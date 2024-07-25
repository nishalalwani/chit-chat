import React ,{createContext, useContext, useEffect ,useState} from 'react'
import { useSocket } from './Socket';

const ChatContext=createContext();



const ChatProvider = ({children}) => {
  
  const [selectedChat,setSelectedChat]=useState()
  const [allMessages, setAllMessages] = useState([]);
  const [chats,setChats]=useState([])
  const [onlineUsers, setOnlineUsers]= useState({})
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false); 
  const [callFrom, setCallFrom] = useState(null); 
  const [videoNavigate, setVideoNavigate] = React.useState(false);
  const [videoIconClicked, setVideoIconClicked] = React.useState(false);
  const [myRoomId,setMyRoomId]=useState()

  
  
  
  const {socket}= useSocket()
    
   const userData = JSON.parse(localStorage.getItem("userData"));

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

  return (
    <ChatContext.Provider value={{myRoomId,setMyRoomId,videoIconClicked, setVideoIconClicked,videoNavigate, setVideoNavigate,remoteUserId, setRemoteUserId,incomingCall, setIncomingCall,callFrom, setCallFrom,selectedChat,setSelectedChat,chats,setChats,allMessages,setAllMessages,userData,onlineUsers}}>
        {children}
    </ChatContext.Provider>
  )
}
export const ChatState=()=>{
    return useContext(ChatContext);
}


export default ChatProvider