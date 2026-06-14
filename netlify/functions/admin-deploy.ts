import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { posts, config, admins, source, commitMessage = 'Update via Kartika admin' } = JSON.parse(event.body || '{}');

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO || 'connectkartikaid/kartikaidlanding';
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

    if (!GITHUB_TOKEN) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'GitHub token not configured. Set GITHUB_TOKEN in Netlify environment variables.' })
        };
    }

    try {
        const [owner, repo] = GITHUB_REPO.split('/');
        
        let filePath = 'src/data/kartika-blog.ts';
        if (source === 'landing_page') filePath = 'src/data/landingConfig.ts';
        if (source === 'admin_management') filePath = 'netlify/functions/login.ts';

        // Step 1: Get current file content and SHA
        const getFileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Kartika-Admin-Bot'
                }
            }
        );

        let currentContent = '';
        let sha: string | undefined = undefined;

        if (getFileResponse.ok) {
            const fileData = await getFileResponse.json();
            currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
            sha = fileData.sha;
        } else if (getFileResponse.status !== 404) {
            throw new Error(`Failed to fetch file from GitHub: ${getFileResponse.statusText}`);
        }

        let newContent = currentContent;

        if (source === 'landing_page') {
            const configJson = JSON.stringify(config, null, 2);
            newContent = currentContent.replace(
                /(export const defaultLandingConfig:\s*LandingConfig\s*=\s*)[\s\S]*?(;\n\nexport const getLandingConfig)/,
                `$1${configJson}$2`
            );
        } else if (source === 'admin_management') {
            const adminsJson = JSON.stringify(admins, null, 2);
            newContent = currentContent.replace(
                /(const customAdmins:\s*any\[\]\s*=\s*)[\s\S]*?(;\s*\n\s*const validAdmins)/,
                `$1${adminsJson}$2`
            );
        } else {
            const newPostsJson = JSON.stringify(posts, null, 2);
            newContent = currentContent.replace(
                /(export const KARTIKA_BLOG_POSTS:\s*KartikaBlogPost\[\]\s*=\s*)[\s\S]*?(;\n\n\/\/\s*───\s*Helper functions|\n\nexport function)/,
                `$1${newPostsJson}$2`
            );
        }

        if (newContent === currentContent) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'No changes detected', deployed: false })
            };
        }

        // Step 3: Commit and push the updated file
        const updateFileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
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
                    sha,
                    branch: GITHUB_BRANCH
                })
            }
        );

        if (!updateFileResponse.ok) {
            const errorData = await updateFileResponse.json();
            throw new Error(`Failed to update file on GitHub: ${errorData.message || updateFileResponse.statusText}`);
        }

        const updateResult = await updateFileResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Changes committed to GitHub. Netlify is rebuilding your site!',
                deployed: true,
                commitUrl: updateResult.commit?.html_url
            })
        };
    } catch (error: any) {
        console.error('[DEPLOY_ERROR]', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to deploy', details: error.message })
        };
    }
};

export { handler };
