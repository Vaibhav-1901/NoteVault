import React from 'react'
import { useState , useCallback} from 'react';
import {useCollab} from '../context/CollabContext.jsx';


function useToast() {
    const { setToasts } = useCollab();
    const show=useCallback((message,type="info")=>{
        const id=Date.now();
        setToasts((prev)=> [...prev,{id,message,type}]);
        setTimeout(()=>{
            setToasts((prev)=> prev.filter((t)=> t.id !==id));
        },3000)
    },[])
    return {show};
}
export default useToast