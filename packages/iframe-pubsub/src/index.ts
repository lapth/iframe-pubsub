/**
 * Message to send to another page or component.
 *
 * @property {string} from - The ID of the sending page or component.
 * @property {string} to - The ID of the receiving page or component.
 * @property {any} payload - The payload of the message.
 */
export interface IMessage {
  from: string;
  to: string;
  payload: any;
}

/**
 * Message to register a page or component.
 *
 * @property {string} type - The type of the message.
 * @property {string} pageId - The ID of the page or component.
 */
interface IRegistrationMessage {
  type: 'REGISTER';
  pageId: string;
}

export type MessageCallback = (message: IMessage) => void | Promise<void>;

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

    // Get subscriber
    const subscriber = this.subscribers.get(message.to);
    if (!subscriber) return;

    if (subscriber.source) {
      // If subscriber is an iframe, send via postMessage
      subscriber.source.postMessage(message, '*');
    } else {
      // If subscriber is a direct client, call callback
      subscriber.callback(message);
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
}

export class Client {
  private pageId: string;
  private callback?: MessageCallback;
  private pubsub: PubSub;
  private isIframe: boolean;

  /**
   * Create a new client instance.
   * 
   * @param pageId The ID of the page or component to register to.
   */
  constructor(pageId: string) {
    this.pageId = pageId;
    this.pubsub = PubSub.getInstance();
    this.isIframe = window !== window.parent;
    
    if (this.isIframe) {
      // We're in an iframe, register via postMessage
      window.parent.postMessage({
        type: 'REGISTER',
        pageId: this.pageId
      }, '*');
      
      // Listen for messages from parent
      window.addEventListener('message', this.handleMessage.bind(this));
    } else {
      // We're a sub component, register normally => using current pubsub instance
      this.pubsub.register(pageId, this.handleMessage.bind(this));
    }
  }

  /**
   * Listen for messages from the parent page with a callback.
   * 
   * @param callback The callback function to register.
   */
  onMessage(callback: MessageCallback): void {
    this.callback = callback;
  }

  /**
   * Send a message to the another page or component.
   * 
   * @param to The ID of the page or component to send the message to.
   * @param payload The payload of the message.
   */
  sendMessage(to: string, payload: any): void {
    const message: IMessage = {
      from: this.pageId,
      to,
      payload
    };

    if (this.isIframe) {
      // We're in an iframe, send via postMessage
      window.parent.postMessage(message, '*');
    } else {
      // We're a direct client, send via pubsub
      this.pubsub.sendMessage(message);
    }
  }

  private async handleMessage(event: MessageEvent | IMessage) {
    let message: IMessage;
    
    if ((event as MessageEvent).data) {
      // Message from postMessage
      const evt = event as MessageEvent;
      message = evt.data as IMessage;
    } else {
      // Direct message
      message = event as IMessage;
    }

    if (!message || !message.from || !message.to || message.to !== this.pageId) return;

    if (this.callback) {
      try {
        await this.callback(message);
      } catch (error) {
        console.error(`Client ${this.pageId} failed to process message:`, error);
      }
    }
  }
}
