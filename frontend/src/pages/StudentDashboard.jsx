import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Work,
  Description,
  Assessment,
  TrendingUp,
  Add,
  Edit,
  Delete,
  Download,
  InsertDriveFile,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    drives: 0,
    profileCompletion: 0,
  });
  const [certificates, setCertificates] = useState([]);
  const [openCertDialog, setOpenCertDialog] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [certFormData, setCertFormData] = useState({
    title: '',
    description: '',
    type: 'Certificate',
    issuedBy: '',
    issuedDate: '',
    file: null,
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await axiosInstance.get('/certificates');
      setCertificates(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get('/profile');
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [applicationsRes, drivesRes] = await Promise.all([
        axiosInstance.get('/applications'),
        axiosInstance.get('/drives'),
      ]);
      setStats({
        applications: applicationsRes.data.length,
        drives: drivesRes.data.length,
        profileCompletion: profile?.profileCompletion?.overall || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <StudentLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#1e3a5f', fontSize: '2rem' }}>
          Welcome back, {userInfo?.name}!
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Completion Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              borderRadius: 3, 
              border: '1px solid #e0e0e0',
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#1e3a5f', fontWeight: 'bold' }}>
                  Profile Completion
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={profile?.profileCompletion?.overall || 0}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {profile?.profileCompletion?.overall || 0}% Complete
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onClick={() => navigate('/profile')}
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              borderRadius: 3, 
              border: '1px solid #e0e0e0',
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Work sx={{ fontSize: 40, color: '#667eea', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 'bold' }}>{stats.drives}</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Available Drives
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => navigate('/drives')}
                  sx={{ 
                    mt: 1, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    } 
                  }}
                >
                  View All
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              borderRadius: 3, 
              border: '1px solid #e0e0e0',
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Description sx={{ fontSize: 40, color: '#667eea', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: '#1e3a5f', fontWeight: 'bold' }}>{stats.applications}</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Applications
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => navigate('/applications')}
                  sx={{ 
                    mt: 1, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    } 
                  }}
                >
                  View All
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              background: 'white', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1e3a5f', fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onClick={() => navigate('/profile')}
                >
                  Update Profile
                </Button>
                <Button
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onClick={() => navigate('/drives')}
                >
                  Browse Drives
                </Button>
                <Button
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onClick={async () => {
                    try {
                      const response = await axiosInstance.get('/resume/generate', {
                        responseType: 'blob',
                      });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'resume.pdf');
                      document.body.appendChild(link);
                      link.click();
                    } catch (error) {
                      console.error('Error generating resume:', error);
                    }
                  }}
                >
                  Download Resume
                </Button>
                <Button
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onClick={() => navigate('/resources')}
                >
                  View Resources
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Certificates Section */}
          <Grid item xs={12}>
            <Card sx={{ 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              background: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#1e3a5f', fontWeight: 'bold' }}>
                    Certificates & Documents
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease',
                      } 
                    }}
                    onClick={() => {
                      setEditingCert(null);
                      setCertFormData({
                        title: '',
                        description: '',
                        type: 'Certificate',
                        issuedBy: '',
                        issuedDate: '',
                        file: null,
                      });
                      setOpenCertDialog(true);
                    }}
                  >
                    Upload Certificate
                  </Button>
                </Box>
                <List>
                  {certificates.map((cert) => (
                    <ListItem key={cert._id} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                      <InsertDriveFile sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={cert.title}
                        secondary={
                          <>
                            <Typography variant="caption" component="span" display="block">
                              {cert.type} {cert.issuedBy && `• ${cert.issuedBy}`}
                            </Typography>
                            {cert.description && (
                              <Typography variant="caption" component="span" color="text.secondary" display="block">
                                {cert.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          sx={{ mr: 1 }}
                          onClick={() => {
                            if (!cert.fileUrl) return;

                            // Always download certificates as PDF files (append .pdf)
                            const safeTitle = cert.title || 'certificate';
                            const downloadName = `${safeTitle}.pdf`;

                            const link = document.createElement('a');
                            link.href = cert.fileUrl;
                            link.setAttribute('download', downloadName);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setEditingCert(cert);
                            setCertFormData({
                              title: cert.title,
                              description: cert.description || '',
                              type: cert.type,
                              issuedBy: cert.issuedBy || '',
                              issuedDate: cert.issuedDate ? new Date(cert.issuedDate).toISOString().split('T')[0] : '',
                              file: null,
                            });
                            setOpenCertDialog(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this certificate?')) {
                              try {
                                await axiosInstance.delete(`/certificates/${cert._id}`);
                                toast.success('Certificate deleted');
                                fetchCertificates();
                              } catch (error) {
                                toast.error('Failed to delete certificate');
                              }
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {certificates.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No certificates uploaded yet
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Certificate Upload/Edit Dialog */}
        <Dialog open={openCertDialog} onClose={() => setOpenCertDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingCert ? 'Edit Certificate' : 'Upload Certificate'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              value={certFormData.title}
              onChange={(e) => setCertFormData({ ...certFormData, title: e.target.value })}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={certFormData.type}
                onChange={(e) => setCertFormData({ ...certFormData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="Certificate">Certificate</MenuItem>
                <MenuItem value="Competition">Competition</MenuItem>
                <MenuItem value="Award">Award</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Issued By"
              margin="normal"
              value={certFormData.issuedBy}
              onChange={(e) => setCertFormData({ ...certFormData, issuedBy: e.target.value })}
            />
            <TextField
              fullWidth
              label="Issued Date"
              type="date"
              margin="normal"
              value={certFormData.issuedDate}
              onChange={(e) => setCertFormData({ ...certFormData, issuedDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={3}
              value={certFormData.description}
              onChange={(e) => setCertFormData({ ...certFormData, description: e.target.value })}
            />
            {!editingCert && (
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setCertFormData({ ...certFormData, file: e.target.files[0] })}
                style={{ marginTop: 16, width: '100%' }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCertDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  if (editingCert) {
                    await axiosInstance.put(`/certificates/${editingCert._id}`, {
                      title: certFormData.title,
                      description: certFormData.description,
                      type: certFormData.type,
                      issuedBy: certFormData.issuedBy,
                      issuedDate: certFormData.issuedDate || undefined,
                    });
                    toast.success('Certificate updated');
                  } else {
                    if (!certFormData.file) {
                      toast.error('Please select a file');
                      return;
                    }
                    const formDataToSend = new FormData();
                    formDataToSend.append('title', certFormData.title);
                    formDataToSend.append('description', certFormData.description);
                    formDataToSend.append('type', certFormData.type);
                    formDataToSend.append('issuedBy', certFormData.issuedBy);
                    if (certFormData.issuedDate) {
                      formDataToSend.append('issuedDate', certFormData.issuedDate);
                    }
                    formDataToSend.append('file', certFormData.file);

                    await axiosInstance.post('/certificates', formDataToSend, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    });
                    toast.success('Certificate uploaded');
                  }
                  setOpenCertDialog(false);
                  setEditingCert(null);
                  setCertFormData({
                    title: '',
                    description: '',
                    type: 'Certificate',
                    issuedBy: '',
                    issuedDate: '',
                    file: null,
                  });
                  fetchCertificates();
                } catch (error) {
                  console.error('Certificate upload error:', error);
                  const errorMessage = error.response?.data?.message || error.message || 'Failed to save certificate';
                  toast.error(errorMessage);
                }
              }}
            >
              {editingCert ? 'Update' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </StudentLayout>
  );
};

export default StudentDashboard;

