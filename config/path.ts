import { APIprod, APItest, demon, testDemon } from "./key";

const ip = process.env.NODE_ENV == "production" ? APIprod : APItest;
const demonPath = process.env.NODE_ENV == "production" ? demon : testDemon;
// const path = `http://${ip}/fdb/demo/quize`;
const path = `http://localhost:8090/fdb/test/bettery22`;
const demonAPI = `http://${demonPath}`

export {
    path,
    demonAPI
}
