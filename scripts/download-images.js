const fs = require('fs');
const path = require('path');
const https = require('https');

const productsDir = path.join(__dirname, '../public/images/products');
const categoriesDir = path.join(__dirname, '../public/images/categories');

fs.mkdirSync(productsDir, { recursive: true });
fs.mkdirSync(categoriesDir, { recursive: true });

const images = [
  { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'iphone-16-pro.jpg') },
  { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'macbook-air-m3.jpg') },
  { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'sony-wh1000xm5.jpg') },
  { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'galaxy-buds3.jpg') },
  { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'apple-watch-s10.jpg') },
  { url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'playstation-5.jpg') },
  { url: 'https://images.unsplash.com/photo-1609592424074-672ef1240a1b?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'anker-power-bank.jpg') },
  { url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'logitech-mx-master-3s.jpg') },
  { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'galaxy-s25.jpg') },
  { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'dell-monitor.jpg') },
  { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'sony-camera.jpg') },
  { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', dest: path.join(productsDir, 'keychron-keyboard.jpg') },

  // Categories
  { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', dest: path.join(categoriesDir, 'smartphones.jpg') },
  { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80', dest: path.join(categoriesDir, 'laptops.jpg') },
  { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', dest: path.join(categoriesDir, 'headphones.jpg') },
  { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80', dest: path.join(categoriesDir, 'smartwatches.jpg') },
  { url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80', dest: path.join(categoriesDir, 'accessories.jpg') },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  console.log('Downloading images locally into public/ directory...');
  for (const img of images) {
    try {
      await download(img.url, img.dest);
      console.log('Downloaded:', path.basename(img.dest));
    } catch (err) {
      console.error('Failed to download:', img.url, err);
    }
  }
  console.log('Finished downloading all images to public/images/');
}

main();
