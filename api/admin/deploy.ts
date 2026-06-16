import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { posts, commitMessage = 'Update blog posts via admin' } = req.body;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO || 'projectcamar/kartikaid-landing';
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

    if (!GITHUB_TOKEN) {
        return res.status(500).json({
            error: 'GitHub token not configured',
            details: 'Please set GITHUB_TOKEN in Vercel environment variables'
        });
    }

    if (!posts || !Array.isArray(posts)) {
        return res.status(400).json({
            error: 'Invalid request',
            details: 'posts array is required'
        });
    }

    try {
        const [owner, repo] = GITHUB_REPO.split('/');
        const filePath = 'src/data/blog.ts';

        // Step 1: Get current file content and SHA
        const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
        const getFileResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Kartika-Admin-Bot'
            }
        });

        if (!getFileResponse.ok) {
            throw new Error(`Failed to fetch file from GitHub: ${getFileResponse.statusText}`);
        }

        const fileData = await getFileResponse.json();
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
        const sha = fileData.sha;

        // Step 2: Generate new content with updated BLOG_POSTS array
        const newPostsJson = JSON.stringify(posts, null, 2);
        const newContent = currentContent.replace(
            /(export const BLOG_POSTS: BlogPost\[\] = )\[[\s\S]*?\](\n\s*\/\/|\n\s*export|\s*$)/,
            `$1${newPostsJson}$2`
        );

        // Check if there are actual changes
        if (newContent === currentContent) {
            return res.status(200).json({
                success: true,
                message: 'No changes detected',
                deployed: false
            });
        }

        // Step 3: Commit and push the updated file
        const updateFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        const updateFileResponse = await fetch(updateFileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Kartika-Admin-Bot'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: Buffer.from(newContent).toString('base64'),
                sha: sha,
                branch: GITHUB_BRANCH
            })
        });

        if (!updateFileResponse.ok) {
            const errorData = await updateFileResponse.json();
            throw new Error(`Failed to update file on GitHub: ${errorData.message || updateFileResponse.statusText}`);
        }

        const updateResult = await updateFileResponse.json();

        return res.status(200).json({
            success: true,
            message: 'Changes committed and pushed successfully. Vercel will auto-deploy.',
            deployed: true,
            commitUrl: updateResult.commit?.html_url
        });
    } catch (error: any) {
        console.error('[AUTO_DEPLOY_ERROR]', error);
        return res.status(500).json({
            error: 'Failed to auto-deploy',
            details: error.message
        });
    }
}
