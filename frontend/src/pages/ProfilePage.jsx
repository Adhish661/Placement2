import { useState, useEffect } from 'react';
import RoleBasedLayout from '../components/RoleBasedLayout';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  PhotoCamera,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

const branchOptions = ['CSE', 'ECE', 'MECH', 'EEE', 'DS', 'R&AI', 'CIVIL'];
const programOptions = ['B.Tech', 'M.Tech'];
const gradingTypeOptions = ['Percentage', 'CGPA', 'Grade'];
const LIGHT_GREY = 'rgba(209,213,219,0.95)';
const formAccentSx = {
  '& .MuiInputLabel-root': { color: LIGHT_GREY },
  '& .MuiInputBase-input::placeholder': { color: LIGHT_GREY, opacity: 1 },
  '& .MuiSvgIcon-root': { color: LIGHT_GREY },
};
const isValidMediaUrl = (url) =>
  typeof url === 'string' && (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'));

const ProfilePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [openAccomplishmentDialog, setOpenAccomplishmentDialog] = useState(false);
  const [openExperienceDialog, setOpenExperienceDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchProjects();
    fetchAccomplishments();
    fetchExperiences();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get('/profile');
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await axiosInstance.get('/profile/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAccomplishments = async () => {
    try {
      const { data } = await axiosInstance.get('/profile/accomplishments');
      setAccomplishments(data);
    } catch (error) {
      console.error('Error fetching accomplishments:', error);
    }
  };

  const fetchExperiences = async () => {
    try {
      const { data } = await axiosInstance.get('/profile/experiences');
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }
  };

  const handleSaveBasicDetails = async (formData) => {
    try {
      await axiosInstance.put('/profile/basic-details', formData);
      toast.success('Basic details updated');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update basic details');
    }
  };

  const handleSaveEducation = async (formData) => {
    try {
      await axiosInstance.put('/profile/education', formData);
      toast.success('Education details updated');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update education');
    }
  };

  const handleSaveSkills = async (skills) => {
    try {
      await axiosInstance.put('/profile/skills', skills);
      toast.success('Skills updated');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update skills');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      await axiosInstance.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile photo updated');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const paperSx = {
    p: 3,
    mb: 3,
    bgcolor: 'rgba(15,23,42,0.96)',
    border: '1px solid rgba(148,163,184,0.35)',
    borderRadius: 3,
    boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
    transition: 'all 0.3s ease',
  };

  return (
    <RoleBasedLayout>
      <Box sx={{ animation: 'fadeIn 0.4s ease-out', ...formAccentSx }}>
        <Helmet>
          <title>My Profile | IES Career Connect</title>
          <meta
            name="description"
            content="Manage your education, skills, projects, and experience in IES Career Connect."
          />
        </Helmet>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mb: 3, color: '#e5e7eb' }}>
          My Profile
        </Typography>

        {/* Profile Photo Section */}
        <Paper sx={{ ...paperSx, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: LIGHT_GREY }}>
            Profile Photo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={isValidMediaUrl(profile?.profilePhoto?.url) ? profile?.profilePhoto?.url : undefined}
              sx={{ width: 100, height: 100 }}
            >
              {!profile?.profilePhoto?.url && profile?.basicDetails?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<PhotoCamera />}
                  disabled={uploadingPhoto}
                  sx={{
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
                  }}
                >
                  {uploadingPhoto ? 'Uploading...' : profile?.profilePhoto?.url ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </label>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ ...paperSx, mb: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': { color: LIGHT_GREY },
              '& .Mui-selected': { color: '#38bdf8' },
              '& .MuiTabs-indicator': { backgroundColor: '#38bdf8' },
            }}
          >
            <Tab label="Basic Details" />
            <Tab label="Education" />
            <Tab label="Skills & Languages" />
            <Tab label="Projects" />
            <Tab label="Accomplishments" />
            <Tab label="Experience" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <BasicDetailsTab
                profile={profile}
                onSave={handleSaveBasicDetails}
              />
            )}
            {tabValue === 1 && (
              <EducationTab
                profile={profile}
                onSave={handleSaveEducation}
              />
            )}
            {tabValue === 2 && (
              <SkillsTab
                profile={profile}
                onSave={handleSaveSkills}
              />
            )}
            {tabValue === 3 && (
              <ProjectsTab
                projects={projects}
                onRefresh={fetchProjects}
              />
            )}
            {tabValue === 4 && (
              <AccomplishmentsTab
                accomplishments={accomplishments}
                onRefresh={fetchAccomplishments}
              />
            )}
            {tabValue === 5 && (
              <ExperiencesTab
                experiences={experiences}
                onRefresh={fetchExperiences}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </RoleBasedLayout>
  );
};

