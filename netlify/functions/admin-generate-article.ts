import type { Handler } from '@netlify/functions';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert content writer for Kartika.id, a platform that inspires and connects people through programs, education, and community.

Your task is to generate high-quality, SEO-optimized blog articles about personal development, programs, and community topics.

IMPORTANT: You MUST respond with ONLY a valid JSON object, no additional text before or after. The JSON must follow this exact structure:

{
  "title": "Article title (max 60 characters, SEO-friendly)",
  "slug": "url-friendly-slug-lowercase-with-hyphens",
  "excerpt": "Brief summary (max 160 characters for meta description)",
  "category": "One of: Tips and Trick, Program, Community, Inspiration, Education, News",
  "imageSearchQuery": "A relevant English keyword for Unsplash image search (main cover)",
  "introduction": "Engaging opening paragraph (2-3 sentences)",
  "keyPoints": [
    "Key takeaway 1",
    "Key takeaway 2",
    "Key takeaway 3 (max 5 points)"
  ],
  "language": "Language code (id or en)",
  "sections": [
    {
      "heading": "Section 1 heading",
      "content": "Section 1 content",
      "imageSearchQuery": "Specific English search query ONLY for Section 1"
    },
    {
      "heading": "Section 2 heading",
      "content": "Section 2 content"
    }
  ],
  "conclusion": "Compelling closing paragraph"
}

LANGUAGE SUPPORT:
- id: Indonesian (Bahasa Indonesia)
- en: English

CONTENT GUIDELINES:
- Use professional yet friendly tone
- Provide practical tips and actionable advice
- Use HTML tags for formatting: <strong>, <em>, <br>
- Create 3-5 sections minimum
- Each section should be substantial (150-300 words)

Remember: Output ONLY the JSON object, nothing else.`;

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
        const { prompt, category, model = 'llama-3.3-70b-versatile', language } = JSON.parse(event.body || '{}');

        if (!prompt?.trim()) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is required' }) };
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

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };
        if (isOpenRouter) {
            headers['HTTP-Referer'] = 'https://kartika.id';
            headers['X-Title'] = 'Kartika Blog Generator';
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: `Generate a blog article about: ${prompt}${category ? `\nPreferred category: ${category}` : ''}${language ? `\nTARGET LANGUAGE: ${language} (MUST USE THIS LANGUAGE)` : ''}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000,
                ...(isOpenRouter ? {} : { response_format: { type: 'json_object' } })
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            return { statusCode: response.status, body: JSON.stringify({ error: 'AI generation failed', details: errorData }) };
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;
        if (!aiResponse) {
            return { statusCode: 500, body: JSON.stringify({ error: 'No response from AI' }) };
        }

        let articleContent: any;
        try {
            articleContent = JSON.parse(aiResponse);
        } catch {
            return { statusCode: 500, body: JSON.stringify({ error: 'Invalid AI response format', rawResponse: aiResponse }) };
        }

        if (!articleContent.title || !articleContent.slug || !articleContent.introduction) {
            return { statusCode: 500, body: JSON.stringify({ error: 'AI response missing required fields' }) };
        }

        // Fetch cover image
        if (articleContent.imageSearchQuery) {
            const imageUrl = await fetchUnsplashImage(articleContent.imageSearchQuery);
            if (imageUrl) articleContent.image = imageUrl;
        }

        // Fetch Section 1 image only
        if (articleContent.sections?.length > 0) {
            const section1 = articleContent.sections[0];
            if (section1?.imageSearchQuery) {
                const sectionImageUrl = await fetchUnsplashImage(section1.imageSearchQuery);
                if (sectionImageUrl) {
                    section1.image = sectionImageUrl;
                    section1.imageAlt = section1.imageSearchQuery;
                }
            }
            for (let i = 1; i < articleContent.sections.length; i++) {
                delete articleContent.sections[i].imageSearchQuery;
                delete articleContent.sections[i].image;
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, article: articleContent })
        };

    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};

export { handler };
