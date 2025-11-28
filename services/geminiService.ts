
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisRequest, SocialStrategyResponse, Platform, Mode } from "../types";
import { SYSTEM_INSTRUCTION, RESPONSE_SCHEMA } from "../constants";

// Helper to determine model based on features
const getModelName = (request: AnalysisRequest): string => {
  // Google Maps tool is strictly supported on gemini-2.5-flash in this context.
  if (request.useMaps) {
    return 'gemini-2.5-flash';
  }

  // Use Pro for everything else to ensure high quality JSON adherence
  return 'gemini-3-pro-preview';
};

// Robust JSON Extraction for when Tools disable strict JSON mode
const extractJSON = (text: string): any => {
  if (!text) return null;
  
  try {
    // 1. Try parsing pure JSON first
    return JSON.parse(text);
  } catch (e) {
    // 2. Try cleaning Markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleanText);
    } catch (e2) {
      // 3. Regex extraction: Find the first '{' and the last '}'
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          try {
              return JSON.parse(jsonMatch[0]);
          } catch (e3) {
               console.error("JSON Extraction failed via regex method", e3);
          }
      }
      throw new Error("Could not parse valid JSON from AI response.");
    }
  }
};

// SAFETY NET: Platform Specific Defaults
const getPlatformDefaults = (platform: Platform) => {
  const defaults: any = {
    posting_strategy: {
      recommended_posting_time_local: "9:00 AM - 11:00 AM",
      suggested_frequency_per_week: 3,
      cross_posting_tips: "Adapt caption length and remove watermarks."
    },
    competitor_insights: {
      cta_strategy: "Direct value-add with save-for-later hook.",
      visual_theme: "High contrast text overlays with quick pacing.",
      keywords_detected: ["Growth", "Strategy", "Tips"],
      hook_patterns: ["Curiosity Loop", "Negative Hook"],
      video_style: "Fast-paced, talking head with B-roll",
      caption_structure: "Hook - Value - CTA",
      competitor_hashtags: ["#fyp", "#trending"]
    }
  };

  switch (platform) {
    case Platform.LinkedIn:
      defaults.posting_strategy = {
        recommended_posting_time_local: "Tue-Thu, 8:00 AM - 10:00 AM",
        suggested_frequency_per_week: 3,
        cross_posting_tips: "Expand into a longer article or carousel PDF."
      };
      break;
    case Platform.Instagram:
      defaults.posting_strategy = {
        recommended_posting_time_local: "Daily, 11:00 AM or 7:00 PM",
        suggested_frequency_per_week: 5,
        cross_posting_tips: "Share to Story with a poll sticker for engagement."
      };
      break;
    case Platform.TikTok:
      defaults.posting_strategy = {
        recommended_posting_time_local: "Daily, 6:00 PM - 9:00 PM",
        suggested_frequency_per_week: 7,
        cross_posting_tips: "Remove watermark before reposting to Reels/Shorts."
      };
      break;
    case Platform.TwitterX:
      defaults.posting_strategy = {
        recommended_posting_time_local: "Weekdays, 9:00 AM & 1:00 PM",
        suggested_frequency_per_week: 10,
        cross_posting_tips: "Screenshot tweet for IG Stories/LinkedIn."
      };
      break;
    case Platform.YouTube:
      defaults.posting_strategy = {
        recommended_posting_time_local: "Fri-Sat, 3:00 PM - 6:00 PM",
        suggested_frequency_per_week: 1,
        cross_posting_tips: "Cut highlights into Shorts linking to full video."
      };
      break;
    case Platform.Facebook:
      defaults.posting_strategy = {
        recommended_posting_time_local: "Daily, 1:00 PM - 4:00 PM",
        suggested_frequency_per_week: 5,
        cross_posting_tips: "Share to Groups for community reach."
      };
      break;
    }
  return defaults;
};

