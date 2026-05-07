const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            background: #5a67d8;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #667eea;
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 5px;
            margin: 20px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 SkillSphere</h1>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Freelancer Marketplace. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
    </div>
</body>
</html>
`;

const getVerificationEmail = (name, verificationUrl, token) =>
  getBaseTemplate(`
    <h2>Welcome, ${name}! 👋</h2>
    <p>Thank you for registering with Freelancer Marketplace. Please verify your email address to get started.</p>
    
    <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
    
    <div class="warning">
        <strong>⚠️ This link expires in 24 hours.</strong> If you didn't create an account, please ignore this email.
    </div>
`);

const getPasswordResetEmail = (name, resetUrl) =>
  getBaseTemplate(`
    <h2>Password Reset Request 🔑</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
    
    <div class="warning">
        <strong>⚠️ This link expires in 1 hour.</strong> If you didn't request a password reset, please ignore this email or contact support if you're concerned.
    </div>
`);

const getTwoFactorCodeEmail = (name, code) =>
  getBaseTemplate(`
    <h2>Your Two-Factor Authentication Code 🔐</h2>
    <p>Hi ${name},</p>
    <p>Here's your verification code to complete login:</p>
    
    <div class="code">${code}</div>
    
    <p>This code will expire in 10 minutes.</p>
    
    <div class="warning">
        <strong>🔒 Security Alert:</strong> If you didn't attempt to login, someone might be trying to access your account. Please change your password immediately.
    </div>
`);

const getWelcomeEmail = (name, role) =>
  getBaseTemplate(`
    <h2>Welcome to the Community, ${name}! 🎉</h2>
    <p>Your account has been successfully created as a <strong>${role}</strong>.</p>
    
    ${
      role === "freelancer"
        ? `
        <h3>Next Steps for Freelancers:</h3>
        <ul>
            <li>✅ Complete your profile with skills and experience</li>
            <li>✅ Upload your portfolio and resume</li>
            <li>✅ Browse available gigs and submit proposals</li>
            <li>✅ Set your availability and pricing</li>
        </ul>
    `
        : role === "client"
          ? `
        <h3>Next Steps for Clients:</h3>
        <ul>
            <li>✅ Complete your company profile</li>
            <li>✅ Post your first gig or project</li>
            <li>✅ Browse freelancer profiles</li>
            <li>✅ Start hiring top talent</li>
        </ul>
    `
          : ""
    }
    
    <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
    </div>
`);

const getGigNotificationEmail = (name, gigTitle, clientName) =>
  getBaseTemplate(`
    <h2>New Gig Alert! 📢</h2>
    <p>Hi ${name},</p>
    <p>A new gig matching your skills has been posted:</p>
    
    <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
        <h3 style="margin: 0;">${gigTitle}</h3>
        <p style="margin: 5px 0; color: #666;">Posted by: ${clientName}</p>
    </div>
    
    <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/gigs" class="button">View Gig Details</a>
    </div>
`);

export {
  getVerificationEmail,
  getPasswordResetEmail,
  getTwoFactorCodeEmail,
  getWelcomeEmail,
  getGigNotificationEmail,
};
