const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", function () {
  let SupplyChain;
  let supplyChain;
  const initialProductId = 1;

  beforeEach(async function () {
    SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
  });

  it("should create a product", async function () {
    await supplyChain.createProduct(0, "Product 1", 10, "Type A", "Description A");

    const product = await supplyChain.products(initialProductId);

    expect(product.productID).to.equal(initialProductId);
    expect(product.idBefore).to.equal(0);
    expect(product.name).to.equal("Product 1");
    expect(product.changedPercent).to.equal(10);
    expect(product.Type).to.equal("Type A");
    expect(product.description).to.equal("Description A");
  });

  it("should update a product", async function () {
    await supplyChain.createProduct(0, "Product 1", 10, "Type A", "Description A");

    const updatedValues = {
      idBefore: 1,
      name: "Updated Product",
      changedPercent: 20,
      Type: "Type B",
      description: "Updated Description",
    };

    await supplyChain.updateProduct(initialProductId, ...Object.values(updatedValues));

    const updatedProduct = await supplyChain.products(initialProductId);

    expect(updatedProduct.productID).to.equal(initialProductId);
    expect(updatedProduct.idBefore).to.equal(updatedValues.idBefore);
    expect(updatedProduct.name).to.equal(updatedValues.name);
    expect(updatedProduct.changedPercent).to.equal(updatedValues.changedPercent);
    expect(updatedProduct.Type).to.equal(updatedValues.Type);
    expect(updatedProduct.description).to.equal(updatedValues.description);
  });

  it("should get all products", async function () {
    await supplyChain.createProduct(0, "Product 1", 10, "Type A", "Description A");
    await supplyChain.createProduct(1, "Product 2", 15, "Type B", "Description B");

    const allProducts = await supplyChain.getAllProducts();

    expect(allProducts.length).to.equal(2);

    expect(allProducts[0].name).to.equal("Product 1");
    expect(allProducts[1].name).to.equal("Product 2");
  });

  it("should get product by ID", async function () {
    await supplyChain.createProduct(0, "Product 1", 10, "Type A", "Description A");

    const product = await supplyChain.getProductById(initialProductId);

    expect(product.name).to.equal("Product 1");
  });
});
