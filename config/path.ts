import { APIprod, APItest, demon, testDemon } from "./key";

const ip = process.env.NODE_ENV == "production" ? APIprod : APItest;
const demonPath = process.env.NODE_ENV == "production" ? demon : testDemon;
const path = `http://${ip}/fdb/demo/quize`;
const demonAPI = `http://${demonPath}`

export {
    path,
    demonAPI
}
