const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use Mailtrap/Ethereal
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendVerificationEmail(userEmail, token) {
  const url = `http://localhost:3000/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"ASAS Auth" example@example.com',
    to: userEmail,
    subject: 'Verify your email',
    html: `<p>Click the link below to verify your email:</p><a href="${url}">${url}</a>`
  });
}

async function sendResetEmail(userEmail, token) {
  const url = `https://localhost:3000/auth/reset-password?token=${token}&email=${encodeURIComponent(userEmail)}`;

  await transporter.sendMail({
    from: '"ASAS Auth" example@example.com',
    to: userEmail,
    subject: 'Reset your password',
    html: `<p>Click the link below to reset your password:</p><a href="${url}">${url}</a>`
  });
}

module.exports = {sendVerificationEmail, sendResetEmail}