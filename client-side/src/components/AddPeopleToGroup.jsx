import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChatState } from '../Context/ChatProvider';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useToast } from '@chakra-ui/react';
import Box from "@mui/material/Box";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { MainContainerContext } from './MainContainer';

const AddPeopleToGroup = ({from,handleCreate}) => {

  const [searchResult, setSearchResult] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = React.useState(true);
  const [openAdd, setOpenAdd] = React.useState(false);

  const {chats,setChats,userData,selectedChat,setSelectedChat,}=ChatState()
  const {selectedUsers, setSelectedUsers,setToasterMessage,setSeverityVal}=MainContainerContext()
  const navigate= useNavigate()
  const toast = useToast();

  const darkStyle = {
    border: "2px solid #9e9e9e",
    bgcolor: '#000000',
    color: '#fff',
   
  };

  
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };



  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
     
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`http://192.168.29.39:8000/user/fetchUsers?search=${search}`, config);
      console.log(data);
      setSearchResult(data);
    } catch (error) {
        console.log(error)
    }
  }

  const handleGroup = (userToAdd) => {
    if(!selectedChat)return

    if (selectedUsers.includes(userToAdd)) {
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

 

  
  const handleDelete = (delUser) => {
    if(!selectedChat)return
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    setToasterMessage("User successfully removed from list!")
    setSeverityVal("success")
  };

  const handleAddUser = async (user1) => {
    if (selectedChat?.users.find((u) => u._id === user1._id)) {
     setToasterMessage("User Already in group!")
     setSeverityVal("error")
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `http://192.168.29.39:8000/chat/addToGroup`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
        );
        setToasterMessage("User successfully added in group!")
        setSeverityVal("success")

        setSelectedChat(data);


      } catch (error) {
        setToasterMessage("Error Occured!")
        setSeverityVal("error")


      }
  };

  if(!userData){
    console.log("user is not authenticated")
    navigate("/")
  }
  const user=userData.data;

  const lightTheme=useSelector((state)=>state.themeKey)

  return (
    <div>
     <Dialog
    
  open={open}
  onClose={handleClose}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"


>
<Box sx={ !lightTheme && darkStyle}>
  <DialogTitle id="alert-dialog-title" className={"dialogTitle"+(lightTheme?"":" dark")}>
    Select the people you want to add in your group
  </DialogTitle>
  <DialogContent className={"dialogContent"+ (lightTheme?"":" dark")}  >
    <div style={{display:"flex",marginTop:"23px"}}>
    <TextField
      
      label="Add Person"
      value={search}
      onChange={(e) => handleSearch(e.target.value)}
      variant="outlined"
      sx={{ 
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: lightTheme ? 'green' : 'white', 
          },
          '&:hover fieldset': {
            borderColor: lightTheme ? 'darkgreen' : 'white',
          },
          '&.Mui-focused fieldset': {
            borderColor: lightTheme ? 'darkgreen' : 'white',
          },
        },
        input: { color: lightTheme ? 'black' : 'white' } 
      }}
      className={lightTheme?"":"dark"}
    />
    <Button variant="contained" color="success" className="button">
      Add
    </Button>

    </div>
    <List  className={"cursor-pointer" +lightTheme?"":" dark"}>
  {searchResult?.slice(0, 4).map((user, index) => {
    return (
      <>
      {from==="createGroupPage"?
      <ListItem key={index} className="listItem cursor-pointer">
        <ListItemText primary={user.name} onClick={()=>{
          handleGroup(user) ;
        }} />
      </ListItem>:
      <ListItem key={index} className="listItem cursor-pointer">
        <ListItemText primary={user.name} onClick={()=>{
          handleGroup(user) ;setToasterMessage("Click on add icon to add in group!") ;setSeverityVal("warning");
        }} />
      </ListItem>}
      </>
    );
  })}
</List>


    <List  className={lightTheme?"":" dark"}>
      {selectedUsers?.map((member, index) => (
        <ListItem key={index} className="listItem">
          <ListItemText primary={member.name} />
          <ListItemSecondaryAction >
          {from==="createGroupPage"?"":<IconButton className={'mx-2'+ (lightTheme?"":" dark")} edge="end" aria-label="delete" onClick={() => handleAddUser(member)}>
              <PersonAddIcon />
            </IconButton>}
            
          
            <IconButton className={lightTheme?"":" dark"} edge="end" aria-label="delete" onClick={() => handleDelete(member)}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  </DialogContent>
  <DialogActions className="dialogActions"  >
    {from==="createGroupPage"?<>
    <Button onClick={handleClose}>CANCEL</Button>
    <Button onClick={() => { setToasterMessage("Group created successfully!") ;setSeverityVal("success");handleClose(); handleCreate() }} autoFocus>
      CREATE GROUP
    </Button>
    
    </>:<>
    <Button onClick={handleClose}>CANCEL</Button>
    <Button onClick={() => {setToasterMessage("Done") ;setSeverityVal("success"); handleClose(); }} autoFocus>
      DONE
    </Button>
    </>}
    
  </DialogActions>
  </Box>
</Dialog>
    </div>
  );
};

export default AddPeopleToGroup;
