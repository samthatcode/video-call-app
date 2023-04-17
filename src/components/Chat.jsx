import React, { useState } from "react";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <>
    <div className=" mt-4 overflow-auto h-64">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 mb-2 max-w-md"
          >
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow rounded-lg p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2"
        >
          Send
        </button>
      </form>
    </>
  );
};

export default Chat;
