/**
 * Dev seed: DESTRUCTIVE – wipes and reseeds all tables.
 * Refuses to run when NODE_ENV === "production".
 */
import "dotenv/config";
import { runSeed } from "./seed-shared";

if (process.env.NODE_ENV === "production") {
  console.error("ERROR: seed:dev must NOT run in production. Use seed:prod instead.");
  process.exit(1);
}

runSeed("dev")
  .then(() => console.log("Dev seed completed."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db");
    await prisma.$disconnect();
  });
