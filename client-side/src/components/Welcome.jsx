import React from 'react'
import logo from '../assets/images/chat.png'
import '../assets/style/myStyles.css'
import { useNavigate } from 'react-router-dom'

const Welcome = () => {
  const userData=JSON.parse(localStorage.getItem("userData"))
  // console.log(userData)
  const navigate=useNavigate();

  if(!userData){
    console.log("User not Authenticated");
    navigate('/')
  }
  return (
    <div className='welcome_container'>
        <img src={logo} alt='logo' className='welcome_logo'/>
        <b>Hi,{userData.data.name}</b>
        <p>View and text directly to people present in the chat Rooms.</p>

    </div>
  )
}

export default Welcome