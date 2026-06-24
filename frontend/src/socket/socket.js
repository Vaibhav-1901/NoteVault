import {io} from "socket.io-client";
import { BASE_URL } from "../../constants.js";
const socket=io(
    BASE_URL,
    {
        withCredentials:true,
        autoConnect:false, 
    }
) 

export default socket;