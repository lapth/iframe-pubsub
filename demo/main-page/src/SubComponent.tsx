import { useState, useEffect } from 'react';
import { Client, IMessage } from '@lapth/iframe-pubsub';

export default function SubComponent() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [targetPageId, setTargetPageId] = useState('');

  // ⭐️⭐️⭐️ NOTE: Client ID constant ⭐️⭐️⭐️
  const [client] = useState(() => new Client('page2'));

  useEffect(() => {
    // ⭐️⭐️⭐️ Listen for message from other pages ⭐️⭐️⭐️
    client.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });
  }, [client]);

  const handleSendMessage = () => {
    if (!messageText || !targetPageId) return;
    // ⭐️⭐️⭐️ Send message to another page ⭐️⭐️⭐️
    client.sendMessage(targetPageId, messageText);
    setMessageText('');
  };

  return (
    <div>
      <h3>Page 2 (Component)</h3>
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
        <h4>Messages:</h4>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.from === 'page2' ? 'Sent to' : 'From'} {msg.from === 'page2' ? msg.to : msg.from}: {msg.payload}
          </div>
        ))}
      </div>
    </div>
  );
}
