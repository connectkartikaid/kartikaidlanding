import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    const ADMIN_USERNAME = 'rioanggara';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
        console.error('[AUTH] ADMIN_PASSWORD environment variable is not set!');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // In a real app, we would generate a JWT here. 
        // For this simple implementation, we'll return a success flag and a simple mock token.
        return res.status(200).json({
            success: true,
            token: 'kartika-admin-token-' + Date.now(),
            user: { username: ADMIN_USERNAME }
        });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
}
