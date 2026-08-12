import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });


async function main() {
  // Roles
  const roles = [
    "Administrator",
    "Staff",
    "Customer",
    "Influencer",
  ];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

    // Development Administrator
  const administratorRole = await prisma.role.findUnique({
    where: { name: "Administrator" },
  });

  if (!administratorRole) {
    throw new Error("Administrator role not found");
  }

  const passwordHash = await bcrypt.hash("Admin12345", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@maillot-store.com",
    },
    update: {
      password: passwordHash,
      role_id: administratorRole.id,
    },
    create: {
      email: "admin@maillot-store.com",
      password: passwordHash,
      role_id: administratorRole.id,
    },
  });

  // Payment methods
  const paymentMethods = [
    "MTN Mobile Money",
    "Orange Money",
    "Cash Before Delivery",
  ];

  for (const name of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: { is_active: true },
      create: {
        name,
        is_active: true,
      },
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });