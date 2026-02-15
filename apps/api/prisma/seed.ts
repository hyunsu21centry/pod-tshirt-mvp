import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin1234', 10);
  const producerPassword = await bcrypt.hash('producer1234', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', passwordHash: adminPassword, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'producer@example.com' },
    update: {},
    create: { email: 'producer@example.com', passwordHash: producerPassword, role: 'PRODUCER' },
  });

  const designs = [
    { name: 'Tiger Street', imageUrl: '/storage/designs/tiger.jpg', printFileUrl: '/storage/designs/tiger-print.png' },
    { name: 'Neon Wave', imageUrl: '/storage/designs/neon.jpg', printFileUrl: '/storage/designs/neon-print.png' },
    { name: 'Minimal Sun', imageUrl: '/storage/designs/sun.jpg', printFileUrl: '/storage/designs/sun-print.png' },
  ];

  for (const d of designs) {
    await prisma.design.create({ data: d });
  }

  const classic = await prisma.productBase.create({ data: { name: 'Classic Tee', basePrice: 19.99 } });
  const oversize = await prisma.productBase.create({ data: { name: 'Oversize Tee', basePrice: 24.99 } });

  const colors = ['White', 'Black'];
  const sizes = ['S', 'M', 'L', 'XL'];

  for (const product of [classic, oversize]) {
    for (const color of colors) {
      for (const size of sizes) {
        await prisma.variant.create({
          data: {
            productBaseId: product.id,
            color,
            size,
            priceDelta: size === 'XL' ? 2 : 0,
            sku: `${product.name.substring(0, 3).toUpperCase()}-${color[0]}-${size}`,
          },
        });
      }
    }
  }
}

main().finally(async () => prisma.$disconnect());
