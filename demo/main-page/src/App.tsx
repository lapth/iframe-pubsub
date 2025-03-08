import { useState, useEffect } from 'react';
import { PubSub, IMessage } from '@lapth/iframe-pubsub';
import SubComponent from './SubComponent';

export default function App() {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    // ⭐️⭐️⭐️ Initialize PubSub, that's all you need ⭐️⭐️⭐️
    const pubsub = PubSub.getInstance();

    pubsub.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });
  }, []);

  return (
    <div>
      <h1>PubSub Demo</h1>
      
      <div>
        <h3>Message Log:</h3>
        <div>
          {messages.length === 0 ? (
            <div>No messages yet</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index}>
                {msg.from} → {msg.to}: {msg.payload}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Page 1 (Iframe)</h3>
          <iframe
            src="http://localhost:3001"
            style={{ width: '100%', height: '400px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <SubComponent />
        </div>

        <div style={{ flex: 1 }}>
          <h3>Page 3 (Iframe)</h3>
          <iframe
            src="http://localhost:3003"
            style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
          />
        </div>
      </div>
    </div>
  );
}
