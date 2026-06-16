import type { VercelRequest, VercelResponse } from '@vercel/node';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerateArticleRequest {
    prompt: string;
    category?: string;
    model?: string; // Model ID from dropdown
    language?: string; // Requested language
}

interface ArticleContent {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    introduction: string;
    keyPoints?: string[];
    language?: string; // AI confirmed language
    imageSearchQuery: string; // Search query for Unsplash
    image?: string; // Final Unsplash image URL
    sections: Array<{
        heading: string;
        content: string;
        imageSearchQuery?: string; // Only for Section 1
        image?: string; // Only for Section 1
        linkedProductId?: number; // Product ID (1-17) to mention
    }>;
    conclusion: string;
}

const SYSTEM_PROMPT = `You are an expert content writer for Kartika.id, an empowering platform dedicated to women's empowerment, education, self-improvement, and building a supportive community.

Your task is to generate high-quality, SEO-optimized, and deeply inspiring blog articles focusing on women's empowerment, career growth, mental well-being, community building, and personal development.

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
- Use an empowering, empathetic, and highly professional tone
- Focus heavily on women's empowerment, breaking boundaries, career tips, education, and mental health
- Provide practical tips and actionable advice for modern women
- Mention Kartika.id naturally as a supportive community or program
- Use HTML tags for formatting: <strong>, <em>, <br>
- Create 3-5 sections minimum
- Each section should be substantial (150-300 words)

Remember: Output ONLY the JSON object, nothing else.`;;

/**
 * Fetch a relevant image from Unsplash
 */
async function fetchUnsplashImage(query: string): Promise<string | null> {
    if (!UNSPLASH_ACCESS_KEY) return null;

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.results?.[0]?.urls?.regular || null;
    } catch (error) {
        console.error('Unsplash fetch error:', error);
        return null;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, category, model = 'llama-3.3-70b-versatile', language }: GenerateArticleRequest = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Determine which API to use based on model
        const isOpenRouter = model.includes('/');
        const apiUrl = isOpenRouter ? OPENROUTER_API_URL : GROQ_API_URL;
        const apiKey = isOpenRouter ? OPENROUTER_API_KEY : GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: `API key not configured for ${isOpenRouter ? 'OpenRouter' : 'Groq'}`
            });
        }

        // Prepare headers
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        // Add OpenRouter-specific headers
        if (isOpenRouter) {
            headers['HTTP-Referer'] = 'https://kartika.id';
            headers['X-Title'] = 'Kartika Blog Generator';
        }

        // Call AI API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
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
            console.error('AI API error:', errorData);
            return res.status(response.status).json({
                error: 'AI generation failed',
                details: errorData
            });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;

        if (!aiResponse) {
            return res.status(500).json({ error: 'No response from AI' });
        }

        // Parse AI response
        let articleContent: ArticleContent;
        try {
            articleContent = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse);
            return res.status(500).json({
                error: 'Invalid AI response format',
                rawResponse: aiResponse
            });
        }

        // Validate required fields
        if (!articleContent.title || !articleContent.slug || !articleContent.introduction) {
            return res.status(500).json({
                error: 'AI response missing required fields',
                received: articleContent
            });
        }

        // Fetch image from Unsplash if search query is provided for cover
        if (articleContent.imageSearchQuery) {
            const imageUrl = await fetchUnsplashImage(articleContent.imageSearchQuery);
            if (imageUrl) {
                articleContent.image = imageUrl;
            }
        }

        // Fetch images for each section if search query is provided
        if (articleContent.sections && articleContent.sections.length > 0) {
            // ONLY Section 1 gets an image search as per requirement
            const section1 = articleContent.sections[0];
            if (section1 && section1.imageSearchQuery) {
                const sectionImageUrl = await fetchUnsplashImage(section1.imageSearchQuery);
                if (sectionImageUrl) {
                    section1.image = sectionImageUrl;
                    (section1 as any).imageAlt = section1.imageSearchQuery;
                }
            }

            // Ensure other sections don't have images (Section 2 is empty, others use productId)
            for (let i = 1; i < articleContent.sections.length; i++) {
                delete articleContent.sections[i].imageSearchQuery;
                delete articleContent.sections[i].image;
            }
        }

        return res.status(200).json({
            success: true,
            article: articleContent
        });

    } catch (error) {
        console.error('Generate article error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
