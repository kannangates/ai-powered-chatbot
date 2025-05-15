import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatSettings, Message } from "@shared/schema";
import { findRelevantContent } from "./vector-store";

export async function generateAIResponse({
  messages,
  settings,
  searchQuery
}: {
  messages: Message[];
  settings: ChatSettings;
  searchQuery: string;
}): Promise<string> {
  try {
    // Define the type explicitly for relevant content
    let relevantContent: Array<{content: string; url: string; title: string}> = [];
    
    // Try to find relevant content, with error handling
    try {
      // Use the current API provider's key for search
      const apiKey = settings.apiKey;
      const apiProvider = settings.apiProvider;
      
      relevantContent = await findRelevantContent(searchQuery, apiProvider, apiKey);
    } catch (searchError: any) {
      console.error("Error finding relevant content:", searchError?.message || 'Unknown error');
      // Continue with empty relevantContent if search fails
    }
    
    // Create a context prompt with relevant content
    let contextPrompt = "";
    if (relevantContent && relevantContent.length > 0) {
      contextPrompt = `
The following information was found on the website and might be relevant to the user's query:

${relevantContent.map(item => `
URL: ${item.url}
Title: ${item.title}
Content: ${item.content}
`).join("\n")}

Please use this information to answer the user's question if applicable. If this information doesn't answer the question completely, provide a general response based on your knowledge but make it clear that you're not using specific website information.
`;
    } else {
      contextPrompt = `
You couldn't find specific information about this on the website. Try to provide a helpful general response, and if appropriate, suggest contacting a human agent via WhatsApp for more specific assistance.
`;
    }

    // Add the context as a system message
    const contextualizedMessages: Message[] = [
      {
        id: "system-context",
        role: "system",
        content: `You are a helpful assistant for a website. ${contextPrompt}`,
        timestamp: new Date()
      },
      ...messages
    ];

    // Generate response based on selected provider with fallback
    try {
      if (settings.apiProvider === "openai") {
        return await generateOpenAIResponse(contextualizedMessages, settings);
      } else {
        return await generateGeminiResponse(contextualizedMessages, settings);
      }
    } catch (providerError: any) {
      console.error(`Error with ${settings.apiProvider} provider:`, providerError?.message || 'Unknown error');
      
      // Try the other provider as fallback if we have both API keys
      if (settings.apiProvider === "openai" && process.env.GEMINI_API_KEY) {
        try {
          const geminiSettings = { ...settings, apiProvider: "gemini" as const, apiKey: process.env.GEMINI_API_KEY };
          return await generateGeminiResponse(contextualizedMessages, geminiSettings);
        } catch (fallbackError) {
          console.error("Fallback provider also failed:", fallbackError);
          throw providerError; // Rethrow the original error
        }
      } else if (settings.apiProvider === "gemini" && process.env.OPENAI_API_KEY) {
        try {
          const openaiSettings = { ...settings, apiProvider: "openai" as const, apiKey: process.env.OPENAI_API_KEY };
          return await generateOpenAIResponse(contextualizedMessages, openaiSettings);
        } catch (fallbackError) {
          console.error("Fallback provider also failed:", fallbackError);
          throw providerError; // Rethrow the original error
        }
      } else {
        // No fallback available
        throw providerError;
      }
    }
  } catch (error: any) {
    console.error("Error generating AI response:", error?.message || 'Unknown error');
    const whatsappLink = "https://wa.me/919513734374?text=Hi";
    return `Sorry, I'm currently unable to respond. You can [click here](${whatsappLink}) to connect with a support agent.`;
  }
}

async function generateOpenAIResponse(messages: Message[], settings: ChatSettings): Promise<string> {
  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
    const openai = new OpenAI({ apiKey: settings.apiKey });
    
    // Model fallback logic - try cheaper models if higher tier models fail
    const modelOptions = [
      settings.modelName || "gpt-4o",
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-instruct"
    ];
    
    let response;
    let lastError = null;
    
    // Try each model in order until one works
    for (const model of modelOptions) {
      try {
        response = await openai.chat.completions.create({
          model: model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 1000,
        });
        
        // If successful, break out of the loop
        break;
      } catch (error: any) {
        console.log(`Error with model ${model}:`, error.message || 'Unknown error');
        lastError = error;
        
        // If it's not a model-related or quota error, don't try other models
        if (!error.message?.includes("model") && error.code !== "insufficient_quota") {
          throw error;
        }
      }
    }
    
    if (response) {
      return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
    } else {
      // If all models failed, throw the last error
      throw lastError || new Error("All OpenAI models failed to respond");
    }
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Provide WhatsApp contact link as requested
    const whatsappLink = "https://wa.me/919513734374?text=Hi";
    const contactMessage = `Sorry, I'm currently unable to respond. You can [click here](${whatsappLink}) to connect with a support agent.`;
    
    // Log the error but don't expose it to the user
    if (error?.code === "insufficient_quota" || error?.message?.includes("model") || true) {
      return contactMessage;
    }
  }
}

async function generateGeminiResponse(messages: Message[], settings: ChatSettings): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const model = genAI.getGenerativeModel({ model: settings.modelName || "gemini-pro" });

    // Convert messages to Gemini format
    const chatHistory = [];
    
    for (let i = 1; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        chatHistory.push({ role: "user", parts: [{ text: msg.content }] });
      } else if (msg.role === "assistant") {
        chatHistory.push({ role: "model", parts: [{ text: msg.content }] });
      }
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const systemMessage = messages[0].content;
    const result = await chat.sendMessage(systemMessage);
    
    return result.response.text();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    // Provide WhatsApp contact link as fallback
    const whatsappLink = "https://wa.me/919513734374?text=Hi";
    return `Sorry, I'm currently unable to respond. You can [click here](${whatsappLink}) to connect with a support agent.`;
  }
}
