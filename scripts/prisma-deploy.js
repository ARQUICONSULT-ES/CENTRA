#!/usr/bin/env node
import { execSync } from "child_process";

const dbUrl = process.argv[2];

if (!dbUrl) {
  console.error("❌ Debes pasar la URL de la base de datos como argumento.");
  console.error("Ejemplo: node scripts/prisma-deploy.js $DATABASE_URL");
  process.exit(1);
}

function run(command) {
  console.log(`Ejecutando: ${command}`);
  try {
    execSync(command, { stdio: "inherit", env: { ...process.env, DATABASE_URL: dbUrl } });
  } catch (error) {
    console.error(`Error al ejecutar: ${command}`);
    process.exit(1);
  }
}

console.log("✅ Aplicando migraciones Prisma...");
run("npx prisma migrate deploy");

console.log("✅ Generando cliente Prisma...");
run("npx prisma generate");

console.log("🎉 Migraciones aplicadas y cliente generado correctamente.");
