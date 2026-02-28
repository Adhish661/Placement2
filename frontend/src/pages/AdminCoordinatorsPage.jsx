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
  IconButton,
} from '@mui/material';
import { Add, Edit, Block, CheckCircle } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AdminCoordinatorsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [coordinators, setCoordinators] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [coordinatorData, setCoordinatorData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
  });

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const { data } = await axiosInstance.get('/coordinators');
      setCoordinators(data);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
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

  const handleToggleStatus = async (coordinatorId, isActive) => {
    try {
      await axiosInstance.put(`/coordinators/${coordinatorId}/status`, {
        isActive: !isActive,
      });
      toast.success(`Coordinator ${!isActive ? 'activated' : 'deactivated'}`);
      fetchCoordinators();
    } catch (error) {
      toast.error('Failed to update coordinator status');
    }
  };

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Manage Coordinators
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create Coordinator
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coordinators.map((coord) => (
                <TableRow key={coord._id}>
                  <TableCell>{coord.name}</TableCell>
                  <TableCell>{coord.email}</TableCell>
                  <TableCell>{coord.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={coord.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={coord.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(coord._id, coord.isActive)}
                      color={coord.isActive ? 'error' : 'success'}
                    >
                      {coord.isActive ? <Block /> : <CheckCircle />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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

export default AdminCoordinatorsPage;

