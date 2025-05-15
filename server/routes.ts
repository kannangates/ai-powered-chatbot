import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIResponse } from "./ai-service";
import { crawlWebsite, chunkContent, scrapeUrl } from "./scraper";
import { addToVectorStore, clearVectorStore, getVectorStoreStats, findRelevantContent } from "./vector-store";
import { z } from "zod";
import { chatMessageSchema, chatSettingsSchema, scrapeRequestSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import chatbotConfig from "./config/chatbot.config";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Chatbot message endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedBody = chatMessageSchema.parse(req.body);
      const { content, role } = validatedBody;
      
      // Initialize or get session data
      if (!req.session) {
        req.session = {};
      }
      
      if (!req.session.chatMessages) {
        req.session.chatMessages = [];
      }
      
      if (!req.session.chatSettings) {
        req.session.chatSettings = {
          apiProvider: "openai",
          apiKey: process.env.OPENAI_API_KEY || "",
          websiteUrl: "",
        };
      }
      
      // Add user message to history
      const userMessage = {
        id: nanoid(),
        content,
        role,
        timestamp: new Date()
      };
      
      req.session.chatMessages.push(userMessage);
      
      // Generate AI response
      const aiResponse = await generateAIResponse({
        messages: req.session.chatMessages,
        settings: req.session.chatSettings,
        searchQuery: content
      });
      
      // Add assistant message to history
      const assistantMessage = {
        id: nanoid(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date()
      };
      
      req.session.chatMessages.push(assistantMessage);
      
      res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(400).json({ 
        error: "Invalid request", 
        details: error instanceof z.ZodError ? error.errors : null 
      });
    }
  });

  // Update chat settings
  app.post("/api/settings", async (req, res) => {
    try {
      const validatedBody = chatSettingsSchema.parse(req.body);
      
      // Initialize session if needed
      if (!req.session) {
        req.session = {};
      }
      
      req.session.chatSettings = validatedBody;
      
      res.json({ success: true, settings: req.session.chatSettings });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({ 
        error: "Invalid settings", 
        details: error instanceof z.ZodError ? error.errors : null 
      });
    }
  });

  // Get current chat settings
  app.get("/api/settings", (req, res) => {
    if (!req.session || !req.session.chatSettings) {
      // Use config defaults instead of hardcoded values
      return res.json({
        apiProvider: chatbotConfig.api.defaultProvider,
        apiKey: process.env.OPENAI_API_KEY || "",
        websiteUrl: "",
        uiConfig: {
          colors: chatbotConfig.ui.colors,
          icon: chatbotConfig.ui.icon,
          text: chatbotConfig.ui.text,
        },
        whatsapp: chatbotConfig.features.whatsapp
      });
    }
    
    // Add UI config to the response
    const settings = {
      ...req.session.chatSettings,
      uiConfig: {
        colors: chatbotConfig.ui.colors,
        icon: chatbotConfig.ui.icon,
        text: chatbotConfig.ui.text,
      },
      whatsapp: chatbotConfig.features.whatsapp
    };
    
    res.json(settings);
  });

  // Crawl website and update vector store
  app.post("/api/crawl", async (req, res) => {
    try {
      const { url } = scrapeRequestSchema.parse(req.body);
      
      // Get settings from session or use defaults
      const settings = req.session?.chatSettings || {
        apiProvider: "openai",
        apiKey: process.env.OPENAI_API_KEY || "",
        websiteUrl: url,
      };
      
      // Start crawling in the background
      res.json({ message: "Crawling started", url });
      
      try {
        // Clear existing vectors
        clearVectorStore();
        
        // Crawl website
        const crawledContent = await crawlWebsite(url);
        
        // Chunk content for better embedding
        let chunkedContent = [];
        for (const content of crawledContent) {
          chunkedContent = chunkedContent.concat(chunkContent(content));
        }
        
        // Add to vector store
        await addToVectorStore(chunkedContent, settings.apiProvider, settings.apiKey);
        
        console.log(`Crawling complete. Added ${chunkedContent.length} chunks to vector store.`);
      } catch (error) {
        console.error("Error during background crawling:", error);
      }
    } catch (error) {
      console.error("Error in crawl endpoint:", error);
      res.status(400).json({ 
        error: "Invalid request", 
        details: error instanceof z.ZodError ? error.errors : null 
      });
    }
  });

  // Get vector store stats
  app.get("/api/vectors/stats", (req, res) => {
    res.json(getVectorStoreStats());
  });

  // Get chat history
  app.get("/api/chat/history", (req, res) => {
    if (!req.session || !req.session.chatMessages) {
      return res.json([]);
    }
    
    res.json(req.session.chatMessages);
  });

  // Clear chat history
  app.post("/api/chat/clear", (req, res) => {
    if (req.session) {
      req.session.chatMessages = [];
    }
    
    res.json({ success: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
