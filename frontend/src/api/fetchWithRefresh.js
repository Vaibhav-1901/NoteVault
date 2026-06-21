import { BASE_URL } from '../../constants.js';
import socket from "../socket/socket";
export const fetchWithRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
        ...options,
        credentials: "include",
    });
    let data = await res.json();
    console.log("FIRST RESPONSE", res.status, data);
    if (!res.ok && data.message === "Invalid Access Token") {
        const renew = await fetch(`${BASE_URL}/api/users/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (!renew.ok) {
            throw new Error("Session expired");
            socket.disconnect();
        }
        data = await renew.json();
        if(socket.connected){
            socket.disconnect();
            socket.auth={
                token:data.AccessToken
            }
            socket.connect();
        }
        console.log("Access token refreshed");
        res = await fetch(url, {
            ...options,
            credentials: "include",
        });

        data = await res.json();

         console.log("SECOND RESPONSE", res.status, data);
    }

    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }
    return data;
};