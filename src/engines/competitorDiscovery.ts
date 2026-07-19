import OpenAI from 'openai';
import { config } from '../lib/config';

// Initialize Firecrawl only if key is available
let FirecrawlApp: any;
try {
  FirecrawlApp = require('@mendable/firecrawl-js').default;
} catch (e) {
  // Ignored, will be handled gracefully below
}

export interface Competitor {
  url: string;
  name: string;
  similarity: number;
}

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY || process.env.OPENAI_API_KEY
});

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function discoverCompetitors(clientUrl: string, clientIndustry?: string): Promise<Competitor[]> {
  const apiKey = config.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY;
  if (!apiKey || !FirecrawlApp) {
    console.warn("Firecrawl API key or SDK missing. Returning empty competitors list.");
    return [];
  }

  const firecrawl = new FirecrawlApp({ apiKey });
  const query = clientIndustry ? `top ${clientIndustry} websites similar to ${clientUrl}` : `websites similar to ${clientUrl} competitors`;

  try {
    // Perform search using Firecrawl
    const searchResponse = await firecrawl.search(query);
    if (!searchResponse || !searchResponse.data || searchResponse.data.length === 0) {
      return [];
    }

    const candidateUrls = searchResponse.data.map((result: any) => result.url).filter((url: string) => url && !url.includes(clientUrl));
    
    // Fallback if no embeddings are possible
    if (candidateUrls.length === 0) return [];

    // Get embedding for client
    const clientEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: clientIndustry ? `${clientIndustry} business at ${clientUrl}` : clientUrl,
    });
    const clientVector = clientEmbeddingResponse.data[0].embedding;

    // Get embeddings for candidates
    const competitors: Competitor[] = [];
    
    for (const result of searchResponse.data) {
      if (!result.url || result.url.includes(clientUrl)) continue;
      
      const candidateEmbeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: result.title || result.url,
      });
      const candidateVector = candidateEmbeddingResponse.data[0].embedding;
      
      const similarity = cosineSimilarity(clientVector, candidateVector);
      
      competitors.push({
        url: result.url,
        name: result.title || new URL(result.url).hostname,
        similarity
      });
    }

    // Sort by highest similarity and pick top 3
    competitors.sort((a, b) => b.similarity - a.similarity);
    return competitors.slice(0, 3);
  } catch (error: any) {
    console.error("Failed to discover competitors:", error.message);
    return [];
  }
}
