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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { Share, Person, People, Search } from '@mui/icons-material';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

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

  const getStudentSkills = (student) => {
    const skills = [];
    const skillsData = student.profile?.skills;
    if (!skillsData) return skills;

    // New structured format: sections: [{ name, items: [] }]
    if (Array.isArray(skillsData.sections)) {
      skillsData.sections.forEach((section) => {
        if (Array.isArray(section.items)) {
          section.items.forEach((item) => {
            if (typeof item === 'string') {
              skills.push(item);
            } else if (item && typeof item === 'object' && item.name) {
              skills.push(item.name);
            }
          });
        }
      });
    }

    // Backwards compatibility: old technical / languages arrays
    if (Array.isArray(skillsData.technical)) {
      skills.push(...skillsData.technical);
    }
    if (Array.isArray(skillsData.languages)) {
      skills.push(...skillsData.languages);
    }

    // De-duplicate while preserving order
    return [...new Set(skills.filter(Boolean))];
  };

  const applyStudentFilters = () => {
    const min = studentFilters.minCGPA ? parseFloat(studentFilters.minCGPA) : null;
    const max = studentFilters.maxCGPA ? parseFloat(studentFilters.maxCGPA) : null;

    if (min != null && (min < 0 || min > 10)) {
      toast.error('Minimum CGPA must be between 0 and 10');
      return;
    }
    if (max != null && (max < 0 || max > 10)) {
      toast.error('Maximum CGPA must be between 0 and 10');
      return;
    }
    if (min != null && max != null && min > max) {
      toast.error('Minimum CGPA cannot be greater than maximum CGPA');
      return;
    }

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
      const requiredSkills = studentFilters.skills
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      filtered = filtered.filter(student => {
        const studentSkills = getStudentSkills(student).map((s) => s.toLowerCase());
        if (!studentSkills.length || !requiredSkills.length) return false;
        return requiredSkills.some((skill) =>
          studentSkills.some((ss) => ss.includes(skill))
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

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || drive.status === filterStatus;
    const matchesRole = !filterRole || (drive.jobRole && drive.jobRole.toLowerCase().includes(filterRole.toLowerCase()));
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <CoordinatorLayout>
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 800, mb: 3, color: '#e5e7eb', letterSpacing: 0.3 }}
        >
          Placement Drives
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by company, role, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              flex: '1 1 280px',
              '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,23,42,0.9)', color: '#e5e7eb' },
              '& .MuiInputLabel-root': { color: '#d1d5db' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#d1d5db' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,23,42,0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#374151' } }} >
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setStatusMenuOpen(false);
              }}
              label="Status"
              open={statusMenuOpen}
              onOpen={() => setStatusMenuOpen(true)}
              onClose={() => setStatusMenuOpen(false)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15,23,42,0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#374151' } }} >
            <InputLabel>Job Role</InputLabel>
            <Select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setRoleMenuOpen(false);
              }}
              label="Job Role"
              open={roleMenuOpen}
              onOpen={() => setRoleMenuOpen(true)}
              onClose={() => setRoleMenuOpen(false)}
            >
              <MenuItem value="">All</MenuItem>
              {[...new Set(drives.map((d) => d.jobRole).filter(Boolean))].map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {filteredDrives.map((drive) => (
            <Grid item xs={12} md={6} key={drive._id}>
              <Card
                sx={{
                  bgcolor: 'rgba(15,23,42,0.96)',
                  borderRadius: 3,
                  border: '1px solid rgba(148,163,184,0.35)',
                  boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#e5e7eb', fontWeight: 700 }}>
                      {drive.companyName}
                    </Typography>
                    <Chip
                      label={drive.status}
                      sx={{
                        bgcolor:
                          drive.status === 'Active'
                            ? 'rgba(34,197,94,0.9)'
                            : 'rgba(55,65,81,0.9)',
                        color: '#f9fafb',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: '#38bdf8', fontWeight: 600 }}
                  >
                    {drive.jobRole}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, color: 'rgba(226,232,240,0.9)' }}
                  >
                    {drive.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: '#e5e7eb' }}>
                    <strong>Description:</strong> {drive.jobDescription}
                  </Typography>
                  {drive.salary && (
                    <Typography variant="body2" sx={{ mb: 1, color: '#e5e7eb' }}>
                      <strong>Salary:</strong> {drive.salary}
                    </Typography>
                  )}
                  {drive.workMode && (
                    <Typography variant="body2" sx={{ mb: 1, color: '#e5e7eb' }}>
                      <strong>Work Mode:</strong> {drive.workMode}
                    </Typography>
                  )}
                  {drive.eligibilityCriteria && (
                    <Typography variant="body2" sx={{ mb: 2, color: '#e5e7eb' }}>
                      <strong>Eligibility:</strong> {drive.eligibilityCriteria}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mb: 2, color: 'rgba(226,232,240,0.9)' }}
                  >
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
                      sx={{
                        flex: 1,
                        minWidth: '120px',
                        borderColor: 'rgba(148,163,184,0.6)',
                        color: '#e5e7eb',
                        '&:hover': {
                          borderColor: '#38bdf8',
                          bgcolor: 'rgba(37,99,235,0.25)',
                        },
                      }}
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
                      sx={{
                        flex: 1,
                        minWidth: '120px',
                        borderColor: 'rgba(148,163,184,0.6)',
                        color: '#e5e7eb',
                        '&:hover': {
                          borderColor: '#38bdf8',
                          bgcolor: 'rgba(37,99,235,0.25)',
                        },
                      }}
                    >
                      Share Drive
                    </Button>
                    {drive.sharedWith && drive.sharedWith.length > 0 && (
                      <Button
                        variant="outlined"
                        startIcon={<People />}
                        onClick={() => {
                          setSelectedDrive(drive);
                          setOpenSharedStudentsDialog(true);
                        }}
                        sx={{
                          flex: 1,
                          minWidth: '120px',
                          borderColor: '#38bdf8',
                          color: '#38bdf8',
                          '&:hover': {
                            borderColor: '#7dd3fc',
                            bgcolor: 'rgba(56,189,248,0.16)',
                          },
                        }}
                      >
                        View Shared ({drive.sharedWith.length})
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filteredDrives.length === 0 && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'rgba(15,23,42,0.96)',
                  borderRadius: 3,
                  border: '1px solid rgba(148,163,184,0.4)',
                  boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
                }}
              >
                <Typography variant="h6" sx={{ color: 'rgba(148,163,184,0.95)' }}>
                  No drives available
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Share Drive Dialog */}
        <Dialog
          open={openShareDialog}
          onClose={() => setOpenShareDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(15,23,42,0.98)',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.5)',
              color: '#e5e7eb',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Share Drive with Students</DialogTitle>
          <DialogContent>
            <Tabs
              value={shareTab}
              onChange={(e, newValue) => setShareTab(newValue)}
              sx={{ mb: 2 }}
              textColor="primary"
              indicatorColor="primary"
            >
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
                  const min = shareCriteria.minCGPA ? parseFloat(shareCriteria.minCGPA) : null;
                  const max = shareCriteria.maxCGPA ? parseFloat(shareCriteria.maxCGPA) : null;
                  if (min != null && (min < 0 || min > 10)) {
                    toast.error('Minimum CGPA must be between 0 and 10');
                    return;
                  }
                  if (max != null && (max < 0 || max > 10)) {
                    toast.error('Maximum CGPA must be between 0 and 10');
                    return;
                  }
                  if (min != null && max != null && min > max) {
                    toast.error('Minimum CGPA cannot be greater than maximum CGPA');
                    return;
                  }
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
        <Dialog
          open={openFilterDialog}
          onClose={() => setOpenFilterDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(15,23,42,0.98)',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.5)',
              color: '#e5e7eb',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Filter Students for {selectedDrive?.companyName} - {selectedDrive?.jobRole}
          </DialogTitle>
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
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 400,
                    bgcolor: 'rgba(15,23,42,0.96)',
                    borderRadius: 3,
                    border: '1px solid rgba(148,163,184,0.4)',
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Name</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Branch</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>CGPA</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Passout Year</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Skills</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(Object.values(studentFilters).some(v => v) ? filteredStudentsList : allStudents).map((student) => (
                        <TableRow
                          key={student._id}
                          sx={{ '&:hover': { bgcolor: 'rgba(30,64,175,0.35)' } }}
                        >
                          <TableCell sx={{ color: '#e5e7eb' }}>{student.name}</TableCell>
                          <TableCell sx={{ color: 'rgba(209,213,219,0.9)' }}>{student.email}</TableCell>
                          <TableCell sx={{ color: 'rgba(148,163,184,0.9)' }}>
                            {student.profile?.education?.current?.branch || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(148,163,184,0.9)' }}>
                            {student.profile?.education?.current?.cgpa || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(148,163,184,0.9)' }}>
                            {student.profile?.education?.current?.passoutBatch || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(209,213,219,0.9)' }}>
                            {(() => {
                              const skills = getStudentSkills(student);
                              return [
                                skills.slice(0, 3).join(', '),
                                skills.length > 3 ? '...' : '',
                              ].join('');
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {filteredStudentsList.length === 0 && Object.values(studentFilters).some(v => v) && (
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  mt: 2,
                  bgcolor: 'rgba(15,23,42,0.96)',
                  borderRadius: 3,
                  border: '1px solid rgba(148,163,184,0.4)',
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.95)' }}>
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
        <Dialog
          open={openSharedStudentsDialog}
          onClose={() => setOpenSharedStudentsDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(15,23,42,0.98)',
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.5)',
              color: '#e5e7eb',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Students Shared With - {selectedDrive?.companyName} - {selectedDrive?.jobRole}
          </DialogTitle>
          <DialogContent>
            {selectedDrive?.sharedWith && selectedDrive.sharedWith.length > 0 ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'rgba(209,213,219,0.95)' }}>
                  Total Students: {selectedDrive.sharedWith.length}
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 400,
                    bgcolor: 'rgba(15,23,42,0.96)',
                    borderRadius: 3,
                    border: '1px solid rgba(148,163,184,0.4)',
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Name</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 700 }}>Shared Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDrive.sharedWith.map((shared, index) => (
                        <TableRow
                          key={index}
                          sx={{ '&:hover': { bgcolor: 'rgba(30,64,175,0.35)' } }}
                        >
                          <TableCell sx={{ color: '#e5e7eb' }}>
                            {shared.student?.name || 'Unknown Student'}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(209,213,219,0.9)' }}>
                            {shared.student?.email || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(148,163,184,0.9)' }}>
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
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'rgba(15,23,42,0.96)',
                  borderRadius: 3,
                  border: '1px solid rgba(148,163,184,0.4)',
                }}
              >
                <People sx={{ fontSize: 60, color: 'rgba(148,163,184,0.9)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'rgba(148,163,184,0.95)' }}>
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

