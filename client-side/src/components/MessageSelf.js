import React from 'react'

const MessageSelf = ({content,createdAt}) => {
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
    <div className='self_message_container'>
        <div className="messageBox" style={{color:"black"}}>
            <p className='self_message' >{content}</p>
            <p className='self_timeStamp'>{formattedTimestamp}</p>
        </div>
    </div>
  )
}

export default MessageSelf;