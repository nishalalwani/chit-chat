import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import "../assets/style/myStyles.css";
import SendIcon from "@mui/icons-material/Send";
import { IconButton, Input } from "@mui/material";
import MessageOthers from "./MessageOthers";
import MessageSelf from "./MessageSelf";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import { myContext } from "./MainContainer";
import { ChatState } from "../Context/ChatProvider";
import Welcome from "./Welcome";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useToast } from "@chakra-ui/react";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import VideocamIcon from "@mui/icons-material/Videocam";
import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import profile from "../assets/images/p.jpg";
import { useSocket } from "../Context/Socket";
import { usePeer } from "../Context/Peer";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import ImageIcon from "@mui/icons-material/Image";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import AddPeopleToGroup from "./AddPeopleToGroup";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";



var socket, selectedChatCompare;

const ChatArea = ({ fetchAgain, setFetchAgain }) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [socketConnectionStatus, setSocketConnectionStatus] = useState(false);
  const [loaded, setloaded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(null);
  const [lastSeen, setLastSeen] = useState();
  const [showAddUser, setShowAddUser] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState([]);
  const [img, setImg] = useState();
  const [renameOpen, setRenameOpen] = React.useState(false);



  const handleOpenGroupModal = () => setOpenGroupModal(true);
  const handleCloseGroupModal = () => setOpenGroupModal(false);
  const handleToggleAddUserModal = () => setShowAddUser(!showAddUser);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const fileInputRef= useRef(null)

  const handleIconClick=()=>{
    // The line fileInputRef.current.click() triggers a click event on the file input element.
    fileInputRef.current.click()
  }

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "29rem",
    bgcolor: "background.paper",
    border: "2px solid #9e9e9e",
    boxShadow: 24,
    borderRadius: "12px",
    p: 4,
  };

  const darkStyle = {
    border: "2px solid #9e9e9e",
    boxShadow: 24,
    borderRadius: "12px",
    p: 4,
    bgcolor: '#000000',
    color: '#fff',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
  };


  const messagesEndRef = useRef(null);
  const typingTimeOutRef = useRef(null);

  const {
    refresh,
    setRefresh,
    messageContent,
    setMessageContent,
    onlineUsers,
    handleOpen,
    handleClose,
    open,
    setOpen,
    setToasterMessage,setSeverityVal
  } = useContext(myContext);
  const {
    selectedChat,
    setSelectedChat,
    allMessages,
    setAllMessages,
    remoteUserId, setRemoteUserId,
    incomingCall, setIncomingCall,
    callFrom, setCallFrom,
    videoNavigate, setVideoNavigate
  } = ChatState();


