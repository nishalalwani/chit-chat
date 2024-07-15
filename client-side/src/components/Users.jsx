import React, { useContext, useEffect, useState } from 'react'
import logo from '../assets/images/chat.png'
import { IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import '../assets/style/myStyles.css'
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { myContext } from "./MainContainer"
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { ChatState } from '../Context/ChatProvider';

const Users = () => {
  const { refresh, setRefresh } = useContext(myContext)
  const { setSelectedChat, userData, chats, setChats } = ChatState()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  if (!userData) {
    console.log("User is not Authenticated");
    navigate(-1)
  }

  const lightTheme = useSelector((state) => state.themeKey)

  useEffect(() => {
    console.log("Users refreshed")
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`
      }
    }
    axios.get("http://192.168.29.39:8000/user/fetchUsers", config).then((data) => {
      console.log("User data from API", data);
      setUsers(data.data);
    })
  }, [refresh]);

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      const { data } = await axios.post(
        "http://192.168.29.39:8000/chat",
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
    } catch (error) {
      console.log(error);
    }
  };
 

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );
  


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ ease: "anticipate", duration: "0.4" }}
        className='list_container'
      >
        <div className={"ug_header" + (lightTheme ? "" : " dark")}>
          <img src={logo} style={{ height: "2rem", width: "2rem" }} alt="" />
          <p className={'ug_title' + (lightTheme ? "" : " dark")}>Available Users</p>
        </div>
        <div className={"sb_search" + (lightTheme ? "" : " dark")}>
          <IconButton>
            <SearchIcon />
          </IconButton>
          <input
            type="text"
            className={'search_box' + (lightTheme ? "" : " dark")}
            placeholder='Search'
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="ug_list">
          {filteredUsers.map((user, index) => {
            return (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={"list_item" + (lightTheme ? "" : " dark")}
                style={{ cursor: 'pointer' }} 
                key={index}
                onClick={() => {
                  console.log("Creating chat with ", user.name);
                  accessChat(user._id)
                  navigate("/app/chat")
                }}
              >
                <img className='con_icon' src={user.image}/>
                <p style={{ padding: '8px', color: lightTheme ? "" : "#dad7d7" }} className='con_title'>{user.name}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Users
