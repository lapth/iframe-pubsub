import { IMessage, IRegistrationMessage, MessageCallback } from "./types";

export class PubSub {
  private static instance: PubSub;
  private subscribers: Map<string, { source?: Window; callback: MessageCallback }>;
  private mainCallback?: MessageCallback;

  private constructor() {
    this.subscribers = new Map();
    this.handleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.handleMessage);
  }

  static getInstance(): PubSub {
    if (!PubSub.instance) {
      PubSub.instance = new PubSub();
    }
    return PubSub.instance;
  }

  onMessage(callback: MessageCallback): void {
    // For main page to listen to all messages
    this.mainCallback = callback;
  }

  /**
   * Registers a callback function to be called when a message is received.
   *
   * @param pageId The ID of the page or component to register for.
   * @param callback The callback function to be called when a message is received.
   */
  register(pageId: string, callback: MessageCallback): void {
    this.subscribers.set(pageId, { callback });
  }

  /**
   * Unregister a page or component from the pubsub.
   * Should unregister the registered page or component if it has been removed.
   *
   * @param pageId The ID of the page or component to unregister from.
   */
  unregister(pageId: string): void {
    this.subscribers.delete(pageId);
  }
  
  sendMessage(message: IMessage): void {
    // Notify main page
    if (this.mainCallback) {
      this.mainCallback(message);
    }

    // Try to send the message with retries
    this.trySendMessageWithRetry(message, 0);
  }

  /**
   * Try to send a message to a client with retry logic.
   * Will retry up to 3 times with 1 second delay between retries.
   * 
   * @param message The message to send.
   * @param retryCount The current retry count.
   */
  private trySendMessageWithRetry(message: IMessage, retryCount: number): void {
    // Get subscriber
    const subscriber = this.subscribers.get(message.to);
    
    // If subscriber exists, send the message
    if (subscriber) {
      if (subscriber.source) {
        // If subscriber is an iframe, send via postMessage
        subscriber.source.postMessage(message, '*');
      } else {
        // If subscriber is a direct client, call callback
        subscriber.callback(message);
      }
      return;
    }
    
    // If subscriber doesn't exist and we haven't reached max retries, schedule a retry
    if (retryCount < 10) {
      setTimeout(() => {
        this.trySendMessageWithRetry(message, retryCount + 1);
      }, 1000);
    } else {
      console.warn(`Failed to send message to client ${message.to} after 10 retries`);
    }
  }

  private async handleMessage(event: MessageEvent) {
    const data = event.data;
    const source = event.source as Window;

    // Handle registration from iframes
    if (data?.type === 'REGISTER') {
      const registration = data as IRegistrationMessage;
      this.subscribers.set(registration.pageId, {
        source,
        callback: (message: IMessage) => {
          source.postMessage(message, '*');
        }
      });
      return;
    }

    // Handle unregistration from iframes
    if (data?.type === 'UNREGISTER') {
      const unregistration = data as IRegistrationMessage;
      this.subscribers.delete(unregistration.pageId);
      return;
    }

    // Handle client existence check from iframes
    if (data?.type === 'CLIENT_EXISTS_CHECK') {
      source.postMessage({
        type: 'CLIENT_EXISTS_RESPONSE',
        requestId: data.requestId,
        exists: this.subscribers.has(data.clientId)
      }, '*');
      return;
    }

    // Handle regular messages
    if (!data || !data.from || !data.to) return;
    const message = data as IMessage;

    // Notify main page
    if (this.mainCallback) {
      await this.mainCallback(message);
    }

    // Forward to target
    const subscriber = this.subscribers.get(message.to);
    if (!subscriber) return;

    if (subscriber.source) {
      // If subscriber is an iframe, send via postMessage
      subscriber.source.postMessage(message, '*');
    } else {
      // If subscriber is a direct client, call callback
      await subscriber.callback(message);
    }
  }

  /**
   * Check if a client with the given ID exists in the PubSub system.
   * 
   * @param clientId The ID of the client to check.
   * @returns True if the client exists, false otherwise.
   */
  isClientExists(clientId: string): boolean {
    return this.subscribers.has(clientId);
  }
}
