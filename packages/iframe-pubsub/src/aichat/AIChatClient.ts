import { Client } from "../Client";

export enum AIChatNameEnum {
  AI_CHAT_CLIENT_ID = 'aichat',
  AI_CHAT_INTERNAL_COMM_TYPE = 'pubsub',
  AI_CHAT_ON_RESIZE = 'onResize',

  // App level
  SET_PARENT_NAME = 'setParentName',
  SET_USER_ID = 'setUserId',
  SET_CUSTOM_HEADERS = 'setCustomHeaders',
  SET_CUSTOM_PAYLOAD = 'setCustomPayload',
  SET_METADATA = 'setMetadata',
  SET_SYSTEM_MESSAGE ='setSystemMessage',

  // AIChat level
  SET_SUGGESTIONS = 'setSuggestions',
  SHOW_SUGGESTIONS = 'showSuggestions',
  SHOW_CHAT_MESSAGE = 'showChatMessage',
  SHOW_ERROR_MESSAGE = 'showErrorMessage',
  SHOW_COMING_SOON = 'showComingSoon',
  CONFIRM_ACTION = 'confirmAction',
  SHOW_OPTIONS = 'showOptions',
  SEND_CHAT_PROMPT = 'sendChatPrompt',
  OPEN_INTERCOM = 'openIntercom',

  // Default handler to process the actions
  DEFAULT = 'default',
}

export class AIChatClient extends Client   {
  /**
   * Create a new client instance.
   * 
   * @param pageId The ID of the page or component to register to.
   */
  constructor(pageId: string, targetAIChatClientId: string = AIChatNameEnum.AI_CHAT_CLIENT_ID) {
    super(pageId, targetAIChatClientId);
  }
  
  private sendAIChatPubsubMethod(methodName: string, arg: any): void {
    this.sendMessage(
      this.targetAIChatClientId,
      {
        type: AIChatNameEnum.AI_CHAT_INTERNAL_COMM_TYPE,
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
    this.sendAIChatPubsubMethod(AIChatNameEnum.SET_PARENT_NAME, parentName);
  }

  /**
   * Set the user ID for the AI Chat component.
   * 
   * @param userId The user ID.
   */
  setUserId(userId: string): void {
    this.sendAIChatPubsubMethod(AIChatNameEnum.SET_USER_ID, userId);
  }

  /**
   * Set custom headers for the AI Chat component.
   * 
   * @param headers The custom headers.
   */
  setCustomHeaders(headers: Record<string, string>): void {
    this.sendAIChatPubsubMethod(AIChatNameEnum.SET_CUSTOM_HEADERS, headers);
  }

  /**
   * Set custom payload for the AI Chat component.
   * 
   * @param payload The custom payload.
   */
  setCustomPayload(payload: Record<string, any>): void {
    this.sendAIChatPubsubMethod(AIChatNameEnum.SET_CUSTOM_PAYLOAD, payload);
  }

  /**
   * Set suggestions for the AI Chat component.
   * 
   * @param suggestions The suggestions to set.
   */
  setSuggestions(suggestions: any[]): void {
    this.sendAIChatPubsubMethod(AIChatNameEnum.SET_SUGGESTIONS, suggestions);
  }

  /**
   * Product metadata for the AI Chat component.
   * @param metadata JSON object containing metadata for the AI Chat component.
   */
  setMetadata(metadata: any): void {
    this.sendAIChatPubsubMethod(AIChatNameEnum.SET_METADATA, metadata);
  }

  /**
   * Add a system message to the AI Chat component.
   * 
   * @param systemMessage The system message to add.
   */
  setSystemMessage(systemMessage: string): void {
    this.sendAIChatPubsubMethod(AIChatNameEnum.SET_SYSTEM_MESSAGE, systemMessage);
  }

  /**
   * Show suggestions in the AI Chat component.
   * 
   * @param show Whether to show suggestions.
   */
  showSuggestions(show: boolean): void {
    this.sendAIChatPubsubMethod(AIChatNameEnum.SHOW_SUGGESTIONS, show);
  }

  /**
   * Show a chat message in the AI Chat component.
   * 
   * @param message The message to show.
   */
  showChatMessage(message: string): void {
    this.sendMessage(this.targetAIChatClientId, {
      type: AIChatNameEnum.AI_CHAT_CLIENT_ID,
      name: AIChatNameEnum.SHOW_CHAT_MESSAGE,
      parameters: {
        message
      }
    })
  }

  /**
   * Show an error message in the AI Chat component.
   * 
   * @param message The error message to show.
   */
  showErrorMessage(message: string): void {
    this.sendMessage(this.targetAIChatClientId, {
      type: AIChatNameEnum.AI_CHAT_CLIENT_ID,
      name: AIChatNameEnum.SHOW_ERROR_MESSAGE,
      parameters: {
        message
      }
    })
  }

  /**
   * Confirm an action in the AI Chat component.
   * 
   * @param action The action to confirm.
   */
  confirmAction(action: any): void {
    this.sendMessage(this.targetAIChatClientId, {
      type: AIChatNameEnum.AI_CHAT_CLIENT_ID,
      name: AIChatNameEnum.CONFIRM_ACTION,
      parameters: {
        action
      }
    })
  }

  /**
   * Show options in the AI Chat component.
   * 
   * @param options The options to show.
   */
  showOptions(options: any[]): void {
    this.sendMessage(this.targetAIChatClientId, {
      type: AIChatNameEnum.AI_CHAT_CLIENT_ID,
      name: AIChatNameEnum.SHOW_OPTIONS,
      parameters: {
        options
      }
    })
  }

  /**
   * Send a chat prompt to the AI Chat component.
   * 
   * @param prompt The prompt to send.
   */
  sendChatPrompt(prompt: string): void {
    this.sendMessage(this.targetAIChatClientId, {
      type: AIChatNameEnum.AI_CHAT_CLIENT_ID,
      name: AIChatNameEnum.SEND_CHAT_PROMPT,
      parameters: {
        message: prompt
      }
    })
  }

  /**
   * Show an unknown error message in the AI Chat component.
   */
  showComingSoon(): void {
    this.sendMessage(this.targetAIChatClientId, {
      type: AIChatNameEnum.AI_CHAT_CLIENT_ID,
      name: AIChatNameEnum.SHOW_COMING_SOON,
      parameters: {
        message: 'coming_soon' // Not used
      }
    })
  }
}
