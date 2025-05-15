import { WebContent, ContentVector } from "@shared/schema";
import OpenAI from "openai";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import crypto from "crypto";

// In-memory vector store
let vectorStore: ContentVector[] = [];

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

// Generate embeddings with OpenAI
async function generateOpenAIEmbedding(text: string, apiKey: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey });
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  
  return response.data[0].embedding;
}

// Generate embeddings with Gemini
async function generateGeminiEmbedding(text: string, apiKey: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  
  const result = await model.embedContent(text);
  const embedding = result.embedding.values;
  
  return embedding;
}

// Public API to add content to vector store
export async function addToVectorStore(
  content: WebContent[], 
  apiProvider: "openai" | "gemini", 
  apiKey: string
): Promise<void> {
  for (const item of content) {
    try {
      const vector = apiProvider === "openai" 
        ? await generateOpenAIEmbedding(item.content, apiKey)
        : await generateGeminiEmbedding(item.content, apiKey);
      
      vectorStore.push({
        id: crypto.randomUUID(),
        content: item.content,
        url: item.url,
        title: item.title,
        vector
      });
      
    } catch (error) {
      console.error(`Error generating embedding for content from ${item.url}:`, error);
    }
  }
  
  console.log(`Added ${content.length} items to vector store. Total items: ${vectorStore.length}`);
}

// Search for relevant content based on query
export async function findRelevantContent(
  query: string, 
  apiProvider: "openai" | "gemini" = "openai",
  apiKey: string = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "", 
  topK: number = 3
): Promise<Pick<ContentVector, "content" | "url" | "title">[]> {
  if (vectorStore.length === 0) {
    return [];
  }
  
  try {
    // If no embeddings in store yet or API key issues, try basic keyword search as fallback
    if (vectorStore.some(item => !item.vector || item.vector.length === 0)) {
      return performKeywordSearch(query, topK);
    }
    
    try {
      let queryVector: number[] = [];
      
      try {
        // Generate query embedding
        queryVector = apiProvider === "openai"
          ? await generateOpenAIEmbedding(query, apiKey)
          : await generateGeminiEmbedding(query, apiKey);
      } catch (embeddingError: any) {
        console.error("Embedding generation failed:", embeddingError?.message || 'Unknown error');
        // If embedding fails, fall back to keyword search
        return performKeywordSearch(query, topK);
      }
      
      if (!queryVector || queryVector.length === 0) {
        return performKeywordSearch(query, topK);
      }
      
      // Calculate similarity scores
      const scoredResults = vectorStore.map(item => ({
        ...item,
        similarity: cosineSimilarity(queryVector, item.vector)
      }));
      
      // Sort by similarity and take top K results
      const topResults = scoredResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .filter(item => item.similarity > 0.7); // Threshold for relevance
      
      if (topResults.length > 0) {
        return topResults.map(({ content, url, title }) => ({ content, url, title }));
      } else {
        // Fallback to keyword search if no semantic matches
        return performKeywordSearch(query, topK);
      }
    } catch (error: any) {
      console.error("Error in semantic search, falling back to keyword search:", error?.message || 'Unknown error');
      return performKeywordSearch(query, topK);
    }
  } catch (error) {
    console.error("Error searching vector store:", error);
    return [];
  }
}

// Simple keyword-based search as fallback when embeddings aren't available
function performKeywordSearch(query: string, topK: number = 3): Pick<ContentVector, "content" | "url" | "title">[] {
  // Normalize and split query into keywords
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  
  if (keywords.length === 0) return [];
  
  // Score documents based on keyword matches
  const scoredResults = vectorStore.map(item => {
    const content = item.content.toLowerCase();
    const title = item.title.toLowerCase();
    
    // Count keyword occurrences
    let score = 0;
    for (const keyword of keywords) {
      // Title matches are more important
      const titleMatches = (title.match(new RegExp(keyword, 'g')) || []).length;
      const contentMatches = (content.match(new RegExp(keyword, 'g')) || []).length;
      
      score += titleMatches * 3 + contentMatches;
    }
    
    return {
      ...item,
      score
    };
  });
  
  // Sort and filter results
  const topResults = scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(item => item.score > 0);
  
  return topResults.map(({ content, url, title }) => ({ content, url, title }));
}

// Clear vector store
export function clearVectorStore(): void {
  vectorStore = [];
}

// Get vector store stats
export function getVectorStoreStats(): { count: number } {
  return { count: vectorStore.length };
}
