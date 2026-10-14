import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getDatabaseUrl(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = "/tmp/gallup.db";
    const bundledTemplatePath = path.join(process.cwd(), "prisma", "template.db");
    const bundledDevPath = path.join(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(tmpDbPath)) {
      try {
        if (fs.existsSync(bundledTemplatePath)) {
          fs.copyFileSync(bundledTemplatePath, tmpDbPath);
          console.log("Copied prisma/template.db to /tmp/gallup.db successfully");
        } else if (fs.existsSync(bundledDevPath)) {
          fs.copyFileSync(bundledDevPath, tmpDbPath);
          console.log("Copied prisma/dev.db to /tmp/gallup.db successfully");
        } else {
          console.warn("No template database found to copy to /tmp!");
        }
      } catch (err) {
        console.error("Error copying template database to /tmp:", err);
      }
    }
    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || "file:./dev.db";
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
