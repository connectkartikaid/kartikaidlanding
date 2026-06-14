import type { Handler } from '@netlify/functions';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function fetchUnsplashImage(query: string): Promise<string | null> {
    if (!UNSPLASH_ACCESS_KEY) return null;
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
            { headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.results?.[0]?.urls?.regular || null;
    } catch {
        return null;
    }
}

const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { title, excerpt, model = 'llama-3.3-70b-versatile', context = 'main cover image' } = JSON.parse(event.body || '{}');

        if (!title) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Title/Heading is required' }) };
        }

        const isOpenRouter = model.includes('/');
        const apiUrl = isOpenRouter ? OPENROUTER_API_URL : GROQ_API_URL;
        const apiKey = isOpenRouter ? OPENROUTER_API_KEY : GROQ_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `API key not configured for ${isOpenRouter ? 'OpenRouter' : 'Groq'}` })
            };
        }

        const aiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at choosing the perfect image search query for blog posts. Respond with ONLY the search query in English. Tends toward specific, high-quality photography terms related to women empowerment, diverse women, female professionals, education, and community support. No quotes, no preamble.'
                    },
                    {
                        role: 'user',
                        content: `Context: ${context}\nArticle/Section Heading: ${title}\nContent Snippet: ${excerpt || ''}\n\nProvide a specific English search query for Unsplash (e.g. "diverse women collaborating", "female leader office", "women studying together"). Ensure the query is relevant to the specific context provided.`
                    }
                ],
                temperature: 0.5,
                max_tokens: 50
            }),
        });

        if (!aiResponse.ok) {
            throw new Error('AI query generation failed');
        }

        const aiData = await aiResponse.json();
        const searchQuery = aiData.choices[0]?.message?.content?.trim().replace(/^"|"$/g, '') || title;

        const imageUrl = await fetchUnsplashImage(searchQuery);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, image: imageUrl, searchQuery })
        };

    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};

export { handler };
