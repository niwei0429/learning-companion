import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
// @ts-ignore - process.env.API_KEY is injected by the environment
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

let chatSession: Chat | null = null;

export const initializeChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // A bit of creativity for warmth, but stable enough for logic
    },
  });
};

export const sendMessageToGemini = async (text: string, imageBase64?: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  if (!chatSession) {
    initializeChat();
  }

  try {
    let response: GenerateContentResponse;

    if (imageBase64) {
      // If there's an image, we send it as a part. 
      // Note: chat.sendMessage supports 'contents' structure or simple message string.
      // For multimodal in chat, we construct the content part.
      
      // Remove header if present (e.g., "data:image/png;base64,")
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      
      // Determine mime type roughly (defaulting to png/jpeg if not found, but usually browser file reader gives the full string)
      const mimeMatch = imageBase64.match(/^data:(.*);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };
      
      const textPart = {
        text: text || "Help me with this image.",
      };

      // @google/genai chat.sendMessage takes a string or a content part-like structure?
      // Actually, checking docs: chat.sendMessage({ message: string | Part[] | ... })
      // We'll use the proper structure.
      response = await chatSession!.sendMessage({
        message: [imagePart, textPart] as any, // Cast to any to avoid strict type issues if library types are slightly off, but standard Part[] is supported
      });

    } else {
      response = await chatSession!.sendMessage({
        message: text,
      });
    }

    if (response.text) {
      return response.text;
    } else {
      return "I'm thinking... but I couldn't come up with words right now. Can you try again?";
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("I had a little trouble connecting. Can you say that again?");
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  if (!apiKey) return undefined;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] }, 
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Puck is friendly and energetic, good for a companion
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};

export const getFunFact = async (context?: string): Promise<string> => {
  if (!apiKey) return "Did you know? I can't think of a fact without my key!";
  
  try {
    const prompt = `Give me a short, mind-blowing "Did you know?" fun fact for a 10-year-old boy. ${context ? `Relate it to: "${context}".` : "Make it about space, animals, robots, or nature."} Keep it under 30 words and include a fun emoji. Start directly with the fact.`;
    
    // Independent generation to not pollute chat context
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Did you know? Space is completely silent because there is no air! 🌌";
  } catch (error) {
    console.error("Fun Fact Error:", error);
    return "Did you know? Honey never spoils! You can eat honey that is 3,000 years old! 🍯";
  }
};

export const resetChat = () => {
  initializeChat();
};