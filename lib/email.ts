/**
 * Servicio de envío de emails
 * 
 * Configurado para usar SMTP de Outlook/Office 365
 * 
 * Variables de entorno requeridas:
 * - SMTP_HOST: smtp.office365.com
 * - SMTP_PORT: 587
 * - SMTP_USER: brian.carrillo@arquiconsult.com
 * - SMTP_PASSWORD: contraseña de la cuenta
 * - FROM_EMAIL: CENTRA <brian.carrillo@arquiconsult.com>
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Configuración SMTP
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.office365.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL || 'CENTRA <brian.carrillo@arquiconsult.com>';
const APP_NAME = 'CENTRA';

/**
 * Obtener la URL de la aplicación
 * @param baseUrl URL base del request (ej: https://centra.vercel.app)
 * @returns URL completa de la aplicación
 */
function getAppUrl(baseUrl?: string): string {
  if (baseUrl) {
    return baseUrl;
  }
  // Fallback a localhost para desarrollo
  return 'http://localhost:3000';
}

/**
 * Obtiene la URL del logo
 * @param baseUrl URL base del request
 */
function getLogoUrl(baseUrl?: string): string {
  return `${getAppUrl(baseUrl)}/logo.png`;
}

/**
 * Crea el transportador de Nodemailer con configuración SMTP
 */
function createTransporter() {
  if (!SMTP_USER || !SMTP_PASSWORD) {
    throw new Error('Configuración SMTP incompleta: faltan SMTP_USER o SMTP_PASSWORD');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });
}

/**
 * Envía un email usando SMTP
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<SendEmailResult> {
  if (!SMTP_USER || !SMTP_PASSWORD) {
    console.error('[Email] Configuración SMTP incompleta');
    return { success: false, error: 'Servicio de email no configurado' };
  }

  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`[Email] Email enviado exitosamente a ${to}, ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('[Email] Error al enviar email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Genera el HTML del email de activación de cuenta
 * 
 * Características:
 * - Estilos inline para compatibilidad con clientes de correo
 * - Diseño responsive y profesional
 * - Botón CTA prominente
 * - Aviso claro de caducidad
 */
export function generateActivationEmailHTML(options: {
  userName: string;
  activationUrl: string;
  expirationHours: number;
  baseUrl?: string;
}): string {
  const { userName, activationUrl, expirationHours, baseUrl } = options;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Activa tu cuenta en ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
  
  <!-- Contenedor principal -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Card del email -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Saludo -->
              <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">
                ¡Bienvenido a ${APP_NAME}!
              </h1>
              
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #3f3f46;">
                Hola <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #3f3f46;">
                Se ha creado una cuenta para ti en ${APP_NAME}. Para comenzar a usar la plataforma, necesitas configurar tu contraseña.
              </p>
              
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #3f3f46;">
                Haz clic en el siguiente botón para crear tu contraseña y activar tu cuenta:
              </p>
              
              <!-- Botón CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${activationUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #5540da; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                      Crear contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Aviso de caducidad -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                      <strong>⏰ Importante:</strong> Este enlace expira en <strong>${expirationHours} horas</strong>. Si no completas la activación antes, deberás solicitar un nuevo enlace al administrador.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Link alternativo -->
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; word-break: break-all;">
                <a href="${activationUrl}" style="color: #2563eb;">${activationUrl}</a>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; text-align: center;">
                Si no esperabas este email, puedes ignorarlo de forma segura.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

/**
 * Envía email de activación de cuenta
 * @param baseUrl URL base obtenida del request (ej: desde headers en API route)
 */
export async function sendActivationEmail(options: {
  to: string;
  userName: string;
  token: string;
  expirationHours?: number;
  baseUrl?: string;
}): Promise<SendEmailResult> {
  const { to, userName, token, expirationHours = 24, baseUrl } = options;

  const activationUrl = `${getAppUrl(baseUrl)}/activate-account?token=${token}`;
  
  const html = generateActivationEmailHTML({
    userName,
    activationUrl,
    expirationHours,
    baseUrl,
  });

  return sendEmail({
    to,
    subject: `Activa tu cuenta en ${APP_NAME}`,
    html,
  });
}
