import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [coordinators, setCoordinators] = useState([]);
  const [drives, setDrives] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [coordinatorData, setCoordinatorData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
  });

  useEffect(() => {
    fetchCoordinators();
    fetchDrives();
  }, []);

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
      setDrives(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching drives:', error);
    }
  };

  const handleCreateCoordinator = async () => {
    try {
      await axiosInstance.post('/coordinators', coordinatorData);
      toast.success('Coordinator created successfully');
      setOpenDialog(false);
      setCoordinatorData({ name: '', email: '', department: '', password: '' });
      fetchCoordinators();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coordinator');
    }
  };

  const handleDeleteCoordinator = async (coordinatorId, coordinatorName) => {
    if (window.confirm(`Are you sure you want to delete coordinator "${coordinatorName}"? This action cannot be undone.`)) {
      try {
        await axiosInstance.delete(`/coordinators/${coordinatorId}`);
        toast.success('Coordinator deleted successfully');
        fetchCoordinators();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete coordinator');
      }
    }
  };

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e3a5f', fontSize: '2rem' }}>
            Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)', 
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { 
                background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
                boxShadow: '0 6px 16px rgba(79, 172, 254, 0.4)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              } 
            }}
          >
            Create Coordinator
          </Button>
        </Box>

        <Grid container spacing={3}>
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
                <Typography variant="h6" gutterBottom sx={{ color: '#1e3a5f', fontWeight: 'bold', mb: 2 }}>
                  Department Coordinators
                </Typography>
                <TableContainer sx={{ bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Name</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Email</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Department</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {coordinators.map((coord) => (
                        <TableRow key={coord._id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                          <TableCell sx={{ color: '#333' }}>{coord.name}</TableCell>
                          <TableCell sx={{ color: '#666' }}>{coord.email}</TableCell>
                          <TableCell sx={{ color: '#666' }}>{coord.department}</TableCell>
                          <TableCell>
                            <Chip
                              label={coord.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{ bgcolor: coord.isActive ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)', color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Delete />}
                              onClick={() => handleDeleteCoordinator(coord._id, coord.name)}
                              sx={{ bgcolor: 'rgba(244, 67, 54, 0.9)', color: 'white', borderColor: 'rgba(244, 67, 54, 0.9)', '&:hover': { bgcolor: 'rgba(244, 67, 54, 1)', borderColor: 'rgba(244, 67, 54, 1)' } }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

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
                <Typography variant="h6" gutterBottom sx={{ color: '#1e3a5f', fontWeight: 'bold', mb: 2 }}>
                  Recent Drives
                </Typography>
                <TableContainer sx={{ bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Company</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Role</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {drives.map((drive) => (
                        <TableRow key={drive._id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                          <TableCell sx={{ color: '#333' }}>{drive.companyName}</TableCell>
                          <TableCell sx={{ color: '#666' }}>{drive.jobRole}</TableCell>
                          <TableCell>
                            <Chip
                              label={drive.status}
                              size="small"
                              sx={{ bgcolor: drive.status === 'Active' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)', color: 'white' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 2, 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
                      boxShadow: '0 6px 16px rgba(79, 172, 254, 0.4)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onClick={() => navigate('/admin/drives')}
                >
                  Manage Drives
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 1, 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)',
                      boxShadow: '0 6px 16px rgba(79, 172, 254, 0.4)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    } 
                  }}
                  onClick={() => navigate('/admin/coordinators')}
                >
                  Manage Coordinators
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Department Coordinator</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              value={coordinatorData.name}
              onChange={(e) => setCoordinatorData({ ...coordinatorData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              value={coordinatorData.email}
              onChange={(e) => setCoordinatorData({ ...coordinatorData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Department"
              margin="normal"
              value={coordinatorData.department}
              onChange={(e) => setCoordinatorData({ ...coordinatorData, department: e.target.value })}
            />
            <TextField
              fullWidth
              label="Password (leave empty for auto-generated)"
              margin="normal"
              type="password"
              value={coordinatorData.password}
              onChange={(e) => setCoordinatorData({ ...coordinatorData, password: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCoordinator} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;

