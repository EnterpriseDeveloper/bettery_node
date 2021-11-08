import axios from "axios";
import {prerenderToken, proxyUrl} from "../config/key";

const prerenderNode = (param: string, id: string) => {
    let url = proxyUrl + '/' + param

    let data = {
        prerenderToken: prerenderToken,
        url: `${url}/${id}`
    }

    axios.post('https://api.prerender.io/recache', data).catch(err => {
        console.log(`Error from preview link:${err}`)
    })
}

export {
    prerenderNode
}
