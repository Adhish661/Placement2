import { useEffect, useState } from 'react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Share, Person, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const CoordinatorDrivesPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [drives, setDrives] = useState([]);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [shareTab, setShareTab] = useState(0);
  const [shareCriteria, setShareCriteria] = useState({
    minCGPA: '',
    maxCGPA: '',
    branches: [],
    programs: [],
    passoutYears: [],
    requiredSkills: [],
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openSharedStudentsDialog, setOpenSharedStudentsDialog] = useState(false);
  const [filteredStudentsList, setFilteredStudentsList] = useState([]);
  const [studentFilters, setStudentFilters] = useState({
    minCGPA: '',
    maxCGPA: '',
    branch: '',
    passoutYear: '',
    skills: '',
  });

  useEffect(() => {
    fetchDrives();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data: users } = await axiosInstance.get('/users');
      const studentUsers = users.filter(user => user.role === 'STUDENT');
      
      // Get profiles for all students in coordinator's department
      const studentsWithProfiles = await Promise.all(
        studentUsers.map(async (user) => {
          try {
            const { data: profile } = await axiosInstance.get(`/profile?userId=${user._id}`);
            return { ...user, profile };
          } catch {
            return { ...user, profile: null };
          }
        })
      );

      // Filter by coordinator's department
      const coordinatorDepartment = userInfo?.department;
      if (!coordinatorDepartment) {
        console.warn('Coordinator department not found');
        setAllStudents([]);
        return;
      }
      
      const filtered = studentsWithProfiles.filter(student => {
        // Check both branch and department fields, with case-insensitive comparison
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

      setAllStudents(filtered);
    } catch (error) {
      console.error('Error fetching students:', error);
      setAllStudents([]);
    }
  };

  const applyStudentFilters = () => {
    let filtered = [...allStudents];

    if (studentFilters.minCGPA) {
      filtered = filtered.filter(student => {
        const cgpa = student.profile?.education?.current?.cgpa;
        return cgpa && cgpa >= parseFloat(studentFilters.minCGPA);
      });
    }

    if (studentFilters.maxCGPA) {
      filtered = filtered.filter(student => {
        const cgpa = student.profile?.education?.current?.cgpa;
        return cgpa && cgpa <= parseFloat(studentFilters.maxCGPA);
      });
    }

    if (studentFilters.branch) {
      filtered = filtered.filter(student => {
        const branch = student.profile?.education?.current?.branch;
        return branch === studentFilters.branch;
      });
    }

    if (studentFilters.passoutYear) {
      filtered = filtered.filter(student => {
        const passoutBatch = student.profile?.education?.current?.passoutBatch;
        return passoutBatch === studentFilters.passoutYear;
      });
    }

    if (studentFilters.skills) {
      const requiredSkills = studentFilters.skills.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter(student => {
        const studentSkills = student.profile?.skills?.technical || [];
        const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
        return requiredSkills.some(skill => 
          studentSkillsLower.some(ss => ss.includes(skill))
        );
      });
    }

    setFilteredStudentsList(filtered);
  };

  const fetchDrives = async () => {
    try {
      const { data } = await axiosInstance.get('/drives');
      // Backend already filters drives for coordinators, so use the data directly
      // Only apply additional filtering if needed for consistency
      setDrives(data || []);
    } catch (error) {
      console.error('Error fetching drives:', error);
      setDrives([]);
    }
  };

  return (
    <CoordinatorLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Placement Drives
        </Typography>

        <Grid container spacing={3}>
          {drives.map((drive) => (
            <Grid item xs={12} md={6} key={drive._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5">{drive.companyName}</Typography>
                    <Chip
                      label={drive.status}
                      color={drive.status === 'Active' ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {drive.jobRole}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {drive.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {drive.jobDescription}
                  </Typography>
                  {drive.salary && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Salary:</strong> {drive.salary}
                    </Typography>
                  )}
                  {drive.workMode && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Work Mode:</strong> {drive.workMode}
                    </Typography>
                  )}
                  {drive.eligibilityCriteria && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Eligibility:</strong> {drive.eligibilityCriteria}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Created by: {drive.createdBy?.name || 'Admin'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Person />}
                      onClick={() => {
                        setSelectedDrive(drive);
                        setStudentFilters({
                          minCGPA: '',
                          maxCGPA: '',
                          branch: '',
                          passoutYear: '',
                          skills: '',
                        });
                        // Show all students initially
                        setFilteredStudentsList(allStudents);
                        setOpenFilterDialog(true);
                      }}
                      sx={{ flex: 1, minWidth: '120px' }}
                    >
                      Filter Students
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={() => {
                        setSelectedDrive(drive);
                        setOpenShareDialog(true);
                      }}
                      sx={{ flex: 1, minWidth: '120px' }}
                    >
                      Share Drive
                    </Button>
                    {drive.sharedWith && drive.sharedWith.length > 0 && (
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<People />}
                        onClick={() => {
                          setSelectedDrive(drive);
                          setOpenSharedStudentsDialog(true);
                        }}
                        sx={{ flex: 1, minWidth: '120px' }}
                      >
                        View Shared ({drive.sharedWith.length})
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {drives.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No drives available
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Share Drive Dialog */}
        <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Share Drive with Students</DialogTitle>
          <DialogContent>
            <Tabs value={shareTab} onChange={(e, newValue) => setShareTab(newValue)} sx={{ mb: 2 }}>
              <Tab label="By Criteria" />
              <Tab label="Select Students" />
            </Tabs>

            {shareTab === 0 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Minimum CGPA"
                      type="number"
                      value={shareCriteria.minCGPA}
                      onChange={(e) => setShareCriteria({ ...shareCriteria, minCGPA: e.target.value })}
                      inputProps={{ min: 0, max: 10, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Maximum CGPA"
                      type="number"
                      value={shareCriteria.maxCGPA}
                      onChange={(e) => setShareCriteria({ ...shareCriteria, maxCGPA: e.target.value })}
                      inputProps={{ min: 0, max: 10, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Branches</InputLabel>
                      <Select
                        multiple
                        value={shareCriteria.branches}
                        onChange={(e) => setShareCriteria({ ...shareCriteria, branches: e.target.value })}
                        label="Branches"
                      >
                        {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'].map((branch) => (
                          <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Programs</InputLabel>
                      <Select
                        multiple
                        value={shareCriteria.programs}
                        onChange={(e) => setShareCriteria({ ...shareCriteria, programs: e.target.value })}
                        label="Programs"
                      >
                        {['B.Tech', 'M.Tech', 'MBA'].map((program) => (
                          <MenuItem key={program} value={program}>{program}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Passout Years (comma separated)"
                      value={shareCriteria.passoutYears.join(', ')}
                      onChange={(e) => setShareCriteria({ 
                        ...shareCriteria, 
                        passoutYears: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                      })}
                      placeholder="2024, 2025, 2026"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Required Skills (comma separated)"
                      value={shareCriteria.requiredSkills.join(', ')}
                      onChange={(e) => setShareCriteria({ 
                        ...shareCriteria, 
                        requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                      })}
                      placeholder="JavaScript, Python, React"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {shareTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Select students to share with:
                </Typography>
                {allStudents
                  .filter(student => {
                    // Filter by department if needed
                    return true;
                  })
                  .map((student) => (
                    <FormControlLabel
                      key={student._id}
                      control={
                        <Checkbox
                          checked={selectedStudents.includes(student._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student._id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                            }
                          }}
                        />
                      }
                      label={`${student.name} (${student.email})`}
                    />
                  ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenShareDialog(false);
              setSelectedDrive(null);
              setShareCriteria({
                minCGPA: '',
                maxCGPA: '',
                branches: [],
                programs: [],
                passoutYears: [],
                requiredSkills: [],
              });
              setSelectedStudents([]);
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  const payload = shareTab === 0 
                    ? { shareCriteria: Object.fromEntries(
                        Object.entries(shareCriteria).map(([k, v]) => [
                          k, 
                          Array.isArray(v) ? v : (v === '' ? undefined : (k.includes('CGPA') ? parseFloat(v) : v))
                        ])
                      ) }
                    : { studentIds: selectedStudents };

                  await axiosInstance.post(`/drives/${selectedDrive._id}/share`, payload);
                  toast.success('Drive shared successfully');
                  setOpenShareDialog(false);
                  setSelectedDrive(null);
                  setShareCriteria({
                    minCGPA: '',
                    maxCGPA: '',
                    branches: [],
                    programs: [],
                    passoutYears: [],
                    requiredSkills: [],
                  });
                  setSelectedStudents([]);
                  fetchDrives(); // Refresh drives to update shared count
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Failed to share drive');
                }
              }}
            >
              Share
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filter Students Dialog */}
        <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Filter Students for {selectedDrive?.companyName} - {selectedDrive?.jobRole}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Apply filters to view students:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minimum CGPA"
                    type="number"
                    value={studentFilters.minCGPA}
                    onChange={(e) => setStudentFilters({ ...studentFilters, minCGPA: e.target.value })}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum CGPA"
                    type="number"
                    value={studentFilters.maxCGPA}
                    onChange={(e) => setStudentFilters({ ...studentFilters, maxCGPA: e.target.value })}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={studentFilters.branch}
                      onChange={(e) => setStudentFilters({ ...studentFilters, branch: e.target.value })}
                      label="Branch"
                    >
                      <MenuItem value="">All Branches</MenuItem>
                      {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT'].map((branch) => (
                        <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Passout Year"
                    value={studentFilters.passoutYear}
                    onChange={(e) => setStudentFilters({ ...studentFilters, passoutYear: e.target.value })}
                    placeholder="2024"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Skills (comma separated)"
                    value={studentFilters.skills}
                    onChange={(e) => setStudentFilters({ ...studentFilters, skills: e.target.value })}
                    placeholder="JavaScript, Python, React"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={applyStudentFilters}
                    fullWidth
                  >
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {(filteredStudentsList.length > 0 || !Object.values(studentFilters).some(v => v)) && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  {Object.values(studentFilters).some(v => v) 
                    ? `Filtered Students (${filteredStudentsList.length}):`
                    : `All Students (${allStudents.length}):`}
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Branch</strong></TableCell>
                        <TableCell><strong>CGPA</strong></TableCell>
                        <TableCell><strong>Passout Year</strong></TableCell>
                        <TableCell><strong>Skills</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(Object.values(studentFilters).some(v => v) ? filteredStudentsList : allStudents).map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.profile?.education?.current?.branch || 'N/A'}</TableCell>
                          <TableCell>{student.profile?.education?.current?.cgpa || 'N/A'}</TableCell>
                          <TableCell>{student.profile?.education?.current?.passoutBatch || 'N/A'}</TableCell>
                          <TableCell>
                            {(student.profile?.skills?.technical || []).slice(0, 3).join(', ')}
                            {(student.profile?.skills?.technical || []).length > 3 && '...'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {filteredStudentsList.length === 0 && Object.values(studentFilters).some(v => v) && (
              <Paper sx={{ p: 2, textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No students match the filter criteria
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenFilterDialog(false);
              setSelectedDrive(null);
              setStudentFilters({
                minCGPA: '',
                maxCGPA: '',
                branch: '',
                passoutYear: '',
                skills: '',
              });
              setFilteredStudentsList([]);
            }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Shared Students Dialog */}
        <Dialog open={openSharedStudentsDialog} onClose={() => setOpenSharedStudentsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Students Shared With - {selectedDrive?.companyName} - {selectedDrive?.jobRole}
          </DialogTitle>
          <DialogContent>
            {selectedDrive?.sharedWith && selectedDrive.sharedWith.length > 0 ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Total Students: {selectedDrive.sharedWith.length}
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Shared Date</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDrive.sharedWith.map((shared, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {shared.student?.name || 'Unknown Student'}
                          </TableCell>
                          <TableCell>
                            {shared.student?.email || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {shared.sharedAt 
                              ? new Date(shared.sharedAt).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No students shared yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Share this drive with students using the "Share Drive" button.
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenSharedStudentsDialog(false);
              setSelectedDrive(null);
            }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CoordinatorLayout>
  );
};

export default CoordinatorDrivesPage;

