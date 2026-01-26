# IES Career Connect - Placement Portal

A comprehensive full-stack placement portal built with the MERN stack for IES College of Engineering.

## Features

### User Roles
- **Student**: Register, login, complete profile, apply to drives, track applications
- **Department Coordinator**: Manage drives, track student applications, upload resources
- **Admin/TPO**: Create drives, manage coordinators, monitor overall placement status

### Key Functionalities
1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Email notifications on login

2. **Student Profile Management**
   - Basic details (name, DOB, address)
   - Education details (current, Class X, Class XII)
   - Skills & Languages
   - Projects
   - Accomplishments (Certificates, Awards, Workshops, Competitions)
   - Work Experience/Internships

3. **Drive Management**
   - Create and manage placement drives
   - Assign drives to department coordinators
   - Students can view and apply to drives

4. **Application Tracking**
   - Students can track application status
   - Coordinators can update application status
   - Real-time notifications

5. **ATS-Friendly Resume Generation**
   - Automatic resume generation from profile data
   - Clean, single-column layout
   - Downloadable as PDF

6. **Resource Management**
   - Coordinators can upload resources (aptitude, technical, company-wise)
   - Students can download resources

7. **Notifications**
   - Email notifications for important events
   - In-app notification system

8. **Excel Integration**
   - Automatic student data export to Excel
   - Updates existing records without overwriting

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Cloudinary (File Storage)
- Nodemailer (Email Service)
- XLSX (Excel Generation)
- PDFKit (Resume Generation)

### Frontend
- React.js
- Material-UI
- Redux Toolkit
- React Router
- Axios
- React Hook Form

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Gmail account for email service

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM_NAME=Placement
COLLEGE_NAME=IES College of Engineering
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Running Both Servers

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend servers concurrently.

## Project Structure

```
placement-portal/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── driveController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Profile.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   └── ...
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── emailService.js
│   │   └── cloudinary.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile/basic-details` - Update basic details
- `PUT /api/profile/education` - Update education
- `PUT /api/profile/skills` - Update skills
- `GET /api/profile/projects` - Get projects
- `POST /api/profile/projects` - Create project
- Similar endpoints for accomplishments and experiences

### Drives
- `GET /api/drives` - Get all drives
- `POST /api/drives` - Create drive (Admin)
- `POST /api/drives/:id/assign` - Assign drive to coordinator

### Applications
- `GET /api/applications` - Get applications
- `POST /api/applications` - Apply to drive
- `PUT /api/applications/:id/status` - Update application status

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based route protection
- Input validation
- CORS configuration

## License

This project is created for IES College of Engineering.

## Support

For issues and questions, please contact the placement cell.

