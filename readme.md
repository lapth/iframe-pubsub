# Simple library for communication between iframes and components

## How to use

### Main page

You need to initialize the library on the main page with 2 steps

1. Initialize the library
```ts
import { PubSub, IMessage } from '@lapth/iframe-pubsub';
```

2. Start it
```ts
const pubsub = PubSub.getInstance();
```

### Sub page (within iframe or component)

1. You only need to import the library
```ts
import { Client, IMessage } from '@lapth/iframe-pubsub';
```

2. Define your page/component id
```ts
const pageId = 'page-id';
```

3. Register with the pubsub
```ts
const [client] = useState(() => new Client(pageId)); // Register the client
```

3. Listen for messages
```ts
client.onMessage((message: IMessage) => {
  setMessages(prev => [...prev, message]);
});
```

4. Or sending a message
```ts
client.sendMessage(targetPageId, messageText);
```
