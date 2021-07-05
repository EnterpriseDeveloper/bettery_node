import { APIprod, APItest } from "./key";

const ip = process.env.NODE_ENV == "production" ? APIprod : APItest;
const path = `http://${ip}/fdb/demo/quize`;

export {
    path
}