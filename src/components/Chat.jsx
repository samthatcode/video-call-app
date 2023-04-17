import { useState, useEffect, useRef } from "react";

const Chat = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080");
    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({ type: "join_room", roomId }));
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "message") {
        setMessages((prevMessages) => [...prevMessages, message.payload]);
      }
    };
  }, [roomId]);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (message.trim() === "") {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "message",
        roomId,
        payload: {
          message,
          time: new Date().toLocaleString(),
        },
      })
    );

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <span className="font-medium">{msg.time}</span>{" "}
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="p-4">
        <form className="flex flex-col md:flex-row">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 mb-4 md:mb-0 md:mr-4 bg-white text-emerald-700 border rounded-md outline-none focus:shadow-outline focus:border-blue-300"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
