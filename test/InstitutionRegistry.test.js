const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InstitutionRegistry", function () {
  let registry;
  let owner;
  let institution1;
  let institution2;
  let user;

  beforeEach(async function () {
    [owner, institution1, institution2, user] = await ethers.getSigners();

    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    registry = await InstitutionRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });
  });

  describe("Institution Registration", function () {
    it("Should register a new institution", async function () {
      await registry.connect(institution1).registerInstitution(
        "Test University",
        "REG123",
        0, // University type
        "USA",
        "https://testuni.edu",
        "admin@testuni.edu",
        "QmLogoHash"
      );

      const inst = await registry.getInstitutionByAddress(institution1.address);
      expect(inst.name).to.equal("Test University");
      expect(inst.registrationNumber).to.equal("REG123");
      expect(inst.isVerified).to.be.false;
      expect(inst.isActive).to.be.true;
    });

    it("Should emit InstitutionRegistered event", async function () {
      await expect(
        registry.connect(institution1).registerInstitution(
          "Test University", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
        )
      ).to.emit(registry, "InstitutionRegistered");
    });

    it("Should not allow duplicate registration", async function () {
      await registry.connect(institution1).registerInstitution(
        "Test University", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
      );

      await expect(
        registry.connect(institution1).registerInstitution(
          "Another Name", "REG456", 1, "UK", "https://another.edu", "admin@another.edu", "QmLogo2"
        )
      ).to.be.revertedWith("Already registered");
    });

    it("Should not allow duplicate registration number", async function () {
      await registry.connect(institution1).registerInstitution(
        "Test University", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
      );

      await expect(
        registry.connect(institution2).registerInstitution(
          "Another University", "REG123", 1, "UK", "https://another.edu", "admin@another.edu", "QmLogo2"
        )
      ).to.be.revertedWith("Registration number exists");
    });

    it("Should require name", async function () {
      await expect(
        registry.connect(institution1).registerInstitution(
          "", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
        )
      ).to.be.revertedWith("Name required");
    });

    it("Should require email", async function () {
      await expect(
        registry.connect(institution1).registerInstitution(
          "Test University", "REG123", 0, "USA", "https://testuni.edu", "", "QmLogoHash"
        )
      ).to.be.revertedWith("Email required");
    });
  });

  describe("Verification Request", function () {
    beforeEach(async function () {
      await registry.connect(institution1).registerInstitution(
        "Test University", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
      );
    });

    it("Should allow institution to request verification", async function () {
      await registry.connect(institution1).requestVerification("QmDocumentsHash");

      const pending = await registry.getPendingVerifications();
      expect(pending.length).to.equal(1);
      expect(pending[0].documentIPFS).to.equal("QmDocumentsHash");
    });

    it("Should emit VerificationRequested event", async function () {
      await expect(
        registry.connect(institution1).requestVerification("QmDocumentsHash")
      ).to.emit(registry, "VerificationRequested");
    });

    it("Should not allow unregistered institution to request", async function () {
      await expect(
        registry.connect(institution2).requestVerification("QmDocumentsHash")
      ).to.be.revertedWith("Not registered");
    });

    it("Should not allow duplicate pending requests", async function () {
      await registry.connect(institution1).requestVerification("QmDocumentsHash");

      await expect(
        registry.connect(institution1).requestVerification("QmDocumentsHash2")
      ).to.be.revertedWith("Request pending");
    });
  });

  describe("Verification Approval", function () {
    beforeEach(async function () {
      await registry.connect(institution1).registerInstitution(
        "Test University", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
      );
      await registry.connect(institution1).requestVerification("QmDocumentsHash");
    });

    it("Should allow owner to approve verification", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).approveVerification(inst.id);

      const updatedInst = await registry.getInstitutionByAddress(institution1.address);
      expect(updatedInst.isVerified).to.be.true;
    });

    it("Should emit InstitutionVerified event", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      
      await expect(
        registry.connect(owner).approveVerification(inst.id)
      ).to.emit(registry, "InstitutionVerified");
    });

    it("Should remove from pending after approval", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).approveVerification(inst.id);

      const pending = await registry.getPendingVerifications();
      expect(pending.length).to.equal(0);
    });

    it("Should not allow non-owner to approve", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      
      await expect(
        registry.connect(user).approveVerification(inst.id)
      ).to.be.reverted;
    });
  });

  describe("Verification Rejection", function () {
    beforeEach(async function () {
      await registry.connect(institution1).registerInstitution(
        "Test University", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
      );
      await registry.connect(institution1).requestVerification("QmDocumentsHash");
    });

    it("Should allow owner to reject verification", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).rejectVerification(inst.id, "Invalid documents");

      const request = await registry.verificationRequests(inst.id);
      expect(request.isPending).to.be.false;
      expect(request.isApproved).to.be.false;
      expect(request.rejectionReason).to.equal("Invalid documents");
    });

    it("Should emit VerificationRejected event", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      
      await expect(
        registry.connect(owner).rejectVerification(inst.id, "Invalid documents")
      ).to.emit(registry, "VerificationRejected");
    });

    it("Should allow resubmission after rejection", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).rejectVerification(inst.id, "Invalid documents");

      // Should be able to request again
      await registry.connect(institution1).requestVerification("QmNewDocuments");
      
      const pending = await registry.getPendingVerifications();
      expect(pending.length).to.equal(1);
    });
  });

  describe("Institution Management", function () {
    beforeEach(async function () {
      await registry.connect(institution1).registerInstitution(
        "Test University", "REG123", 0, "USA", "https://testuni.edu", "admin@testuni.edu", "QmLogoHash"
      );
      await registry.connect(institution1).requestVerification("QmDocumentsHash");
      const inst = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).approveVerification(inst.id);
    });

    it("Should allow owner to deactivate institution", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).deactivateInstitution(inst.id);

      const updatedInst = await registry.getInstitutionByAddress(institution1.address);
      expect(updatedInst.isActive).to.be.false;
    });

    it("Should allow owner to reactivate institution", async function () {
      const inst = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).deactivateInstitution(inst.id);
      await registry.connect(owner).reactivateInstitution(inst.id);

      const updatedInst = await registry.getInstitutionByAddress(institution1.address);
      expect(updatedInst.isActive).to.be.true;
    });

    it("Should allow institution to update details", async function () {
      await registry.connect(institution1).updateInstitution(
        "https://newwebsite.edu",
        "newemail@testuni.edu",
        "QmNewLogo"
      );

      const inst = await registry.getInstitutionByAddress(institution1.address);
      expect(inst.website).to.equal("https://newwebsite.edu");
      expect(inst.email).to.equal("newemail@testuni.edu");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Register two institutions
      await registry.connect(institution1).registerInstitution(
        "University A", "REGA", 0, "USA", "https://unia.edu", "admin@unia.edu", "QmLogoA"
      );
      await registry.connect(institution2).registerInstitution(
        "University B", "REGB", 1, "UK", "https://unib.edu", "admin@unib.edu", "QmLogoB"
      );

      // Verify institution1
      await registry.connect(institution1).requestVerification("QmDocsA");
      const inst1 = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).approveVerification(inst1.id);
    });

    it("Should get verified institutions", async function () {
      const verified = await registry.getVerifiedInstitutions();
      expect(verified.length).to.equal(1);
      expect(verified[0].name).to.equal("University A");
    });

    it("Should check if address is verified", async function () {
      expect(await registry.isVerified(institution1.address)).to.be.true;
      expect(await registry.isVerified(institution2.address)).to.be.false;
    });

    it("Should get total institutions count", async function () {
      expect(await registry.getTotalInstitutions()).to.equal(2);
    });

    it("Should not include deactivated institutions in verified list", async function () {
      const inst1 = await registry.getInstitutionByAddress(institution1.address);
      await registry.connect(owner).deactivateInstitution(inst1.id);

      const verified = await registry.getVerifiedInstitutions();
      expect(verified.length).to.equal(0);
    });
  });
});
