import fs from 'fs';
import https from 'https';
import path from 'path';

const files = [
  { url: 'https://raw.githubusercontent.com/projectcamar/kartikaid-landing/main/src/pages/Admin.css', dest: 'src/pages/Admin.css' },
  { url: 'https://raw.githubusercontent.com/projectcamar/kartikaid-landing/main/src/pages/Blog.css', dest: 'src/pages/Blog.css' },
  { url: 'https://raw.githubusercontent.com/projectcamar/kartikaid-landing/main/src/pages/BlogPost.css', dest: 'src/pages/BlogPost.css' }
];

files.forEach(({ url, dest }) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(path.resolve(dest), data);
      console.log(`Restored ${dest} successfully!`);
    });
  }).on('error', err => {
    console.error(`Error downloading ${dest}:`, err.message);
  });
});
