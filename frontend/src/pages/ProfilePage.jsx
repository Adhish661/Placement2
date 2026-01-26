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

  return (
    <RoleBasedLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          My Profile
        </Typography>

        {/* Profile Photo Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Profile Photo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={profile?.profilePhoto?.url}
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
                >
                  {uploadingPhoto ? 'Uploading...' : profile?.profilePhoto?.url ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </label>
            </Box>
          </Box>
        </Paper>

        <Paper>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
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
    <Box component="form" onSubmit={handleSubmit}>
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
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
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
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
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
      percentage: '',
    },
  });

  useEffect(() => {
    if (profile?.education) {
      setFormData(profile.education);
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Current Education
      </Typography>
      <Grid container spacing={2}>
        {Object.keys(formData.current).map((key) => (
          <Grid item xs={12} md={6} key={key}>
            <TextField
              fullWidth
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              type={key === 'cgpa' ? 'number' : 'text'}
              value={formData.current[key]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current: { ...formData.current, [key]: e.target.value },
                })
              }
              margin="normal"
              inputProps={key === 'cgpa' ? { min: 0, max: 10, step: 0.1 } : {}}
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Class X
      </Typography>
      <Grid container spacing={2}>
        {Object.keys(formData.classX).map((key) => (
          <Grid item xs={12} md={6} key={key}>
            {key === 'educationType' ? (
              <FormControl fullWidth margin="normal">
                <InputLabel>Education Type</InputLabel>
                <Select
                  value={formData.classX[key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classX: { ...formData.classX, [key]: e.target.value },
                    })
                  }
                  label="Education Type"
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label={key.replace(/([A-Z])/g, ' $1').trim()}
                type={key.includes('Year') || key === 'percentage' ? 'number' : 'text'}
                value={formData.classX[key]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classX: { ...formData.classX, [key]: e.target.value },
                  })
                }
                margin="normal"
              />
            )}
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Class XII
      </Typography>
      <Grid container spacing={2}>
        {Object.keys(formData.classXII).map((key) => (
          <Grid item xs={12} md={6} key={key}>
            {key === 'educationType' ? (
              <FormControl fullWidth margin="normal">
                <InputLabel>Education Type</InputLabel>
                <Select
                  value={formData.classXII[key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classXII: { ...formData.classXII, [key]: e.target.value },
                    })
                  }
                  label="Education Type"
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label={key.replace(/([A-Z])/g, ' $1').trim()}
                type={key.includes('Year') || key === 'percentage' ? 'number' : 'text'}
                value={formData.classXII[key]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classXII: { ...formData.classXII, [key]: e.target.value },
                  })
                }
                margin="normal"
              />
            )}
          </Grid>
        ))}
      </Grid>

      <Button type="submit" variant="contained" sx={{ mt: 3 }}>
        Save Education Details
      </Button>
    </Box>
  );
};

// Skills Tab Component
const SkillsTab = ({ profile, onSave }) => {
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    if (profile?.skills) {
      setTechnicalSkills(profile.skills.technical || []);
      setLanguages(profile.skills.languages || []);
    }
  }, [profile]);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setTechnicalSkills([...technicalSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleAddLanguage = () => {
    if (languageInput.trim()) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const handleRemoveSkill = (index) => {
    setTechnicalSkills(technicalSkills.filter((_, i) => i !== index));
  };

  const handleRemoveLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ technical: technicalSkills, languages });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Technical Skills
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {technicalSkills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            onDelete={() => handleRemoveSkill(index)}
            color="primary"
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          placeholder="Add technical skill"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
        />
        <Button onClick={handleAddSkill} variant="outlined">
          Add
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Languages Known
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {languages.map((lang, index) => (
          <Chip
            key={index}
            label={lang}
            onDelete={() => handleRemoveLanguage(index)}
            color="secondary"
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          value={languageInput}
          onChange={(e) => setLanguageInput(e.target.value)}
          placeholder="Add language"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddLanguage();
            }
          }}
        />
        <Button onClick={handleAddLanguage} variant="outlined">
          Add
        </Button>
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormData({ title: '', description: '', githubLink: '' });
            setEditingId(null);
            setOpenDialog(true);
          }}
        >
          Add Project
        </Button>
      </Box>

      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} key={project._id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{project.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
                <IconButton size="small" onClick={() => handleEdit(project)}>
                  <Edit />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(project._id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Accomplishments</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormData({ type: 'Certificate', title: '', description: '' });
            setEditingId(null);
            setOpenDialog(true);
          }}
        >
          Add Accomplishment
        </Button>
      </Box>

      <Grid container spacing={2}>
        {accomplishments.map((acc) => (
          <Grid item xs={12} md={6} key={acc._id}>
            <Paper sx={{ p: 2 }}>
              <Chip label={acc.type} size="small" sx={{ mb: 1 }} />
              <Typography variant="h6">{acc.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {acc.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <IconButton size="small" onClick={() => handleDelete(acc._id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Accomplishment</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
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
              Add
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Work Experience / Internships</Typography>
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
        >
          Add Experience
        </Button>
      </Box>

      <Grid container spacing={2}>
        {experiences.map((exp) => (
          <Grid item xs={12} md={6} key={exp._id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{exp.jobTitle}</Typography>
              <Typography variant="body2" color="text.secondary">
                {exp.companyName} | {exp.positionType}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {new Date(exp.startDate).toLocaleDateString()} -{' '}
                {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {exp.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <IconButton size="small" onClick={() => handleDelete(exp._id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Experience</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
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
              Add
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;

