import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = 'admin@example.com';
  const adminPassword = 'Admin@123';
  const adminUsername = 'superadmin';

  // Create Supabase Auth user
  console.log('Creating Supabase Auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (authError && !authError.message.includes('already been registered')) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  const authUserId = authData?.user?.id;

  if (!authUserId) {
    // Try to get existing user
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existingUser = usersData?.users?.find((u) => u.email === adminEmail);
    if (!existingUser) {
      throw new Error('Could not retrieve or create admin auth user');
    }

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { authUserId: existingUser.id },
      update: { role: Role.ADMIN, isActive: true },
      create: {
        authUserId: existingUser.id,
        email: adminEmail,
        username: adminUsername,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log('✅ Admin profile upserted:', profile.email);
  } else {
    // Create profile
    const profile = await prisma.profile.upsert({
      where: { authUserId },
      update: { role: Role.ADMIN, isActive: true },
      create: {
        authUserId,
        email: adminEmail,
        username: adminUsername,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log('✅ Admin profile created:', profile.email);
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Admin credentials:');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  Username: ${adminUsername}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