const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAns, remoteStream } = usePeer();

  const toast = useToast();
  const navigate = useNavigate();


  const chatName = selectedChat
    ? selectedChat.isGroupChat
      ? selectedChat.chatName
      : selectedChat.users?.filter((u) => u._id !== userData.data._id)[0]?.name
    : "";

    const chatId=selectedChat
    ? selectedChat.isGroupChat
      ? selectedChat.chatName
      : selectedChat.users?.filter((u) => u._id !== userData.data._id)[0]?._id
    : "";
    var chatImage= selectedChat?.isGroupChat?selectedChat.groupImage:selectedChat?.users?.filter((u)=>u._id!==userData.data._id)[0]?.image





  const handleRenameOpen = () => {
    setRenameOpen(true);
  };

  const handleRenameClose = () => {
    setRenameOpen(false);
  };

  const typingHandler = async (e) => {
    if(!selectedChat)return
    setMessageContent(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { selectedChat, userData });
    }

    if (typingTimeOutRef.current) {
      clearTimeout(typingTimeOutRef.current);
    }

    setLastTypingTime(new Date().getTime());
    const timerLength = 3000;
    typingTimeOutRef.current = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const sendMessage = async () => {
    if(!selectedChat)return
    socket.emit("stop typing", selectedChat._id);
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    try {
      const { data } = await axios.post(
        "/message/",
        {
          content: messageContent,
          chatId: selectedChat._id,
        },
        config
      );
      socket.emit("new message", data);
      setAllMessages([...allMessages, data]);

    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
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

    handleUpdateGroupImage()
  }
  };

  const handleUpdateGroupImage=async()=>{
    if(!selectedChat)return
    try{
      const config={
        headers:{
          Authorization:`Bearer ${userData.data.token}`,
          "Content-type":"application/json"
        }
      }

      const {data}= await axios.put("/chat/updateImage",
        {image:img,
          chatId:selectedChat._id

        },
        config
      )
      setToasterMessage("Image Updated Successfully!")
      setSeverityVal("success")
      setSelectedChat(data)

    }catch(error){
      setToasterMessage("Error occurred while updating image!")
      setSeverityVal("error")
      console.log("error",error)
    }
  }

  const handleRemove = async (user1) => {
    if(!selectedChat)return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      const { data } = await axios.put(
        `/chat/groupExit`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === userData.data._id
        ? setSelectedChat()
        : setSelectedChat(data);
        setToasterMessage("User Removed!")
        setSeverityVal("success")
    } catch (error) {
     setToasterMessage("Error Occurred!")
     setSeverityVal("error")
     console.log("error",error)
    }
  };

  useEffect(() => {
    socket.emit("setup", userData);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const handleRoomJoined = useCallback(
    ({ roomId }) => {
      navigate(`/app/room/${roomId}`);
    },
    [navigate]
  );

  // useEffect(() => {
  //   socket.on("joined-room", handleRoomJoined);

  //   return () => {
  //     socket.off("joined-room", handleRoomJoined);
  //   };
  // }, [handleRoomJoined, socket]);

  // const handleJoinRoom = () => {
  //   const userId = userData.data._id;
  //   const roomId = selectedChat?._id;
  //   socket.emit("join-room", { roomId, userId });

  // };

  // useEffect(()=>{
  //   handleJoinRoom()
  // },[])
  console.log(videoNavigate,"gvh")

  const handleCall = (userToCall) => {
    const roomId = selectedChat?._id;
    socket.emit("call-user-notification", { roomId, callerId: userData.data._id, calleeId: userToCall });
    // Caller joins the room
    socket.emit("join-room", { roomId, userId: userData.data._id });
     navigate(`/app/room/${roomId}`)
   ;
  };
  
  useEffect(() => {
    socket.on("incoming-call-notification", ({ roomId, callerId }) => {
      // Only callee joins the room on incoming call notification
      if (userData.data._id !== callerId) {
        socket.emit("join-room", { roomId, userId: userData.data._id });
         navigate(`/app/room/${roomId}`)
        setIncomingCall(true);
        setCallFrom(callerId);
      }
    });
   return () => {
    socket.off("incoming-call-notification");
  };
}, [socket, navigate, userData.data._id]);


  const fetchMessages = async () => {
    if (!selectedChat) return;
    setloaded(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      const { data } = await axios.get(
        `/message/${selectedChat._id}`,
        config
      );
      if (data) {
        setAllMessages(data);
        setloaded(false);
      }
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log("error",error)
    }
  };

  const handleRename = async () => {
    if (!newGroupName || !userData || !userData.data || !userData.data.token) {
      console.error("UserData or token not available:", userData);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      const { data } = await axios.put(
        `/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: newGroupName,
        },
        config
      );


      setToasterMessage("Group Renamed successfully!")
      setSeverityVal("success")
      setSelectedChat(data);
    } catch (error) {
     setToasterMessage("Error Occurred!")
     setSeverityVal("error")
    }
    setNewGroupName("");
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      setAllMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ animated: true });
    }
  }, [allMessages, messageContent]);

  useEffect(() => {
    const fetchLastSeen = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };
        const { data } = await axios.get(
          "/user/last-seen",
          config
        );

        setLastSeen(data);
      } catch (error) {
        console.log("Error fetching last seen:", error);
      }
    };

    fetchLastSeen();
  }, []);

  useEffect(() => {
    // console.log('Online users updated:', onlineUsers);
  }, [onlineUsers]);

  const otherUserIds = selectedChat?.users
    ?.filter((u) => u._id !== userData.data._id)
    ?.map((u) => u._id);

  const status = otherUserIds?.map((id) => {
    if (onlineUsers[id]) {
      return `Online`;
    } else {
      const lastSeenTime = lastSeen?.[id];
      if (lastSeenTime) {
        return `last seen at ${new Date(lastSeenTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        return `Offline`;
      }
    }
  });

  const groupChat = selectedChat?.isGroupChat ? true : false;

  let groupMembers = [];
  if (selectedChat && selectedChat?.users && userData && userData.data) {
    groupMembers = selectedChat?.users
      .filter((u) => u._id !== userData.data._id)
      .map((u) => u.name);
    groupMembers.push(userData.data.name);

    groupMembers = groupMembers.join(", ");
  }

  const isLoggedUserAdmin = selectedChat?.groupAdmin?._id === userData.data._id;

  if (loaded) {
    return (
      <div
      className="chat-loading"
        style={{
          border: "20px",
          padding: "10px",
          width: "100%",
          display: "flex",
          flex:"0.7 1",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            borderRadius: "10px",
            flexGrow: "1",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
      </div>
    );
  }

  return (
    <>
      {selectedChat ? (
        <>
          <div className="chatArea_cotainer ">
            <div className={"chatArea_header" + (lightTheme ? "" : " dark")}>
              <IconButton
                onClick={() => {
                  navigate("/app/welcome");
                  setSelectedChat("");
                 
                }}
                className={(lightTheme ? "" : " dark")}
              >
                <ArrowBackIosIcon />
              </IconButton>

              <img className="con_icon" src={chatImage}/>
              <div className={"header_txt" + (lightTheme ? "" : " dark")}>
                <p className={"con_title" + (lightTheme ? "" : " dark")}>
                  {chatName}
                </p>
                {groupChat ? (
                  <p className={"header_timeStamp" +(lightTheme ? "" : " dark")}>{groupMembers} (You) </p>
                ) : (
                  <p className={"header_timeStamp" +(lightTheme ? "" : " dark")}>
                    {isTyping ? "typing..." : status}
                  </p>
                )}
              </div>
      
              <IconButton  className={(lightTheme ? "" : " dark")} onClick={()=>handleCall(chatId)} >
                <LocalPhoneIcon/>
              </IconButton>
              <IconButton className={(lightTheme ? "" : " dark")} onClick={()=>{setVideoNavigate(true);handleCall(chatId)}}>
                <VideocamIcon />
              </IconButton>
              <IconButton
                onClick={groupChat ? handleOpenGroupModal : handleOpen}
                className={(lightTheme ? "" : " dark")}
              >
                <InfoIcon />
              </IconButton>

            </div>

            <div className={"messages_container" + (lightTheme ? "" : " dark")}>
              {allMessages &&
                allMessages.map((message, index) => {
                  const sender = message.sender;
                  const self_id = userData.data._id;

                  // Check if the message object has the 'content' property
                  const messageContent = message?.content || ""; // Use optional chaining and provide a default value

                  if (messageContent === "") {
                    // Render a placeholder for empty content
                    return <div key={index}>Empty Message</div>;
                  } else {
                    if (sender._id === self_id) {
                      return (
                        <MessageSelf
                          content={messageContent}
                          createdAt={message.createdAt}
                          key={index}
                        />
                      );
                    } else {
                      return (
                        <MessageOthers
                        
                          props={message}
                          createdAt={message.createdAt}
                          key={index}
                        />
                      );
                    }
                  }
                })}

              <div ref={messagesEndRef} className="BOTTOM" />
            </div>
            <div className={"text_input_area my-3 mx-2" + (lightTheme ? "" : " dark")} >
              <input
                placeholder="Type a message"
                type="text"
                className={"search_box" + (lightTheme ? "" : " dark")}
                value={messageContent}
                onChange={typingHandler}
                onKeyDown={(event) => {
                  if (event.key == "Enter") {
                    sendMessage();
                    setMessageContent("");
                    setRefresh(!refresh);
                  }
                }}
              />

              <IconButton
                className={"icon" + (lightTheme ? "" : " dark")}
                onClick={() => {
                  sendMessage();
                  setMessageContent("");
                  setRefresh(!refresh);
                }}
              >
                <SendIcon />
              </IconButton>
            </div>
          </div>
        </>
      ) : (
        <Welcome />
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={lightTheme?style:darkStyle}>
          <div className={"user-info"}>

            <img src={chatImage} alt="User Image" />

            <h2 className={(lightTheme?"":"dark")}>{chatName}</h2>
            <p className={(lightTheme?"":"dark")}>
              {
                selectedChat?.users?.filter(
                  (u) => u._id !== userData.data._id
                )[0]?.email
              }
            </p>
          </div>
        </Box>
      </Modal>
      <Modal
        open={openGroupModal}
        onClose={handleCloseGroupModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        
      >
        <Box sx={lightTheme?style:darkStyle}>
          <div class="user-info">
          <div className="d-flex justify-content-center position-relative">
      <img src={chatImage} alt="User Image" className="img-fluid" />
      {isLoggedUserAdmin && (
        <>
        <ImageIcon
          onClick={handleIconClick}
          className="position-absolute image-edit-group"
          style={{ bottom: '1.5rem', left: '15rem', cursor: 'pointer' }}
        />
        <input type="file" ref={fileInputRef}  style={{ display: 'none' }}
            onChange={(e)=>handleFileChange(e.target.files[0])}/>
        </>
      )}
    </div>
            <div className="d-flex text-align-center justify-content-center mt-3">
              <h2 className={"px-2  mb-4"+ (lightTheme?"":" text-white")}>{chatName}</h2>
              {isLoggedUserAdmin ? (
                <BorderColorIcon onClick={handleRenameOpen} />
              ) : (
                ""
              )}
            </div>

            <List>
              {selectedChat?.users
                ?.filter((u) => u._id !== userData.data._id)
                ?.map((user, index) => {
                  return (
                    <ListItem key={index} className="listItem">
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <div className="d-flex flex-column">
                        <ListItemText primary={user.name}  />
                        <ListItemText primary={user.email} />
                        </div>
                        {isLoggedUserAdmin ? (
                          <PersonRemoveAlt1Icon
                            onClick={() => handleRemove(user)}
                          />
                        ) : (
                          ""
                        )}
                        {user._id === selectedChat?.groupAdmin?._id ? (
                          <button className="rounded-pill bg-success text-white border-white px-2 ">Admin</button>
                        ) : (
                          ""
                        )}
                      </div>
                    </ListItem>
                  );
                })}

                <ListItem className="listItem">
     <div className="d-flex justify-content-center justify-content-between w-100 align-items-center">
                  <div className="d-flex flex-column">
                  <ListItemText  primary={`${userData.data.name} (You)`}  />
                  <ListItemText  primary={userData.data.email} />
                  </div>
                  {isLoggedUserAdmin&& <Box><button className="rounded-pill bg-success text-white border-white px-2 ">Admin</button></Box>}

     </div>

             
              </ListItem>
              <ListItem/>
            </List>
            {isLoggedUserAdmin ? (
              <button className="rounded-pill py-2 px-4 mt-4" onClick={handleToggleAddUserModal}>Add users</button>
            ) : (
              ""
            )}

            {showAddUser ? <AddPeopleToGroup from="chatsPage" /> : ""}
          </div>
        </Box>
      </Modal>

      <Dialog
        open={renameOpen}
        onClose={handleRenameClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="dialogTitle">
          Rename Group
        </DialogTitle>
        <DialogContent className="dialogContent">
          <div style={{ display: "flex", marginTop: "23px" }}>
            <TextField
              label="Enter new group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              variant="outlined"
              color="secondary"
            />
            <Button
              variant="contained"
              className="button bg-dark"
              onClick={() => {
                handleRename();
                handleRenameClose();
              }}
            >
              Update
            </Button>
          </div>
        </DialogContent>
        <DialogActions className="dialogActions">
          <Button onClick={handleRenameClose}>CANCEL</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatArea;
