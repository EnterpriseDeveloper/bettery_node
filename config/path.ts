import keys from "./key";

const ip = process.env.NODE_ENV == "production" ? keys.APIprod : keys.APItest;
const path = `http://${ip}/fdb/demo/quize`;

export = {
    path
}