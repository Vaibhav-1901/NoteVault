import { BASE_URL } from '../../constants.js';
export const fetchWithRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
        ...options,
        credentials: "include",
    });
    let data = await res.json();
    if (!res.ok && data.message === "Invalid Access Token") {
        const renew = await fetch(`${BASE_URL}/api/users/refresh`, {
            method: "POST",
            credentials: "include",
        });

        if (!renew.ok) {
            throw new Error("Session expired");
        }
        data = await renew.json();
       
        res = await fetch(url, {
            ...options,
            credentials: "include",
        });

        data = await res.json();

    }

    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }
    return data;
};