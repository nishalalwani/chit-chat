import React from 'react'
import { useSelector } from 'react-redux'

const MessageOthers = ({props,createdAt}) => {

  const lightTheme=useSelector((state)=>state.themeKey)

  const timestampDate = new Date(createdAt);

    // Get hours and minutes from the timestamp
    let hours = timestampDate.getHours();
    let minutes = timestampDate.getMinutes();
  
    // Convert hours to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  
    // Format the minutes to have leading zeros if less than 10
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    // Construct the formatted timestamp string
    const formattedTimestamp = `${hours}:${minutes} ${ampm}`;

  return (
    <div className='other_message_container'>
        <div className="conversation_container">
            <img className="con_icon" src={props.sender.image}/>
            <div className="other_text_content" style={{color:lightTheme?"":"#323131"}}>
                <p className="con_title">{props.sender.name}</p>
                <p className="self_message ">{props.content}</p>
                <p className="con_timeStamp" >{formattedTimestamp}</p>
            </div>
        </div>
    </div>
  )
}

export default MessageOthers