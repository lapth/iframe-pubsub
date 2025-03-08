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

# DEMO

## Let build the library if you haven't done that yet with
```sh
cd packages/iframe-pubsub
npm install
npm run build
```

## Let install the dependencies if you haven't done that yet with
```sh
cd demo/main-page
npm install
```

```sh
cd demo/sub-page
npm install
```

## You need to start 3 pages: main page, sub page 1 and sub page 2

```shell
# Run main page from terminal on port 3000
cd demo/main-page
npm run dev

# Run sub page 1 from terminal on port 3001
cd demo/sub-page
npm run dev:page1

# Run sub page 3 from terminal on port 3003
cd demo/sub-page
npm run dev:page3
```
