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
  Paper,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const DrivesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [drives, setDrives] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [formData, setFormData] = useState({
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
  });
  const [coordinators, setCoordinators] = useState([]);

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

  const handleCreateDrive = async () => {
    try {
      await axiosInstance.post('/drives', { ...formData, status: 'Active' });
      toast.success('Drive created successfully');
      setOpenDialog(false);
      setFormData({
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
      });
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
    if (window.confirm('Are you sure you want to delete this drive? This action cannot be undone.')) {
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
      setIsEditing(false);
      setSelectedDrive(null);
      setFormData({
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
      });
      fetchDrives();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update drive');
    }
  };

  return (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Placement Drives
          </Typography>
          {userInfo?.role === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Create Drive
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {drives.map((drive) => (
            <Grid item xs={12} md={6} key={drive._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5">{drive.companyName}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={drive.status}
                        color={drive.status === 'Active' ? 'success' : 'default'}
                      />
                      {userInfo?.role === 'ADMIN' && (
                        <>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditDrive(drive)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteDrive(drive._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Box>
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
                  {drive.stipend && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Stipend:</strong> {drive.stipend}
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
                  {userInfo?.role === 'STUDENT' && drive.status === 'Active' && (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setSelectedDrive(drive);
                        setOpenApplyDialog(true);
                      }}
                    >
                      Apply Now
                    </Button>
                  )}
                  {drive.applicationLink && (
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 1 }}
                      href={drive.applicationLink}
                      target="_blank"
                    >
                      External Application Link
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Create/Edit Drive Dialog */}
        <Dialog open={openDialog} onClose={() => {
          setOpenDialog(false);
          setIsEditing(false);
          setSelectedDrive(null);
          setFormData({
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
          });
        }} maxWidth="md" fullWidth>
          <DialogTitle>{isEditing ? 'Edit Drive' : 'Create New Drive'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Role"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Description"
                  multiline
                  rows={4}
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Work Mode</InputLabel>
                  <Select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    label="Work Mode"
                  >
                    <MenuItem value="Onsite">Onsite</MenuItem>
                    <MenuItem value="Remote">Remote</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stipend"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Experience Required"
                  value={formData.experienceRequired}
                  onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Eligibility Criteria"
                  multiline
                  rows={3}
                  value={formData.eligibilityCriteria}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Application Link"
                  value={formData.applicationLink}
                  onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    label="Department"
                  >
                    {coordinators.map((coord) => (
                      <MenuItem key={coord._id} value={coord.department}>
                        {coord.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              setIsEditing(false);
              setSelectedDrive(null);
              setFormData({
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
              });
            }}>Cancel</Button>
            <Button onClick={isEditing ? handleUpdateDrive : handleCreateDrive} variant="contained">
              {isEditing ? 'Update Drive' : 'Create Drive'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog open={openApplyDialog} onClose={() => setOpenApplyDialog(false)}>
          <DialogTitle>Apply to Drive</DialogTitle>
          <DialogContent>
            {selectedDrive && (
              <Box>
                <Typography variant="h6">{selectedDrive.companyName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDrive.jobRole}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Are you sure you want to apply for this position?
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenApplyDialog(false)}>Cancel</Button>
            <Button onClick={handleApply} variant="contained">
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default DrivesPage;

