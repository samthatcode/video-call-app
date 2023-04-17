import React, { useState, useEffect } from "react";
import VideoPlayer from "./components/VideoPlayer";
import Chat from "./components/Chat";
// import StartVideoButton from "./components/StartVideoButton";

function App() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Create a new peer connection when the component mounts
  useEffect(() => {
    createPeerConnection();
  }, []);

  // Create a new peer connection using WebRTC
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    pc.onicecandidate = handleIceCandidate;
    pc.ontrack = handleTrack;

    setPeerConnection(pc);
  };

  // Handle ICE candidates and add them to the peer connection
  const handleIceCandidate = (event) => {
    const pc = peerConnection;
    const candidate = event.candidate;

    if (candidate) {
      const iceCandidate = new RTCIceCandidate(candidate);
      pc.addIceCandidate(iceCandidate);
    }
  };

  // Handle incoming media tracks and add them to the remote video player
  const handleTrack = (event) => {
    setRemoteStream(event.streams[0]);
  };

  // Start the local video stream and add it to the local video player
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setLocalStream(stream);

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  };

  // Join an existing room using the room ID
  const joinRoom = (e) => {
    // TODO: Implement joining a room using the room ID
    e.preventDefault();
    if (roomId.trim() !== "") {
      setRoomId(roomId);
    }
  };

  // Create a new room and generate a unique room ID
  const createRoom = () => {
    // TODO: Implement creating a new room and generating a unique room ID
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
  };

  // Handle sending a new chat message to the server
  const sendMessage = (e) => {
    // TODO: Implement sending a new chat message to the server
    e.preventDefault();
    if (message.trim() !== "") {
      setMessages([...messages, { user: "Me", text: message }]);
      setMessage("");
    }
  };

  // Render the UI
  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="flex-1">
          <div className="relative h-full">
            {localStream && (
              <VideoPlayer
                stream={localStream}
                isLocal={true}
                muted={true}
                controls={false}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}{" "}
            {remoteStream && (
              <VideoPlayer
                stream={remoteStream}
                isLocal={false}
                muted={false}
                controls={true}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100">
          {!roomId && (
            <div className="flex flex-col items-center w-full max-w-md px-4">
              <h2 className="text-xl md:text-3xl font-bold mb-4 text-center">
                Create or join a room
              </h2>
              <form
                className="flex flex-col items-center w-full"
                onSubmit={joinRoom}
              >
                <input
                  required
                  type="text"
                  className="w-full max-w-sm border-gray-300 rounded-md p-3 mb-4"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full max-w-sm"
                >
                  Join Room
                </button>
              </form>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full max-w-sm mt-4"
                onClick={createRoom}
              >
                Create Room
              </button>
              <button
                onClick={startVideo}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full max-w-sm mt-4"
              >
                Start Video
              </button>
            </div>
          )}

          {roomId && (
            <div class="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl">
              <VideoPlayer roomId={roomId} />
              <Chat
                roomId={roomId}
                message={message}
                messages={messages}
                setMessage={setMessage}
                setMessages={setMessages}
                sendMessage={sendMessage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default App;
