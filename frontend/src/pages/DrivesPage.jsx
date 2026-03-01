import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Fade,
} from '@mui/material';
import { Add, Delete, Edit, Launch } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const neuBg = '#0f1b2d';
const neuCard = '#13243c';
const neuBorder = 'rgba(255,255,255,0.06)';

const emptyForm = {
  companyName: '',
  jobRole: '',
  jobDescription: '',
  location: '',
  stipend: '',
  salary: '',
  experienceRequired: '',
  qualification: '',
  eligibilityCriteria: '',
  serviceAgreement: { required: false, details: '' },
  shift: '',
  workMode: 'Onsite',
  applicationLink: '',
  department: '',
};

const DrivesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [drives, setDrives] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [coordinators, setCoordinators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchDrives();
    if (userInfo?.role === 'ADMIN') {
      fetchCoordinators();
    }
  }, [userInfo]);

  const fetchCoordinators = async () => {
    try {
      const { data } = await axiosInstance.get('/coordinators');
      setCoordinators(data);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
    }
  };

  const fetchDrives = async () => {
    try {
      const { data } = await axiosInstance.get('/drives');
      setDrives(data);
    } catch (error) {
      console.error('Error fetching drives:', error);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setSelectedDrive(null);
  };

  const handleCreateDrive = async () => {
    try {
      await axiosInstance.post('/drives', { ...formData, status: 'Active' });
      toast.success('Drive created successfully');
      setOpenDialog(false);
      resetForm();
      fetchDrives();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create drive');
    }
  };

  const handleApply = async () => {
    try {
      await axiosInstance.post('/applications', {
        driveId: selectedDrive._id,
        documents: [],
      });
      toast.success('Application submitted successfully');
      setOpenApplyDialog(false);
      setSelectedDrive(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (window.confirm('Are you sure you want to delete this drive?')) {
      try {
        await axiosInstance.delete(`/drives/${driveId}`);
        toast.success('Drive deleted successfully');
        fetchDrives();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete drive');
      }
    }
  };

  const handleEditDrive = (drive) => {
    setSelectedDrive(drive);
    setIsEditing(true);
    setFormData({
      companyName: drive.companyName || '',
      jobRole: drive.jobRole || '',
      jobDescription: drive.jobDescription || '',
      location: drive.location || '',
      stipend: drive.stipend || '',
      salary: drive.salary || '',
      experienceRequired: drive.experienceRequired || '',
      qualification: drive.qualification || '',
      eligibilityCriteria: drive.eligibilityCriteria || '',
      serviceAgreement: drive.serviceAgreement || { required: false, details: '' },
      shift: drive.shift || '',
      workMode: drive.workMode || 'Onsite',
      applicationLink: drive.applicationLink || '',
      department: drive.department || '',
    });
    setOpenDialog(true);
  };

  const handleUpdateDrive = async () => {
    try {
      await axiosInstance.put(`/drives/${selectedDrive._id}`, formData);
      toast.success('Drive updated successfully');
      setOpenDialog(false);
      resetForm();
      fetchDrives();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update drive');
    }
  };

  const filteredDrives = drives.filter((drive) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      drive.companyName?.toLowerCase().includes(search) ||
      drive.jobRole?.toLowerCase().includes(search) ||
      drive.location?.toLowerCase().includes(search);

    const matchesStatus = !statusFilter || drive.status === statusFilter;
    const matchesDept = !departmentFilter || drive.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: neuBg,
        borderRadius: 4,
        p: 2,
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 3,
          animation: 'fadeIn 0.6s ease',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#e5ecff',
            letterSpacing: 0.4,
          }}
        >
          Placement Drives
        </Typography>

        {userInfo?.role === 'ADMIN' && (
          <Button
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: neuCard,
              color: '#fff',
              borderRadius: '14px',
              px: 3,
              transition: 'all 0.25s ease',
              border: `1px solid ${neuBorder}`,
              '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                background: '#1b3560',
              },
            }}
          >
            Create Drive
          </Button>
        )}
      </Stack>

      {userInfo?.role === 'ADMIN' && (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            placeholder="Search by company, role, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ sx: { color: '#9fb4ff' } }}
            InputProps={{
              sx: {
                color: '#fff',
                background: '#0f1b2d',
                borderRadius: '10px',
              },
            }}
          />
          <FormControl
            size="small"
            sx={{
              minWidth: 140,
              '& .MuiInputBase-root': {
                color: '#fff',
                background: '#0f1b2d',
                borderRadius: '10px',
              },
            }}
          >
            <InputLabel sx={{ color: '#9fb4ff' }}>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{
              minWidth: 160,
              '& .MuiInputBase-root': {
                color: '#fff',
                background: '#0f1b2d',
                borderRadius: '10px',
              },
            }}
          >
            <InputLabel sx={{ color: '#9fb4ff' }}>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {[...new Set(drives.map((d) => d.department).filter(Boolean))].map(
                (dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Cards */}
      <Grid container spacing={2}>
        {filteredDrives.map((drive) => (
          <Grid item xs={12} md={6} key={drive._id}>
            <Fade in timeout={500}>
              <Card
                sx={{
                  height: '100%',
                  background: neuCard,
                  borderRadius: '18px',
                  border: `1px solid ${neuBorder}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.01)',
                    background: '#1b3560',
                  },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: '#e5ecff', fontWeight: 600 }}
                      >
                        {drive.companyName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#9fb4ff' }}
                      >
                        {drive.jobRole}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={drive.status}
                        sx={{
                          background:
                            drive.status === 'Active'
                              ? 'rgba(46,213,115,0.15)'
                              : 'rgba(255,255,255,0.08)',
                          color:
                            drive.status === 'Active'
                              ? '#2ed573'
                              : '#cfd8ff',
                        }}
                      />

                      {userInfo?.role === 'ADMIN' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditDrive(drive)}
                            sx={{ color: '#9fb4ff' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteDrive(drive._id)
                            }
                            sx={{ color: '#ff6b6b' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{ color: '#cfd8ff', mt: 1 }}
                  >
                    📍 {drive.location}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: '#e5ecff', mt: 1 }}
                  >
                    {drive.jobDescription}
                  </Typography>

                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {drive.salary && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#9fb4ff' }}
                      >
                        Salary: {drive.salary}
                      </Typography>
                    )}
                    {drive.stipend && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#9fb4ff' }}
                      >
                        Stipend: {drive.stipend}
                      </Typography>
                    )}
                    {drive.workMode && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#9fb4ff' }}
                      >
                        Mode: {drive.workMode}
                      </Typography>
                    )}
                    {drive.eligibilityCriteria && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#9fb4ff' }}
                      >
                        Eligibility: {drive.eligibilityCriteria}
                      </Typography>
                    )}
                  </Stack>

                  <Stack spacing={1.2} sx={{ mt: 2 }}>
                    {userInfo?.role === 'STUDENT' &&
                      drive.status === 'Active' && (
                        <Button
                          fullWidth
                          onClick={() => {
                            setSelectedDrive(drive);
                            setOpenApplyDialog(true);
                          }}
                          sx={{
                            background: '#0f1b2d',
                            color: '#fff',
                            borderRadius: '12px',
                            border: `1px solid ${neuBorder}`,
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              transform: 'scale(1.03)',
                              background: '#1b3560',
                            },
                          }}
                        >
                          Apply Now
                        </Button>
                      )}

                    {drive.applicationLink && (
                      <Button
                        fullWidth
                        href={drive.applicationLink}
                        target="_blank"
                        startIcon={<Launch />}
                        sx={{
                          color: '#9fb4ff',
                          borderRadius: '12px',
                          border: `1px solid ${neuBorder}`,
                          '&:hover': {
                            background: 'rgba(255,255,255,0.05)',
                          },
                        }}
                      >
                        External Application
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Create / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: neuCard,
            borderRadius: '18px',
            border: `1px solid ${neuBorder}`,
          },
        }}
      >
        <DialogTitle sx={{ color: '#e5ecff' }}>
          {isEditing ? 'Edit Drive' : 'Create New Drive'}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[
              { label: 'Company Name', key: 'companyName', md: 6 },
              { label: 'Job Role', key: 'jobRole', md: 6 },
              { label: 'Location', key: 'location', md: 6 },
              { label: 'Salary', key: 'salary', md: 6 },
              { label: 'Stipend', key: 'stipend', md: 6 },
              {
                label: 'Experience Required',
                key: 'experienceRequired',
                md: 6,
              },
              { label: 'Qualification', key: 'qualification', md: 6 },
            ].map((f) => (
              <Grid item xs={12} md={f.md} key={f.key}>
                <TextField
                  fullWidth
                  label={f.label}
                  value={formData[f.key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [f.key]: e.target.value,
                    })
                  }
                  InputLabelProps={{ sx: { color: '#9fb4ff' } }}
                  InputProps={{
                    sx: {
                      color: '#fff',
                      background: '#0f1b2d',
                      borderRadius: '10px',
                    },
                  }}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                value={formData.jobDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobDescription: e.target.value,
                  })
                }
                InputLabelProps={{ sx: { color: '#9fb4ff' } }}
                InputProps={{
                  sx: {
                    color: '#fff',
                    background: '#0f1b2d',
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9fb4ff' }}>
                  Work Mode
                </InputLabel>
                <Select
                  value={formData.workMode}
                  label="Work Mode"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workMode: e.target.value,
                    })
                  }
                  sx={{
                    color: '#fff',
                    background: '#0f1b2d',
                    borderRadius: '10px',
                  }}
                >
                  <MenuItem value="Onsite">Onsite</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9fb4ff' }}>
                  Department
                </InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department: e.target.value,
                    })
                  }
                  sx={{
                    color: '#fff',
                    background: '#0f1b2d',
                    borderRadius: '10px',
                  }}
                >
                  {coordinators.map((c) => (
                    <MenuItem key={c._id} value={c.department}>
                      {c.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Eligibility Criteria"
                multiline
                rows={3}
                value={formData.eligibilityCriteria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eligibilityCriteria: e.target.value,
                  })
                }
                InputLabelProps={{ sx: { color: '#9fb4ff' } }}
                InputProps={{
                  sx: {
                    color: '#fff',
                    background: '#0f1b2d',
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Application Link"
                value={formData.applicationLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicationLink: e.target.value,
                  })
                }
                InputLabelProps={{ sx: { color: '#9fb4ff' } }}
                InputProps={{
                  sx: {
                    color: '#fff',
                    background: '#0f1b2d',
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button sx={{ color: '#9fb4ff' }} onClick={() => {
            setOpenDialog(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button
            onClick={isEditing ? handleUpdateDrive : handleCreateDrive}
            sx={{
              background: '#0f1b2d',
              color: '#fff',
              borderRadius: '12px',
              px: 3,
              '&:hover': { background: '#1b3560' },
            }}
          >
            {isEditing ? 'Update Drive' : 'Create Drive'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog
        open={openApplyDialog}
        onClose={() => setOpenApplyDialog(false)}
        PaperProps={{
          sx: {
            background: neuCard,
            borderRadius: '16px',
            border: `1px solid ${neuBorder}`,
          },
        }}
      >
        <DialogTitle sx={{ color: '#e5ecff' }}>
          Apply to Drive
        </DialogTitle>

        <DialogContent>
          {selectedDrive && (
            <Box>
              <Typography sx={{ color: '#e5ecff', fontWeight: 600 }}>
                {selectedDrive.companyName}
              </Typography>
              <Typography sx={{ color: '#9fb4ff' }}>
                {selectedDrive.jobRole}
              </Typography>
              <Typography sx={{ color: '#cfd8ff', mt: 2 }}>
                Are you sure you want to apply for this position?
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button sx={{ color: '#9fb4ff' }} onClick={() => setOpenApplyDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            sx={{
              background: '#0f1b2d',
              color: '#fff',
              borderRadius: '12px',
              '&:hover': { background: '#1b3560' },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Local animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default DrivesPage;