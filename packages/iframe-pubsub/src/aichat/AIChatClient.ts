import { Client } from "../Client";

export enum AIChatNameEnum {
  AI_CHAT_CLIENT_ID = 'aichat',
  AI_CHAT_INTERNAL_COMM_TYPE = 'pubsub',

  // App level
  SET_PARENT_NAME = 'setParentName',
  SET_USER_ID = 'setUserId',
  SET_CUSTOM_HEADERS = 'setCustomHeaders',
  SET_CUSTOM_PAYLOAD = 'setCustomPayload',

  // AIChat level
  SET_SUGGESTIONS = 'setSuggestions',
  SHOW_SUGGESTIONS = 'showSuggestions',
  SHOW_CHAT_MESSAGE = 'showChatMessage',
  CONFIRM_ACTION = 'confirmAction',
  SHOW_OPTIONS = 'showOptions',

  SEND_CHAT_PROMPT = 'sendChatPrompt',

  // Default handler to process the actions
  DEFAULT = 'default',
}

export class AIChatClient extends Client   {
  /**
   * Create a new client instance.
   * 
   * @param pageId The ID of the page or component to register to.
   */
  constructor(pageId: string) {
    super(pageId);
  }
  
  private sendAIChatMethod(methodName: string, arg: any): void {
    this.sendMessage(
      AIChatNameEnum.AI_CHAT_CLIENT_ID, // This name is hardcode, do not change it
      {
        type: AIChatNameEnum.AI_CHAT_INTERNAL_COMM_TYPE, // This name is hardcode, do not change it
        methodName,
        arg
      }
    );
  }

  /**
   * Set the parent name then the AI Chat can know who should it communicate with.
   * 
   * @param parentName The name of the parent page.
   */
  setParentName(parentName: string): void {
    this.sendAIChatMethod(AIChatNameEnum.SET_PARENT_NAME, parentName);
  }

  /**
   * Set the user ID for the AI Chat component.
   * 
   * @param userId The user ID.
   */
  setUserId(userId: string): void {
    this.sendAIChatMethod(AIChatNameEnum.SET_USER_ID, userId);
  }

  /**
   * Set custom headers for the AI Chat component.
   * 
   * @param headers The custom headers.
   */
  setCustomHeaders(headers: Record<string, string>): void {
    this.sendAIChatMethod(AIChatNameEnum.SET_CUSTOM_HEADERS, headers);
  }

  /**
   * Set custom payload for the AI Chat component.
   * 
   * @param payload The custom payload.
   */
  setCustomPayload(payload: Record<string, any>): void {
    this.sendAIChatMethod(AIChatNameEnum.SET_CUSTOM_PAYLOAD, payload);
  }

  /**
   * Set suggestions for the AI Chat component.
   * 
   * @param suggestions The suggestions to set.
   */
  setSuggestions(suggestions: any[]): void {
    this.sendAIChatMethod(AIChatNameEnum.SET_SUGGESTIONS, suggestions);
  }

  /**
   * Show suggestions in the AI Chat component.
   * 
   * @param show Whether to show suggestions.
   */
  showSuggestions(show: boolean): void {
    this.sendAIChatMethod(AIChatNameEnum.SHOW_SUGGESTIONS, show);
  }

  /**
   * Show a chat message in the AI Chat component.
   * 
   * @param message The message to show.
   */
  showChatMessage(message: string): void {
    this.sendAIChatMethod(AIChatNameEnum.SHOW_CHAT_MESSAGE, message);
  }

  /**
   * Confirm an action in the AI Chat component.
   * 
   * @param action The action to confirm.
   */
  confirmAction(action: any): void {
    this.sendAIChatMethod(AIChatNameEnum.CONFIRM_ACTION, action);
  }

  /**
   * Show options in the AI Chat component.
   * 
   * @param options The options to show.
   */
  showOptions(options: any[]): void {
    this.sendAIChatMethod(AIChatNameEnum.SHOW_OPTIONS, options);
  }

  /**
   * Send a chat prompt to the AI Chat component.
   * 
   * @param prompt The prompt to send.
   */
  sendChatPrompt(prompt: string): void {
    this.sendAIChatMethod(AIChatNameEnum.SEND_CHAT_PROMPT, prompt);
  }
}
