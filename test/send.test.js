const { expect } = require("chai");
const { ethers } = require("hardhat");
const {utils} = require("ethers")

describe("SupplyChain", function () {
  let SupplyChain;
  let supplyChain;
  const userAddress1 = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
  const userAddress2 = "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB";
    const hexToDecimal = hex => Number(hex.toString());


  beforeEach(async function () {
    SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
    const occupation = "Software Engineer";
    const name = "John Doe";
    const location = "Cityville";
    await supplyChain.createPerson(userAddress1, name, occupation, location);
  });
  
it("should Send Shipment with same product from user", async () => {
 
    const productId = 1;
    const weight = 100;
    const shipmentId = 0;

    await supplyChain.addInventory(userAddress1, productId, weight, shipmentId);
    const inventoryBefore = await supplyChain.getInventoryByAddressAndProductID(userAddress1, productId);
    // Check if the inventory was created correctly
    expect(inventoryBefore.productID).to.equal(productId);
    expect(inventoryBefore.totalWeight).to.equal(weight);
    expect(inventoryBefore.productRecords.length).to.equal(1);

    // Add more inventory to the existing product
    const additionalWeight = 50;
    const additionalShipmentId = 0;

    await supplyChain.addInventory(userAddress1, productId, additionalWeight, additionalShipmentId);

    // Get the user's inventory after the second addition
    const inventoryAfter = await supplyChain.getInventoryByAddressAndProductID(userAddress1, productId);
    // Check if the inventory was updated correctly
    expect(inventoryAfter.productID).to.equal(productId);
    expect(inventoryAfter.totalWeight).to.equal(weight + additionalWeight);
  expect(inventoryAfter.productRecords.length).to.equal(2);
    const productRecords = [
      { shipmentID: 0, weight:5, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 100)[0].timestamp },
      { shipmentID: 0, weight: 10, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 50)[0].timestamp},
    ];
    const reduceweight = 15;
    await supplyChain.sendShipment(userAddress1, userAddress2, reduceweight, productId, productRecords)

    const address1 = await supplyChain.getInventoryByAddressAndProductID(userAddress1, productId);
    const address2 = await supplyChain.getInventoryByAddressAndProductID(userAddress2, productId);

    expect(address1.totalWeight).to.equal(weight + additionalWeight - 15);
    expect(address1.productID).to.equal(productId);
    expect(address1.productRecords.length).to.equal(2);

    expect(address2.totalWeight).to.equal(15);
    expect(address2.productID).to.equal(productId);
    expect(address2.productRecords.length).to.equal(1);
    expect(address2.productRecords[0].shipmentID).to.equal(1);


  });
});
