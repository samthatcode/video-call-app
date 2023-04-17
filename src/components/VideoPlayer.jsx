import React, { useRef, useEffect, useState } from "react";

const VideoPlayer = ({ stream }) => {
  const videoRef = useRef();
  const [peers, setPeers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    videoRef.current.srcObject.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
  };
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="">
          <video
            muted
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
          {peers.map((peer) => (
            <div
              key={peer.peerId}
              className="w-full h-full object-cover rounded-lg"
            >
              <video
                ref={(el) => (peer.videoRef = el)}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          className={`w-full px-4 py-2 md:mt-2 mt-4 lg:mt-8 font-semibold text-white transition-colors duration-200 rounded ${
            isMuted ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={toggleMute}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>
    </>
  );
};

export default VideoPlayer;
