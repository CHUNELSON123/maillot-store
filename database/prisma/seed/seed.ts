import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

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