import { apiRequest } from "./queryClient";

// Trigger website scraping process
export async function scrapeWebsite(url: string): Promise<{ success: boolean, message: string }> {
  try {
    await apiRequest("POST", "/api/crawl", { url });
    return { success: true, message: "Website crawling started successfully" };
  } catch (error) {
    console.error("Error scraping website:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Validate if a URL is valid
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Format URL by ensuring it has a protocol
export function formatUrl(url: string): string {
  if (!url) return "";
  
  url = url.trim();
  
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  
  return url;
}

// Extract domain from URL for display
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(formatUrl(url));
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
}
