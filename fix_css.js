const fs = require('fs');
let css = fs.readFileSync('src/pages/Home.css', 'utf8');

const regex = /\.kartika-home \.logo \{\r?\n    max-width: 180px;\r?\n\}\r?\n    max-width: 1200px;\r?\n    margin: 0 auto;\r?\n    padding: 10px 20px;\r?\n    width: 100%;\r?\n    box-sizing: border-box;\r?\n    flex-direction: row;\r?\n\}/;

const replacement = `.kartika-home .logo {
    max-width: 180px;
}

.kartika-home .kartika-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: transparent;
    transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
}

.kartika-home .kartika-header.scrolled {
    background: rgba(45, 27, 0, 0.65);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.22);
}

.kartika-home .header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 20px;
    width: 100%;
    box-sizing: border-box;
    flex-direction: row;
}`;

css = css.replace(regex, replacement);
fs.writeFileSync('src/pages/Home.css', css);
console.log('Fixed Home.css');
