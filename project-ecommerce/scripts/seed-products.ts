import fetch from 'node-fetch';
import { DataSource } from 'typeorm';
import { Product } from '../src/entity/Product';
import { Category } from '../src/entity/Category';

const ds = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root@123',
  database: 'ecommerce',
  entities: [Product, Category],
  synchronize: false,
});

async function main() {
  await ds.initialize();

  // garante categorias básicas
  const catRepo = ds.getRepository(Category);
  const prodRepo = ds.getRepository(Product);

  const categories = ['electronics','jewelery','men\'s clothing','women\'s clothing'];
  const catMap = new Map<string, Category>();
  for (const name of categories) {
    let c = await catRepo.findOne({ where: { name } });
    if (!c) c = await catRepo.save(catRepo.create({ name }));
    catMap.set(name, c);
  }

  const resp = await fetch('https://fakestoreapi.com/products');
  const items: any[] = await resp.json();

  for (const it of items) {
    const cat = catMap.get(it.category) ?? Array.from(catMap.values())[0];
    const p = prodRepo.create({
      name: it.title,
      description: it.description,
      price: String(it.price),
      stock: Math.floor(Math.random()*100)+1,
      active: true,
      imageUrl: it.image,
      category: cat,
    });
    await prodRepo.save(p);
  }

  await ds.destroy();
  console.log('Seed pronto!');
}

main().catch(console.error);