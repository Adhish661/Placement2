# Email Setup Guide - Gmail App Password

## Problem
If you're getting `EAUTH: Missing credentials for "PLAIN"` error, it means:
1. Email credentials are not configured in `.env` file, OR
2. You're using a regular Gmail password instead of an App Password

## Solution: Create Gmail App Password

Gmail requires **App Passwords** for SMTP authentication (not your regular password).

### Step 1: Enable 2-Step Verification
1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. If not enabled, click **Get Started** and follow the setup process

### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to **Security**
2. Under "Signing in to Google", you'll now see **App passwords**
3. Click on **App passwords**
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Enter "Placement Portal" as the name
7. Click **Generate**
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
In your `backend/.env` file, update these values:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Important Notes:**
- Use the **16-character App Password** (remove spaces if any)
- Do NOT use your regular Gmail password
- The App Password should be all lowercase letters and numbers

### Step 4: Restart Server
After updating the `.env` file, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

## Verification

Once configured, you should see:
- ✅ No EAUTH errors in the console
- ✅ Email sent successfully messages when users login
- ✅ Emails are actually delivered to recipients

## Troubleshooting

### Still getting EAUTH error?
1. **Check .env file exists** in `backend/.env`
2. **Verify variable names** are exactly:
   - `EMAIL_USER` (not EMAIL_ADDRESS or EMAIL)
   - `EMAIL_PASSWORD` (not EMAIL_PASS or PASSWORD)
3. **Check for typos** in the App Password
4. **Ensure no extra spaces** in the .env file values
5. **Restart the server** after making changes

### Email not sending but no errors?
- Check spam folder
- Verify recipient email is correct
- Check Gmail account for security alerts
- Ensure "Less secure app access" is not required (App Passwords should work without this)

### Alternative: Use Different Email Service
If Gmail doesn't work, you can configure other SMTP services:

```env
# For other services, you might need to change the transporter config
# in backend/utils/emailService.js
```

## Security Best Practices
- ✅ Never commit `.env` file to version control
- ✅ Use App Passwords, not regular passwords
- ✅ Rotate App Passwords periodically
- ✅ Use environment-specific credentials for production

