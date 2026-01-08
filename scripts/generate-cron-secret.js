/**
 * Script para generar un token secreto seguro para el Cron Job
 * 
 * Uso:
 *   node scripts/generate-cron-secret.js
 * 
 * Este script genera un token aleatorio de 32 bytes codificado en base64
 * que puede ser usado como CRON_SECRET en las variables de entorno.
 */

const crypto = require('crypto');

// Generar token secreto de 32 bytes
const cronSecret = crypto.randomBytes(32).toString('base64');

console.log('\n' + '='.repeat(60));
console.log('🔐 CRON SECRET GENERATOR');
console.log('='.repeat(60));
console.log('\nToken generado exitosamente:\n');
console.log(`CRON_SECRET=${cronSecret}`);
console.log('\n' + '='.repeat(60));
console.log('\n📋 Pasos para configurar:');
console.log('\n1. Copia el token generado arriba');
console.log('2. Agrégalo a tu archivo .env.local:');
console.log('   CRON_SECRET=<tu-token-aqui>');
console.log('\n3. En Vercel Dashboard:');
console.log('   - Ve a Settings → Environment Variables');
console.log('   - Agrega: CRON_SECRET = <tu-token-aqui>');
console.log('   - Aplica a: Production, Preview, Development');
console.log('\n4. Redeploy tu aplicación');
console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANTE: Guarda este token de forma segura');
console.log('   No lo compartas públicamente ni lo subas al repositorio\n');
