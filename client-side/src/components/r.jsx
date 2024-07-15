import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useSocket } from '../Context/Socket';
import { usePeer } from '../Context/Peer';

const Room = () => {
  const [myStream, setMyStream] = useState(null);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const addedTracks = useRef(new Set());

  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAns, remoteStream } = usePeer();

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMyStream(stream);
      // if (localVideoRef.current) {
      //   localVideoRef.current.srcObject = stream;
      // }
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }, []);

  const handleNewUserJoined = useCallback(async (data) => {
    const { userId } = data;
    console.log('New user joined', userId);
    setRemoteUserId(userId);
    try {
      const offer = await createOffer();
      socket.emit('call-user', { userId, offer });
    } catch (error) {
      console.error('Error creating offer', error);
    }
  }, [createOffer, socket]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    console.log('Incoming call from', from);
    setRemoteUserId(from);
    try {
      const ans = await createAnswer(offer);
      socket.emit('call-accepted', { userId: from, ans });
    } catch (error) {
      console.error('Error creating answer', error);
    }
  }, [createAnswer, socket]);

  const handleCallAccepted = useCallback(async ({ ans }) => {
    console.log('Call accepted, setting remote answer', ans);
    if (peer.signalingState === 'have-local-offer') {
      try {
        await setRemoteAns(ans);
      } catch (error) {
        console.error('Error setting remote answer', error);
      }
    } else {
      console.warn('Cannot set remote answer in state:', peer.signalingState);
    }
  }, [setRemoteAns, peer]);

  const handleSendStream = useCallback(() => {
    if (myStream) {
      console.log("Sending stream");
      myStream.getTracks().forEach((track) => {
        if (!addedTracks.current.has(track)) {
          peer.addTrack(track, myStream);
          addedTracks.current.add(track);
        }
      });
    }
  }, [myStream, peer]);

  const handleNegotiation = useCallback(async () => {
    if (peer.signalingState === 'stable') {
      const localOffer = await peer.createOffer();
      await peer.setLocalDescription(localOffer);
      console.log('Negotiation needed, sending offer:', localOffer);
      socket.emit('call-user', { userId: remoteUserId, offer: localOffer });
    } else {
      console.warn('Cannot negotiate in state:', peer.signalingState);
    }
  }, [peer, remoteUserId, socket]);

  useEffect(() => {
    console.log('Setting up peer negotiation listener');
    peer.addEventListener('negotiationneeded', handleNegotiation);
    return () => {
      console.log('Cleaning up peer negotiation listener');
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
    // if (remoteStream && remoteVideoRef.current) {
    //   remoteVideoRef.current.srcObject = remoteStream;
    // }
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>Room</div>
      <h2>You are connected to {remoteUserId}</h2>
      <button onClick={handleSendStream}>Send My Video</button>
      {/* <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '12rem' }} />
      <video ref={remoteVideoRef} autoPlay playsInline /> */}
      <audio ref={localAudioRef} autoPlay controls muted />
      <audio ref={remoteAudioRef} autoPlay controls />
    </div>
  );
};

export default Room;
