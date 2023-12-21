const ethers = require('ethers')
require('dotenv').config()
const API_URL = process.env.API_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const contractAddress = process.env.CONTRACT_ADDRESS

const provider = new ethers.providers.JsonRpcProvider(API_URL)
const signer = new ethers.Wallet(PRIVATE_KEY, provider)
const { abi } = require('./artifacts/contracts/SupplyChain.sol/SupplyChain.json')
const supplyChain = new ethers.Contract(contractAddress, abi, signer)
const morgan = require('morgan')
const express = require('express')
const app = express()
app.use(express.json())
app.use(morgan('dev'))
const cors = require('cors')

var allowedOrigins = ['https://lensights.my.id', 'http://localhost:3000']
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          'The CORS policy for this site does not ' + 'allow access from the specified Origin.'
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    },
  })
)
// PERSON
app.get('/person/:address', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const address = req.params.address
    const person = await supplyChain.getPersonByAddress(address)

    console.log(person)
    res.send(person)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.post('/person', async (req, res) => {
  try {
    const { userAddress, name, occupation, location } = req.body
    const tx = await supplyChain.createPerson(userAddress, name, occupation, location)
    await tx.wait()
    res.json({ success: true })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// PRODUCTS
app.get('/products', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const allProducts = await supplyChain.getAllProducts()
    const products = allProducts.map((product) => ({
      productID: parseInt(product.productID),
      idBefore: parseInt(product.idBefore),
      name: product.name,
      changedPercent: parseInt(product.changedPercent),
      Type: product.Type,
      description: product.description,
    }))
    console.log(products)
    res.send(products)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.post('/products', async (req, res) => {
  try {
    const { idBefore, name, changePercent, type, description } = req.body
    const tx = await supplyChain.createProduct(idBefore, name, changePercent, type, description)
    await tx.wait()
    res.json({ success: true })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.put('/products/:id', async (req, res) => {
  //http://localhost:3000/products/1
  try {
    const id = req.params.id
    const { idBefore, name, changePercent, type, description } = req.body
    const tx = await supplyChain.updateProduct(id, idBefore, name, changePercent, type, description)
    await tx.wait()
    res.json({ success: true })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// INVENTORY
app.get('/inventory/:address', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const address = req.params.address
    const inventory = await supplyChain.getInventoryByAddress(address)
    const allProducts = await supplyChain.getAllProducts()
    const products = allProducts.map((product) => ({
      productID: parseInt(product.productID),
      name: product.name,
      Type: product.Type,
      description: product.description,
    }))
      const allShipment = await supplyChain.getAllShipment()
      const shipments = allShipment.map((product) => ({
        fromAddress: shipmentsLocal.fromAddress,
        toAddress: shipmentsLocal.toAddress,
        shipmentID: parseInt(shipmentsLocal.shipmentID),
        weight: parseInt(shipmentsLocal.weight),
        productID: parseInt(shipmentsLocal.productID),
        timestamp: parseInt(shipmentsLocal.timestamp),
        buyPrice: parseInt(shipmentsLocal.buyPrice),
      }))

    const myInventory = inventory.map((item) => ({
      ...products.filter(e => e.productID === parseInt(item.productID))[0],

        totalWeight: parseInt(item.totalWeight),
        productRecords: item.map((product) => ({
          ...shipments.filter(e => e.shipmentID ===  parseInt(product.shipmentID))
      })),
    })) 
    console.log(myInventory)
    res.send(myInventory)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.post('/inventory', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const address = req.body.address
    const { productId, weight, shipmentId } = req.body
    const tx = await supplyChain.addInventory(address, productId, weight, shipmentId)
    await tx.wait()
    res.json({ success: true })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// SEND PRODUCT
app.post('/send', async (req, res) => {
  try {
    // const productRecords = [
    //     { shipmentID: 0, weight:5, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 100)[0].timestamp },
    //     { shipmentID: 0, weight: 10, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 50)[0].timestamp},
    //   ];
    //   const reduceweight = 15;
    const { userAddress1, userAddress2, weight, productId, productRecords } = req.body
    const tx = await supplyChain.sendShipment(
      userAddress1,
      userAddress2,
      weight,
      productId,
      productRecords
    )
    await tx.wait()
    res.json({ success: true })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// SHIPMENT RECORDS
app.get('/shipment/:address', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const address = req.params.address
    const shipments = await supplyChain.getSendShipmentByAddress(address)
    const myShipments = shipments.map((product) => ({
      shipmentID: parseInt(product.shipmentID),
      weight: parseInt(product.weight),
      timestamp: parseInt(product.timestamp),
    }))
    console.log(myShipments)
    res.send(myShipments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// CHANGE PRODUCT
app.post('/change/:address', async (req, res) => {
  try {
    // const productRecords = [
    //     { shipmentID: 0, weight:5, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 100)[0].timestamp },
    //     { shipmentID: 0, weight: 10, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 50)[0].timestamp},
    //   ];
    //   const reduceweight = 15;
    const address = req.params.address
    const { productId, newProductId, weight, productRecords } = req.body
    const tx = await supplyChain.processMyProduct(
      address,
      productId,
      newProductId,
      weight,
      productRecords
    )
    await tx.wait()
    res.json({ success: true })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.get('/products:idbefore', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const idbef = req.params.idbefore
    const allProducts = await supplyChain.getAllProducts()
    const products = allProducts.map((product) => ({
      productID: parseInt(product.productID),
      idBefore: parseInt(product.idBefore),
      name: product.name,
      changedPercent: parseInt(product.changedPercent),
      Type: product.Type,
      description: product.description,
    }))
    console.log(products.filter((e) => e.idBefore === idbef))
    res.send(products.filter((e) => e.idBefore === idbef))
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// FINAL PRODUCT
app.get('/final/:id', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const id = req.params.id
    const shipments = await supplyChain.getShipmentById(id)
    let myShipments = []
    async function getAllShipment(shipmentId) {
      const shipmentsLocal = await supplyChain.getShipmentById(shipmentId)
      myShipments.push({
        fromAddress: shipmentsLocal.fromAddress,
        toAddress: shipmentsLocal.toAddress,
        shipmentID: parseInt(shipmentsLocal.shipmentID),
        weight: parseInt(shipmentsLocal.weight),
        productID: parseInt(shipmentsLocal.productID),
        timestamp: parseInt(shipmentsLocal.timestamp),
        buyPrice: parseInt(shipmentsLocal.buyPrice),
      })
      shipmentsLocal.shipmentRecords.forEach(getAllShipment)
    }
    shipments.shipmentRecords.forEach(getAllShipment)
    console.log(myShipments)
    res.send(myShipments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.get('/final/:address', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const address = req.params.address
    const shipments = await supplyChain.getSendShipmentByAddress(address)
    let myShipments = []
    async function getAllShipment(shipmentId) {
      const shipmentsLocal = await supplyChain.getShipmentById(shipmentId)
      myShipments.push({
        fromAddress: shipmentsLocal.fromAddress,
        toAddress: shipmentsLocal.toAddress,
        shipmentID: parseInt(shipmentsLocal.shipmentID),
        weight: parseInt(shipmentsLocal.weight),
        productID: parseInt(shipmentsLocal.productID),
        timestamp: parseInt(shipmentsLocal.timestamp),
        buyPrice: parseInt(shipmentsLocal.buyPrice),
      })
      shipmentsLocal.shipmentRecords.forEach(getAllShipment)
    }
    shipments.forEach(getAllShipment)
    console.log(myShipments)
    res.send(myShipments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// ORIGIN PRODUCT
app.get('/origin/:id', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const id = req.params.id
    const shipments = await supplyChain.getShipmentById(id)
    let myShipments = []
    async function getAllShipment(productRecords) {
      const shipmentsLocal = await supplyChain.getShipmentById(productRecords.shipmentID)
      myShipments.push({
        fromAddress: shipmentsLocal.fromAddress,
        toAddress: shipmentsLocal.toAddress,
        shipmentID: parseInt(shipmentsLocal.shipmentID),
        weight: parseInt(shipmentsLocal.weight),
        productID: parseInt(shipmentsLocal.productID),
        timestamp: parseInt(shipmentsLocal.timestamp),
        buyPrice: parseInt(shipmentsLocal.buyPrice),
      })
      shipmentsLocal.productRecords.forEach(getAllShipment)
    }
    shipments.productRecords.forEach(getAllShipment)
    console.log(myShipments)
    res.send(myShipments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

const port = 5000
app.listen(port, () => {
  console.log('API server is listening on port 5000')
})
