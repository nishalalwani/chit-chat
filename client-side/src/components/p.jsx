import React, { useCallback, useEffect, useMemo, useState } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [localICECandidates, setLocalICECandidates] = useState([]);
  const [remoteICECandidates, setRemoteICECandidates] = useState([]);

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

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    console.log('Offer created:', offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    console.log('Answer created:', answer);
    return answer;
  };

  const setRemoteAns = async (ans) => {
    await peer.setRemoteDescription(ans);
  };

  const sendStream = async (stream) => {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  };

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
    <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream,}}>
      {props.children}
    </PeerContext.Provider>
  );
};
