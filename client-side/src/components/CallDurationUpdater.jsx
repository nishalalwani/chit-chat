import React, { useEffect, useRef } from 'react';

const CallDurationUpdater = ({ remoteAudioRef, remoteVideoRef, setCallDuration }) => {
  const updateDuration = useRef(() => {
    if (remoteAudioRef.current || remoteVideoRef.current) {
      const duration = Math.floor(remoteAudioRef.current?.currentTime || remoteVideoRef.current?.currentTime);
      const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
      const seconds = (duration % 60).toString().padStart(2, '0');
      setCallDuration(`${minutes}:${seconds}`);
    }
  });

  useEffect(() => {
    const interval = setInterval(() => updateDuration.current(), 500);
    return () => clearInterval(interval);
  }, [remoteAudioRef, remoteVideoRef]);

  return null;
};

export default CallDurationUpdater;
