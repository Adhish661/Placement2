import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateStudentExcel = async () => {
  try {
    const students = await User.find({ role: 'STUDENT' }).sort({ createdAt: -1 });
    
    if (students.length === 0) {
      console.log('No students found for Excel export');
      return null;
    }

    const studentIds = students.map(s => s._id);
    const profiles = await Profile.find({ user: { $in: studentIds } });

    const excelData = students.map(student => {
      const profile = profiles.find(p => p.user && p.user.toString() === student._id.toString());
      
      return {
        'Name': student.name,
        'Email': student.email,
        'Full Name': profile?.basicDetails?.fullName || '',
        'Date of Birth': profile?.basicDetails?.dateOfBirth 
          ? new Date(profile.basicDetails.dateOfBirth).toLocaleDateString() 
          : '',
        'Gender': profile?.basicDetails?.gender || '',
        'Current College': profile?.basicDetails?.currentCollege || '',
        'Department': profile?.education?.current?.department || '',
        'Program': profile?.education?.current?.program || '',
        'Branch': profile?.education?.current?.branch || '',
        'Current Semester': profile?.education?.current?.currentSemester || '',
        'Roll Number': profile?.education?.current?.rollNumber || '',
        'Passout Batch': profile?.education?.current?.passoutBatch || '',
        'Permanent Address': profile?.basicDetails?.permanentAddress ? 
          `${profile.basicDetails.permanentAddress.street}, ${profile.basicDetails.permanentAddress.city}, ${profile.basicDetails.permanentAddress.state} ${profile.basicDetails.permanentAddress.pincode}` : '',
        'Current Address': profile?.basicDetails?.currentAddress ? 
          `${profile.basicDetails.currentAddress.street}, ${profile.basicDetails.currentAddress.city}, ${profile.basicDetails.currentAddress.state} ${profile.basicDetails.currentAddress.pincode}` : '',
        'Technical Skills': profile?.skills?.technical?.join(', ') || '',
        'Languages': profile?.skills?.languages?.join(', ') || '',
        'Registered At': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '',
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const excelDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    const filePath = path.join(excelDir, 'students.xlsx');
    XLSX.writeFile(workbook, filePath);

    return filePath;
  } catch (error) {
    console.error('Excel update error:', error);
    throw error;
  }
};