// Validate and Fill Response with Fallbacks
const validateAndFillResponse = (response: any, request: AnalysisRequest): SocialStrategyResponse => {
    const platformDefaults = getPlatformDefaults(request.platform);

    // Ensure arrays exist
    if (!Array.isArray(response.hashtags)) response.hashtags = [];
    if (!Array.isArray(response.seo_keywords)) response.seo_keywords = [];
    if (!Array.isArray(response.trend_hunter_ideas)) response.trend_hunter_ideas = [];

    // Trend Hunter Fallback
    if (request.mode === Mode.TrendHunter && response.trend_hunter_ideas.length === 0) {
        response.trend_hunter_ideas = [
            {
                idea_title: `Trending News in ${request.niche}`,
                idea_description: `Search results indicate high interest in ${request.niche}. Capitalize on this by sharing your unique perspective on recent industry shifts.`,
                why_it_works: "Newsjacking leverages existing search traffic.",
                suggested_platforms: [Platform.TwitterX, Platform.LinkedIn]
            },
            {
                idea_title: "Community Debate Topic",
                idea_description: "Start a conversation about a common controversial opinion in your niche.",
                why_it_works: "Engagement bait drives algorithmic reach.",
                suggested_platforms: [Platform.Instagram, Platform.TikTok]
            }
        ];
        if (!response.trend_metadata) response.trend_metadata = {};
        response.trend_metadata.trend_detected = true;
        response.trend_metadata.trend_name = "Niche High Activity";
    }

    // Creator/Editor Fallbacks - only fallback if strictly missing/undefined.
    // If empty string is returned, it means AI failed to generate.
    if (request.mode === Mode.Creator || request.mode === Mode.Editor) {
        if (!response.hook || response.hook.length < 5) response.hook = "Hook generation unavailable. Please refine input context.";
        if (!response.caption || response.caption.length < 5) response.caption = "Caption generation unavailable. Please refine input context.";
    }

    // Score
    if (typeof response.virality_score !== 'number') response.virality_score = 0;

    // Strategies
    if (!response.posting_strategy || !response.posting_strategy.recommended_posting_time_local) {
        response.posting_strategy = {
            ...platformDefaults.posting_strategy,
            ...response.posting_strategy
        };
    }

    if (!response.competitor_insights) {
        response.competitor_insights = platformDefaults.competitor_insights;
    }

    return response as SocialStrategyResponse;
};

