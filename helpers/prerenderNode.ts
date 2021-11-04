import axios from "axios";
import {prerenderToken} from "../config/key";

const prerenderNode = (path: string, id: string) => {


    let data = {
        prerenderToken: prerenderToken,
        url: `${path}/${id}`
    }
    console.log(data, 'data')
    axios.post('https://api.prerender.io/recache', data).catch(err => {
        console.log(`Error from preview link:${err}`)
    })
}

export {
    prerenderNode
}
