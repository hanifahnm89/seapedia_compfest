import { PrismaClient, Role, DeliveryMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding SEAPEDIA...')

  const hash = (p: string) => bcrypt.hash(p, 12)

  // ── ADMIN ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@seapedia.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@seapedia.com',
      password: await hash('admin123'),
      name: 'Super Admin',
      roles: [Role.ADMIN],
    },
  })
  console.log('Admin:', admin.email)

  // ── SELLER ─────────────────────────────────────────────
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@seapedia.com' },
    update: {},
    create: {
      username: 'toko_budi',
      email: 'seller@seapedia.com',
      password: await hash('seller123'),
      name: 'Budi Santoso',
      roles: [Role.SELLER, Role.BUYER],
    },
  })

  const store = await prisma.store.upsert({
    where: { sellerId: sellerUser.id },
    update: {},
    create: {
      sellerId: sellerUser.id,
      name: 'Toko Elektronik Budi',
      description: 'Elektronik berkualitas, harga terjangkau!',
    },
  })

  // Buyer profile for seller (since seller also has BUYER role)
  const sellerBuyer = await prisma.buyerProfile.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: { userId: sellerUser.id, balance: 500000 },
  })
  await prisma.cart.upsert({
    where: { buyerId: sellerBuyer.id },
    update: {},
    create: { buyerId: sellerBuyer.id },
  })

  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod_headphone_001' },
      update: {},
      create: {
        id: 'prod_headphone_001',
        storeId: store.id,
        name: 'Headphone Wireless Pro X200',
        description: 'Headphone premium dengan noise cancelling, baterai 30 jam.',
        price: 450000,
        stock: 50,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_charger_002' },
      update: {},
      create: {
        id: 'prod_charger_002',
        storeId: store.id,
        name: 'Charger GaN 65W USB-C',
        description: 'Fast charging untuk laptop, tablet, dan HP.',
        price: 185000,
        stock: 100,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_keyboard_003' },
      update: {},
      create: {
        id: 'prod_keyboard_003',
        storeId: store.id,
        name: 'Keyboard Mechanical TKL RGB',
        description: 'Switch Blue, RGB backlight, anti-ghosting 100%.',
        price: 320000,
        stock: 30,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_mouse_004' },
      update: {},
      create: {
        id: 'prod_mouse_004',
        storeId: store.id,
        name: 'Mouse Gaming 16000 DPI',
        description: 'Sensor presisi tinggi, desain ergonomis, 7 tombol.',
        price: 275000,
        stock: 45,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_kabel_005' },
      update: {},
      create: {
        id: 'prod_kabel_005',
        storeId: store.id,
        name: 'Kabel Data USB-C 3m Braided',
        description: 'Kabel kuat, transfer 480Mbps, fast charging 60W.',
        price: 65000,
        stock: 200,
      },
    }),
  ])
  console.log('Seller:', sellerUser.email, '| Store:', store.name, '| Products:', products.length)

  // ── BUYER ──────────────────────────────────────────────
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@seapedia.com' },
    update: {},
    create: {
      username: 'siti_buyer',
      email: 'buyer@seapedia.com',
      password: await hash('buyer123'),
      name: 'Siti Rahayu',
      phone: '08123456789',
      roles: [Role.BUYER],
    },
  })
  const buyer = await prisma.buyerProfile.upsert({
    where: { userId: buyerUser.id },
    update: {},
    create: { userId: buyerUser.id, balance: 2000000 },
  })
  await prisma.cart.upsert({
    where: { buyerId: buyer.id },
    update: {},
    create: { buyerId: buyer.id },
  })
  await prisma.address.upsert({
    where: { id: 'addr_siti_001' },
    update: {},
    create: {
      id: 'addr_siti_001',
      buyerId: buyer.id,
      label: 'Rumah',
      street: 'Jl. Soekarno Hatta No. 10',
      city: 'Malang',
      province: 'Jawa Timur',
      zipCode: '65141',
      isDefault: true,
    },
  })
  console.log('Buyer:', buyerUser.email, '| Balance: Rp', buyer.balance.toLocaleString('id-ID'))

  // ── DRIVER ─────────────────────────────────────────────
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@seapedia.com' },
    update: {},
    create: {
      username: 'pak_driver',
      email: 'driver@seapedia.com',
      password: await hash('driver123'),
      name: 'Ahmad Supir',
      phone: '08567891234',
      roles: [Role.DRIVER],
    },
  })
  await prisma.driverProfile.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: { userId: driverUser.id, balance: 150000 },
  })
  console.log('Driver:', driverUser.email)

  // ── MULTI-ROLE USER ────────────────────────────────────
  const multiUser = await prisma.user.upsert({
    where: { email: 'multi@seapedia.com' },
    update: {},
    create: {
      username: 'multi_role',
      email: 'multi@seapedia.com',
      password: await hash('multi123'),
      name: 'Dewi Multi',
      roles: [Role.BUYER, Role.SELLER, Role.DRIVER],
    },
  })
  const multiBuyer = await prisma.buyerProfile.upsert({
    where: { userId: multiUser.id },
    update: {},
    create: { userId: multiUser.id, balance: 1000000 },
  })
  await prisma.cart.upsert({
    where: { buyerId: multiBuyer.id },
    update: {},
    create: { buyerId: multiBuyer.id },
  })
  await prisma.driverProfile.upsert({
    where: { userId: multiUser.id },
    update: {},
    create: { userId: multiUser.id },
  })
  console.log('Multi-role user:', multiUser.email)

  // ── VOUCHERS ───────────────────────────────────────────
  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 1)

  await prisma.voucher.upsert({
    where: { code: 'SEAPEDIA10' },
    update: {},
    create: {
      code: 'SEAPEDIA10',
      description: 'Diskon 10% untuk semua produk',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 100000,
      maxDiscount: 50000,
      expiresAt: futureDate,
      usageLimit: 100,
    },
  })
  await prisma.voucher.upsert({
    where: { code: 'HEMAT50K' },
    update: {},
    create: {
      code: 'HEMAT50K',
      description: 'Potongan Rp 50.000',
      discountType: 'FIXED',
      discountValue: 50000,
      minPurchase: 200000,
      expiresAt: futureDate,
      usageLimit: 50,
    },
  })
  await prisma.promo.upsert({
    where: { code: 'PROMO20' },
    update: {},
    create: {
      code: 'PROMO20',
      description: 'Promo Spesial 20% off',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minPurchase: 150000,
      maxDiscount: 100000,
      expiresAt: futureDate,
    },
  })
  console.log('Vouchers & Promos seeded')

  // ── SAMPLE REVIEWS ─────────────────────────────────────
  const reviewsData = [
    { name: 'Andi', rating: 5, comment: 'Aplikasi keren banget! Mudah digunakan dan cepat.' },
    { name: 'Bela', rating: 4, comment: 'Produknya lengkap, pengiriman juga cepat. Recommended!' },
    { name: 'Candra', rating: 5, comment: 'SEAPEDIA terbaik! Suka dengan fitur multi-role-nya.' },
    { name: 'Diana', rating: 4, comment: 'UI bagus dan intuitif. Pengalaman belanja menyenangkan.' },
  ]
  for (const r of reviewsData) {
    await prisma.review.create({ data: r }).catch(() => {})
  }
  console.log('Sample reviews seeded')

  console.log('\n Seed selesai!')
  console.log('─────────────────────────────────────')
  console.log('Demo Accounts:')
  console.log('  Admin  → admin@seapedia.com       / admin123')
  console.log('  Seller → seller@seapedia.com      / seller123')
  console.log('  Buyer  → buyer@seapedia.com       / buyer123')
  console.log('  Driver → driver@seapedia.com      / driver123')
  console.log('  Multi  → multi@seapedia.com       / multi123')
  console.log('─────────────────────────────────────')
  console.log('Discount Codes: SEAPEDIA10 | HEMAT50K | PROMO20')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())