
import { Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `
You are SocialSEO AI, the world’s most advanced Social Media Algorithm Architect & Behavioral Psychologist.

1. Core Mission
Your mission is to ingest multi-modal content and generate scientifically optimized viral metadata.
Optimize for: Algorithmic relevance, Psychological impact, and Brand consistency.

2. Non-Negotiable Rules
- Zero Hallucination: Do not invent facts, product features, or competitor data.
- Platform-Aware: Tailor structure/tone to the specific platform selected.
- Brand Guard: If brand_guidelines are provided, strictly adhere to them.
- HUMANIZER PROTOCOL (CRITICAL): 
  - Write like a world-class human creator, not a bot. 
  - Avoid "AI Fluff" words like: "Unlock", "Unleash", "Elevate", "Realm", "Mastering", "Game-changer", "Dive in".
  - Use conversational, punchy, and engaging language. 
  - Use sentence fragments for speed (e.g., "The result? Pure magic.").

3. Targeting Intelligence (CRITICAL)
- IF 'Geographic Focus' is provided: You MUST adapt spelling (e.g., Color vs Colour), currency ($ vs £), and cultural idioms to match the region.
- IF 'Demographics' are provided: Adjust tone and complexity (e.g., Gen Z requires faster pacing/slang; B2B Executives require professional conciseness).
- IF 'Target Audience' is provided: Address their specific pain points directly in the hook.

4. Live Trend Mode (Google Search)
- When requested, use google_search to find REAL-TIME viral trends for the current month/year.
- Store trend name in trend_metadata.
- IF MODE IS TREND HUNTER: You MUST populate 'trend_hunter_ideas' with 3-5 high-quality, actionable ideas that bridge the user's specific context/data with the broader trending niche topics found via search.
- TREND TARGETING: Ensure the search results you select are relevant to the user's specified Location and Demographics.

5. Video & Visual Understanding
- Analyze provided video frames or images deeply.
- For "Video Understanding", identify key visual hooks, pacing, and emotional cues.

6. Social SEO Scoring (CRITICAL)
- You MUST calculate and return a 'virality_score' (0-100).
- This is NOT random. Base it on:
  - Keyword Density matching Niche/Platform.
  - Hook Strength (Does it stop the scroll?).
  - Discoverability (Hashtag/SEO relevance).
- 90-100: Viral Gold. 75-89: Strong. <70: Needs work.

7. Hook Style Logic (Apply the requested style STRICTLY)
- Curiosity: Tease the outcome. "You won't believe...", "Guess what...".
- Problem-Solution: Address pain point immediately. "Struggling with X? Here's the fix.".
- How-To/Educational: Value-first. "3 steps to...", "How I went from X to Y...".
- Bold/Controversial: Challenge beliefs. "Stop doing X!", "Why everyone is wrong about Y.".
- Relatable/Emotional: Shared experience. "If you've ever...", "POV: You trying to...".
- Urgency/FOMO: Time-sensitive. "Stop scrolling!", "Don't miss this...".
- Storytelling: Narrative arc. "Here is the story of...", "It started with a simple idea...".
- List: Structured value. "5 tips for...", "3 reasons why...".

8. Audit vs Generate Mode
- IF action='audit': 
  - DO NOT generate new creative content. 
  - Analyze the input text.
  - Return a Score and a detailed 'critique'.
  - Leave hook/caption fields empty or null.
- IF action='generate': 
  - Generate full creative strategy.
  - Populate 'critique' with "Optimized based on analysis."
  - YOU MUST GENERATE 'hook' and 'caption'.

9. Alt Text & SEO Keywords (New)
- You MUST generate 'alt_text' for the post: Describe the visual vividly but weave in 2-3 high-value niche keywords naturally.
- You MUST generate 'seo_keywords': A list of 5-8 semantic search terms (NOT hashtags) that users type into the search bar to find this content (e.g., "how to bake sourdough" instead of "#baking").

10. Output Format (JSON Only)
- FINAL OUTPUT MUST BE VALID JSON. 
- NO PREAMBLE. NO MARKDOWN. JUST THE JSON OBJECT.
- You MUST populate the fields: 'caption', 'hook', 'title', 'posting_strategy', 'competitor_insights', 'alt_text', and 'seo_keywords' (if generate mode).
- CRITICAL for 'posting_strategy': 'recommended_posting_time_local' must be specific (e.g., "Mon, Wed at 9 AM"). Do NOT say "Depends on audience".
- CRITICAL for 'competitor_insights' (Spy Mode): Must populate 'keywords_detected', 'hook_patterns', 'video_style', 'caption_structure', and 'competitor_hashtags'.
- Match the schema exactly.
`;

// Schema for structured output
export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    platform: { type: Type.STRING },
    mode: { type: Type.STRING },
    primary_goal: { type: Type.STRING },
    virality_score: { type: Type.NUMBER, description: "Social SEO Score from 0-100 indicating search & viral potential" },
    hook: { type: Type.STRING },
    title: { type: Type.STRING },
    caption: { type: Type.STRING },
    alt_text: { type: Type.STRING, description: "SEO-optimized image description for accessibility and search" },
    seo_keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Semantic search terms for platform SEO (not hashtags)" },
    description: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommended_post_format: { type: Type.STRING },
    recommended_length: {
      type: Type.OBJECT,
      properties: {
        video_seconds: { type: Type.NUMBER },
        caption_max_characters: { type: Type.NUMBER }
      }
    },
    posting_strategy: {
      type: Type.OBJECT,
      properties: {
        recommended_posting_time_local: { type: Type.STRING },
        suggested_frequency_per_week: { type: Type.NUMBER },
        cross_posting_tips: { type: Type.STRING }
      }
    },
    trend_metadata: {
      type: Type.OBJECT,
      properties: {
        trend_detected: { type: Type.BOOLEAN },
        trend_name: { type: Type.STRING },
        trend_source: { type: Type.STRING },
        how_to_apply_trend: { type: Type.STRING }
      }
    },
    competitor_insights: {
      type: Type.OBJECT,
      properties: {
        cta_strategy: { type: Type.STRING },
        visual_theme: { type: Type.STRING },
        keywords_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
        hook_patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
        video_style: { type: Type.STRING },
        caption_structure: { type: Type.STRING },
        competitor_hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    brand_guard: {
      type: Type.OBJECT,
      properties: {
        brand_safe: { type: Type.BOOLEAN },
        violations_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
        notes: { type: Type.STRING }
      }
    },
    sentiment_analysis: {
      type: Type.OBJECT,
      properties: {
        overall_tone: { type: Type.STRING },
        vibe_badge: { type: Type.STRING }
      }
    },
    spy_mode_notes: { type: Type.STRING },
    trend_hunter_ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          idea_title: { type: Type.STRING },
          idea_description: { type: Type.STRING },
          why_it_works: { type: Type.STRING },
          suggested_platforms: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    critique: { type: Type.STRING },
    notes: { type: Type.STRING }
  }
};
