import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { username, password } = JSON.parse(event.body || '{}');

        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!ADMIN_PASSWORD) {
            console.error('[AUTH] ADMIN_PASSWORD environment variable is not set!');
            return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
        }

        // Check against all admins stored in env, or fallback to single admin check
        // The primary admin is kartikaadmin; other admins are managed via Admin Dashboard
        const customAdmins: any[] = [
  {
    "id": "1781433996714",
    "username": "ugi",
    "password": "ugi354",
    "role": "Super Admin"
  }
];
        
        const validAdmins = [
            { username: 'kartikaadmin', password: ADMIN_PASSWORD, role: 'Super Admin' },
            ...customAdmins
        ];

        const admin = validAdmins.find(a => a.username === username && a.password === password);

        if (admin) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    token: 'kartika_admin_session_' + Date.now(),
                    user: { username: admin.username, role: admin.role }
                })
            };
        }

        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid username or password' }) };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server error', message: error.message }) };
    }
};

export { handler };
