import { AIChatNameEnum } from "./aichat/AIChatClient";
import { PubSub } from "./PubSub";
import { IMessage, MessageCallback } from "./types";

export class Client {
  protected targetAIChatClientId: string;
  private pageId: string;
  private callback?: MessageCallback;
  private pubsub?: PubSub;
  private isIframe: boolean;
  private isMainApp: boolean;
  private boundHandleMessage;

  /**
   * Create a new client instance.
   * 
   * @param pageId The ID of the page or component to register to.
   */
  constructor(
    pageId: string,
    targetAIChatClientId: string = AIChatNameEnum.AI_CHAT_CLIENT_ID
  ) {
    this.targetAIChatClientId = targetAIChatClientId;
    this.pageId = pageId;
    this.isIframe = window !== window.parent;
    this.isMainApp = window === window.top;
    this.boundHandleMessage = this.handleMessage.bind(this);

    if (this.isMainApp) {
      // We're in the main app - use PubSub directly
      this.pubsub = PubSub.getInstance();
      this.pubsub.register(pageId, this.boundHandleMessage);
      console.info(`✅ Client ${pageId} registered with main PubSub`);
    } else {
      console.info(
        `📡 Client ${pageId} from iframe is registering with top window PubSub`
      );

      window.top!.postMessage(
        {
          type: "REGISTER",
          pageId: this.pageId,
        },
        "*"
      );

      // Listen for messages
      window.addEventListener("message", this.boundHandleMessage);
    }
  }

  /**
   * Unregister the client from the pubsub.
   */
  unregister(): void {
    if (this.isMainApp && this.pubsub) {
      this.pubsub.unregister(this.pageId);
    } else {
      window.top!.postMessage(
        {
          type: "UNREGISTER",
          pageId: this.pageId,
        },
        "*"
      );
      window.removeEventListener("message", this.boundHandleMessage);
    }
    console.info(`❌ Client ${this.pageId} unregistered from PubSub`);
  }

  // Will not support this method anymore.
  cleanAIChat(): boolean {
    console.warn(`‼️ Unsupported operation cleanAIChat has been called from ${this.pageId}.`);
    return false;
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
      payload,
    };

    if (this.isMainApp && this.pubsub) {
      // Direct PubSub call
      this.pubsub.sendMessage(message);
    } else {
      // All iframe messages go directly to window.top
      window.top!.postMessage(message, "*");
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
  checkClientExists(
    clientId: string,
    maxRetries: number = 3,
    retryInterval: number = 1000
  ): Promise<boolean> {
    return this.checkClientExistsWithRetry(
      clientId,
      0,
      maxRetries,
      retryInterval
    );
  }

  /**
   * Check if a client with the given ID exists in the PubSub system with retry mechanism.
   * Will retry up to 3 times with 1 second delay between retries.
   * 
   * @param clientId The ID of the client to check.
   * @param retryCount The current retry count.
   * @returns A Promise that resolves to true if the client exists, false otherwise.
   */
  private checkClientExistsWithRetry(
    clientId: string,
    retryCount: number,
    maxRetries: number,
    retryInterval: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isMainApp && this.pubsub) {
        // Direct check in main app
        const exists = this.pubsub.isClientExists(clientId);

        if (exists) {
          resolve(true);
        } else if (retryCount < maxRetries - 1) {
          setTimeout(() => {
            this.checkClientExistsWithRetry(
              clientId,
              retryCount + 1,
              maxRetries,
              retryInterval
            ).then((exists) => resolve(exists));
          }, retryInterval);
        } else {
          resolve(false);
        }
      } else {
        // Check via top window
        const requestId = `check-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const messageHandler = (event: MessageEvent) => {
          const data = event.data;
          if (
            data &&
            data.type === "CLIENT_EXISTS_RESPONSE" &&
            data.requestId === requestId
          ) {
            window.removeEventListener("message", messageHandler);
            clearTimeout(removeHandlerTimeout);

            if (data.exists) {
              resolve(true);
            } else if (retryCount < maxRetries - 1) {
              setTimeout(() => {
                this.checkClientExistsWithRetry(
                  clientId,
                  retryCount + 1,
                  maxRetries,
                  retryInterval
                ).then((exists) => resolve(exists));
              }, retryInterval);
            } else {
              resolve(false);
            }
          }
        };

        window.addEventListener("message", messageHandler);

        window.top!.postMessage(
          {
            type: "CLIENT_EXISTS_CHECK",
            clientId,
            requestId,
            from: this.pageId,
          },
          "*"
        );

        const removeHandlerTimeout = setTimeout(() => {
          window.removeEventListener("message", messageHandler);
          resolve(false);
        }, retryInterval + 1000);
      }
    });
  }

  private handleMessage(event: MessageEvent | IMessage) {
    let message: IMessage;

    if ((event as MessageEvent).data) {
      const evt = event as MessageEvent;
      message = evt.data as IMessage;
    } else {
      message = event as IMessage;
    }

    if (!message || !message.from || !message.to || message.to !== this.pageId)
      return;

    if (this.callback) {
      try {
        this.callback(message);
      } catch (error) {
        console.error(
          `Client ${this.pageId} failed to process message:`,
          error
        );
      }
    }
  }

  getDebugInfo(): {
    pageId: string;
    isMainApp: boolean;
    isIframe: boolean;
    windowLevel: string;
  } {
    let windowLevel = "main";
    if (window !== window.top) {
      if (window.parent === window.top) {
        windowLevel = "first-level-iframe";
      } else {
        windowLevel = "nested-iframe";
      }
    }

    return {
      pageId: this.pageId,
      isMainApp: this.isMainApp,
      isIframe: this.isIframe,
      windowLevel,
    };
  }
}
