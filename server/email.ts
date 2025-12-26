import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@consentease.com'
  };
}

export function getBaseUrl(): string {
  if (process.env.REPLIT_DOMAINS) {
    return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return 'http://localhost:5000';
}

export async function sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
  console.log(`Attempting to send password reset email to ${email}...`);
  
  const { client, fromEmail } = await getResendClient();
  console.log(`Using from email: ${fromEmail}`);
  
  const result = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Reset your ConsentEase password',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">Reset Your Password</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to create a new password.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Password reset email sent, result:`, result);
  return result;
}

export async function sendVerificationEmail(email: string, verificationToken: string, verifyUrl: string) {
  console.log(`Attempting to send verification email to ${email}...`);
  
  const { client, fromEmail } = await getResendClient();
  console.log(`Using from email: ${fromEmail}`);
  
  const result = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Verify your ConsentEase email',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">Verify Your Email</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Thanks for signing up! Please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Verify Email
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Verification email sent, result:`, result);
  return result;
}
