import { createContext, useEffect, useState, useContext } from "react";
import React from "react";
import { BASE_URL } from "../../constants";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userloading, setUserLoading] = useState(true);

    useEffect(() => {
        if(user){
            setUserLoading(false);
            return;
        }
        const fetchUser = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/users/me`,
                    { credentials: "include" }
                )
                if (!res.ok) throw new Error("Please Login Again");
                const data = await res.json();
                setUser(data.data);
            } catch (error) {
                console.error("Error fetching user:", error);
                setUser(null);
            }
            finally {
                setUserLoading(false);
            }
            
        }
        fetchUser();
    }, [])
    return (
        <UserContext.Provider value={{ user, setUser, userloading }}>
            {children}
        </UserContext.Provider>
    )

}
export function useUser() {
    return useContext(UserContext);
}




