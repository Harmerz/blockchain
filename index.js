const ethers = require('ethers')
require('dotenv').config()
const Change = require('./models/change')
const Contact = require('./models/contact')
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
const mongoose = require('mongoose')
const contact = require('./models/contact')

// Protect against XSS attacks, should come before any routes
mongoose.set('strictQuery', false)
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('DB CONNECTED')
  })
  .catch((err) => {
    console.error('UNABLE to connect to DB:', err)
  })

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
    res.send({
      userAddress: person.userAddress,
      name: person.name,
      occupation: person.occupation,
      location: person.location,
    })
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
      idBefore: parseInt(product.idBefore),
    }))
    const allShipment = await supplyChain.getAllShipment()
    const shipments = allShipment.map((shipmentsLocal) => ({
      fromAddress: shipmentsLocal.fromAddress,
      toAddress: shipmentsLocal.toAddress,
      shipmentID: parseInt(shipmentsLocal.shipmentID),
      weight: parseInt(shipmentsLocal.weight),
      productID: parseInt(shipmentsLocal.productID),
      timestamp: parseInt(shipmentsLocal.timestamp),
      buyPrice: parseInt(shipmentsLocal.buyPrice),
    }))

    const myInventory = inventory.map((item) => ({
      ...products.filter((e) => e.productID === parseInt(item.productID))[0],

      totalWeight: parseInt(item.totalWeight),
      productRecords: item.productRecords.map((product) => ({
        ...shipments.filter((e) => e.shipmentID === parseInt(product.shipmentID))[0],
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
        const gasPrice = 100000000000 ;
        const gasLimit = 1000000; // Adjust this based on your contract's complexity
        const overrides = {
          gasPrice: gasPrice, // or use maxFeePerGas and maxPriorityFeePerGas
          gasLimit: gasLimit,
        };
    // const productRecords = [
    //     { shipmentID: 0, weight:5, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 100)[0].timestamp },
    //     { shipmentID: 0, weight: 10, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 50)[0].timestamp},
    //   ];
    //   const reduceweight = 15;
    const { userAddress1, userAddress2, weight, productId, buyPrice, productRecords } = req.body
    let _productRecords = productRecords
    const date = new Date()
    if (!productRecords[0].shipmentID) {
      _productRecords = [{ shipmentID: 0, weight: weight, timestamp: date.getTime() }]
    } else {
        console.log("A")
        _productRecords = _productRecords.filter(e => e.shipmentID > 0)
      }
      console.log( userAddress1,
        userAddress2,
        parseInt(weight),
        productId,
        parseInt(buyPrice),
          _productRecords,)
    const tx = await supplyChain.sendShipment(
      userAddress1,
      userAddress2,
      parseInt(weight),
      productId,
      parseInt(buyPrice),
        _productRecords,
        overrides
        )
        console.log('Transaction Hash:', tx.hash);
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
    const allShipment = await supplyChain.getAllShipment()
    const shipmentsList = allShipment.map((shipmentsLocal) => ({
      fromAddress: shipmentsLocal.fromAddress,
      toAddress: shipmentsLocal.toAddress,
      shipmentID: parseInt(shipmentsLocal.shipmentID),
      weight: parseInt(shipmentsLocal.weight),
      productID: parseInt(shipmentsLocal.productID),
      timestamp: parseInt(shipmentsLocal.timestamp),
      buyPrice: parseInt(shipmentsLocal.buyPrice),
    }))
    const myShipments = shipments.map((product) => ({
      ...shipmentsList.filter((e) => e.shipmentID === parseInt(product.shipmentID))[0],
    }))
    console.log(myShipments)
    res.send(myShipments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// CHANGE PRODUCT
app.post('/change', async (req, res) => {
  try {
    // const productRecords = [
    //     { shipmentID: 0, weight:5, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 100)[0].timestamp },
    //     { shipmentID: 0, weight: 10, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 50)[0].timestamp},
    //   ];
    //   const reduceweight = 15;
    const { _userAddress } = req.body
    const { _productIdFrom, _productIdTo, _productWeight, _productRecords } = req.body
    console.log({ _userAddress, _productIdFrom, _productIdTo, _productWeight, _productRecords })
    let productRecords = _productRecords
    const date = new Date()
    if (!_productRecords[0].shipmentID) {
      productRecords = [{ shipmentID: 0, weight: _productWeight, timestamp: date.getTime() }]
    }
    const tx = await supplyChain.processMyProduct(
      _userAddress,
      _productIdFrom,
      _productIdTo,
      _productWeight,
      productRecords
    )
    await tx.wait()
    const change = new Change({
      address: _userAddress,
      from: _productIdFrom,
      to: _productIdTo,
      totalWeight: _productWeight,
      timestamp: date.getTime(),
      productRecords: _productRecords,
    })
    await change.save()
    res.json({ success: true })
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message)
  }
})

app.get('/change/:address', async (req, res) => {
  //http://localhost:3000/products/
  try {
    const change = await Change.find({
      address: req.params.address,
    })
    if (change) res.status(200).send(change)
    else res.status(404).send('No Data Found')
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.get('/products/:idbefore', async (req, res) => {
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
    console.log(products)
    console.log(products.filter((e) => e.idBefore == idbef))
    res.send(products.filter((e) => e.idBefore == idbef))
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// FINAL PRODUCT
// app.get('/final/:id', async (req, res) => {
//   //http://localhost:3000/products/
//   try {
//     const id = req.params.id
//     const shipments = await supplyChain.getShipmentById(id)
//     let myShipments = []
//     async function getAllShipment(shipmentId) {
//       const shipmentsLocal = await supplyChain.getShipmentById(shipmentId)
//       myShipments.push({
//         fromAddress: shipmentsLocal.fromAddress,
//         toAddress: shipmentsLocal.toAddress,
//         shipmentID: parseInt(shipmentsLocal.shipmentID),
//         weight: parseInt(shipmentsLocal.weight),
//         productID: parseInt(shipmentsLocal.productID),
//         timestamp: parseInt(shipmentsLocal.timestamp),
//         buyPrice: parseInt(shipmentsLocal.buyPrice),
//       })
//       shipmentsLocal.shipmentRecords.forEach(getAllShipment)
//     }
//     shipments.shipmentRecords.forEach(getAllShipment)
//     console.log(myShipments)
//     res.send(myShipments)
//   } catch (error) {
//     res.status(500).send(error.message)
//   }
// })

app.get('/final/:address', async (req, res) => {
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
    const address = req.params.address
    const shipments = await supplyChain.getSendShipmentByAddress(address)
    const myShipments = []
  
    async function getAllShipment(shipmentID) {
      const shipmentsLocal = await supplyChain.getShipmentById(parseInt(shipmentID))
      // Check if shipmentsLocal is not empty before pushing to myShipments
      if (shipmentsLocal && shipmentsLocal.shipmentID != 0) {
        myShipments.push({
          fromAddress: shipmentsLocal.fromAddress,
          toAddress: shipmentsLocal.toAddress,
          shipmentID: parseInt(shipmentsLocal.shipmentID),
          weight: parseInt(shipmentsLocal.weight),
          productID: parseInt(shipmentsLocal.productID),
          timestamp: parseInt(shipmentsLocal.timestamp),
          buyPrice: parseInt(shipmentsLocal.buyPrice),
          // Assuming products is an array
          ...(products.find((e) => e.productID == shipmentsLocal.productID) || {}),
        })
  
        // Recursively call getAllShipment for each shipmentRecord
        if (shipmentsLocal.shipmentRecords && shipmentsLocal.shipmentRecords.length > 0) {
          await Promise.all(shipmentsLocal.shipmentRecords.map((e) => getAllShipment(e)))
        }
      }
    }
  
    // Use direct await without additional Promise.all
    await Promise.all(shipments.map(async (e) => {
      if (e.shipmentID) {
        await getAllShipment(e.shipmentID);
      }
    }));
  
    console.log(myShipments)
    res.send(myShipments)
  } catch (error) {
    console.error("Error in main code:", error);
    res.status(500).send("Internal Server Error");
  }
  
})

// ORIGIN PRODUCT
// app.get('/origin/:id', async (req, res) => {
//   //http://localhost:3000/products/
//   try {
//     const id = req.params.id
//     const shipments = await supplyChain.getShipmentById(id)
//     let myShipments = []
//     async function getAllShipment(productRecords) {
//       const shipmentsLocal = await supplyChain.getShipmentById(productRecords.shipmentID)
//       myShipments.push({
//         fromAddress: shipmentsLocal.fromAddress,
//         toAddress: shipmentsLocal.toAddress,
//         shipmentID: parseInt(shipmentsLocal.shipmentID),
//         weight: parseInt(shipmentsLocal.weight),
//         productID: parseInt(shipmentsLocal.productID),
//         timestamp: parseInt(shipmentsLocal.timestamp),
//         buyPrice: parseInt(shipmentsLocal.buyPrice),
//       })
//       shipmentsLocal.productRecords.forEach(getAllShipment)
//     }
//     shipments.productRecords.forEach(getAllShipment)
//     console.log(myShipments)
//     res.send(myShipments)
//   } catch (error) {
//     res.status(500).send(error.message)
//   }
// })

app.get('/origin/:address', async (req, res) => {
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
    const address = req.params.address
    const shipments = await supplyChain.getInventoryByAddress(address)
    const myShipments = []
    async function getAllShipment(shipmentID) {
      const shipmentsLocal = await supplyChain.getShipmentById(parseInt(shipmentID))
      // Check if shipmentsLocal is not empty before pushing to myShipments
      if (shipmentsLocal && shipmentsLocal.shipmentID != 0) {
        myShipments.push({
          fromAddress: shipmentsLocal.fromAddress,
          toAddress: shipmentsLocal.toAddress,
          shipmentID: parseInt(shipmentsLocal.shipmentID),
          weight: parseInt(shipmentsLocal.weight),
          productID: parseInt(shipmentsLocal.productID),
          timestamp: parseInt(shipmentsLocal.timestamp),
          buyPrice: parseInt(shipmentsLocal.buyPrice),
          // Assuming products is an array
          ...(products.find((e) => e.productID == shipmentsLocal.productID) || {}),
        })
        console.log(myShipments)

        // Recursively call getAllShipment for each productRecord
        if (shipmentsLocal.productRecords && shipmentsLocal.productRecords.length > 0) {
            await Promise.all(shipmentsLocal.productRecords.map((e) => getAllShipment(e.shipmentID)))
        }
      }
    }
    await Promise.all(shipments.map(async (e) => {
        if (e.productRecords) {
          await Promise.all(e.productRecords.map((record) => getAllShipment(record.shipmentID)));
        }
      }));

    console.log(myShipments)
    res.send(myShipments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// CONTACT
// Create a new contact
app.post('/contacts', async (req, res) => {
  try {
    const { account } = req.body
    const user = await Contact.findOne({
      account: account,
    })
    console.log(req.body)
    if (user) {
      await Contact.updateOne(
        {
          account: account,
        },

        {
          $push: {
            contact: req.body.contact,
          },
        }
      )
    } else {
      const newContact = new Contact({
        account: account,
        contact: [
          
            req.body.contact,
          
        ],
      })
        console.log(newContact)
      await newContact.save()
    }
    res.status(201).json(contact)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all contacts
app.get('/contacts/:address', async (req, res) => {
  try {
    const account = req.params.address
    const user = await Contact.findOne({
      account: account,
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const port = 5000
app.listen(port, () => {
  console.log('API server is listening on port 5000')
})
