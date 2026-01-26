import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Download, Folder, InsertDriveFile, MoreVert } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ResourcesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [resources, setResources] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'aptitude',
    file: null,
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data } = await axiosInstance.get('/resources');
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      await axiosInstance.post('/resources', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Resource uploaded successfully');
      setOpenDialog(false);
      setFormData({ title: '', description: '', type: 'aptitude', file: null });
      fetchResources();
    } catch (error) {
      toast.error('Failed to upload resource');
    }
  };

  // Group resources by type
  const groupedResources = resources.reduce((acc, resource) => {
    const type = resource.type || 'general';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(resource);
    return acc;
  }, {});

  const getFileIcon = (type) => {
    return <InsertDriveFile sx={{ fontSize: 48, color: '#4285f4' }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Resources
        </Typography>
        {userInfo?.role === 'DEPT_COORDINATOR' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Upload Resource
          </Button>
        )}
      </Box>

      {Object.keys(groupedResources).map((type) => (
        <Box key={type} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Folder sx={{ fontSize: 32, color: '#fbbc04', mr: 1 }} />
            <Typography variant="h5" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
              {type.replace('-', ' ')} Resources
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {groupedResources[type].map((resource) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={resource._id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-4px)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 200,
                    justifyContent: 'space-between',
                  }}
                  onClick={() => window.open(resource.fileUrl, '_blank')}
                >
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {getFileIcon(resource.type)}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mt: 1,
                        fontWeight: 'medium',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        width: '100%',
                      }}
                    >
                      {resource.title}
                    </Typography>
                    {resource.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          width: '100%',
                        }}
                      >
                        {resource.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 2 }}>
                    <Chip label={resource.type} size="small" sx={{ textTransform: 'capitalize' }} />
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(resource.fileUrl, '_blank');
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {resources.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Folder sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No resources available
          </Typography>
        </Paper>
      )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogContent>
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
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="aptitude">Aptitude</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="company-wise">Company-wise</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ marginTop: 16, width: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default ResourcesPage;

