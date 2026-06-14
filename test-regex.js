const fs = require('fs');

const content = `import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
    // ...
        const customAdmins: any[] = [
  {
    "id": "1781433347234",
    "username": "ugifitri",
    "password": "ugifitri123",
    "role": "Super Admin"
  }
];
        
        const validAdmins = [
            { username: 'kartikaadmin', password: ADMIN_PASSWORD, role: 'Super Admin' },
            ...customAdmins
        ];
`;

const adminsJson = JSON.stringify([{ "id": "123", "username": "ugi", "password": "ugi", "role": "Super Admin" }], null, 2);

const newContent = content.replace(
    /(const customAdmins:\s*any\[\]\s*=\s*)[\s\S]*?(;\s*\n\s*const validAdmins)/,
    `$1${adminsJson}$2`
);

console.log(newContent === content ? "NO MATCH" : "MATCHED");
console.log(newContent);
