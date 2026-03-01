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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';

const CoordinatorStudentsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

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

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const branch = student.profile?.education?.current?.branch || student.profile?.education?.current?.department;
    const matchesBranch = !filterBranch || (branch && branch.toLowerCase() === filterBranch.toLowerCase());
    const passoutBatch = student.profile?.education?.current?.passoutBatch;
    const matchesYear = !filterYear || passoutBatch === filterYear;
    return matchesSearch && matchesBranch && matchesYear;
  });

  const uniqueBranches = [...new Set(students.map((s) => s.profile?.education?.current?.branch || s.profile?.education?.current?.department).filter(Boolean))].sort();
  const uniqueYears = [...new Set(students.map((s) => s.profile?.education?.current?.passoutBatch).filter(Boolean))].sort((a, b) => (b || '').localeCompare(a || ''));

  return (
    <CoordinatorLayout>
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 800, mb: 3, color: '#e5e7eb', letterSpacing: 0.3 }}
        >
          View Students
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15,23,42,0.9)',
                  color: '#e5e7eb',
                },
                '& .MuiInputLabel-root': { color: 'rgba(148,163,184,0.9)' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'rgba(148,163,184,0.9)' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,23,42,0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: 'rgba(226,232,240,0.9)' } }}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={filterBranch}
                onChange={(e) => {
                  setFilterBranch(e.target.value);
                  setBranchMenuOpen(false);
                }}
                label="Branch"
                open={branchMenuOpen}
                onOpen={() => setBranchMenuOpen(true)}
                onClose={() => setBranchMenuOpen(false)}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueBranches.map((b) => (
                  <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,23,42,0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: 'rgba(226,232,240,0.9)' } }}>
              <InputLabel>Passout Year</InputLabel>
              <Select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setYearMenuOpen(false);
                }}
                label="Passout Year"
                open={yearMenuOpen}
                onOpen={() => setYearMenuOpen(true)}
                onClose={() => setYearMenuOpen(false)}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueYears.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer
          component={Paper}
          sx={{
            bgcolor: 'rgba(15,23,42,0.96)',
            borderRadius: 3,
            border: '1px solid rgba(148,163,184,0.4)',
            boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Branch</TableCell>
                <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Registered Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student._id}
                  sx={{ '&:hover': { bgcolor: 'rgba(30,64,175,0.35)' } }}
                >
                  <TableCell sx={{ color: '#e5e7eb' }}>{student.name}</TableCell>
                  <TableCell sx={{ color: 'rgba(241,245,249,0.92)' }}>{student.email}</TableCell>
                  <TableCell sx={{ color: 'rgba(226,232,240,0.9)' }}>
                    {student.profile?.education?.current?.branch || student.profile?.education?.current?.department || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(226,232,240,0.9)' }}>
                    {new Date(student.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredStudents.length === 0 && (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              mt: 2,
              bgcolor: 'rgba(15,23,42,0.96)',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.4)',
              boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'rgba(148,163,184,0.95)' }}>
              No students found
            </Typography>
          </Paper>
        )}
      </Box>
    </CoordinatorLayout>
  );
};

export default CoordinatorStudentsPage;