// Basic Details Tab Component
const BasicDetailsTab = ({ profile, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    currentCollege: '',
    contactInfo: {
      phone: '',
      alternatePhone: '',
      personalEmail: '',
      linkedIn: '',
      github: '',
    },
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    currentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (profile?.basicDetails) {
      setFormData({
        fullName: profile.basicDetails.fullName || '',
        dateOfBirth: profile.basicDetails.dateOfBirth
          ? new Date(profile.basicDetails.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: profile.basicDetails.gender || '',
        currentCollege: profile.basicDetails.currentCollege || '',
        contactInfo: profile.basicDetails.contactInfo || {
          phone: '',
          alternatePhone: '',
          personalEmail: '',
          linkedIn: '',
          github: '',
        },
        permanentAddress: profile.basicDetails.permanentAddress || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: '',
        },
        currentAddress: profile.basicDetails.currentAddress || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: '',
        },
      });
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={formAccentSx}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              label="Gender"
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Current College"
            value={formData.currentCollege}
            onChange={(e) => setFormData({ ...formData, currentCollege: e.target.value })}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: LIGHT_GREY }}>
            Contact Information
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.contactInfo.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, phone: e.target.value },
              })
            }
            margin="normal"
            placeholder="Enter phone number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Alternate Phone"
            value={formData.contactInfo.alternatePhone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, alternatePhone: e.target.value },
              })
            }
            margin="normal"
            placeholder="Enter alternate phone"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Personal Email"
            type="email"
            value={formData.contactInfo.personalEmail}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, personalEmail: e.target.value },
              })
            }
            margin="normal"
            placeholder="example@mail.com"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="LinkedIn URL"
            value={formData.contactInfo.linkedIn}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, linkedIn: e.target.value },
              })
            }
            margin="normal"
            placeholder="https://linkedin.com/in/username"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="GitHub URL"
            value={formData.contactInfo.github}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, github: e.target.value },
              })
            }
            margin="normal"
            placeholder="https://github.com/username"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: LIGHT_GREY }}>
            Permanent Address
          </Typography>
        </Grid>
        {Object.keys(formData.permanentAddress).map((key) => (
          <Grid item xs={12} md={6} key={key}>
            <TextField
              fullWidth
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={formData.permanentAddress[key]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  permanentAddress: { ...formData.permanentAddress, [key]: e.target.value },
                })
              }
              margin="normal"
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: LIGHT_GREY }}>
            Current Address
          </Typography>
        </Grid>
        {Object.keys(formData.currentAddress).map((key) => (
          <Grid item xs={12} md={6} key={key}>
            <TextField
              fullWidth
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={formData.currentAddress[key]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentAddress: { ...formData.currentAddress, [key]: e.target.value },
                })
              }
              margin="normal"
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Save Basic Details
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

// Education Tab Component
const EducationTab = ({ profile, onSave }) => {
  const [formData, setFormData] = useState({
      current: {
        institutionName: '',
        department: '',
        program: '',
        branch: '',
        currentSemester: '',
        rollNumber: '',
        passoutBatch: '',
        cgpa: '',
      },
    classX: {
      institution: '',
      board: '',
      program: '',
      educationType: '',
      startingYear: '',
      endingYear: '',
      gradingType: 'Percentage',
      gradeValue: '',
      percentage: '',
    },
    classXII: {
      institution: '',
      board: '',
      program: '',
      branch: '',
      educationType: '',
      startingYear: '',
      endingYear: '',
      gradingType: 'Percentage',
      gradeValue: '',
      percentage: '',
    },
  });
  const [rollNumberError, setRollNumberError] = useState('');

  useEffect(() => {
    if (profile?.education) {
      const current = profile.education.current || {};
      const classX = profile.education.classX || {};
      const classXII = profile.education.classXII || {};
      setFormData({
        current: {
          institutionName: current.institutionName || '',
          department: current.department || '',
          program: current.program || '',
          branch: current.branch || '',
          currentSemester: current.currentSemester || '',
          rollNumber: current.rollNumber || '',
          passoutBatch: current.passoutBatch || '',
          cgpa: current.cgpa ?? '',
        },
        classX: {
          institution: classX.institution || '',
          board: classX.board || '',
          program: classX.program || '',
          educationType: classX.educationType || '',
          startingYear: classX.startingYear ?? '',
          endingYear: classX.endingYear ?? '',
          gradingType: classX.gradingType || (classX.percentage ? 'Percentage' : 'Percentage'),
          gradeValue: classX.gradeValue ?? (classX.percentage ?? ''),
          percentage: classX.percentage ?? '',
        },
        classXII: {
          institution: classXII.institution || '',
          board: classXII.board || '',
          program: classXII.program || '',
          branch: classXII.branch || '',
          educationType: classXII.educationType || '',
          startingYear: classXII.startingYear ?? '',
          endingYear: classXII.endingYear ?? '',
          gradingType: classXII.gradingType || (classXII.percentage ? 'Percentage' : 'Percentage'),
          gradeValue: classXII.gradeValue ?? (classXII.percentage ?? ''),
          percentage: classXII.percentage ?? '',
        },
      });
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.current.rollNumber && !formData.current.rollNumber.toUpperCase().startsWith('IES')) {
      setRollNumberError('Roll number should start with IES');
      toast.error('Roll number should start with IES');
      return;
    }
    const toNumberOrEmpty = (value) => (value === '' ? '' : Number(value));
    const classXPayload = {
      ...formData.classX,
      gradeValue: formData.classX.gradeValue,
      percentage:
        formData.classX.gradingType === 'Percentage'
          ? toNumberOrEmpty(formData.classX.gradeValue)
          : '',
    };
    const classXIIPayload = {
      ...formData.classXII,
      gradeValue: formData.classXII.gradeValue,
      percentage:
        formData.classXII.gradingType === 'Percentage'
          ? toNumberOrEmpty(formData.classXII.gradeValue)
          : '',
    };
    onSave({
      ...formData,
      classX: classXPayload,
      classXII: classXIIPayload,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={formAccentSx}>
      <Typography variant="h6" sx={{ mb: 2, color: LIGHT_GREY }}>
        Current Education
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Institution Name"
            value={formData.current.institutionName}
            onChange={(e) =>
              setFormData({
                ...formData,
                current: { ...formData.current, institutionName: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Department"
            value={formData.current.department}
            onChange={(e) =>
              setFormData({
                ...formData,
                current: { ...formData.current, department: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Program</InputLabel>
            <Select
              value={formData.current.program}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current: { ...formData.current, program: e.target.value },
                })
              }
              label="Program"
            >
              {programOptions.map((program) => (
                <MenuItem key={program} value={program}>
                  {program}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Branch</InputLabel>
            <Select
              value={formData.current.branch}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current: { ...formData.current, branch: e.target.value },
                })
              }
              label="Branch"
            >
              {branchOptions.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Current Semester"
            value={formData.current.currentSemester}
            onChange={(e) =>
              setFormData({
                ...formData,
                current: { ...formData.current, currentSemester: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Roll Number"
            value={formData.current.rollNumber}
            onChange={(e) => {
              const value = e.target.value;
              setRollNumberError(
                value && !value.toUpperCase().startsWith('IES')
                  ? 'Roll number should start with IES'
                  : ''
              );
              setFormData({
                ...formData,
                current: { ...formData.current, rollNumber: value },
              });
            }}
            margin="normal"
            error={Boolean(rollNumberError)}
            helperText={rollNumberError || 'Format: IES...'}
            inputProps={{ pattern: '^IES.*' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Passout Batch"
            value={formData.current.passoutBatch}
            onChange={(e) =>
              setFormData({
                ...formData,
                current: { ...formData.current, passoutBatch: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="CGPA"
            type="number"
            value={formData.current.cgpa}
            onChange={(e) =>
              setFormData({
                ...formData,
                current: { ...formData.current, cgpa: e.target.value },
              })
            }
            margin="normal"
            inputProps={{ min: 0, max: 10, step: 0.1 }}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2, color: LIGHT_GREY }}>
        Class X
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Institution"
            value={formData.classX.institution}
            onChange={(e) =>
              setFormData({
                ...formData,
                classX: { ...formData.classX, institution: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Board"
            value={formData.classX.board}
            onChange={(e) =>
              setFormData({
                ...formData,
                classX: { ...formData.classX, board: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Program"
            value={formData.classX.program}
            onChange={(e) =>
              setFormData({
                ...formData,
                classX: { ...formData.classX, program: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Education Type</InputLabel>
            <Select
              value={formData.classX.educationType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classX: { ...formData.classX, educationType: e.target.value },
                })
              }
              label="Education Type"
            >
              <MenuItem value="Regular">Regular</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Starting Year"
            type="number"
            value={formData.classX.startingYear}
            onChange={(e) =>
              setFormData({
                ...formData,
                classX: { ...formData.classX, startingYear: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ending Year"
            type="number"
            value={formData.classX.endingYear}
            onChange={(e) =>
              setFormData({
                ...formData,
                classX: { ...formData.classX, endingYear: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Grade Type</InputLabel>
            <Select
              value={formData.classX.gradingType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classX: { ...formData.classX, gradingType: e.target.value },
                })
              }
              label="Grade Type"
            >
              {gradingTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Grade Value"
            type={formData.classX.gradingType === 'Grade' ? 'text' : 'number'}
            value={formData.classX.gradeValue}
            onChange={(e) =>
              setFormData({
                ...formData,
                classX: { ...formData.classX, gradeValue: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2, color: LIGHT_GREY }}>
        Class XII
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Institution"
            value={formData.classXII.institution}
            onChange={(e) =>
              setFormData({
                ...formData,
                classXII: { ...formData.classXII, institution: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Board"
            value={formData.classXII.board}
            onChange={(e) =>
              setFormData({
                ...formData,
                classXII: { ...formData.classXII, board: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Program"
            value={formData.classXII.program}
            onChange={(e) =>
              setFormData({
                ...formData,
                classXII: { ...formData.classXII, program: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Branch</InputLabel>
            <Select
              value={formData.classXII.branch}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classXII: { ...formData.classXII, branch: e.target.value },
                })
              }
              label="Branch"
            >
              {branchOptions.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Education Type</InputLabel>
            <Select
              value={formData.classXII.educationType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classXII: { ...formData.classXII, educationType: e.target.value },
                })
              }
              label="Education Type"
            >
              <MenuItem value="Regular">Regular</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Starting Year"
            type="number"
            value={formData.classXII.startingYear}
            onChange={(e) =>
              setFormData({
                ...formData,
                classXII: { ...formData.classXII, startingYear: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ending Year"
            type="number"
            value={formData.classXII.endingYear}
            onChange={(e) =>
              setFormData({
                ...formData,
                classXII: { ...formData.classXII, endingYear: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Grade Type</InputLabel>
            <Select
              value={formData.classXII.gradingType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classXII: { ...formData.classXII, gradingType: e.target.value },
                })
              }
              label="Grade Type"
            >
              {gradingTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Grade Value"
            type={formData.classXII.gradingType === 'Grade' ? 'text' : 'number'}
            value={formData.classXII.gradeValue}
            onChange={(e) =>
              setFormData({
                ...formData,
                classXII: { ...formData.classXII, gradeValue: e.target.value },
              })
            }
            margin="normal"
          />
        </Grid>
      </Grid>

      <Button type="submit" variant="contained" sx={{ mt: 3 }}>
        Save Education Details
      </Button>
    </Box>
  );
};

// Skills Tab Component (dynamic sections)
const SkillsTab = ({ profile, onSave }) => {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSkillInputs, setNewSkillInputs] = useState({});

  const normalizeItems = (items = []) =>
    items
      .map((item) => {
        if (typeof item === 'string') {
          return { name: item, description: '' };
        }
        if (item && typeof item === 'object') {
          const name = item.name || item.title || '';
          return { name, description: item.description || '' };
        }
        return null;
      })
      .filter((item) => item && item.name);

  // Initialize from profile, supporting both new (sections) and old (technical/languages) formats
  useEffect(() => {
    if (profile?.skills) {
      if (Array.isArray(profile.skills.sections)) {
        setSections(
          profile.skills.sections.map((section) => ({
            name: section.name,
            items: normalizeItems(section.items),
          }))
        );
      } else {
        const initialSections = [];
        if (Array.isArray(profile.skills.technical) && profile.skills.technical.length) {
          initialSections.push({
            name: 'Technical Skills',
            items: normalizeItems(profile.skills.technical),
          });
        }
        if (Array.isArray(profile.skills.languages) && profile.skills.languages.length) {
          initialSections.push({
            name: 'Languages',
            items: normalizeItems(profile.skills.languages),
          });
        }
        setSections(initialSections);
      }
    }
  }, [profile]);

  const handleAddSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    if (sections.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSections([...sections, { name, items: [] }]);
    setNewSectionName('');
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleAddSkillToSection = (index) => {
    const input = newSkillInputs[index] || { name: '', description: '' };
    const name = input.name?.trim();
    const description = input.description?.trim() || '';
    if (!name) return;
    const updated = [...sections];
    const existing = new Set(
      (updated[index].items || []).map((item) => item?.name?.toLowerCase())
    );
    if (!existing.has(name.toLowerCase())) {
      updated[index] = {
        ...updated[index],
        items: [...(updated[index].items || []), { name, description }],
      };
    }
    updated[index] = {
      ...updated[index],
      items: updated[index].items || [],
    };
    setSections(updated);
    setNewSkillInputs({ ...newSkillInputs, [index]: { name: '', description: '' } });
  };

  const handleRemoveSkillFromSection = (sectionIndex, skillIndex) => {
    const updated = [...sections];
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      items: updated[sectionIndex].items.filter((_, i) => i !== skillIndex),
    };
    setSections(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ sections });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={formAccentSx}>
      <Typography variant="h6" sx={{ mb: 2, color: LIGHT_GREY }}>
        Skill Sections
      </Typography>

      {/* Existing sections */}
      {sections.map((section, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: LIGHT_GREY }}>
              {section.name}
            </Typography>
            <Button
              size="small"
              color="error"
              onClick={() => handleRemoveSection(index)}
            >
              Remove Section
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            {section.items.map((skill, skillIndex) => (
              <Box key={skillIndex} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Chip
                  label={skill.name}
                  onDelete={() => handleRemoveSkillFromSection(index, skillIndex)}
                  color="primary"
                />
                {skill.description && (
                  <Typography variant="caption" sx={{ mt: 0.5, color: 'rgba(226,232,240,0.9)' }}>
                    {skill.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              value={newSkillInputs[index]?.name || ''}
              onChange={(e) =>
                setNewSkillInputs({
                  ...newSkillInputs,
                  [index]: { ...(newSkillInputs[index] || {}), name: e.target.value },
                })
              }
              placeholder={`Skill name for "${section.name}"`}
              size="small"
            />
            <TextField
              value={newSkillInputs[index]?.description || ''}
              onChange={(e) =>
                setNewSkillInputs({
                  ...newSkillInputs,
                  [index]: { ...(newSkillInputs[index] || {}), description: e.target.value },
                })
              }
              placeholder="Description"
              size="small"
            />
            <Button
              variant="outlined"
              onClick={() => handleAddSkillToSection(index)}
            >
              Add
            </Button>
          </Box>
        </Box>
      ))}

      {/* Add new section */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, color: LIGHT_GREY }}>
          Add New Section
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Section name (e.g. Frameworks, Languages, Tools)"
            size="small"
          />
          <Button variant="outlined" onClick={handleAddSection}>
            Add Section
          </Button>
        </Box>
      </Box>

      <Button type="submit" variant="contained">
        Save Skills
      </Button>
    </Box>
  );
};

// Projects Tab Component
const ProjectsTab = ({ projects, onRefresh }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', githubLink: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/profile/projects/${editingId}`, formData);
        toast.success('Project updated');
      } else {
        await axiosInstance.post('/profile/projects', formData);
        toast.success('Project added');
      }
      setOpenDialog(false);
      setFormData({ title: '', description: '', githubLink: '' });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      githubLink: project.githubLink || '',
    });
    setEditingId(project._id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axiosInstance.delete(`/profile/projects/${id}`);
        toast.success('Project deleted');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <Box sx={formAccentSx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: LIGHT_GREY }}>Projects</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormData({ title: '', description: '', githubLink: '' });
            setEditingId(null);
            setOpenDialog(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
          }}
        >
          Add Project
        </Button>
      </Box>

      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} key={project._id}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.35)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: '#e5e7eb' }}>{project.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(226,232,240,0.9)' }}>
                {project.description}
              </Typography>
              {project.githubLink && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                    GitHub Link
                  </a>
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => handleEdit(project)} sx={{ color: LIGHT_GREY }}>
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(project._id)} sx={{ color: LIGHT_GREY }}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingId(null);
          setFormData({ title: '', description: '', githubLink: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingId ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={formAccentSx}>
            <TextField
              fullWidth
              label="Project Title"
              margin="normal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="GitHub Link"
              margin="normal"
              value={formData.githubLink}
              onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

// Accomplishments Tab Component
const AccomplishmentsTab = ({ accomplishments, onRefresh }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ type: 'Certificate', title: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/profile/accomplishments/${editingId}`, formData);
        toast.success('Accomplishment updated');
      } else {
        await axiosInstance.post('/profile/accomplishments', formData);
        toast.success('Accomplishment added');
      }
      setOpenDialog(false);
      setFormData({ type: 'Certificate', title: '', description: '' });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save accomplishment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accomplishment?')) {
      try {
        await axiosInstance.delete(`/profile/accomplishments/${id}`);
        toast.success('Accomplishment deleted');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete accomplishment');
      }
    }
  };

  const handleEdit = (acc) => {
    setFormData({
      type: acc.type || 'Certificate',
      title: acc.title || '',
      description: acc.description || '',
    });
    setEditingId(acc._id);
    setOpenDialog(true);
  };

  return (
    <Box sx={formAccentSx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: LIGHT_GREY }}>Accomplishments</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormData({ type: 'Certificate', title: '', description: '' });
            setEditingId(null);
            setOpenDialog(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
          }}
        >
          Add Accomplishment
        </Button>
      </Box>

      <Grid container spacing={2}>
        {accomplishments.map((acc) => (
          <Grid item xs={12} md={6} key={acc._id}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.35)', borderRadius: 2 }}>
              <Chip label={acc.type} size="small" sx={{ mb: 1, background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', color: 'white' }} />
              <Typography variant="h6" sx={{ color: '#e5e7eb' }}>{acc.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(226,232,240,0.9)' }}>
                {acc.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => handleEdit(acc)} sx={{ color: LIGHT_GREY }}>
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(acc._id)} sx={{ color: LIGHT_GREY }}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingId(null);
          setFormData({
            companyName: '',
            jobTitle: '',
            positionType: 'Internship',
            startDate: '',
            endDate: '',
            currentlyWorking: false,
            description: '',
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingId ? 'Edit Accomplishment' : 'Add Accomplishment'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={formAccentSx}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="Certificate">Certificate</MenuItem>
                <MenuItem value="Award">Award</MenuItem>
                <MenuItem value="Workshop">Workshop</MenuItem>
                <MenuItem value="Competition">Competition</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

// Experiences Tab Component
const ExperiencesTab = ({ experiences, onRefresh }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    positionType: 'Internship',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/profile/experiences/${editingId}`, formData);
        toast.success('Experience updated');
      } else {
        await axiosInstance.post('/profile/experiences', formData);
        toast.success('Experience added');
      }
      setOpenDialog(false);
      setFormData({
        companyName: '',
        jobTitle: '',
        positionType: 'Internship',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
      });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to save experience');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await axiosInstance.delete(`/profile/experiences/${id}`);
        toast.success('Experience deleted');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete experience');
      }
    }
  };

  const handleEdit = (exp) => {
    setFormData({
      companyName: exp.companyName || '',
      jobTitle: exp.jobTitle || '',
      positionType: exp.positionType || 'Internship',
      startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      currentlyWorking: Boolean(exp.currentlyWorking),
      description: exp.description || '',
    });
    setEditingId(exp._id);
    setOpenDialog(true);
  };

  return (
    <Box sx={formAccentSx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: LIGHT_GREY }}>Work Experience / Internships</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormData({
              companyName: '',
              jobTitle: '',
              positionType: 'Internship',
              startDate: '',
              endDate: '',
              currentlyWorking: false,
              description: '',
            });
            setEditingId(null);
            setOpenDialog(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)' },
          }}
        >
          Add Experience
        </Button>
      </Box>

      <Grid container spacing={2}>
        {experiences.map((exp) => (
          <Grid item xs={12} md={6} key={exp._id}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.35)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: '#e5e7eb' }}>{exp.jobTitle}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.9)' }}>
                {exp.companyName} | {exp.positionType}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {new Date(exp.startDate).toLocaleDateString()} -{' '}
                {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(226,232,240,0.9)' }}>
                {exp.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={() => handleEdit(exp)} sx={{ color: LIGHT_GREY }}>
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(exp._id)} sx={{ color: LIGHT_GREY }}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={formAccentSx}>
            <TextField
              fullWidth
              label="Company Name"
              margin="normal"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Job Title"
              margin="normal"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Position Type</InputLabel>
              <Select
                value={formData.positionType}
                onChange={(e) => setFormData({ ...formData, positionType: e.target.value })}
                label="Position Type"
              >
                <MenuItem value="Internship">Internship</MenuItem>
                <MenuItem value="Full-Time">Full-Time</MenuItem>
                <MenuItem value="Part-Time">Part-Time</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              margin="normal"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              margin="normal"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={formData.currentlyWorking}
            />
            <Box sx={{ mt: 2 }}>
              <input
                type="checkbox"
                checked={formData.currentlyWorking}
                onChange={(e) =>
                  setFormData({ ...formData, currentlyWorking: e.target.checked })
                }
              />
              <label style={{ marginLeft: 8 }}>Currently Working</label>
            </Box>
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

ProfilePage.propTypes = {};
BasicDetailsTab.propTypes = {
  profile: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
EducationTab.propTypes = {
  profile: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
SkillsTab.propTypes = {
  profile: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
ProjectsTab.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRefresh: PropTypes.func.isRequired,
};
AccomplishmentsTab.propTypes = {
  accomplishments: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRefresh: PropTypes.func.isRequired,
};
ExperiencesTab.propTypes = {
  experiences: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default ProfilePage;

