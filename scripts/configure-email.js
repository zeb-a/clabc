
/**
 * PocketBase Email Configuration Script
 *
 * This script configures:
 * 1. Email verification redirect URL to your website
 * 2. Custom email verification template with your branding
 *
 * Run this after starting your PocketBase instance:
 * node scripts/configure-email.js
 */

const POCKETBASE_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@klasiz.fun';
const POCKETBASE_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'Nora@2014q';
const POCKETBASE_URL = process.env.PB_URL || 'https://klasiz.fun';

// Your website URL - update this to match your production domain
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://klasiz.fun';

/**
 * Custom email verification template
 * Replaces PocketBase banner with your website branding
 */
const EMAIL_VERIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
      padding: 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 900;
      color: white;
      letter-spacing: -1px;
    }
    .content {
      padding: 40px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .button:hover {
      background: #45a049;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .footer a {
      color: #999;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Klasiz</div>
    </div>
    <div class="content">
      <h1>Verify Your Email Address</h1>
      <p>Hi {{.username}},</p>
      <p>Thank you for signing up for Klasiz! To complete your registration and access your account, please verify your email address by clicking the button below.</p>
      <p style="text-align: center;">
        <a href="{{.url}}" class="button">Verify Email Address</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #4CAF50; font-size: 13px;">{{.url}}</p>
      <p>If you didn't create an account with Klasiz, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Klasiz. All rights reserved.</p>
      <p>This email was sent to {{.email}}</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Custom password reset template
 * Same branding as verification email
 */
const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
      padding: 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 900;
      color: white;
      letter-spacing: -1px;
    }
    .content {
      padding: 40px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .button:hover {
      background: #45a049;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Klasiz</div>
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hi {{.username}},</p>
      <p>We received a request to reset your password for your Klasiz account. Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="{{.url}}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #4CAF50; font-size: 13px;">{{.url}}</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Klasiz. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

async function configureEmailSettings() {
  try {
    const PocketBase = (await import('pocketbase')).default;
    const pb = new PocketBase(POCKETBASE_URL);

    console.log(`Connecting to PocketBase at ${POCKETBASE_URL}...`);

    // Login as admin
    const authData = await pb.collection('_superusers').authWithPassword(
      POCKETBASE_ADMIN_EMAIL,
      POCKETBASE_ADMIN_PASSWORD
    );
    console.log('Admin login successful');

    // Get current settings
    const settings = await pb.collection('_settings').getList(1, 1, {
      filter: 'name = "meta" || name = "email"'
    });

    let metaSettings = null;
    let emailSettings = null;

    for (const setting of settings.items) {
      if (setting.name === 'meta') metaSettings = setting;
      if (setting.name === 'email') emailSettings = setting;
    }

    // Prepare updates
    const updates = [];

    // Update meta settings with redirect URLs
    if (metaSettings) {
      const metaValue = typeof metaSettings.value === 'string'
        ? JSON.parse(metaSettings.value)
        : metaSettings.value;

      metaValue.verificationUrl = `${WEBSITE_URL}/_/#/auth/confirm-verification/`;
      metaValue.passwordResetUrl = `${WEBSITE_URL}/_/#/auth/reset-password/`;

      updates.push({
        id: metaSettings.id,
        value: metaValue
      });
      console.log('Configured redirect URLs:', metaValue);
    }

    // Update email templates
    if (emailSettings) {
      const emailValue = typeof emailSettings.value === 'string'
        ? JSON.parse(emailSettings.value)
        : emailSettings.value;

      emailValue.templates = emailValue.templates || {};

      // Set verification email template
      emailValue.templates.verificationEmail = {
        subject: 'Verify Your Email Address',
        body: EMAIL_VERIFICATION_TEMPLATE
      };

      // Set password reset email template
      emailValue.templates.passwordResetEmail = {
        subject: 'Reset Your Password',
        body: PASSWORD_RESET_TEMPLATE
      };

      updates.push({
        id: emailSettings.id,
        value: emailValue
      });
      console.log('Configured email templates');
    }

    // Apply updates
    for (const update of updates) {
      await pb.collection('_settings').update(update.id, {
        value: JSON.stringify(update.value)
      });
      console.log(`Updated settings: ${update.id}`);
    }

    console.log('\n✅ Email configuration completed successfully!');
    console.log('\nConfiguration summary:');
    console.log(`  - Verification redirect: ${WEBSITE_URL}/#/confirm-verification/`);
    console.log(`  - Password reset redirect: ${WEBSITE_URL}/#/reset/`);
    console.log(`  - Email templates: Custom Klasiz branding`);
    console.log('\nTest by signing up a new user or requesting a password reset.');

  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  configureEmailSettings();
}

export default configureEmailSettings;
