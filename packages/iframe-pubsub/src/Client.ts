import { AIChatNameEnum } from "./aichat/AIChatClient";
import { PubSub } from "./PubSub";
import { IMessage, MessageCallback } from "./types";

export class Client {
  private pageId: string;
  private callback?: MessageCallback;
  private pubsub: PubSub;
  private isIframe: boolean;
  private boundHandleMessage;

  /**
   * Create a new client instance.
   * 
   * @param pageId The ID of the page or component to register to.
   */
  constructor(pageId: string) {
    this.pageId = pageId;
    this.pubsub = PubSub.getInstance();
    this.isIframe = window !== window.parent;
    this.boundHandleMessage = this.handleMessage.bind(this);
    if (this.isIframe) {
      // We're in an iframe, register via postMessage
      window.parent.postMessage({
        type: 'REGISTER',
        pageId: this.pageId
      }, '*');
      
      // Listen for messages from parent
      window.addEventListener('message', this.boundHandleMessage);
    } else {
      // We're a sub component, register normally => using current pubsub instance
      this.pubsub.register(pageId, this.boundHandleMessage);
    }
  }
  
  /**
   * Unregister the client from the pubsub.
   */
  unregister(): void {
    if (this.isIframe) {
      // We're in an iframe, unregister via postMessage
      window.parent.postMessage({
        type: 'UNREGISTER',
        pageId: this.pageId
      }, '*');
    } else {
      // We're a direct client, unregister normally => using current pubsub instance
      this.pubsub.unregister(this.pageId);
    }
  }

  /**
   * Clean up the aichat registration if the iframe is removed.
   * 
   * Note: aichat itself does not know the iframe is removed then we have to clean up from parent
   */
  cleanAIChat(): boolean {
    if (this.isIframe) {
      throw new Error('You are not allowed to clean up aichat from iframe.')
    }
    window.removeEventListener('message', this.boundHandleMessage)
    return this.pubsub.unregister(AIChatNameEnum.AI_CHAT_CLIENT_ID);
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

  /**
   * Check if a client with the given ID exists in the PubSub system.
   * 
   * @param clientId The ID of the client to check.
   * @param maxRetries Maximum number of retries. Default is 3.
   * @param retryInterval Interval between retries in milliseconds. Default is 1000ms.
   * @returns A Promise that resolves to true if the client exists, false otherwise.
   */
  checkClientExists(clientId: string, maxRetries: number = 3, retryInterval: number = 1000): Promise<boolean> {
    return this.checkClientExistsWithRetry(clientId, 0, maxRetries, retryInterval);
  }

  /**
   * Check if a client with the given ID exists in the PubSub system with retry mechanism.
   * Will retry up to 3 times with 1 second delay between retries.
   * 
   * @param clientId The ID of the client to check.
   * @param retryCount The current retry count.
   * @returns A Promise that resolves to true if the client exists, false otherwise.
   * @private
   */
  private checkClientExistsWithRetry(clientId: string, retryCount: number, maxRetries: number, retryInterval: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isIframe) {
        // Create a unique message ID for this request
        const requestId = `check-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create a one-time message handler to receive the response
        const messageHandler = (event: MessageEvent) => {
          const data = event.data;
          if (data && data.type === 'CLIENT_EXISTS_RESPONSE' && data.requestId === requestId) {
            // Remove the message handler
            window.removeEventListener('message', messageHandler);
            // If we had the response, clear the timeout
            clearTimeout(removeHandlerTimeout);
            
            if (data.exists) {
              // Client exists, resolve immediately
              resolve(true);
            } else if (retryCount < maxRetries - 1) { // Retry up to 3 times (initial + 2 retries)
              // Client doesn't exist yet, retry after delay
              setTimeout(() => {
                this.checkClientExistsWithRetry(clientId, retryCount + 1, maxRetries, retryInterval)
                  .then(exists => resolve(exists));
              }, retryInterval);
            } else {
              // Max retries reached, client doesn't exist
              resolve(false);
            }
          }
        };
        
        // Add the message handler
        window.addEventListener('message', messageHandler);
        
        // Send the check request to the parent
        window.parent.postMessage({
          type: 'CLIENT_EXISTS_CHECK',
          clientId,
          requestId,
          from: this.pageId
        }, '*');
        
        // If no response returned from PubSub, let remove the messageHandler after retryInterval + 1 second
        // This case should never happen
        const removeHandlerTimeout = setTimeout(() => {
          window.removeEventListener('message', messageHandler);
          resolve(false);
        }, retryInterval + 1000);
      } else {
        // We're a direct client, check via pubsub
        const exists = this.pubsub.isClientExists(clientId);
        
        if (exists) {
          // Client exists, resolve immediately
          resolve(true);
        } else if (retryCount < maxRetries - 1) { // Retry up to 3 times (initial + 2 retries)
          // Client doesn't exist yet, retry after delay
          setTimeout(() => {
            this.checkClientExistsWithRetry(clientId, retryCount + 1, maxRetries, retryInterval)
              .then(exists => resolve(exists));
          }, retryInterval);
        } else {
          // Max retries reached, client doesn't exist
          resolve(false);
        }
      }
    });
  }

  private handleMessage(event: MessageEvent | IMessage) {
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
        this.callback(message);
      } catch (error) {
        console.error(`Client ${this.pageId} failed to process message:`, error);
      }
    }
  }
}
