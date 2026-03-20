import axios from 'axios';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

/**
 * Tries the Gemini API directly, then falls back to OpenRouter.
 */
export const getBestMove = async (fen) => {
  console.log('[AI] Requesting best move for FEN:', fen);

  // First attempt: Gemini API
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    console.log('[AI] Attempting direct Gemini API call...');
    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a chess grandmaster. Respond ONLY with the best move in UCI format (e.g., e2e4) for this FEN: ${fen}`,
                },
              ],
            },
          ],
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const move = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (move) {
        console.log('[AI] Gemini success! Move:', move);
        return move;
      }
    } catch (error) {
      console.warn('[AI] Gemini API failed:', error.response?.data || error.message);
    }
  }

  // Second attempt: OpenRouter
  if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') {
    console.log('[AI] Attempting OpenRouter fallback...');
    try {
      const openRouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-pro-1.5',
          messages: [
            {
              role: 'system',
              content: 'You are a chess grandmaster. Respond ONLY with the best move in UCI format.',
            },
            {
              role: 'user',
              content: `FEN: ${fen}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const move = openRouterResponse.data.choices[0].message.content.trim();
      console.log('[AI] OpenRouter success! Move:', move);
      return move;
    } catch (error) {
      console.error('[AI] OpenRouter failed:', error.response?.data || error.message);
    }
  }

  console.error('[AI] All AI attempts failed. Check your API keys.');
  return null;
};
