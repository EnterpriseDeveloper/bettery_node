const axios = require("axios");
const Contract = require("../contract/contract");

const setEthPriceToContract = async () =>{
    // get Price
    let data = await axios.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=b615c4243192f32db11c07ef29a4e5eda4b9ab7924c9066148adb64c04bd9c6a")
    .catch((err) => console.log(err))
    let price = (data.data.USD * 100);

    // conntect to contract
    let contr = new Contract.Contract();
    let getContract = await contr.loadContract();
    
   let test =  await getContract.methods.setEthPrice(price).send();
   console.log(test);
}

module.exports = {
    setEthPriceToContract
}