const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run() {
  const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
  if (!fs.existsSync(schemaPath)) {
    console.error("schema.prisma not found at", schemaPath);
    process.exit(1);
  }

  let schema = fs.readFileSync(schemaPath, "utf-8");
  const dbUrl = process.env.DATABASE_URL || "";

  const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
  const targetProvider = isPostgres ? "postgresql" : "sqlite";

  const currentMatch = schema.match(/provider\s*=\s*"(sqlite|postgresql)"/);
  const currentProvider = currentMatch ? currentMatch[1] : "sqlite";

  if (currentProvider !== targetProvider) {
    console.log(`[prepare-db] Switching Prisma provider from ${currentProvider} to ${targetProvider}...`);
    schema = schema.replace(
      /provider\s*=\s*"(sqlite|postgresql)"/,
      `provider = "${targetProvider}"`
    );
    fs.writeFileSync(schemaPath, schema, "utf-8");
  }

  console.log(`[prepare-db] Database provider configured: ${targetProvider}`);
  console.log("[prepare-db] Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("[prepare-db] Syncing database schema...");
  try {
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  } catch (err) {
    console.warn("[prepare-db] Warning during prisma db push:", err.message);
  }

  console.log("[prepare-db] Ensuring seed data exists (safe non-destructive sync)...");
  try {
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  } catch (err) {
    console.warn("[prepare-db] Warning during seed:", err.message);
  }

  console.log("[prepare-db] Database preparation completed successfully.");
}

run();
