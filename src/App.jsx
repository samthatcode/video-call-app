import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { v4 as uuidv4 } from "uuid";
import VideoPlayer from "./components/VideoPlayer";
import Chat from "./components/Chat";

const socket = io("http://localhost:3001");

const App = () => {
  const [stream, setStream] = useState();
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);

        socket.on("join-room", ({ roomId, userId }) => {
          const peer = createPeer(roomId, userId, stream);
          setPeers((peers) => [...peers, peer]);
        });

        socket.on("receive-message", (message) => {
          console.log("Received message:", message);
        });
      });
  }, []);

  const createPeer = (roomId, userId, stream, peerId) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
          // Add TURN server credentials if necessary
        ],
      },
    });

    peer.on("signal", (signal) => {
      socket.emit("send-signal", { roomId, userId, signal });
    });

    peer.on("stream", (remoteStream) => {
      // Assuming `peerData` is an object containing the peer's information (e.g., peerId and videoRef)
      const peerData = peers.find((p) => p.peerId === peerId);
      if (peerData && peerData.videoRef) {
        peerData.videoRef.srcObject = remoteStream;
      }
    });

    setPeers((prevPeers) => [
      ...prevPeers,
      { peerId, videoRef: React.createRef() },
    ]);

    peer.on("stream", (stream) => {
      setStream(stream);
    });

    return peer;
  };

  const joinRoom = () => {
    const roomId = prompt("Enter room ID to join:");
    if (roomId) {
      socket.emit("join-room", roomId);
    }
  };

  const createRoom = () => {
    const roomId = uuidv4();
    socket.emit("create-room", roomId);
    alert(`Room created. Share this ID with others to join: \${roomId}`);
  };

  const sendMessage = (message) => {
    socket.emit("send-message", message);
  };

  return (
    <div className="p-4 flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-4">
        <button
          onClick={joinRoom}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 mr-2"
        >
          Join Room
        </button>
        <button
          onClick={createRoom}
          className="bg-blue-500 text-white rounded-lg px-4 py-2"
        >
          Create Room
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full md:w-2/3 bg-gray-200 rounded-lg p-4">
          <VideoPlayer stream={stream} peers={peers}/>
        </div>
        <div className="w-full md:w-1/3 bg-gray-100 rounded-lg p-4 md:ml-4 mt-4 md:mt-0">
          <Chat sendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
};

export default App;
