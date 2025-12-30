const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialNFT", function () {
  let credentialNFT;
  let owner;
  let institution;
  let student;
  let verifier;

  beforeEach(async function () {
    [owner, institution, student, verifier] = await ethers.getSigners();

    const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
    credentialNFT = await CredentialNFT.deploy();
    await credentialNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await credentialNFT.name()).to.equal("AccredChain Credential");
      expect(await credentialNFT.symbol()).to.equal("CERT");
    });

    it("Should grant admin role to deployer", async function () {
      const ADMIN_ROLE = await credentialNFT.ADMIN_ROLE();
      expect(await credentialNFT.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Institution Registration", function () {
    it("Should allow institution to register", async function () {
      await credentialNFT.connect(institution).registerInstitution(
        "Test University",
        "REG123456"
      );

      const inst = await credentialNFT.getInstitution(institution.address);
      expect(inst.name).to.equal("Test University");
      expect(inst.registrationId).to.equal("REG123456");
      expect(inst.isVerified).to.be.false;
    });

    it("Should emit InstitutionRegistered event", async function () {
      await expect(
        credentialNFT.connect(institution).registerInstitution("Test University", "REG123456")
      ).to.emit(credentialNFT, "InstitutionRegistered");
    });

    it("Should not allow duplicate registration", async function () {
      await credentialNFT.connect(institution).registerInstitution("Test University", "REG123456");
      
      await expect(
        credentialNFT.connect(institution).registerInstitution("Another Name", "REG789")
      ).to.be.revertedWith("Institution already registered");
    });

    it("Should not allow empty name", async function () {
      await expect(
        credentialNFT.connect(institution).registerInstitution("", "REG123456")
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Institution Verification", function () {
    beforeEach(async function () {
      await credentialNFT.connect(institution).registerInstitution("Test University", "REG123456");
    });

    it("Should allow admin to verify institution", async function () {
      await credentialNFT.connect(owner).verifyInstitution(institution.address);
      
      const inst = await credentialNFT.getInstitution(institution.address);
      expect(inst.isVerified).to.be.true;
    });

    it("Should emit InstitutionVerified event", async function () {
      await expect(
        credentialNFT.connect(owner).verifyInstitution(institution.address)
      ).to.emit(credentialNFT, "InstitutionVerified");
    });

    it("Should not allow non-admin to verify", async function () {
      await expect(
        credentialNFT.connect(student).verifyInstitution(institution.address)
      ).to.be.reverted;
    });

    it("Should allow admin to revoke institution", async function () {
      await credentialNFT.connect(owner).verifyInstitution(institution.address);
      await credentialNFT.connect(owner).revokeInstitution(institution.address);
      
      const inst = await credentialNFT.getInstitution(institution.address);
      expect(inst.isVerified).to.be.false;
    });
  });

  describe("Credential Issuance", function () {
    beforeEach(async function () {
      await credentialNFT.connect(institution).registerInstitution("Test University", "REG123456");
      await credentialNFT.connect(owner).verifyInstitution(institution.address);
    });

    it("Should allow verified institution to issue credential", async function () {
      const tx = await credentialNFT.connect(institution).issueCredential(
        student.address,
        "degree",
        "Computer Science",
        "John Doe",
        "STU001",
        0, // no expiry
        "QmTestHash123",
        "A+",
        "ipfs://metadata"
      );

      const receipt = await tx.wait();
      expect(await credentialNFT.getTotalCredentials()).to.equal(1);
    });

    it("Should emit CredentialIssued event", async function () {
      await expect(
        credentialNFT.connect(institution).issueCredential(
          student.address,
          "degree",
          "Computer Science",
          "John Doe",
          "STU001",
          0,
          "QmTestHash123",
          "A+",
          "ipfs://metadata"
        )
      ).to.emit(credentialNFT, "CredentialIssued");
    });

    it("Should mint NFT to student", async function () {
      await credentialNFT.connect(institution).issueCredential(
        student.address,
        "degree",
        "Computer Science",
        "John Doe",
        "STU001",
        0,
        "QmTestHash123",
        "A+",
        "ipfs://metadata"
      );

      expect(await credentialNFT.ownerOf(1)).to.equal(student.address);
    });

    it("Should not allow unverified institution to issue", async function () {
      const [, , , anotherInst] = await ethers.getSigners();
      
      await expect(
        credentialNFT.connect(anotherInst).issueCredential(
          student.address,
          "degree",
          "Computer Science",
          "John Doe",
          "STU001",
          0,
          "QmTestHash123",
          "A+",
          "ipfs://metadata"
        )
      ).to.be.revertedWith("Not a verified institution");
    });

    it("Should not allow duplicate IPFS hash", async function () {
      await credentialNFT.connect(institution).issueCredential(
        student.address,
        "degree",
        "Computer Science",
        "John Doe",
        "STU001",
        0,
        "QmTestHash123",
        "A+",
        "ipfs://metadata"
      );

      await expect(
        credentialNFT.connect(institution).issueCredential(
          student.address,
          "certificate",
          "Another Course",
          "John Doe",
          "STU001",
          0,
          "QmTestHash123", // same hash
          "B+",
          "ipfs://metadata2"
        )
      ).to.be.revertedWith("Credential already exists");
    });
  });

  describe("Credential Verification", function () {
    beforeEach(async function () {
      await credentialNFT.connect(institution).registerInstitution("Test University", "REG123456");
      await credentialNFT.connect(owner).verifyInstitution(institution.address);
      await credentialNFT.connect(institution).issueCredential(
        student.address,
        "degree",
        "Computer Science",
        "John Doe",
        "STU001",
        0,
        "QmTestHash123",
        "A+",
        "ipfs://metadata"
      );
    });

    it("Should verify valid credential", async function () {
      const result = await credentialNFT.connect(verifier).verifyCredential.staticCall(1);
      
      expect(result.isValid).to.be.true;
      expect(result.credential.studentName).to.equal("John Doe");
      expect(result.institution.name).to.equal("Test University");
    });

    it("Should emit CredentialVerified event", async function () {
      await expect(
        credentialNFT.connect(verifier).verifyCredential(1)
      ).to.emit(credentialNFT, "CredentialVerified");
    });

    it("Should return invalid for revoked credential", async function () {
      await credentialNFT.connect(institution).revokeCredential(1);
      
      const result = await credentialNFT.connect(verifier).verifyCredential.staticCall(1);
      expect(result.isValid).to.be.false;
    });
  });

  describe("Credential Revocation", function () {
    beforeEach(async function () {
      await credentialNFT.connect(institution).registerInstitution("Test University", "REG123456");
      await credentialNFT.connect(owner).verifyInstitution(institution.address);
      await credentialNFT.connect(institution).issueCredential(
        student.address,
        "degree",
        "Computer Science",
        "John Doe",
        "STU001",
        0,
        "QmTestHash123",
        "A+",
        "ipfs://metadata"
      );
    });

    it("Should allow issuing institution to revoke", async function () {
      await credentialNFT.connect(institution).revokeCredential(1);
      
      const credential = await credentialNFT.getCredential(1);
      expect(credential.status).to.equal(1); // Revoked = 1
    });

    it("Should emit CredentialRevoked event", async function () {
      await expect(
        credentialNFT.connect(institution).revokeCredential(1)
      ).to.emit(credentialNFT, "CredentialRevoked");
    });

    it("Should not allow others to revoke", async function () {
      await expect(
        credentialNFT.connect(student).revokeCredential(1)
      ).to.be.revertedWith("Only issuing institution can revoke");
    });

    it("Should not allow double revocation", async function () {
      await credentialNFT.connect(institution).revokeCredential(1);
      
      await expect(
        credentialNFT.connect(institution).revokeCredential(1)
      ).to.be.revertedWith("Credential not active");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await credentialNFT.connect(institution).registerInstitution("Test University", "REG123456");
      await credentialNFT.connect(owner).verifyInstitution(institution.address);
      
      // Issue multiple credentials
      await credentialNFT.connect(institution).issueCredential(
        student.address, "degree", "CS", "John", "S1", 0, "hash1", "A", "uri1"
      );
      await credentialNFT.connect(institution).issueCredential(
        student.address, "certificate", "AI", "John", "S1", 0, "hash2", "A+", "uri2"
      );
    });

    it("Should get student credentials", async function () {
      const credentials = await credentialNFT.getStudentCredentials(student.address);
      expect(credentials.length).to.equal(2);
    });

    it("Should get institution credentials", async function () {
      const credentials = await credentialNFT.getInstitutionCredentials(institution.address);
      expect(credentials.length).to.equal(2);
    });

    it("Should get credential by IPFS hash", async function () {
      const [exists, credential] = await credentialNFT.getCredentialByHash("hash1");
      expect(exists).to.be.true;
      expect(credential.courseName).to.equal("CS");
    });

    it("Should return false for non-existent hash", async function () {
      const [exists] = await credentialNFT.getCredentialByHash("nonexistent");
      expect(exists).to.be.false;
    });

    it("Should check if institution is verified", async function () {
      expect(await credentialNFT.isVerifiedInstitution(institution.address)).to.be.true;
      expect(await credentialNFT.isVerifiedInstitution(student.address)).to.be.false;
    });
  });
});
