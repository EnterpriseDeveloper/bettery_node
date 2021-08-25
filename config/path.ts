import { APIprod, APItest } from "./key";

const ip = process.env.NODE_ENV == "production" ? APIprod : APItest;
// const path = `http://${ip}/fdb/demo/quize`;
const path = `http://localhost:8090/fdb/test/bettery3`;

export {
    path
}
