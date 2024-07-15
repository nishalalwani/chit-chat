import React, { useContext,useEffect ,useState} from 'react'
import logo from '../assets/images/chat.png'
import { IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import '../assets/style/myStyles.css'
import { useSelector,useDispatch } from 'react-redux';
import {AnimatePresence,motion} from 'framer-motion'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import { refreshSidebarFun } from "../Features/refreshSidebar";
import {myContext} from "./MainContainer"
import { ChatState } from '../Context/ChatProvider';


const Groups = () => {

    const[groups, setGroups] =useState([])
    const[search, setSearch] =useState("")
    const {refresh, setRefresh} = useContext(myContext)
    const {setSelectedChat,userData,chats,setChats,selectedChat} = ChatState()

    const lightTheme=useSelector((state)=>state.themeKey)
    const navigate= useNavigate()
    const dispatch= useDispatch()

    if(!userData){
        console.log("user is not authenticated")
        navigate("/")
      }
    
      const user=userData.data;

    useEffect(()=>{
        const config={
            headers:{
                Authorization:`Bearer ${user.token}`
            }
        }

        axios
        .get("/chat/fetchGroups",config)
        .then((response)=>{
            setGroups(response.data)
        })
    },[])

    const accessGroupChat = async (chatId) => {

        try {
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${userData.data.token}`,
            },
          };
          const { data } = await axios.post(
            "/chat/access-group",
            { chatId },
            config
          );
        
    
          if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
          setSelectedChat(data);
          console.log(data,"data")
        } catch (error) {
          console.log(error);
        }
      };

      const handleSearch=(e)=>{
        setSearch(e.target.value)
      }

      const filteredGroups= groups.filter((group)=>
        group.chatName.toLowerCase().includes(search.toLowerCase())
      )
      console.log(selectedChat,"sdjskdb")
 

  return (
    <AnimatePresence >
         <motion.div
            initial={{opacity:0,scale:0}}
            animate={{opacity:1,scale:1}}
            exit={{opacity:0,scale:0}}
            transition={{ease:"anticipate",duration:"0.4"}}
            className='list_container'>

        <div className={"ug_header" + (lightTheme?"":" dark")}>
            <img src={logo} style={{height:"2rem",width: "2rem"}}alt="" />
            <p className={'ug_title' + (lightTheme?"":" dark")}>Available Groups</p>
        </div>
        <div className={"sb_search" + (lightTheme? "": " dark")}>
            <IconButton>
                <SearchIcon/>
            </IconButton>
            <input type="text" className={'search_box'+(lightTheme? "": " dark")} placeholder='Search' onChange={handleSearch}/>
        </div>
        <div className="ug_list">
            {filteredGroups.map((group,index)=>{

                return(
                    <motion.div 
                     key={index} 
                     onClick={()=>{
                        navigate('/app/chat')
                        accessGroupChat(group._id)
                        dispatch(refreshSidebarFun())
                    }} 
                    whileHover={{scale:1.03}} 
                    whileTap={{scale:0.98}} 
                    className={"list_item"  + (lightTheme?"":" dark")}
                    style={{ cursor: 'pointer' }} >
                      
                        <img className='con_icon' src={ group.groupImage}/>
                        <p style={{padding:'8px', color:lightTheme?"":"#dad7d7"}} className='con_title'>{group.chatName}</p>
                    </motion.div>
                )
            })}
        
        </div>
         </motion.div>
    </AnimatePresence>

  )
}

export default Groups