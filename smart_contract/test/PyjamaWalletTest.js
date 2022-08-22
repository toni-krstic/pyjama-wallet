
const { expect, use } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("PyjamaWallet contract", function () {
  async function deployPyjamaWalletFixture() {
    const PyjamaWallet = await ethers.getContractFactory("PyjamaWallet");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const pyjamaWallet = await PyjamaWallet.deploy();
    await pyjamaWallet.deployed();

    return { PyjamaWallet, pyjamaWallet, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { pyjamaWallet, owner } = await loadFixture(deployPyjamaWalletFixture);
      expect(await pyjamaWallet.owner()).to.equal(owner.address);
    });

    it("Should deploy multisig contract", async function () {
      const { pyjamaWallet, owner, addr1, addr2 } = await loadFixture(deployPyjamaWalletFixture);
      initialWalletCount = await pyjamaWallet.userWalletCount(owner.address);
      await pyjamaWallet.deploy([addr1.address,addr2.address], 2);
      expect(await pyjamaWallet.userWalletCount(owner.address)).to.equal(initialWalletCount+1);
    });
  });

  describe("Transactions", function () {
    it("Should be able to deposit ether to multisig contract", async function () {
      const { pyjamaWallet, owner, addr1, addr2 } = await loadFixture(deployPyjamaWalletFixture);
      await pyjamaWallet.deploy([addr1.address,addr2.address], 2);
      await pyjamaWallet.deposit( 0,{ value: 1  });
      expect(await pyjamaWallet.getWalletBalance(owner.address, 0)).to.equal(1);
    });

    it("Should send ether to recipient", async function () {
      const { pyjamaWallet, addr1, addr2 } = await loadFixture(deployPyjamaWalletFixture);
      await pyjamaWallet.deploy([addr1.address, addr2.address], 2);
      await pyjamaWallet.deposit( 0,{ value: 1  });
      await pyjamaWallet.requestTransaction(addr1.address, 1, 0);
      await pyjamaWallet.connect(addr1).approveTransaction(0, 0);
      const initialBalance = await addr1.getBalance();
      await pyjamaWallet.sendTransaction(0, 0);
      const balance = await addr1.getBalance();
      expect(
       Number(balance)
      ).to.equal(Number(initialBalance)+1);
    });

    it("Should fail if you are not the owner", async function () {
      const { pyjamaWallet, addr1, addr2 } = await loadFixture(deployPyjamaWalletFixture);
      await pyjamaWallet.deploy([addr1.address], 2);
      await pyjamaWallet.deposit( 0,{ value: 1  });
      await expect(
        pyjamaWallet.connect(addr2).requestTransaction(addr1.address, 1, 0)
      ).to.be.revertedWith("function call to a non-contract account");
      await pyjamaWallet.requestTransaction(addr1.address, 1, 0);
      await expect(
        pyjamaWallet.connect(addr2).approveTransaction(0, 0)
      ).to.be.revertedWith("function call to a non-contract account");
      await pyjamaWallet.connect(addr1).approveTransaction(0, 0);
      await expect(
        pyjamaWallet.connect(addr2).sendTransaction(0, 0)
      ).to.be.revertedWith("function call to a non-contract account");
    });

    it("Should fail if user wants to approve same transaction twice", async function () {
      const { pyjamaWallet, addr1, addr2 } = await loadFixture(deployPyjamaWalletFixture);
      await pyjamaWallet.deploy([addr1.address, addr2.address], 2);
      await pyjamaWallet.deposit( 0,{ value: 1  });
      await pyjamaWallet.requestTransaction(addr1.address, 1, 0);
      await pyjamaWallet.connect(addr1).approveTransaction(0, 0);
      await expect(
        pyjamaWallet.connect(addr1).approveTransaction(0, 0)
      ).to.be.revertedWith("You already approved this transaction.");
    });

    it("Should fail if transaction has already been sent", async function () {
      const { pyjamaWallet, addr1, addr2 } = await loadFixture(deployPyjamaWalletFixture);
      await pyjamaWallet.deploy([addr1.address, addr2.address], 2);
      await pyjamaWallet.deposit( 0,{ value: 1  });
      await pyjamaWallet.requestTransaction(addr1.address, 1, 0);
      await pyjamaWallet.connect(addr1).approveTransaction(0, 0);
      await pyjamaWallet.sendTransaction(0, 0);
      await expect(
        pyjamaWallet.sendTransaction(0, 0)
      ).to.be.revertedWith("Transaction alredy sent.");
    });

    it("Should fail if transaction doesn't have enough approvals", async function () {
      const { pyjamaWallet, addr1 } = await loadFixture(deployPyjamaWalletFixture);
      await pyjamaWallet.deploy([addr1.address], 2);
      await pyjamaWallet.deposit( 0,{ value: 1  });
      await pyjamaWallet.requestTransaction(addr1.address, 1, 0);
      await expect(
        pyjamaWallet.sendTransaction(0, 0)
      ).to.be.revertedWith("Not approved you need more approvals");
    });

    it("Should fail if wallet doesn't have enough ether", async function () {
      const { pyjamaWallet, addr1, addr2 } = await loadFixture(deployPyjamaWalletFixture);
      await pyjamaWallet.deploy([addr1.address,addr2.address], 2);
      await pyjamaWallet.deposit( 0,{ value: 1  });
      await pyjamaWallet.requestTransaction(addr1.address, 1, 0);
      await pyjamaWallet.requestTransaction(addr1.address, 1, 0);
      await pyjamaWallet.connect(addr1).approveTransaction(0, 0);
      await pyjamaWallet.connect(addr1).approveTransaction(1, 0);
      await pyjamaWallet.sendTransaction(0, 0);
      await expect(
        pyjamaWallet.sendTransaction(1, 0)
      ).to.be.revertedWith("Balance not sufficient");
    });
  });
});