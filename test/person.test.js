const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("SupplyChain", function () {
  let SupplyChain;
  let supplyChain;
  const initialProductId = 1;
   let accounts;
  let personContract;

  beforeEach(async function () {
    SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
  });

  it("should create a person", async function () {
    const userAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
    const name = "John Doe";
    const occupation = "Software Engineer";
    const location = "Cityville";
        await supplyChain.createPerson(userAddress, name, occupation, location);

    const person = await supplyChain.getPersonByAddress(userAddress);
    expect(person.userAddress).to.equal(userAddress);
    expect(person.name).to.equal(name);
    expect(person.occupation).to.equal(occupation);
    expect(person.location).to.equal(location);
    expect(person.inventory.length).to.equal(0);
    expect(person.sendShipment.length).to.equal(0);
  });
    it("should not allow creating a person with an existing address", async () => {
    const userAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
    const name = "John Doe";
    const occupation = "Software Engineer";
    const location = "Cityville";

    await supplyChain.createPerson(userAddress, name, occupation, location);
    await supplyChain.getPersonByAddress(userAddress);

    // Try to create a person with the same address again
    try {
        await supplyChain.createPerson(userAddress, "Another Name", "Another Occupation", "Another Location");
        expect.fail("Creating a person with an existing address should fail");
    } catch (error) {
        expect(error.message).to.include("User already exists", "Error message should indicate user already exists");
    }
    });
    
});
