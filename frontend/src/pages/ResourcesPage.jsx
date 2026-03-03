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
  Collapse,
} from '@mui/material';
import { Add, Download, Folder, FolderOpen, InsertDriveFile, ExpandMore, ExpandLess, Edit, Delete } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const FOLDER_TYPES = [
  { id: 'technical', label: 'Technical', icon: Folder },
  { id: 'aptitude', label: 'Aptitude', icon: Folder },
  { id: 'general', label: 'General', icon: Folder },
];

const ResourcesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [resources, setResources] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceToDelete, setResourceToDelete] = useState(null);
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

  const handleEditClick = (resource, e) => {
    e?.stopPropagation?.();
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      type: resource.type || 'aptitude',
      file: null,
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editingResource?._id) return;
    try {
      await axiosInstance.put(`/resources/${editingResource._id}`, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
      });
      toast.success('Resource updated');
      setEditDialog(false);
      setEditingResource(null);
      setFormData({ title: '', description: '', type: 'aptitude', file: null });
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update resource');
    }
  };

  const handleDeleteClick = (resource, e) => {
    e?.stopPropagation?.();
    setResourceToDelete(resource);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete?._id) return;
    try {
      await axiosInstance.delete(`/resources/${resourceToDelete._id}`);
      toast.success('Resource deleted');
      setDeleteDialog(false);
      setResourceToDelete(null);
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  const handleDownload = async (resource, e) => {
    e?.stopPropagation?.();
    if (!resource?._id) return;

    try {
      const response = await axiosInstance.get(`/resources/${resource._id}/download`, {
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] || '';
      let fileName =
        resource.fileOriginalName ||
        resource.title ||
        'resource';

      const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
      if (fileNameMatch && fileNameMatch[1]) {
        try {
          fileName = decodeURIComponent(fileNameMatch[1].replace(/\"/g, ''));
        } catch {
          fileName = fileNameMatch[1].replace(/\"/g, '');
        }
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Resource download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download resource');
    }
  };

  const getResourcesByType = (type) => {
    return resources.filter((r) => {
      const matchesType = (r.type || 'general').toLowerCase() === type.toLowerCase();
      const hasFile = !!r.fileUrl;
      const hasTitle = !!r.title;
      return matchesType && hasFile && hasTitle;
    });
  };

  const cardSx = {
    bgcolor: 'rgba(15,23,42,0.96)',
    borderRadius: 3,
    border: '1px solid rgba(148,163,184,0.35)',
    boxShadow: '0 18px 45px rgba(15,23,42,0.7)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: '0 24px 70px rgba(15,23,42,0.9)',
      transform: 'translateY(-4px)',
      borderColor: 'rgba(56,189,248,0.5)',
    },
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#e5e7eb', letterSpacing: 0.3 }}>
          Resources
        </Typography>
        {userInfo?.role === 'DEPT_COORDINATOR' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
              boxShadow: '0 12px 32px rgba(37,99,235,0.6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)',
                boxShadow: '0 16px 42px rgba(37,99,235,0.8)',
              },
            }}
          >
            Upload Resource
          </Button>
        )}
      </Box>

      {/* Folder structure */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {FOLDER_TYPES.map((folder) => {
          const count = getResourcesByType(folder.id).length;
          const isSelected = selectedFolder === folder.id;
          const FolderIcon = isSelected ? FolderOpen : folder.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={folder.id}>
              <Paper
                onClick={() => setSelectedFolder(isSelected ? null : folder.id)}
                sx={{
                  ...cardSx,
                  p: 2.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderColor: isSelected ? 'rgba(56,189,248,0.6)' : undefined,
                  bgcolor: isSelected ? 'rgba(30,64,175,0.4)' : undefined,
                }}
              >
                <FolderIcon sx={{ fontSize: 48, color: '#38bdf8' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 700 }}>
                    {folder.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                    {count} file{count !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                {isSelected ? <ExpandLess sx={{ color: '#d1d5db' }} /> : <ExpandMore sx={{ color: '#d1d5db' }} />}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Files in selected folder */}
      <Collapse in={!!selectedFolder}>
        <Box sx={{ mt: 2 }}>
          {selectedFolder && (
            <>
              <Typography variant="h6" sx={{ color: '#e5e7eb', fontWeight: 700, mb: 2, textTransform: 'capitalize' }}>
                {FOLDER_TYPES.find((f) => f.id === selectedFolder)?.label} Resources
              </Typography>
              <Grid container spacing={2}>
                {getResourcesByType(selectedFolder).map((resource) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={resource._id}>
                    <Paper
                      elevation={0}
                      sx={{
                        ...cardSx,
                        p: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        minHeight: 200,
                        justifyContent: 'space-between',
                      }}
                      onClick={(e) => handleDownload(resource, e)}
                    >
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <InsertDriveFile sx={{ fontSize: 48, color: '#38bdf8' }} />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            mt: 1,
                            fontWeight: 600,
                            color: '#e5e7eb',
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
                            sx={{
                              mt: 0.5,
                              color: 'rgba(148,163,184,0.9)',
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
                        <Chip label={resource.type} size="small" sx={{ textTransform: 'capitalize', bgcolor: 'rgba(56,189,248,0.2)', color: '#38bdf8' }} />
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          {(userInfo?.role === 'DEPT_COORDINATOR' || userInfo?.role === 'ADMIN') && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleEditClick(resource, e)}
                                  sx={{ color: '#38bdf8' }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleDeleteClick(resource, e)}
                                  sx={{ color: '#f87171' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={(e) => handleDownload(resource, e)}
                              sx={{ color: '#38bdf8' }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {getResourcesByType(selectedFolder).length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', ...cardSx }}>
                  <InsertDriveFile sx={{ fontSize: 64, color: 'rgba(148,163,184,0.5)', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'rgba(148,163,184,0.95)' }}>
                    No resources in this folder
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Collapse>

      {!selectedFolder && resources.length > 0 && (
        <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.9)', textAlign: 'center', py: 4 }}>
          Click a folder above to view its files
        </Typography>
      )}

      {resources.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', ...cardSx }}>
          <Folder sx={{ fontSize: 64, color: 'rgba(148,163,184,0.5)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(148,163,184,0.95)' }}>
            No resources available
          </Typography>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'rgba(15,23,42,0.98)', borderRadius: 3, border: '1px solid rgba(148,163,184,0.5)', color: '#e5e7eb' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Resource</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" margin="normal" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15, 23, 42, 0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' } }} />
          <TextField fullWidth label="Description" margin="normal" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15, 23, 42, 0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' } }} />
          <FormControl fullWidth margin="normal" sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15, 23, 42, 0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' } }} >
            <InputLabel>Type</InputLabel>
            <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} label="Type">
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="aptitude">Aptitude</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
          </FormControl>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ marginTop: 16, width: '100%' }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'rgba(148,163,184,0.9)' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)' }}>Upload</Button>
        </DialogActions>
      </Dialog>

      {/* Edit resource dialog */}
      <Dialog
        open={editDialog}
        onClose={() => { setEditDialog(false); setEditingResource(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'rgba(15,23,42,0.98)', borderRadius: 3, border: '1px solid rgba(148,163,184,0.5)', color: '#e5e7eb' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Resource</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15, 23, 42, 0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' } }}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15, 23, 42, 0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' } }}
          />
          <FormControl fullWidth margin="normal" sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(15, 23, 42, 0.9)', color: '#e5e7eb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' } }}>
            <InputLabel>Type</InputLabel>
            <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} label="Type">
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="aptitude">Aptitude</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setEditDialog(false); setEditingResource(null); }} sx={{ color: 'rgba(148,163,184,0.9)' }}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" sx={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)' }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => { setDeleteDialog(false); setResourceToDelete(null); }}
        PaperProps={{ sx: { bgcolor: 'rgba(15,23,42,0.98)', borderRadius: 3, border: '1px solid rgba(148,163,184,0.5)', color: '#e5e7eb' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Resource</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(148,163,184,0.95)' }}>
            Are you sure you want to delete &quot;{resourceToDelete?.title}&quot;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setDeleteDialog(false); setResourceToDelete(null); }} sx={{ color: 'rgba(148,163,184,0.9)' }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourcesPage;
