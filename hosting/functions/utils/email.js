const nodemailer = require('nodemailer');
const functions = require('firebase-functions');

// Configure email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass
  }
});

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: functions.config().email.from,
    to: user.email,
    subject: 'Welcome to Solid Oak Structures',
    html: `
      <h1>Welcome to Solid Oak Structures</h1>
      <p>Thank you for creating an account with us. We're excited to help you with your oak structure needs.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

// Send order confirmation
exports.sendOrderConfirmation = async (order, user) => {
  const mailOptions = {
    from: functions.config().email.from,
    to: user.email,
    subject: `Order Confirmation #${order.id}`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order. Your order number is: ${order.id}</p>
      <h2>Order Details:</h2>
      <p>${order.details}</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

// Send contact form notification
exports.sendContactFormNotification = async (formData) => {
  const mailOptions = {
    from: functions.config().email.from,
    to: functions.config().email.notifications,
    subject: 'New Contact Form Submission',
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Message:</strong> ${formData.message}</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

