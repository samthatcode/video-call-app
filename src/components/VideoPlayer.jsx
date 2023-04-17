import React,{ useEffect, useRef, useState } from "react";

const VideoPlayer = ({ roomId }) => {
  const [peers, setPeers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;

        socketRef.current = new WebSocket("ws://localhost:8080");
        socketRef.current.onopen = () => {
          socketRef.current.send(JSON.stringify({ type: "join_room", roomId }));
        };

        socketRef.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "user_join") {
            const peerId = message.payload.peerId;
            const peer = createPeer(peerId, socketRef.current, stream);
            peersRef.current.push({
              peerId,
              peer,
            });
            setPeers((prevPeers) => [...prevPeers, peer]);
          } else if (message.type === "user_leave") {
            const peerId = message.payload.peerId;
            const peerIndex = peersRef.current.findIndex(
              (p) => p.peerId === peerId
            );
            if (peerIndex !== -1) {
              peersRef.current[peerIndex].peer.destroy();
              peersRef.current.splice(peerIndex, 1);
              setPeers((prevPeers) =>
                prevPeers.filter((p) => p.peerId !== peerId)
              );
            }
          } else if (message.type === "offer") {
            const peerId = message.payload.peerId;
            const peer = addPeer(
              message.payload.offer,
              peerId,
              socketRef.current,
              stream
            );
            peersRef.current.push({
              peerId,
              peer,
            });
            setPeers((prevPeers) => [...prevPeers, peer]);
          } else if (message.type === "answer") {
            const peerId = message.payload.peerId;
            const peer = peersRef.current.find((p) => p.peerId === peerId);
            if (peer) {
              peer.peer.signal(message.payload.answer);
            }
          }
        };
      })
      .catch((error) => {
        console.log(error);
      });
  }, [roomId]);

  const createPeer = (peerId, socket, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "ice_candidate",
            roomId,
            peerId,
            candidate: event.candidate,
          })
        );
      }
    };

    peer.ontrack = (event) => {
      const stream = event.streams[0];
      const peerVideo = document.createElement("video");
      peerVideo.srcObject = stream;
      peerVideo.autoplay = true;
      peerVideo.className = "w-full h-full object-cover";
      setPeers((prevPeers) =>
        prevPeers.map((p) => {
          if (p.peerId === peerId) {
            return { ...p, video: peerVideo };
          }
          return p;
        })
      );
    };

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    return peer;
  };

  const addPeer = (offer, peerId, socket, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "ice_candidate",
            roomId,
            peerId,
            candidate: event.candidate,
          })
        );
      }
    };

    peer.ontrack = (event) => {
      const stream = event.streams[0];
      const peerVideo = document.createElement("video");
      peerVideo.srcObject = stream;
      peerVideo.autoplay = true;
      peerVideo.className = "w-full h-full object-cover";
      setPeers((prevPeers) =>
        prevPeers.map((p) => {
          if (p.peerId === peerId) {
            return { ...p, video: peerVideo };
          }
          return p;
        })
      );
    };

    peer.setRemoteDescription(offer);

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    const answer = peer.createAnswer();
    peer.setLocalDescription(answer);

    socket.send(
      JSON.stringify({
        type: "answer",
        roomId,
        peerId,
        answer,
      })
    );

    return peer;
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    userVideoRef.current.srcObject.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="relative w-full h-0 pb-9/16">
        <video
          ref={userVideoRef}
          className="absolute w-full h-full object-cover"
          muted
          autoPlay
        />
        {peers.map((peer) => (
          <div key={peer.peerId} className="relative w-full h-0 pb-9/16">
            {peer.video}
          </div>
        ))}
      </div>
      <div>
        <button
          className={`w-full px-4 py-2 md:mt-2 lg:mt-8 font-semibold text-white transition-colors duration-200 rounded ${
            isMuted ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={toggleMute}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
