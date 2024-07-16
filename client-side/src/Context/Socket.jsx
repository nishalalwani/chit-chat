import React, { useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext(null)

export const useSocket=()=>{
    return React.useContext(SocketContext)
}
const ENDPOINT = "https://my-chitchat-app.onrender.com/"; 
// const ENDPOINT = "http://127.0.0.1:8000"; 

export const SocketProvider=(props)=>{
    const socket=useMemo(
        ()=>
            io(ENDPOINT)
    ,[])
    return(
        <SocketContext.Provider value={{socket}}>
            {props.children}
        </SocketContext.Provider>
    )
}