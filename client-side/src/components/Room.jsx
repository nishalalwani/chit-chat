import React, { useEffect, useCallback, useState, useRef ,useContext} from 'react';
import { useSocket } from '../Context/Socket';
import { usePeer } from '../Context/Peer';
import '../assets/style/myStyles.css';
import profile from '../assets/images/p.jpg';
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { IconButton } from '@mui/material';
import { myContext } from "./MainContainer";

const Room = () => {
  const [myStream, setMyStream] = useState(null);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [callDuration, setCallDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [show, setShow] = useState(true);
  const [allUsers, setAllUsers] = useState();


  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const addedTracks = useRef(new Set());
  const navigate= useNavigate()

  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAns, remoteStream } = usePeer();
  const { incomingCall, setIncomingCall, callFrom, setCallFrom,userData ,videoNavigate, setVideoNavigate,selectedChat} = ChatState();



const getAllUsers= async()=>{
  const config={
    headers:{
      "Content-type":"application/json",
      Authorization:`Bearer ${userData.data.token}`
    }
  }

  try{
    const {data}= await axios.get('/user/getUsers',config)
    setAllUsers(data)
  }catch(error){
    console.log(error)
  }
}

useEffect(()=>{
  getAllUsers()
},[])



const getUserMediaStream = useCallback(async () => {
  try {
    let stream;
    if (videoNavigate) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } else {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
    }
    setMyStream(stream);
  } catch (error) {
    console.error('Error accessing media devices.', error);
  }
}, []);

const handleSendStream = useCallback(() => {
  if (myStream) {
    console.log("Sending stream");
    setShow(false)
    myStream.getTracks().forEach((track) => {
      if (!addedTracks.current.has(track)) {
          peer.addTrack(track, myStream);
          addedTracks.current.add(track);
        }
      });
    }
  }, [myStream, peer]);
  
  const handleNewUserJoined = useCallback(async (data) => {
    const { userId } = data;
    // console.log('New user joined', userId);
    setRemoteUserId(userId);
    try {
      const offer = await createOffer();
      socket.emit('call-user', { userId, offer });
      // handleSendStream(); // Automatically send audio stream when a new user joins
    } catch (error) {
      console.error('Error creating offer', error);
    }
  }, [createOffer, socket]);
  
  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    // console.log('Incoming call from', from);
    setRemoteUserId(from);
    try {
      const ans = await createAnswer(offer);
      socket.emit('call-accepted', { userId: from, ans });
      // handleSendStream();// Automatically send audio stream when the call is accepted
    } catch (error) {
      console.error('Error creating answer', error);
    }
  }, [createAnswer, socket,handleSendStream]);
  
  const handleCallAccepted = useCallback(async ({ ans }) => {
    // console.log('Call accepted, setting remote answer', ans);
    if (peer.signalingState === 'have-local-offer') {
      try {
        await setRemoteAns(ans);
        // handleSendStream(); // Automatically send audio stream when the call is accepted
      } catch (error) {
        console.error('Error setting remote answer', error);
      }
    } else {
      console.warn('Cannot set remote answer in state:', peer.signalingState);
    }
  }, [setRemoteAns, peer]);
  
  const handleNegotiation = useCallback(async () => {
    if (peer.signalingState === 'stable') {
      const localOffer = await peer.createOffer();
      await peer.setLocalDescription(localOffer);
      // console.log('Negotiation needed, sending offer:', localOffer);
      socket.emit('call-user', { userId: remoteUserId, offer: localOffer });
      
    } else {
      console.warn('Cannot negotiate in state:', peer.signalingState);
    }
  }, [peer, remoteUserId, socket]);
  
  useEffect(() => {
    // console.log('Setting up peer negotiation listener');
    peer.addEventListener('negotiationneeded', handleNegotiation);
    return () => {
      // console.log('Cleaning up peer negotiation listener');
      peer.removeEventListener('negotiationneeded', handleNegotiation);
    };
  }, [handleNegotiation]);
  
  useEffect(() => {
    socket.on('user-joined', handleNewUserJoined);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    
    return () => {
      socket.off('user-joined', handleNewUserJoined);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted]);
  
  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);
  

