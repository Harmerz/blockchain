const { expect } = require('chai')
const { ethers } = require('hardhat')
const { utils } = require('ethers')

describe('SupplyChain', function () {
  let SupplyChain
  const hexToDecimal = (hex) => Number(hex.toString())
  let supplyChain
  const userAddress = '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2'

  beforeEach(async function () {
    SupplyChain = await ethers.getContractFactory('SupplyChain')
    supplyChain = await SupplyChain.deploy()
    const occupation = 'Software Engineer'
    const name = 'John Doe'
    const location = 'Cityville'
    await supplyChain.createPerson(userAddress, name, occupation, location)
    const person = await supplyChain.getPersonByAddress(userAddress)
  })

  it('should add inventory to an existing product', async () => {
    const productId = 1
    const weight = 100
    const shipmentId = 123

    await supplyChain.addInventory(userAddress, productId, weight, shipmentId)
    // Get the user's inventory after the first addition
    const inventoryBefore = await supplyChain.getInventoryByAddressAndProductID(
      userAddress,
      productId
    )

    // Check if the inventory was created correctly
    expect(inventoryBefore.productID).to.equal(productId)
    expect(inventoryBefore.totalWeight).to.equal(weight)
    expect(inventoryBefore.productRecords.length).to.equal(1)

    // Add more inventory to the existing product
    const additionalWeight = 50
    const additionalShipmentId = 456

    await supplyChain.addInventory(userAddress, productId, additionalWeight, additionalShipmentId)

    // Get the user's inventory after the second addition
    const inventoryAfter = await supplyChain.getInventoryByAddressAndProductID(
      userAddress,
      productId
    )
    // Check if the inventory was updated correctly
    expect(inventoryAfter.productID).to.equal(productId)
    expect(inventoryAfter.totalWeight).to.equal(weight + additionalWeight)
    expect(inventoryAfter.productRecords.length).to.equal(2)
  })

  it('should create a new inventory for a new product', async () => {
    const productId = 1
    const weight = 100
    const shipmentId = 123

    // Add inventory for the first time
    await supplyChain.addInventory(userAddress, productId, weight, shipmentId)

    // Get the user's inventory after the first addition
    const inventoryBefore = await supplyChain.getInventoryByAddress(userAddress)

    // Check if the inventory was created correctly
    expect(inventoryBefore.length).to.equal(1)

    // Add inventory for a new product
    const newProductId = 2
    const newWeight = 200
    const newShipmentId = 789

    await supplyChain.addInventory(userAddress, newProductId, newWeight, newShipmentId)

    // Get the user's inventory after adding inventory for a new product
    const newInventory = await supplyChain.getInventoryByAddress(userAddress)
    expect(newInventory.length).to.equal(2)
  })

  it('should reduction inventory from user', async () => {
    const productId = 1
    const weight = 100
    const shipmentId = 123

    await supplyChain.addInventory(userAddress, productId, weight, shipmentId)
    const inventoryBefore = await supplyChain.getInventoryByAddressAndProductID(
      userAddress,
      productId
    )
    // Check if the inventory was created correctly
    expect(inventoryBefore.productID).to.equal(productId)
    expect(inventoryBefore.totalWeight).to.equal(weight)
    expect(inventoryBefore.productRecords.length).to.equal(1)

    // Add more inventory to the existing product
    const additionalWeight = 50
    const additionalShipmentId = 456

    await supplyChain.addInventory(userAddress, productId, additionalWeight, additionalShipmentId)

    // Get the user's inventory after the second addition
    const inventoryAfter = await supplyChain.getInventoryByAddressAndProductID(
      userAddress,
      productId
    )
    // Check if the inventory was updated correctly
    expect(inventoryAfter.productID).to.equal(productId)
    expect(inventoryAfter.totalWeight).to.equal(weight + additionalWeight)
    expect(inventoryAfter.productRecords.length).to.equal(2)
    const productRecords = [
      {
        shipmentID: 123,
        weight: 5,
        timestamp: inventoryAfter.productRecords.filter(
          (e) => hexToDecimal(e.shipmentID) === 123
        )[0].timestamp,
      },
      {
        shipmentID: 456,
        weight: 10,
        timestamp: inventoryAfter.productRecords.filter(
          (e) => hexToDecimal(e.shipmentID) === 456
        )[0].timestamp,
      },
    ]
    const reduceweight = 15
    await supplyChain.reductionInventory(userAddress, productId, reduceweight, productRecords)
    const inventoryAfterReduction = await supplyChain.getInventoryByAddressAndProductID(
      userAddress,
      productId
    )
    expect(inventoryAfterReduction.totalWeight).to.equal(weight + additionalWeight - 15)
    expect(inventoryAfterReduction.productID).to.equal(productId)
    expect(inventoryAfterReduction.productRecords.length).to.equal(2)

    expect(
      inventoryAfterReduction.productRecords.filter((e) => hexToDecimal(e.shipmentID) === 123)[0]
        .weight
    ).to.equal(weight - 5)
    expect(
      inventoryAfterReduction.productRecords.filter((e) => hexToDecimal(e.shipmentID) === 456)[0]
        .weight
    ).to.equal(additionalWeight - 10)
  })
})
