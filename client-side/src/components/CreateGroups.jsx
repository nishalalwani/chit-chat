import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import React,{useState} from 'react'
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import '../assets/style/myStyles.css'
import { ChatState } from '../Context/ChatProvider';
import AddPeopleToGroup from './AddPeopleToGroup';
import Box from "@mui/material/Box";
import { MainContainerContext } from './MainContainer';

const CreateGroups = () => {
  const[groupName, setGroupName]=useState("")
  const [showAddUser, setShowAddUser] = useState(false);
 

  const navigate= useNavigate()

  const [openAdd, setOpenAdd] = React.useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleToggleAddUserModal=()=>setShowAddUser(!showAddUser)

  


  const {chats,setChats,userData,}=ChatState()
  const {selectedUsers, setSelectedUsers,setToasterMessage,setSeverityVal}=MainContainerContext()

  const handleClickOpen = () => {
    if(!groupName){
      setToasterMessage("Please enter group name!")
      setSeverityVal("error")
      return;
    }
   
    setOpen(true);
  };
  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };


    const handleRemovePerson = (index) => {
      const updatedMembers = [...groupMembers];
      updatedMembers.splice(index, 1);
      setGroupMembers(updatedMembers);
    };


  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };


  if(!userData){
    console.log("user is not authenticated")
    navigate("/")
  }


  const user=userData.data;


  const lightTheme=useSelector((state)=>state.themeKey)
 

  const createGroup=async()=>{
    console.log("creating group")

    if (!groupName||!selectedUsers) {
      return;
    }

    try{
      console.log("selectedusers",selectedUsers)
      const config={
        headers:{
          Authorization:`Bearer ${user.token}`
        }
      }
      
    const {data}= await axios.post("/chat/createGroup",
      {
        name:groupName,
        users: JSON.stringify(selectedUsers.map((user)=>user._id)),
      },config
    )
    setChats([data,...chats])
    navigate("/app/groups")
    console.log("success group",chats)
    }
    catch(error){
    console.error("Error creating group:", error);
   }
  
  }

  

  return (
    <>
    <div>
<Dialog
  open={open}
  onClose={handleClose}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
 

>
<Box sx={{ 
    border: `2px solid ${lightTheme ? 'white' : 'white'}`, 
    borderRadius: '8px', 
    backgroundColor: lightTheme ? 'white' : 'black' 
  }}>
  <DialogTitle id="alert-dialog-title " className={lightTheme?"":" dark"}>
   { `Do you want to create a group ${groupName}`}
  </DialogTitle>
  <DialogContent >
    <DialogContentText id="alert-dialog-description" className={lightTheme?"":" dark"} >
      This will create a group in which you will be the admin and others will be able to join this group
    </DialogContentText>
  </DialogContent>
  <DialogActions >
    <Button onClick={handleClose}>Disagree</Button>
    
      <Button onClick={()=>{
        handleToggleAddUserModal();
        handleClose();
      }} autoFocus>
        Agree
      </Button>
    
  </DialogActions>
  </Box>
</Dialog>








    </div>

    {showAddUser&&<AddPeopleToGroup from="createGroupPage" handleCreate={createGroup}/>}
   
    <div className={'createGroups_container'+(lightTheme?"": " dark")}>
        <input type="text" 
          placeholder='Enter Group Name'
          value={groupName} 
          className={'search_box'+(lightTheme?"": " dark")} 
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        />

        <IconButton
             onClick={() => {
              handleClickOpen();
             }}
        >
          <HowToRegIcon className={lightTheme?"": " dark"}/>
        </IconButton>
    </div>
    </>
  )
}

export default CreateGroups