const nodemailer = require('nodemailer');

// Create transporter
let transporter;

const initializeTransporter = () => {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    return transporter;
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transport = initializeTransporter();

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'AuctionHub'}" <${process.env.EMAIL_FROM || 'noreply@auctionhub.com'}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '')
        };

        const info = await transport.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email error:', error);
        // Don't throw - email failures shouldn't break the app
        return null;
    }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, username, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    return sendEmail({
        to: email,
        subject: 'Verify your AuctionHub account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A73E8;">Welcome to AuctionHub!</h1>
        <p>Hi ${username},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; padding: 20px;">
          <a href="${verifyUrl}" style="background-color: #1A73E8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </p>
        <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 24 hours.</p>
        <p>Best regards,<br>The AuctionHub Team</p>
      </div>
    `
    });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, username, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return sendEmail({
        to: email,
        subject: 'Reset your AuctionHub password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A73E8;">Password Reset</h1>
        <p>Hi ${username},</p>
        <p>You requested to reset your password. Click the button below:</p>
        <p style="text-align: center; padding: 20px;">
          <a href="${resetUrl}" style="background-color: #FF6A00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
    });
};

/**
 * Send outbid notification email
 */
const sendOutbidEmail = async (email, username, auctionTitle, auctionId, currentBid) => {
    const auctionUrl = `${process.env.FRONTEND_URL}/auction/${auctionId}`;

    return sendEmail({
        to: email,
        subject: `You've been outbid on ${auctionTitle}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF6A00;">You've Been Outbid!</h1>
        <p>Hi ${username},</p>
        <p>Someone has placed a higher bid on <strong>${auctionTitle}</strong>.</p>
        <p>Current bid: <strong>$${currentBid.toFixed(2)}</strong></p>
        <p style="text-align: center; padding: 20px;">
          <a href="${auctionUrl}" style="background-color: #FF6A00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Bid Now</a>
        </p>
      </div>
    `
    });
};

/**
 * Send auction won email
 */
const sendAuctionWonEmail = async (email, username, auctionTitle, auctionId, winningBid) => {
    const auctionUrl = `${process.env.FRONTEND_URL}/auction/${auctionId}`;

    return sendEmail({
        to: email,
        subject: `Congratulations! You won ${auctionTitle}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">🎉 Congratulations!</h1>
        <p>Hi ${username},</p>
        <p>You won the auction for <strong>${auctionTitle}</strong>!</p>
        <p>Winning bid: <strong>$${winningBid.toFixed(2)}</strong></p>
        <p style="text-align: center; padding: 20px;">
          <a href="${auctionUrl}" style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Payment</a>
        </p>
      </div>
    `
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOutbidEmail,
    sendAuctionWonEmail
};
