import React,{ createContext, useContext, useState,useEffect }  from 'react';
import '../assets/style/myStyles.css'
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../Context/Socket';


import { useDispatch, useSelector } from 'react-redux';

import Toaster from './Toaster';





export const myContext = createContext();
export const MainContainerContext=()=>{
  return useContext(myContext)
}

const MainContainer = () => {
  const navigate=useNavigate()

  const { socket } = useSocket();
  const userData = JSON.parse(localStorage.getItem("userData"));
  if(!userData){
    console.log("User is not Authenticated")

    navigate("/")

  }
  
  const lightTheme = useSelector((state) => state.themeKey);
  const [refresh, setRefresh] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [onlineUsers, setOnlineUsers]= useState({})
  const [open, setOpen] = useState(false);
  const [toasterMessage, setToasterMessage]= useState("")
  const [severityVal, setSeverityVal]= useState("")
  const [snackbarOpen, setSnackbarOpen] = useState(false);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  

  useEffect(()=>{
    socket.emit('setup',userData)
    socket.on('userOnline', (userId)=>{
      setOnlineUsers((prev)=>({...prev,[userId]:true}))
    })
    socket.on('userOffline',(userId)=>{
      setOnlineUsers((prev)=>{
        const updatedUsers={...prev};
        delete updatedUsers[userId]
        return updatedUsers
      })
    })
    socket.on('onlineUsers',(users)=>{
      setOnlineUsers(users);
    })

    return () => {
      socket.disconnect();
    }
  },[])

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setToasterMessage("");
    setSeverityVal("");
  };

  useEffect(() => {
    if (toasterMessage) {
      setSnackbarOpen(true);
    }
  }, [toasterMessage]);
 


  return (
    <myContext.Provider value={{ refresh: refresh, setRefresh: setRefresh,messageContent,setMessageContent,onlineUsers,setOnlineUsers,handleOpen,handleClose,open,setOpen,selectedUsers, setSelectedUsers,setToasterMessage,setSeverityVal }}> 
    {/* Providing context value */}

          <div className='mainn_container' style={{ backgroundColor: lightTheme ? "" : "rgb(53 51 51 / 72%)" }}>
             {userData && <Sidebar />}
             {userData && <Outlet  />}
          </div>
    <div className="position-absolute" style={{ top: "1rem", right: "2rem" }}>
        <Toaster message={toasterMessage} severity={severityVal} open={snackbarOpen} handleClose={handleSnackbarClose} />
      </div>
      </myContext.Provider>
  );
}

export default MainContainer;