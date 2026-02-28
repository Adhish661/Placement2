import { useEffect, useState } from 'react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';

const CoordinatorStudentsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data: users } = await axiosInstance.get('/users');
      const studentUsers = users.filter(user => user.role === 'STUDENT');
      
      // Get profiles for all students with better error handling
      const studentsWithProfiles = await Promise.all(
        studentUsers.map(async (user) => {
          try {
            const { data: profile } = await axiosInstance.get(`/profile?userId=${user._id}`);
            return { ...user, profile };
          } catch (error) {
            // If profile doesn't exist, return user without profile
            console.warn(`Profile not found for user ${user._id}:`, error.message);
            return { ...user, profile: null };
          }
        })
      );

      // Filter by department (compare branch with coordinator's department)
      const coordinatorDepartment = userInfo?.department;
      
      if (!coordinatorDepartment) {
        console.warn('Coordinator department not found');
        setStudents([]);
        return;
      }
      
      const filteredStudents = studentsWithProfiles.filter(student => {
        // Check if student has profile and branch matches coordinator's department
        // Also handle case-insensitive comparison and check both branch and department fields
        const studentBranch = student.profile?.education?.current?.branch;
        const studentDepartment = student.profile?.education?.current?.department;
        const branchMatch = studentBranch && 
          (studentBranch === coordinatorDepartment || 
           studentBranch.toLowerCase() === coordinatorDepartment.toLowerCase());
        const deptMatch = studentDepartment && 
          (studentDepartment === coordinatorDepartment || 
           studentDepartment.toLowerCase() === coordinatorDepartment.toLowerCase());
        return branchMatch || deptMatch;
      });

      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CoordinatorLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          View Students
        </Typography>

        <TextField
          fullWidth
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Registered Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {new Date(student.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredStudents.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" color="text.secondary">
              No students found
            </Typography>
          </Paper>
        )}
      </Box>
    </CoordinatorLayout>
  );
};

export default CoordinatorStudentsPage;

