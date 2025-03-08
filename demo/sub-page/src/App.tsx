import { useState, useEffect } from 'react';
import { Client, IMessage } from '@lapth/iframe-pubsub';

// ⭐️⭐️⭐️ NOTE: Client ID constant ⭐️⭐️⭐️
const pageId = window.location.port === '3001' ? 'page1' : 'page3';

export default function App() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [targetPageId, setTargetPageId] = useState('');

  const [client] = useState(() => new Client(pageId)); // Register the client

  useEffect(() => {
    // ⭐️⭐️⭐️ Listen for message from other pages ⭐️⭐️⭐️
    client.onMessage((message: IMessage) => {
      setMessages(prev => [...prev, message]);
    });
  }, [client]);

  const handleSendMessage = () => {
    if (!messageText || !targetPageId) return;
    
    // ⭐️⭐️⭐️ Send message to another page ⭐️⭐️⭐️
    client.sendMessage(targetPageId, messageText);
    
    setMessages(prev => [...prev, {
      from: pageId,
      to: targetPageId,
      payload: messageText
    }]);
    
    setMessageText('');
  };

  return (
    <div>
      <h2>Sub Page {pageId}</h2>
      <div>
        <input
          placeholder="Target Page ID"
          value={targetPageId}
          onChange={(e) => setTargetPageId(e.target.value)}
        />
        <input
          placeholder="Message"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        <h3>Messages:</h3>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.from === pageId ? 'Sent to' : 'From'} {msg.from === pageId ? msg.to : msg.from}: {msg.payload}
          </div>
        ))}
      </div>
    </div>
  );
}
