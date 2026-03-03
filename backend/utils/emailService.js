import nodemailer from 'nodemailer';

// Validate email credentials (supports EMAIL_PASSWORD or EMAIL_PASS)
const validateEmailConfig = () => {
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
    console.warn('⚠️  Email credentials not configured. Email functionality will be disabled.');
    console.warn('   Please set EMAIL_USER and either EMAIL_PASSWORD or EMAIL_PASS in your .env file');
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
    const rawPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || '';
    const password = rawPassword.replace(/\s/g, '');
    
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
    const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    if (!process.env.EMAIL_USER || !password) {
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
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
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

export const sendRegistrationEmail = async (email, name) => {
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
    return;
  }
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Welcome to Placement Portal</h2>
      <p>Hello ${name},</p>
      <p>Your student account has been successfully created on ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
      <p>You can now log in with your email and password to access drives, apply for placements, and manage your profile.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
    </div>
  `;
  return sendEmail({
    email,
    subject: 'Welcome - Placement Portal Registration',
    html,
  });
};

export const sendEmailOtp = async (email, otp, purpose = 'register') => {
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
    return;
  }
  
  let actionText, subject;
  if (purpose === 'update_email') {
    actionText = 'update your email';
    subject = 'Email Verification OTP';
  } else if (purpose === 'forgot_password') {
    actionText = 'reset your password';
    subject = 'Password Reset OTP';
  } else {
    actionText = 'complete your registration';
    subject = 'Email Verification OTP';
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Email Verification</h2>
      <p>Use the OTP below to ${actionText}:</p>
      <div style="background: #f7fafc; padding: 16px; border-radius: 6px; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-align: center;">
        ${otp}
      </div>
      <p style="margin-top: 16px;">This OTP will expire in 10 minutes.</p>
      ${purpose === 'forgot_password' ? '<p style="color: #e53e3e;">If you did not request a password reset, please ignore this email.</p>' : ''}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
    </div>
  `;
  return sendEmail({
    email,
    subject,
    html,
  });
};

export const sendDriveAssignment = async (email, name, driveDetails) => {
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
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

export const sendApplicationSubmitted = async (email, name, companyName, jobRole) => {
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
    return;
  }
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Application Submitted</h2>
      <p>Hello ${name},</p>
      <p>Your application for <strong>${companyName}</strong> - ${jobRole} has been submitted successfully.</p>
      <p>You will be notified when there is an update on your application status.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
    </div>
  `;
  return sendEmail({
    email,
    subject: `Application submitted - ${companyName} - ${jobRole}`,
    html,
  });
};

export const sendDriveSharedToStudent = async (email, name, companyName, jobRole) => {
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
    return;
  }
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">New Drive Shared With You</h2>
      <p>Hello ${name},</p>
      <p>A new placement drive has been shared with you:</p>
      <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Role:</strong> ${jobRole}</p>
      </div>
      <p>Log in to the portal to view details and apply if eligible.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${process.env.COLLEGE_NAME || 'IES College of Engineering'} Placement Portal.</p>
    </div>
  `;
  return sendEmail({
    email,
    subject: `New drive shared: ${companyName} - ${jobRole}`,
    html,
  });
};

export const sendCoordinatorCredentials = async (email, name, password, department) => {
  // Silently fail if email is not configured
  const envPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !envPassword) {
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

export const sendNewApplicationToCoordinator = async (
  email,
  coordinatorName,
  studentName,
  companyName,
  jobRole
) => {
  const password = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  if (!process.env.EMAIL_USER || !password) {
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">New Application Received</h2>
      <p>Hello ${coordinatorName},</p>
      <p>Student <strong>${studentName}</strong> has applied for <strong>${companyName}</strong> - ${jobRole}.</p>
      <p>Please log in to the portal to review the application.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #718096; font-size: 12px;">This is an automated email from ${
        process.env.COLLEGE_NAME || 'IES College of Engineering'
      } Placement Portal.</p>
    </div>
  `;

  return sendEmail({
    email,
    subject: `New application: ${companyName} - ${jobRole}`,
    html,
  });
};

