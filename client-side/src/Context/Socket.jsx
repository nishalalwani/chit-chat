import React, { useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext(null)

export const useSocket=()=>{
    return React.useContext(SocketContext)
}
const ENDPOINT = "https://chit-chat-y6ai.onrender.com"; 

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