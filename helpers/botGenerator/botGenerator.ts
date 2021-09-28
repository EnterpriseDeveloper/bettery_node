import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import axios from "axios";
import {path} from "../../config/path";

const bip39 = require("bip39");

const creatAllBots = async (amount: number) => {
    let params = []
    for (let i = 1; i <= amount; i++) {
        params.push(await creatOneBot(i))
    }
    return params
}

let creatOneBot = (i: any) => {
    return generationWallet().then(({wallet, mnemonic}) => {
        const nickName = randomName();
        return {
            "_id": "users",
            "avatar": `https://api.bettery.io/image/user_${i}.png`,
            "nickName": nickName,
            "email": `${nickName + i}@fake.com`,
            "wallet": wallet,
            "isBot": true,
            "seedPhrase": mnemonic
        }
    })
}


const randomName = () => {
    let name = ['James', 'Mary', 'Robert', 'Kirk', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Ryan', 'Justin', 'Gregory', 'Christine', 'Frank', 'Debra', 'Alexander', 'Raymond', 'Rachel', 'Catherine', 'Samuel', 'Benjamin', 'Jack', 'Dennis', 'Tom', 'Max', 'Johnny', 'Ruth', 'Jerry', 'Maria', 'Tyler', 'Heather', 'Aaron', 'Diane', 'Jose', 'Virginia', 'Adam', 'Julie', 'Henry', 'Joyce', 'Nathan', 'Victoria', 'Douglas', 'Olivia', 'Zachary', 'Kelly', 'Peter', 'Andrii', 'Christina', 'Kyle', 'Lauren', 'Walter', 'Joan', 'Ethan', 'Evelyn', 'Jeremy', 'Judith', 'Harold', 'Megan', 'Keith', 'Cheryl', 'Jerome', 'Johnson', 'Jones', 'Howard', 'Gilmore', 'Ford']
    let surname = ['Choe', 'Choi', 'Chong', 'Bartlet', 'Sohrin', 'Chou', 'Chu', 'Chun', 'Chung', 'Chweh', 'Gil', 'Gu', 'Gwang', 'Hyun', 'Jang', 'Jeon', 'Haig', 'Hailey', 'Hamphrey', 'Hancock', 'Hardman', 'Harrison', 'Hawkins', 'Keat', 'Kelly', 'Kendal', 'Kennedy', 'MacAlister', 'MacDonald', 'Macduff', 'Macey', 'Mackenzie', 'Mansfield', 'Marlow', 'Marshman', 'Mason', 'Nash', 'Nathan', 'Neal', 'Nelson', 'Page', 'Palmer', 'Parkinson', 'Parson', 'Pass', 'Paterson', 'Salisburry', 'Salomon', 'Samuels', 'Saunder', 'Shackley', 'Sheldon', 'Sherlock', 'Shorter', 'Taft', 'Taylor', 'Thomson', 'Thorndike', 'Roberts', 'Roger', 'Russel', 'Ryder', 'Nevill', 'Nicholson', 'Nyman', 'Mathews', 'Mercer', 'Michaelson', 'Miers', 'Miller', 'Miln', 'Milton', 'Molligan', 'Morrison', 'Murphy']

    function getRandomInt(min: any, max: any) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    return name[getRandomInt(0, name.length + 1)] + surname[getRandomInt(0, surname.length + 1)];
}

const generationWallet = async () => {
    const mnemonic = bip39.generateMnemonic(256);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    const [pubKey] = await wallet.getAccounts();

    return {wallet: pubKey.address, mnemonic}
}

const sendToDBBots = async (amount: number) => {
    let params = await creatAllBots(amount)

    if (params && params.length) {
        // await axios.post(`${path}transact`, params).catch((err) => {
        //     console.log(err.response.data.message)
        //     console.log('from botGenerator')
        //     return
        // })
      //!  console.log(params, 'params')
    }
}

//! sendToDBBots(2)



