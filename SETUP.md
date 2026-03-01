# Setup Guide - IES Career Connect Placement Portal

## Quick Start

### 1. Install Dependencies

From the root directory:
```bash
npm run install-all
```

Or install separately:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM_NAME=Placement
COLLEGE_NAME=IES College of Engineering
```

**Important Notes:**
- For MongoDB: Use MongoDB Atlas connection string or local MongoDB URI
- For Cloudinary: Sign up at https://cloudinary.com and get your credentials
- For Email: Use Gmail App Password (not regular password)
  - Go to Google Account → Security → 2-Step Verification → App Passwords
  - Generate an app password for "Mail"

### 3. Run the Application

**Option 1: Run both servers together (Recommended)**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Creating Admin Account

To create an admin account, you can either:

1. **Use MongoDB directly:**
   - Connect to your MongoDB database
   - Insert a user document in the `users` collection:
   ```json
   {
     "name": "Admin User",
     "email": "admin@ies.edu",
     "password": "hashed_password_here",
     "role": "ADMIN",
     "isActive": true
   }
   ```
   - Note: Password must be hashed using bcrypt

2. **Use the registration endpoint:**
   - First, temporarily modify the registration endpoint to allow ADMIN role
   - Register as admin
   - Revert the change

## Default User Roles

- **STUDENT**: Can register and login
- **DEPT_COORDINATOR**: Login only (created by Admin)
- **ADMIN**: Login only (must be created manually or via database)

## Features Overview

### For Students:
1. Register/Login
2. Complete profile (Basic Details, Education, Skills)
3. Add Projects, Accomplishments, Work Experience
4. Browse and apply to placement drives
5. Track application status
6. Download ATS-friendly resume
7. Access resources uploaded by coordinators

### For Coordinators:
1. Login (credentials provided by Admin)
2. View assigned drives
3. Track student applications
4. Update application status
5. Upload resources (aptitude, technical, company-wise)

### For Admin:
1. Login
2. Create and manage placement drives
3. Create Department Coordinator accounts
4. Assign drives to coordinators
5. Monitor overall placement status
6. Manage coordinators (activate/deactivate, reset passwords)

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check if MongoDB Atlas IP whitelist includes your IP
- Ensure network access is enabled

### Cloudinary Upload Issues
- Verify Cloudinary credentials
- Check file size limits (max 10MB)
- Ensure correct folder permissions

### Email Not Sending
- Verify Gmail App Password is correct
- Check if "Less secure app access" is enabled (if required)
- Verify email credentials in .env file

### CORS Errors
- Ensure FRONTEND_URL in .env matches your frontend URL
- Check backend CORS configuration

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill
  ```

## Production Deployment

### Backend:
1. Set NODE_ENV=production
2. Use a process manager like PM2
3. Configure proper CORS settings
4. Use environment-specific MongoDB URI
5. Set up proper logging

### Frontend:
1. Build the application: `npm run build`
2. Serve the `dist` folder using a web server (Nginx, Apache)
3. Configure API proxy if needed

## Support

For issues or questions, contact the development team or refer to the main README.md file.

