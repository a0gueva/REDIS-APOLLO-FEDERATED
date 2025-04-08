const fs = require('fs');
const Redis = require('ioredis');
const redis = new Redis({ host: 'redis' });

async function warmFromJsonFile() {
  const rawData = fs.readFileSync('./products.json', 'utf-8');
  const products = JSON.parse(rawData);

  const pipeline = redis.pipeline();

  for (const product of products) {
    const { id, price, inventory, ...baseFields } = product;
    const base = { id, ...baseFields }

    pipeline.call('JSON.SET', `product:${id}`, '$', JSON.stringify(base));
    pipeline.call('JSON.SET', `price:${id}`, '$', JSON.stringify(price));
    pipeline.call('JSON.SET', `inventory:${id}`, '$', JSON.stringify(inventory));
  }

  await pipeline.exec();
  console.log('✅ Redis warmed from JSON file');
  process.exit(0);
}

warmFromJsonFile().catch(console.error);