export const generateStrategy = async (request: AnalysisRequest): Promise<SocialStrategyResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = getModelName(request);
  const parts: any[] = [];
  
  // Construct Input Fallback to ensure AI always has context
  const effectiveInput = request.contextInput && request.contextInput.trim().length > 0 
    ? request.contextInput 
    : `Generate a high-performing viral post for the ${request.niche} niche.`;

  // Base Prompt
  let promptText = `
    STRICT OUTPUT REQUIREMENT: You must respond with valid JSON only. Do not include markdown formatting or conversational text.
    
    ACTION MODE: ${request.action?.toUpperCase() || 'GENERATE'}
    CURRENT MODE: ${request.mode.toUpperCase()}
    
    MANDATORY FIELD CHECKLIST (DO NOT SKIP):
    - [ ] virality_score (0-100)
    - [ ] posting_strategy (MUST include specific 'recommended_posting_time_local')
    - [ ] competitor_insights
    - [ ] alt_text 
    - [ ] seo_keywords
  `;

  if (request.action === 'audit') {
    promptText += `
    - [ ] critique (Detailed analysis)
    `;
  } else {
    // GENERATE MODE (Creator / Editor / Spy / Trends)
    promptText += `
    - [ ] hook (Strong, psychology-based hook)
    - [ ] caption (Engaging body text)
    `;
  }
  
  // --- SPECIALIZED MODE LOGIC ---

  // 1. TREND HUNTER MODE
  if (request.mode === Mode.TrendHunter) {
    const searchKeywords = request.contextInput || request.niche || "Trending News";
    promptText += `
    - [ ] trend_hunter_ideas (MUST populate this array with 3-5 items)
    
    *** TREND HUNTER MODE ACTIVE ***
    - INPUT KEYWORDS: "${searchKeywords}"
    - NICHE: "${request.niche}"
    - TARGETING: Location: ${request.geoFocus || 'Global'}, Audience: ${request.targetAudience || 'General'}

    - CORE TASK: Act as a Viral News Aggregator. Use 'google_search' to find BREAKING NEWS and HOT TOPICS right now (Current Date).
    - SEARCH STRATEGY: Search for "Latest trending news ${request.niche} ${searchKeywords} ${request.geoFocus || ''}".
    - OUTPUT MAPPING:
      - 'idea_title' -> The Specific News Topic (e.g. "Release of New AI Model")
      - 'idea_description' -> The Context (What happened?)
      - 'why_it_works' -> Virality Factor (Why people care)
    `;
  }

  // 2. COMPETITOR SPY MODE
  else if (request.mode === Mode.CompetitorSpy) {
    promptText += `
    *** COMPETITOR SPY MODE ACTIVE ***
    - CORE TASK: Analyze inputs as COMPETITOR DATA.
    - REQUIRED INSIGHTS (Populate 'competitor_insights' object fully):
      - 'keywords_detected', 'hook_patterns', 'video_style', 'caption_structure', 'competitor_hashtags'
    `;
  }

  // 3. EDITOR MODE
  else if (request.mode === Mode.Editor) {
    promptText += `
    *** EDITOR MODE ACTIVE ***
    - CORE TASK: Refine the user's draft.
    - FIELD 'critique': Explain improvements.
    - FIELD 'hook': Generate a stronger version.
    - FIELD 'caption': Rewrite for maximum engagement.
    `;
  }

  // 4. CREATOR MODE (Implicit)
  else {
      promptText += `
      *** CREATOR MODE ACTIVE ***
      - CORE TASK: Generate new creative content from scratch.
      - FIELD 'hook': Generate a scroll-stopping hook.
      - FIELD 'caption': Write a full engaging caption.
      `;
  }
    
  promptText += `
    Request Parameters:
    Platform: ${request.platform}
    Mode: ${request.mode}
    Niche: ${request.niche}
    User Input: ${effectiveInput}
  `;

  if (request.hookStyle) {
    promptText += `\nSelected Hook Style: ${request.hookStyle}`;
  }

  // --- CRITICAL TARGETING CONTEXT ---
  if (request.targetAudience || request.demographics || request.geoFocus) {
    promptText += `\n\n=== CRITICAL TARGETING INTELLIGENCE ===`;
    if (request.targetAudience) promptText += `\n- Target Audience: ${request.targetAudience}`;
    if (request.demographics) promptText += `\n- Demographics: ${request.demographics}`;
    if (request.geoFocus) promptText += `\n- Geographic Focus: ${request.geoFocus}`;
    promptText += `\n=======================================\n`;
  }

  if (request.brandDNA) {
    promptText += `\nBrand Guidelines: ${request.brandDNA}`;
  }

  // Hashtag Logic
  promptText += `\n\nHashtag Strategy: Mix Broad, Niche, and Community tags suitable for ${request.platform}.`;

  if (request.useLiveTrends || request.mode === Mode.TrendHunter) {
    promptText += `\n- LIVE TREND INJECTION: Use 'google_search' to find current viral topics.`;
  }
  
  // FINAL INSTRUCTION
  promptText += `\n\nFINAL INSTRUCTION: RESPONSE MUST BE A SINGLE VALID JSON OBJECT. NO TEXT BEFORE OR AFTER.`;

  parts.push({ text: promptText });

  request.mediaAssets.forEach(asset => {
    parts.push({
      inlineData: {
        mimeType: asset.mimeType,
        data: asset.data
      }
    });
  });

  if (request.videoFrames.length > 0) {
     parts.push({ text: "Analyze these video keyframes." });
     request.videoFrames.forEach(base64 => {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64
        }
      });
    });
  }

  const tools: any[] = [];
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    responseMimeType: "application/json",
    responseSchema: RESPONSE_SCHEMA
  };

  if (request.useThinking) {
    config.thinkingConfig = { thinkingBudget: modelName === 'gemini-3-pro-preview' ? 32768 : 24576 };
  }

  if (request.useLiveTrends || request.mode === Mode.TrendHunter) {
    tools.push({ googleSearch: {} });
    delete config.responseMimeType;
    delete config.responseSchema;
  }

  if (request.useMaps) {
    tools.push({ googleMaps: {} });
    if (request.location) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: request.location.lat,
                    longitude: request.location.lng
                }
            }
        };
    }
    delete config.responseMimeType;
    delete config.responseSchema;
  }

  if (tools.length > 0) {
    config.tools = tools;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config
    });

    const parsedResponse = extractJSON(response.text);
    return validateAndFillResponse(parsedResponse, request);

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    const platformDefaults = getPlatformDefaults(request.platform);
    
    const fallbackResponse: SocialStrategyResponse = {
        platform: request.platform,
        mode: request.mode,
        primary_goal: request.goal,
        virality_score: 0,
        hook: "Generation unavailable.",
        title: "Strategy Snapshot",
        caption: "We encountered a connection issue. Please try again.",
        alt_text: "Placeholder.",
        seo_keywords: [],
        description: "Generation failed.",
        hashtags: [`#${request.platform}`, "#SocialStrategy"],
        recommended_post_format: "Standard Post",
        recommended_length: { video_seconds: 0, caption_max_characters: 0 },
        posting_strategy: platformDefaults.posting_strategy,
        trend_metadata: { trend_detected: false },
        competitor_insights: platformDefaults.competitor_insights,
        brand_guard: { brand_safe: true, violations_detected: [], notes: "Fallback mode active." },
        sentiment_analysis: { overall_tone: "Neutral", vibe_badge: "System Alert" },
        critique: "Analysis failed.",
        trend_hunter_ideas: [],
        notes: `Error Details: ${error instanceof Error ? error.message : "Unknown API Error"}`
    };
    
    return validateAndFillResponse(fallbackResponse, request);
  }
};
