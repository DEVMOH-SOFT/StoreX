const fs = require('fs');
const path = require('path');
const https = require('https');

const dest = path.join(__dirname, '../public/images/products/anker-power-bank.jpg');

const urls = [
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1609592424074-672ef1240a1b?w=800&auto=format&fit=crop&q=80'
];

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, filePath).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

async function run() {
  for (const u of urls) {
    try {
      await download(u, dest);
      const stat = fs.statSync(dest);
      if (stat.size > 1000) {
        console.log('Successfully downloaded Anker Power Bank image! Size:', stat.size);
        break;
      }
    } catch (e) {
      console.error(e);
    }
  }
}

run();
