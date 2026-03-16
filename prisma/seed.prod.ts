/**
 * Prod seed: NON-DESTRUCTIVE – upserts baseline content only.
 * NEVER deletes attempts, states, or any user learning history.
 * Safe to run on Vercel Preview and Production for first-time bootstrap.
 */
import "dotenv/config";
import { runSeed } from "./seed-shared";

runSeed("prod")
  .then(() => console.log("Prod seed completed (baseline content upserted)."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db");
    await prisma.$disconnect();
  });
