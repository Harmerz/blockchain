const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", function () {
  let supplyChainInstance;
  const weight = 100;
  const shipmentId = 1;
  const userAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";

  beforeEach(async function () {
    const SupplyChain = await ethers.getContractFactory("SupplyChain"); // Make sure to replace with your actual contract name
    supplyChainInstance = await SupplyChain.deploy();
    await supplyChainInstance.deployed();
  });

  it("should add a send shipment and retrieve it by address", async function () {
    // Add send shipment
    await supplyChainInstance.AddSendShipment(userAddress, weight, shipmentId);

    // Get send shipment by address
    const sendShipments = await supplyChainInstance.GetSendShipmentByAddress(userAddress);
    // Assert that the send shipment was added and retrieved correctly
    expect(sendShipments.length).to.equal(1);
    expect(sendShipments[0].shipmentID).to.equal(shipmentId);
    expect(sendShipments[0].weight).to.equal(weight);
  });
});