useEffect(() => {
  if (videoNavigate) {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  } else {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }
}, [remoteStream, videoNavigate]);


useEffect(() => {
  // Define the handler function
  const handleCallAccepted =  () => {
    setTimeout(()=>{
      handleSendStream();
    },1000)
  };

  // Set up the event listener
  socket.on('call_accepted', handleCallAccepted);

  // Clean up the event listener on component unmount or when dependencies change
  return () => {
    socket.off('call_accepted', handleCallAccepted);
  };
}, [socket, handleSendStream]);

  
  const handleTimeUpdate = useCallback(() => {
    if (remoteAudioRef.current) {
      const duration = Math.floor(remoteAudioRef.current.currentTime);
      const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
      const seconds = (duration % 60).toString().padStart(2, '0');
      setCallDuration(`${minutes}:${seconds}`);
    }
  }, []);
  
  const handleMuteUnmute = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  
  const handleAcceptCall = useCallback(async () => {
    if (callFrom) {
      try {
        
        handleSendStream(); 
        socket.emit('accept_call', { callFrom });
      } catch (error) {
        console.error('Error accepting call', error);
      }
    }
  }, [callFrom, socket, handleSendStream]);
  
  const handleDeclineCall = useCallback(() => {

    if (callFrom) {
      socket.emit('call-declined', { userId: callFrom });
      setIncomingCall(false);
      setRemoteUserId(null);
      if (myStream) {
        myStream.getTracks().forEach((track) => {
          track.stop();
        });
        setMyStream(null);
      }
      peer.close();
      
    }
    navigate("/app/chat")
  }, [callFrom, socket, peer, myStream]);
  
  useEffect(() => {
    socket.on('call-declined', (data) => {

      setIncomingCall(false);
      setRemoteUserId(null);
      navigate("/app/chat"); 
      if (myStream) {
        myStream.getTracks().forEach((track) => {
          track.stop();
        });
        setMyStream(null);
      }
      peer.close();
    });
  }, [socket, myStream, peer]);
 
  
  const user = allUsers?.find((u) => u._id === remoteUserId) ||
  selectedChat?.users.find((u) => u._id !== userData.data._id);
  const userName= user?.name
  const userImage= user?.image


  return (
    <>
<button onClick={handleSendStream}>send</button>

      <div className="incoming-call-screen d-flex flex-column align-items-center justify-content-center">
        <div className="caller-info text-center">
          <img src={userImage || profile} alt="Caller" className="caller-image mb-3" />
          {incomingCall ? (
            <>
              <h2 className="caller-name my-2">{userName}</h2>
              {show && <p className="calling-text">is calling...</p>}
            </>
          ) : (
            <>
              {show && <p className="calling-text">calling...</p>}
              <h2 className="caller-name my-2">{userName}</h2>
            </>
          )}
          {videoNavigate &&!show ? (
            <>

              <div className="video-container">
                <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
              </div>
            </>
          ) : (
            <audio ref={remoteAudioRef} autoPlay controls={false} onTimeUpdate={handleTimeUpdate} style={{ display: 'none' }} />
          )}
           {videoNavigate &&show ? (
            <>

              <div className="video-container">
                <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
              </div>
            </>
          ) : (
            <audio ref={remoteAudioRef} autoPlay controls={false} onTimeUpdate={handleTimeUpdate} style={{ display: 'none' }} />
          )}
        </div>
        <div className="actions mt-4">
          {!show || (incomingCall && <button className="answer-button mx-2 bg-success text-white" onClick={handleAcceptCall}>Answer</button>)}
          <button className="decline-button mx-2 bg-danger text-white" onClick={handleDeclineCall}>Decline</button>
        </div>
        <div className="call-controls mt-4">
          {!show && <p className="text-white">Call Duration: {callDuration}</p>}
          {!show && (
            <IconButton className="mute-button text-white" onClick={handleMuteUnmute}>
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          )}
        </div>
    
    </div>
    </>
  );
};

export default Room;
