import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { username, password } = JSON.parse(event.body || '{}');

        // Check against all admins
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
            { username: 'kartikaadmin', password: 'adminkartikaid354', role: 'Super Admin' },
            { username: 'adminkartika', password: 'kartikaempower', role: 'Super Admin' },
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
