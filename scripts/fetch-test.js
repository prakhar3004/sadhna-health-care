const https = require('https');

const urls = [
  'https://sadhna-health-care.vercel.app/',
  'https://health-mu-mauve.vercel.app/',
  'https://health-ajh62aauj-thinkprakhar1998-9758s-projects.vercel.app/'
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const scripts = data.match(/<script[^>]+src="([^"]+)"/g) || [];
        resolve({
          url,
          status: res.statusCode,
          vercelId: res.headers['x-vercel-id'],
          scripts
        });
      });
    });
  });
}

async function run() {
  for (const url of urls) {
    const res = await fetchUrl(url);
    console.log('-----------------------------');
    console.log('URL:', res.url);
    console.log('Status:', res.status);
    console.log('Vercel ID:', res.vercelId);
    console.log('Scripts found:', res.scripts);
  }
}

run();
