import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { WebContent } from "@shared/schema";

// Utility to clean text by removing extra whitespace and HTML artifacts
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

// Extract text content from HTML
function extractTextContent(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove script, style, svg, and other non-content elements
  $("script, style, svg, meta, link, noscript, iframe").remove();
  
  // Get text from body
  const bodyText = $("body").text();
  
  return cleanText(bodyText);
}

// Extract title from HTML
function extractTitle(html: string): string {
  const $ = cheerio.load(html);
  return $("title").text().trim() || "Untitled Page";
}

// Extract links from HTML to crawl further
function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];
  
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    
    try {
      // Convert relative URLs to absolute
      let absoluteUrl = href;
      if (href.startsWith("/")) {
        const urlObj = new URL(baseUrl);
        absoluteUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
      } else if (!href.startsWith("http")) {
        // Skip mailto:, tel:, javascript:, etc.
        if (href.includes(":")) return;
        
        // Handle relative paths without leading slash
        const urlObj = new URL(baseUrl);
        const path = urlObj.pathname.endsWith("/") 
          ? urlObj.pathname 
          : urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf("/") + 1);
        absoluteUrl = `${urlObj.protocol}//${urlObj.host}${path}${href}`;
      }
      
      // Only include links from the same domain
      const urlObj = new URL(absoluteUrl);
      const baseUrlObj = new URL(baseUrl);
      
      if (urlObj.hostname === baseUrlObj.hostname) {
        links.push(absoluteUrl);
      }
    } catch (e) {
      // Skip invalid URLs
      console.error(`Error processing URL ${href}:`, e);
    }
  });
  
  return [...new Set(links)]; // Remove duplicates
}

// Main function to scrape a URL
export async function scrapeUrl(url: string): Promise<WebContent> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    return {
      url,
      content: extractTextContent(html),
      title: extractTitle(html),
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape URL: ${url}`);
  }
}

// Main function to crawl a website starting from a given URL
export async function crawlWebsite(startUrl: string, maxPages: number = 20): Promise<WebContent[]> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const results: WebContent[] = [];
  
  try {
    // Normalize the start URL
    const urlObj = new URL(startUrl);
    const normalizedStartUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    queue[0] = normalizedStartUrl;
    
    while (queue.length > 0 && results.length < maxPages) {
      const currentUrl = queue.shift()!;
      
      // Skip if already visited
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
      
      console.log(`Scraping: ${currentUrl}`);
      
      try {
        const response = await fetch(currentUrl);
        const html = await response.text();
        
        // Extract content
        results.push({
          url: currentUrl,
          content: extractTextContent(html),
          title: extractTitle(html),
          timestamp: new Date()
        });
        
        // Extract and queue new links
        const links = extractLinks(html, currentUrl);
        for (const link of links) {
          if (!visited.has(link)) {
            queue.push(link);
          }
        }
      } catch (error) {
        console.error(`Error processing ${currentUrl}:`, error);
        // Continue with the next URL
        continue;
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error during crawling:", error);
    // Return any partial results we gathered
    return results;
  }
}

// Function to chunk content into smaller pieces for embedding
export function chunkContent(content: WebContent, maxChunkSize: number = 1000): WebContent[] {
  if (content.content.length <= maxChunkSize) {
    return [content];
  }
  
  const chunks: WebContent[] = [];
  // Split by paragraphs or sentences to create more meaningful chunks
  const paragraphs = content.content.split(/(?:\r?\n){2,}/);
  
  let currentChunk = "";
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push({
          ...content,
          content: currentChunk.trim()
        });
      }
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push({
      ...content,
      content: currentChunk.trim()
    });
  }
  
  return chunks;
}
