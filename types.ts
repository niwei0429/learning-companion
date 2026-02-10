export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string; // base64 string for user uploaded images
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface UserSettings {
  userName: string;
}

export enum CompanionMood {
  NEUTRAL = 'neutral',
  THINKING = 'thinking',
  HAPPY = 'happy',
  WAITING = 'waiting',
}