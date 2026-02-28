import nodemailer from 'nodemailer';

// Validate email credentials
const validateEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email credentials not configured. Email functionality will be disabled.');
    console.warn('   Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
    return false;
  }
  return true;
};

// Create transporter lazily with validation
const getTransporter = () => {
  if (!validateEmailConfig()) {
    return null;
  }

  try {
    // Remove spaces from password if present (Gmail App Passwords sometimes have spaces)
    const password = process.env.EMAIL_PASSWORD?.replace(/\s/g, '') || process.env.EMAIL_PASSWORD;
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: password,
      },
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

export const sendEmail = async (options) => {
  try {
    // Validate credentials before attempting to send
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email not sent: Credentials not configured');
      return { message: 'Email service not configured' };
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.warn('Email not sent: Transporter not available');
      return { message: 'Email service not available' };
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Placement Portal'}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Don't throw error to prevent breaking the application flow
    // Just log it and return a failure indicator
    return { error: error.message };
  }
};

export const sendLoginAlert = async (email, name) => {
  // Silently fail if email is not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Login Alert</h2>
      <p>Hello ${name},</p>
      <p>You have successfully logged into your ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal account.</p>
      <p>If this wasn't you, please contact the placement cell immediately.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: 'Login Alert - Placement Portal',
    html,
  });
};

export const sendDriveAssignment = async (email, name, driveDetails) => {
  // Silently fail if email is not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">New Drive Assignment</h2>
      <p>Hello ${name},</p>
      <p>A new placement drive has been assigned to you:</p>
      <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Company:</strong> ${driveDetails.companyName}</p>
        <p><strong>Role:</strong> ${driveDetails.jobRole}</p>
        <p><strong>Location:</strong> ${driveDetails.location}</p>
      </div>
      <p>Please log in to the portal to view more details and allocate this drive to eligible students.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: `New Drive: ${driveDetails.companyName} - ${driveDetails.jobRole}`,
    html,
  });
};

export const sendCoordinatorCredentials = async (email, name, password, department) => {
  // Silently fail if email is not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Coordinator credentials email not sent: Email service not configured');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Welcome to Placement Portal</h2>
      <p>Hello ${name},</p>
      <p>Your Department Coordinator account has been created for ${department} department.</p>
      <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Department:</strong> ${department}</p>
      </div>
      <p><strong>Please change your password after first login.</strong></p>
      <p>You can now log in to the portal and start managing placement drives for your department.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: 'Placement Portal - Account Credentials',
    html,
  });
};

