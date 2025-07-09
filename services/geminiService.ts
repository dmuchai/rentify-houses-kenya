import { GoogleGenerativeAI, GenerateContentResponse, Chat, GroundingChunk } from "@google/generative-ai";
import { PropertyListing, AiEnhancedContent, RentEstimate } from '../types';

// IMPORTANT: API Key Management
// The API key MUST be provided via the `process.env.API_KEY` environment variable.
// This client-side code assumes `process.env.API_KEY` is replaced by a build tool (e.g., Vite, Webpack)
// or handled by the execution environment if this code runs server-side (e.g. Next.js API route).
// DO NOT hardcode the API key here or expose it directly in client-side bundles without obfuscation.
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key not found. AI features will be disabled. Ensure process.env.API_KEY is set.");
}

const ai = API_KEY ? new GoogleGenerativeAI({ apiKey: API_KEY }) : null;
const TEXT_MODEL_NAME = "gemini-2.5-flash-preview-04-17";
// const IMAGE_MODEL_NAME = "imagen-3.0-generate-002"; // If image generation is needed

const parseJsonResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", responseText);
    return null;
  }
};

export const geminiService = {
  /**
   * Placeholder: Checks an image for potential reuse indicating a scam.
   * In a real app, this would involve more complex image analysis.
   * This version simulates sending image data (e.g., base64) to Gemini.
   */
  checkImageForScam: async (
    imageDataBase64: string,
    existingImageHashes?: string[] // Optional: hashes of known scam images or agent's other listings
  ): Promise<{ status: 'clear' | 'flagged_reused' | 'flagged_poor_quality'; reason?: string }> => {
    if (!ai) return { status: 'clear', reason: "AI service disabled." };
    
    console.log("Simulating AI image scam check for image (first 50 chars):", imageDataBase64.substring(0,50));

    // Simulate Gemini Vision call
    // In a real scenario, you'd convert base64 to a Part for the API.
    // const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageDataBase64 } };
    // const prompt = "Analyze this image. Is it a common stock photo or known scam image related to real estate? Does it appear in multiple unrelated listings? Is the quality very low? Respond with JSON: {isScam: boolean, reason: string}";
    // For now, mock a response:
    return new Promise(resolve => {
        setTimeout(() => {
            const random = Math.random();
            if (existingImageHashes && existingImageHashes.includes("mock_hash_" + imageDataBase64.substring(10,20))) { // Simple mock check
                resolve({ status: 'flagged_reused', reason: 'Image appears to be reused from another listing.' });
            } else if (random < 0.1) {
                resolve({ status: 'flagged_reused', reason: 'AI detected potential image reuse or stock photo characteristics.' });
            } else if (random < 0.15) {
                resolve({ status: 'flagged_poor_quality', reason: 'Image quality is very low, potentially suspicious.' });
            } else {
                resolve({ status: 'clear' });
            }
        }, 1500);
    });
  },

  /**
   * Enhances listing details using AI.
   */
  enhanceListingContent: async (listing: Partial<PropertyListing>): Promise<AiEnhancedContent | null> => {
    if (!ai) return null;

    const prompt = `
      Given the following Kenyan rental listing details, enhance them.
      Provide an engaging property description (max 150 words), a catchy title (max 10 words),
      and brief pricing advice (e.g., "Consider highlighting value compared to area average.").
      Focus on the Kenyan market context.

      Details:
      Title: ${listing.title || 'N/A'}
      Location: ${listing.location?.neighborhood}, ${listing.location?.county}
      Price: KES ${listing.price}
      Bedrooms: ${listing.bedrooms}
      Bathrooms: ${listing.bathrooms}
      Current Description: ${listing.description || 'N/A'}
      Amenities: ${listing.amenities?.join(', ') || 'N/A'}

      Respond ONLY with a JSON object in the format:
      {
        "enhancedDescription": "string",
        "suggestedTitle": "string",
        "pricingAdvice": "string"
      }
    `;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return parseJsonResponse<AiEnhancedContent>(response.text);
    } catch (error) {
      console.error("Error enhancing listing content with Gemini:", error);
      return null;
    }
  },

  /**
   * Provides a rent estimate for a given area and property type.
   * This is a placeholder; real implementation would require a fine-tuned model or RAG with market data.
   */
  estimateRent: async (location: string, bedrooms: number, county: string): Promise<RentEstimate | null> => {
    if (!ai) return null;

    const prompt = `
      Provide a rent estimate for a ${bedrooms}-bedroom property in ${location}, ${county}, Kenya.
      Consider current market trends if possible (hypothetically, as this is a general model).
      Give a min, max, and average rent in KES. Also, state a confidence level (high, medium, low).
      
      Respond ONLY with a JSON object in the format:
      {
        "location": "${location}, ${county}",
        "bedrooms": ${bedrooms},
        "minRent": number,
        "maxRent": number,
        "averageRent": number,
        "confidence": "high" | "medium" | "low",
        "lastUpdated": "YYYY-MM-DD" 
      }
      If you use Google Search grounding, list the sources.
    `;
    
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: prompt,
        config: { 
            tools: [{googleSearch: {}}] // Enable Google Search for potentially more current info
            // Removed: responseMimeType: "application/json" as it's incompatible with tools
        }
      });
      
      const parsed = parseJsonResponse<RentEstimate>(response.text);
      if(parsed){
        // Log grounding sources if available
        const groundingChunks: GroundingChunk[] | undefined = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
            console.log("Rent estimate grounded with sources:");
            groundingChunks.forEach(chunk => {
              if(chunk.web) console.log(`- ${chunk.web.title}: ${chunk.web.uri}`);
              if(chunk.retrievedContext) console.log(`- ${chunk.retrievedContext.title}: ${chunk.retrievedContext.uri}`);
            });
            // You might want to return these sources to the UI
        }
        return {...parsed, lastUpdated: new Date().toISOString().split('T')[0]}; // Override lastUpdated with current date for mock
      }
      return null;

    } catch (error) {
      console.error("Error estimating rent with Gemini:", error);
      // Fallback mock data if API fails or in AI-disabled mode
      const mockMin = bedrooms * 15000 + (Math.random() * 5000);
      return {
        location: `${location}, ${county}`,
        bedrooms,
        minRent: mockMin,
        maxRent: mockMin + bedrooms * 10000 + (Math.random() * 10000),
        averageRent: mockMin + bedrooms * 5000 + (Math.random() * 5000),
        confidence: 'low',
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    }
  },

  /**
   * Smart assistant for renters.
   * This function would parse the query and try to match it with listing criteria.
   */
  processSmartAssistantQuery: async (query: string): Promise<string> => {
    if (!ai) return "AI smart assistant is currently unavailable.";

    const chat: Chat = ai.chats.create({
        model: TEXT_MODEL_NAME,
        config: {
          systemInstruction: `You are a helpful assistant for finding rental houses in Kenya. 
          The user will describe what they are looking for. 
          Your goal is to understand their needs (location, number of bedrooms, budget in KES, specific amenities) 
          and provide a concise summary of their request or ask clarifying questions if needed.
          If they mention a price, assume it's in KES.
          Keep your responses brief and conversational. If the query is vague, ask for more details.
          Example user query: "Find me a 2BR in Rongai under Ksh 30,000"
          Example response: "Okay, looking for a 2-bedroom place in Rongai for under KES 30,000. Any specific amenities you need?"
          Example user query: "I need a house"
          Example response: "Sure, I can help with that! Could you tell me more about what you're looking for? For example, which location, how many bedrooms, and your approximate budget?"
          `,
           thinkingConfig: { thinkingBudget: 0 } // Low latency
        },
      });

    try {
      // For a real app, you might have a conversation history.
      const result: GenerateContentResponse = await chat.sendMessage({message: query});
      return result.text;
    } catch (error) {
      console.error("Error with smart assistant:", error);
      return "Sorry, I'm having trouble understanding that right now. Please try rephrasing.";
    }
  },

  /**
   *  Generic text generation for other purposes.
   */
  generateText: async (prompt: string, streamingCallback?: (chunk: string) => void ): Promise<string> => {
    if (!ai) return "AI service is unavailable.";
    try {
      if (streamingCallback) {
        const responseStream = await ai.models.generateContentStream({
            model: TEXT_MODEL_NAME,
            contents: prompt,
        });
        let fullText = "";
        for await (const chunk of responseStream) {
            fullText += chunk.text;
            streamingCallback(chunk.text);
        }
        return fullText;
      } else {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: prompt,
        });
        return response.text;
      }
    } catch (error) {
        console.error("Error generating text with Gemini:", error);
        return "An error occurred while generating text.";
    }
  }
};
