const main = async () => {
  const SupplyChainFactory = await ethers.getContractFactory('SupplyChain')
  const SupplyChain = await SupplyChainFactory.deploy()
  await SupplyChain.deployed()
  console.log('Contract deployed to:', SupplyChain.address)
}
const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
runMain()
