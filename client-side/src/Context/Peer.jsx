import React, { useCallback, useEffect, useMemo, useState } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);

  const peer = useMemo(() => {
    return new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twillio.com:3478"
          ]
        }
      ]
    });
  }, []);

  const createOffer = useCallback(async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    console.log('Offer created:', offer);
    return offer;
  }, [peer]);

  const createAnswer = useCallback(async (offer) => {
    try {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      console.log('Answer created:', answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error; // Ensure errors are propagated
    }
  }, [peer]);

  const setRemoteAns = useCallback(async (ans) => {
    try {
      await peer.setRemoteDescription(new RTCSessionDescription(ans));
    } catch (error) {
      console.error('Error setting remote answer:', error);
    }
  }, [peer]);

  const sendStream = useCallback(async (stream) => {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  }, [peer]);

  const handleTrackEvent = useCallback((e) => {
    const streams = e.streams;
    console.log('Track event:', streams);
    setRemoteStream(streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener('track', handleTrackEvent);
    return () => {
      peer.removeEventListener('track', handleTrackEvent);
    };
  }, [peer, handleTrackEvent]);

  return (
    <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream,setRemoteStream }}>
      {props.children}
    </PeerContext.Provider>
  );
};
