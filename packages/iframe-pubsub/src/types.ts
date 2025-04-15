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
export interface IRegistrationMessage {
  type: 'REGISTER' | 'UNREGISTER';
  pageId: string;
}

export type MessageCallback = (message: IMessage) => void | Promise<void>;
