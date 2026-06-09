import { PrismaClient, AdminRole, BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const business = await prisma.business.upsert({
    where: { slug: 'lanka-futsal' },
    update: {},
    create: {
      name: 'Lanka Futsal Hub',
      slug: 'lanka-futsal',
      description: 'Premium futsal & sports facilities across Sri Lanka',
      primaryColor: '#16a34a',
      accentColor: '#15803d',
      phone: '+94 11 234 5678',
      email: 'info@lankafutsal.lk',
      city: 'Colombo',
      country: 'Sri Lanka',
      currency: 'LKR',
    },
  });

  const branch1 = await prisma.branch.upsert({
    where: { id: 'branch-colombo-1' },
    update: {},
    create: {
      id: 'branch-colombo-1',
      businessId: business.id,
      name: 'Colombo - Wellawatte',
      address: '45 Galle Road, Wellawatte',
      city: 'Colombo',
      phone: '+94 11 234 5678',
      email: 'wellawatte@lankafutsal.lk',
      openTime: '06:00',
      closeTime: '23:00',
      slotDuration: 60,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { id: 'branch-kandy-1' },
    update: {},
    create: {
      id: 'branch-kandy-1',
      businessId: business.id,
      name: 'Kandy - Peradeniya',
      address: '12 Peradeniya Road, Kandy',
      city: 'Kandy',
      phone: '+94 81 234 5678',
      email: 'kandy@lankafutsal.lk',
      openTime: '06:00',
      closeTime: '22:00',
      slotDuration: 60,
    },
  });

  const football = await prisma.sport.upsert({
    where: { id: 'sport-football' },
    update: {},
    create: {
      id: 'sport-football',
      name: 'Football / Futsal',
      icon: 'football',
      description: 'Indoor futsal and 5-a-side football courts',
      color: '#16a34a',
    },
  });

  const cricket = await prisma.sport.upsert({
    where: { id: 'sport-cricket' },
    update: {},
    create: {
      id: 'sport-cricket',
      name: 'Cricket Nets',
      icon: 'cricket',
      description: 'Professional cricket practice nets',
      color: '#2563eb',
    },
  });

  const badminton = await prisma.sport.upsert({
    where: { id: 'sport-badminton' },
    update: {},
    create: {
      id: 'sport-badminton',
      name: 'Badminton',
      icon: 'badminton',
      description: 'Indoor badminton courts',
      color: '#d97706',
    },
  });

  await prisma.court.upsert({
    where: { id: 'court-fb-1' },
    update: {},
    create: {
      id: 'court-fb-1',
      branchId: branch1.id,
      sports: { connect: [{ id: football.id }] },
      name: 'Futsal Court A',
      description: 'Astroturf 5-a-side football court with floodlights',
      pricePerHour: 3500,
      minDuration: 60,
      maxDuration: 120,
    },
  });

  await prisma.court.upsert({
    where: { id: 'court-fb-2' },
    update: {},
    create: {
      id: 'court-fb-2',
      branchId: branch1.id,
      sports: { connect: [{ id: football.id }] },
      name: 'Futsal Court B',
      description: 'Premium synthetic turf court',
      pricePerHour: 4000,
      minDuration: 60,
      maxDuration: 120,
    },
  });

  await prisma.court.upsert({
    where: { id: 'court-cr-1' },
    update: {},
    create: {
      id: 'court-cr-1',
      branchId: branch1.id,
      sports: { connect: [{ id: cricket.id }] },
      name: 'Cricket Net 1',
      description: 'Professional indoor cricket practice net',
      pricePerHour: 2000,
      minDuration: 60,
      maxDuration: 60,
    },
  });

  await prisma.court.upsert({
    where: { id: 'court-bd-1' },
    update: {},
    create: {
      id: 'court-bd-1',
      branchId: branch1.id,
      sports: { connect: [{ id: badminton.id }] },
      name: 'Badminton Court 1',
      description: 'Standard badminton court with wooden flooring',
      pricePerHour: 1500,
      minDuration: 60,
      maxDuration: 120,
    },
  });

  await prisma.court.upsert({
    where: { id: 'court-kandy-fb-1' },
    update: {},
    create: {
      id: 'court-kandy-fb-1',
      branchId: branch2.id,
      sports: { connect: [{ id: football.id }] },
      name: 'Kandy Futsal Court',
      description: 'Indoor futsal court with premium astroturf',
      pricePerHour: 3000,
      minDuration: 60,
      maxDuration: 120,
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.admin.upsert({
    where: { email: 'admin@lankafutsal.lk' },
    update: {},
    create: {
      businessId: business.id,
      name: 'Super Admin',
      email: 'admin@lankafutsal.lk',
      password: hashedPassword,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  await prisma.admin.upsert({
    where: { email: 'manager@lankafutsal.lk' },
    update: {},
    create: {
      businessId: business.id,
      name: 'Branch Manager',
      email: 'manager@lankafutsal.lk',
      password: hashedPassword,
      role: AdminRole.ADMIN,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('📧 Admin login: admin@lankafutsal.lk / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
