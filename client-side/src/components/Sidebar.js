import React, { useContext, useEffect, useState,useRef } from "react";
import "../assets/style/myStyles.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from '@mui/icons-material/Groups';
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightIcon from "@mui/icons-material/Nightlight";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton, Menu, MenuItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "../Features/themeSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { myContext } from "./MainContainer";
import Snackbar from "@mui/material/Snackbar";
import { ChatState } from "../Context/ChatProvider";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import profile from "../assets/images/p.jpg";
import ImageIcon from "@mui/icons-material/Image";





const Sidebar = () => {
  const StyledMenu = styled(Menu)`
  .MuiPaper-root {
    max-height: 400px;
    width: 20ch;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
`;
  const inputRef= useRef(null)
  const [search, setSearch] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const { refresh, setRefresh ,setMessageContent,messageContent,setToasterMessage,setSeverityVal } = useContext(myContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState('');
  

  const fileInputRef= useRef(null)
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleIconClick=()=>{
    fileInputRef.current.click()
  }

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    border: "2px solid #9e9e9e",
    boxShadow: 24,
    borderRadius: "12px",
    p: 4,
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData) {
    console.log("User is not Authenticated");

    navigate("/");
  }
  const { setSelectedChat, chats, setChats, selectedChat,allMessages,onlineUsers} = ChatState();
 

  // This function receives the entire Redux store state as its argument and returns the specific piece of data that you're interested in, which in this case is state.themeKey.

  const lightTheme = useSelector((state) => state.themeKey);
  const user = userData.data;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get("/chat", config);

        await setChats(data);


      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchData();
  }, [allMessages]);

  const logoutHandler = () => {
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleSearch = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/user/fetchUsers?search=${search}`,
        config
      );
      setSearchResult(data);

    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }

  const handleFileChange = (pic) => {
    if(pic===undefined){
      console.log("Please select an image")
      return;
  }
  if(pic.type==="image/jpeg" || pic.type==="image/png"){
    const data= new FormData()
    data.append("file",pic)
    data.append("upload_preset", "chat-app")
    data.append("cloud_name","dpuc22zhd")
    fetch("https://api.cloudinary.com/v1_1/dpuc22zhd/image/upload",{
      method:"post",
      body:data
    })
    .then((res)=>res.json())
    .then((data)=>{
      setImg(data.url.toString())
    }).catch((err)=>{
      console.log(err)
    })

    // handleUpdateGroupImage()
  }
  };


  const accessChat = async (userId) => {

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/chat",
        { userId },
        config
      );
    

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);


    } catch (error) {
      setToasterMessage("error")
      setSeverityVal("Error occurred while accessing chat!")
      console.log(error);
    }
  };



  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      handleSearch();
    }, 1000); // Adjust the delay time as needed (e.g., 1000 milliseconds)

    return () => clearTimeout(debounceSearch);
  }, [search]);

  const handleInputChange = async (event) => {
    setSearch(event.target.value);
    handleMenuOpen(); 
  }

  const handleMenuOpen = () => {
    setAnchorEl(inputRef.current); // Set the anchor element to open the Menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the Menu
  };

  const handleAccountMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setMenuAnchorEl(null);
  };

  useEffect(() => {
    if (anchorEl) {
      inputRef.current.focus();
    }
  }, [anchorEl]);

  const sortedChats = chats?.sort((a, b) => {
    if (!a.latestMessage) return 1;
    if (!b.latestMessage) return -1;
    return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
  });

  useEffect(() => {
    // console.log('Online users updated:', onlineUsers);
  }, [onlineUsers]);



  return (
    <div className="sidebar_container">
<Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div class="user-info">
          <div className="d-flex justify-content-center position-relative">
      <img src={userData.data.iamge} alt="User Image" className="img-fluid" />
 
        <ImageIcon
          onClick={handleIconClick}
          className="position-absolute image-edit-group"
          style={{ bottom: '1.5rem', left: '15rem', cursor: 'pointer' }}
        />
        <input type="file" ref={fileInputRef}  style={{ display: 'none' }}
            onChange={(e)=>handleFileChange(e.target.files[0])}/>
  

    </div>
            <img src={userData.data.image} alt="User Image" />
            <h2>{userData.data.name}</h2>
            <p>
              {
               userData.data.email
              }
            </p>
          </div>
        </Box>
      </Modal>
   
      <div className={"sb_header" + (lightTheme ? "" : " dark")}>
        <div>
          <IconButton onClick={handleAccountMenuOpen}>
            <AccountCircleIcon className={lightTheme ? "" : " dark"} />
          </IconButton>

          
        </div>
        <div>
          <IconButton
            onClick={() => {
              navigate("users");
            }}
          >
            <PersonIcon className={lightTheme ? "" : " dark"} />
          </IconButton>

          <IconButton
            onClick={() => {
              navigate("groups");
            }}
          >
            <GroupsIcon className={lightTheme ? "" : " dark"} />
          </IconButton>

          <IconButton
            onClick={() => {
              navigate("create-groups");
            }}
          >
            <GroupAddIcon className={lightTheme ? "" : " dark"} />
          </IconButton>

          <IconButton
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {lightTheme ? (
              <NightlightIcon className={lightTheme ? "" : " dark"} />
            ) : (
              <LightModeIcon className={lightTheme ? "" : " dark"} />
            )}
          </IconButton>
        </div>
      </div>
      <div className={"sb_search" + (lightTheme ? "" : " dark")}>
        <IconButton id="search-button" onClick={handleMenuOpen} >
          <SearchIcon className={lightTheme ? "" : " dark"} />
        </IconButton>
        <input
          className={"search_box" + (lightTheme ? "" : " dark")}
          placeholder="search"
          ref={inputRef}
          value={search}
          onChange={handleInputChange}
        />
       
      </div>
      <div className={"sb_conversation" + (lightTheme ? "" : " dark")}>
        <StyledMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
  
        >
          {searchResult.map((user, index) => (
            <MenuItem key={index} onClick={handleMenuClose}>
              <ListItemText
                primary={user.name}
                onClick={() => {
                  accessChat(user._id);
                  navigate("/app/chat")
                }}
              />
            </MenuItem>
          ))}
        </StyledMenu>

        {sortedChats ?.map((chat, index) => {
          var chatName = "";
          if (chat?.isGroupChat) {
            chatName = chat?.chatName;
          } else {
            chat?.users.map((user) => {
              if (user._id !== userData.data._id) {
                chatName = user.name;
              }
            });
          }

          var chatImage= chat?.isGroupChat?chat.groupImage:chat?.users?.filter((u)=>u._id!==userData.data._id)[0].image

          // Check if there are no previous messages in the chat
          if (chat.latestMessage === undefined || chat.latestMessage === null) {
            return (
              <div
                key={chat._id}
                className={"conversation_container"+(lightTheme?"":" dark")}
                onClick={() => {
                  setSelectedChat(chat);
                  setMessageContent("")
                  navigate('/app/chat')
                }}
                style={{
                  backgroundColor: selectedChat?._id === chat._id ? "#f1f1f1" : "",paddingLeft:"14px"
                }}
              
              >
                <img className="con_icon" src={chatImage}/>
                {chat.isGroupChat?"":chat?.users.filter((u)=>u._id!==userData.data._id).some((u)=>onlineUsers[u._id])?<div className="active_dot"/>:""}
                <p className={"con_title"+(lightTheme?"":" dark")}>{chatName}</p>
                <p className={"con_lastMessage"+(lightTheme?"":" dark")}>
                  No previous messages
                </p>
              </div>
            );
          } else {
            // Display the latest message

            return (
              <div
                key={index}
                className="conversation_container"
                onClick={() => {
                  setSelectedChat(chat);
                  setMessageContent("")
                  navigate('/app/chat')
                }}
                style={{
                  backgroundColor: selectedChat?._id === chat._id ? lightTheme? "#f1f1f1" : "#ffffff33":"",paddingLeft:"14px"
                }}
              >
                {chat.isGroupChat?"":chat?.users.filter((u)=>u._id!==userData.data._id).some((u)=>onlineUsers[u._id])?<div className="active_dot"/>:""}
            
                <img className="con_icon" src={chatImage}/>
                <p className="con_title"style={{color:lightTheme?"black":"white"}}>{chatName}</p>
                <p className= "con_lastMessage" style={{color:lightTheme?"black":"white"}}>
                  {chat.latestMessage.sender.name}: {chat.latestMessage.content}
                </p>
              </div>
            );
          }
        })}
      </div>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleAccountMenuClose}
      >
        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
        <MenuItem onClick={handleOpen}>User Info</MenuItem>
      </Menu>
    </div>
  );
};

export default Sidebar;
