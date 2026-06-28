import { Resend } from 'resend';

const DEFAULT_FROM_EMAIL = 'ConsentEase <noreply@consentease.io>';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured. Please add your Resend API key to the secrets.');
  }
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  
  return {
    client: new Resend(apiKey),
    fromEmail
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
  
  const { client, fromEmail } = getResendClient();
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
  
  const { client, fromEmail } = getResendClient();
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

export async function sendEmailChangeVerification(currentEmail: string, newEmail: string, verifyUrl: string) {
  console.log(`Attempting to send email change verification to ${newEmail}...`);
  
  const { client, fromEmail } = getResendClient();
  
  const result = await client.emails.send({
    from: fromEmail,
    to: newEmail,
    subject: 'Verify your new email address - ConsentEase',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">Verify Your New Email</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          You requested to change your email address from <strong>${currentEmail}</strong> to <strong>${newEmail}</strong>.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to confirm this change.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Verify New Email
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          This link will expire in 1 hour. If you didn't request this change, you can safely ignore this email and your current email will remain unchanged.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Email change verification sent, result:`, result);
  return result;
}

export async function sendAgencyClientInviteEmail(
  clientEmail: string, 
  agencyName: string, 
  inviteUrl: string,
  personalMessage?: string
) {
  console.log(`Attempting to send agency invite email to ${clientEmail} from ${agencyName}...`);
  
  const { client, fromEmail } = getResendClient();
  
  const result = await client.emails.send({
    from: fromEmail,
    to: clientEmail,
    subject: `${agencyName} invites you to ConsentEase`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">You've Been Invited!</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          <strong>${agencyName}</strong> has invited you to join ConsentEase, the simple and affordable way to make your website GDPR and CCPA compliant.
        </p>
        
        ${personalMessage ? `
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
            "${personalMessage}"
          </p>
          <p style="color: #999; font-size: 12px; margin: 8px 0 0 0;">— ${agencyName}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Accept Invitation
          </a>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="color: #333; font-size: 16px; margin: 0 0 12px 0;">What you get:</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>GDPR & CCPA compliant consent banner</li>
            <li>Google Consent Mode v2 support</li>
            <li>Setup in under 2 minutes</li>
            <li>Support from ${agencyName}</li>
          </ul>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Agency invite email sent, result:`, result);
  return result;
}

export async function sendTrialExpiringEmail(email: string, firstName: string | null, daysLeft: number) {
  console.log(`Attempting to send trial expiring email to ${email}...`);
  
  const { client, fromEmail } = getResendClient();
  const upgradeUrl = `${getBaseUrl()}/dashboard/settings`;
  
  const result = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: daysLeft === 1 
      ? 'Last day of your ConsentEase trial!' 
      : `Your ConsentEase trial ends in ${daysLeft} days`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">
          ${daysLeft === 1 ? 'Your trial ends tomorrow!' : `${daysLeft} days left in your trial`}
        </h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi${firstName ? ` ${firstName}` : ''},
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          ${daysLeft === 1 
            ? 'This is your last day to use ConsentEase for free. After your trial ends, your consent banners will stop working on your websites.' 
            : `Your 7-day free trial of ConsentEase ends in ${daysLeft} days. Subscribe now to ensure your consent banners keep working without interruption.`}
        </p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="color: #333; font-size: 16px; margin: 0 0 12px 0;">Keep enjoying:</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>GDPR & CCPA compliant consent banners</li>
            <li>Google Consent Mode v2 integration</li>
            <li>Real-time consent analytics</li>
            <li>Automatic cookie scanning</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${upgradeUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Choose Your Plan
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Plans start from just EUR 5/month. No long-term commitment required.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Trial expiring email sent, result:`, result);
  return result;
}

export async function sendPaymentFailedEmail(email: string, firstName: string | null) {
  console.log(`Attempting to send payment failed email to ${email}...`);
  
  const { client, fromEmail } = getResendClient();
  const billingUrl = `${getBaseUrl()}/dashboard/billing`;
  
  const result = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Action required: Your ConsentEase payment failed',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">Payment failed</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi${firstName ? ` ${firstName}` : ''},
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          We were unable to process your latest payment for your ConsentEase subscription. Please update your payment method to keep your account active.
        </p>
        
        <p style="color: #e53e3e; font-size: 16px; line-height: 1.6; margin-bottom: 24px; font-weight: 600;">
          If payment is not resolved within 14 days, your account will be automatically downgraded to the Solo plan and your consent banners may stop working as expected.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${billingUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Update Payment Method
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          If you believe this is an error, please contact us at support@consentease.io.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Payment failed email sent, result:`, result);
  return result;
}

export async function sendAutoDowngradeEmail(email: string, firstName: string | null, previousPlan: string) {
  console.log(`Attempting to send auto-downgrade email to ${email}...`);
  
  const { client, fromEmail } = getResendClient();
  const billingUrl = `${getBaseUrl()}/dashboard/billing`;
  
  const result = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Your ConsentEase account has been downgraded',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">Account downgraded</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi${firstName ? ` ${firstName}` : ''},
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Due to an unresolved payment issue, your ConsentEase account has been automatically downgraded from the <strong>${previousPlan}</strong> plan to the <strong>Solo</strong> plan.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Your banner settings and analytics data are still saved. You can upgrade again at any time to restore full functionality.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${billingUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Resubscribe Now
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          If you need assistance, please contact us at support@consentease.io.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Auto-downgrade email sent, result:`, result);
  return result;
}

export async function sendTrialExpiredEmail(email: string, firstName: string | null) {
  console.log(`Attempting to send trial expired email to ${email}...`);
  
  const { client, fromEmail } = getResendClient();
  const upgradeUrl = `${getBaseUrl()}/dashboard/settings`;
  
  const result = await client.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Your ConsentEase trial has ended',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #726CEA; font-size: 28px; margin: 0;">ConsentEase</h1>
        </div>
        
        <h2 style="color: #1e1e1e; font-size: 24px; margin-bottom: 16px;">Your trial has ended</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hi${firstName ? ` ${firstName}` : ''},
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Your 7-day free trial of ConsentEase has ended. Your consent banners are currently not active on your websites.
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Subscribe now to restore your banners and stay compliant with GDPR and CCPA regulations.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${upgradeUrl}" style="display: inline-block; background-color: #726CEA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Subscribe Now
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Plans start from just EUR 5/month. Your banner settings and analytics are saved and ready when you return.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          ConsentEase - GDPR/CCPA Consent Management Made Simple
        </p>
      </div>
    `
  });
  
  console.log(`Trial expired email sent, result:`, result);
  return result;
}
