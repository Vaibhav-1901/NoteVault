import {io} from "socket.io-client";
import { BASE_URL } from "../../constants.js";
 console.log("BASE_URL:", JSON.stringify(BASE_URL));
const socket=io(
    BASE_URL,
    {
        withCredentials:true,
        autoConnect:false, 
    }
) // making a connection to the server

export default socket;