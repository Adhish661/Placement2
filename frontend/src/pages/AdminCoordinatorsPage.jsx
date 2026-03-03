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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Add, Block, CheckCircle, Edit } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const neuBg = '#0f1b2d';
const neuCard = '#13243c';
const neuLight = '#1c3354';
const neuDark = '#0a1220';

const AdminCoordinatorsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [coordinators, setCoordinators] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCoordinator, setEditingCoordinator] = useState(null);
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
    const nameTrimmed = coordinatorData.name.trim();
    if (!nameTrimmed || !/^[A-Za-z\s.]+$/.test(nameTrimmed)) {
      toast.error('Name should contain alphabets and spaces only');
      return;
    }
    if (coordinatorData.password && coordinatorData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    try {
      await axiosInstance.post('/coordinators', coordinatorData);
      toast.success('Coordinator created successfully');
      setOpenDialog(false);
      setCoordinatorData({
        name: '',
        email: '',
        department: '',
        password: '',
      });
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

  const handleEditClick = (coord) => {
    setEditingCoordinator(coord);
    setCoordinatorData({
      name: coord.name,
      email: coord.email,
      department: coord.department,
      password: '',
    });
    setOpenEditDialog(true);
  };

  const handleUpdateCoordinator = async () => {
    if (!editingCoordinator) return;
    const nameTrimmed = coordinatorData.name.trim();
    if (!nameTrimmed || !/^[A-Za-z\s.]+$/.test(nameTrimmed)) {
      toast.error('Name should contain alphabets and spaces only');
      return;
    }
    try {
      await axiosInstance.put(`/coordinators/${editingCoordinator._id}`, {
        name: coordinatorData.name,
        email: coordinatorData.email,
        department: coordinatorData.department,
      });
      toast.success('Coordinator updated successfully');
      setOpenEditDialog(false);
      setEditingCoordinator(null);
      setCoordinatorData({ name: '', email: '', department: '', password: '' });
      fetchCoordinators();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coordinator');
    }
  };

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: '100vh',
          background: neuBg,
          p: 3,
          animation: 'fadeIn 0.4s ease-out',
          borderRadius: 4,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
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
            Manage Coordinators
          </Typography>

          <Button
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: neuCard,
              color: '#fff',
              borderRadius: '14px',
              px: 3,
              boxShadow: `
                6px 6px 14px ${neuDark},
                -6px -6px 14px ${neuLight}
              `,
              '&:hover': {
                background: neuLight,
              },
            }}
          >
            Create Coordinator
          </Button>
        </Box>

        {/* Table */}
        <TableContainer
          sx={{
            background: neuCard,
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: `
              10px 10px 24px ${neuDark},
              -10px -10px 24px ${neuLight}
            `,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {['Name', 'Email', 'Department', 'Status', 'Actions'].map(
                  (head) => (
                    <TableCell
                      key={head}
                      sx={{
                        color: '#9fb4ff',
                        fontWeight: 600,
                        borderBottom: '1px solid #1f3558',
                      }}
                    >
                      {head}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {coordinators.map((coord) => (
                <TableRow
                  key={coord._id}
                  sx={{
                    '&:hover': {
                      background: '#162a48',
                    },
                  }}
                >
                  <TableCell sx={{ color: '#e5ecff' }}>
                    {coord.name}
                  </TableCell>
                  <TableCell sx={{ color: '#e5ecff' }}>
                    {coord.email}
                  </TableCell>
                  <TableCell sx={{ color: '#e5ecff' }}>
                    {coord.department}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coord.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        background: coord.isActive
                          ? 'rgba(46, 213, 115, 0.15)'
                          : 'rgba(255,255,255,0.08)',
                        color: coord.isActive ? '#2ed573' : '#cfd8ff',
                        borderRadius: '10px',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditClick(coord)}
                      sx={{
                        background: neuBg,
                        color: '#38bdf8',
                        mr: 1,
                        boxShadow: `inset 2px 2px 5px ${neuDark}, inset -2px -2px 5px ${neuLight}`,
                        '&:hover': { background: neuCard },
                      }}
                      size="small"
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        handleToggleStatus(coord._id, coord.isActive)
                      }
                      sx={{
                        background: neuBg,
                        color: coord.isActive ? '#ff6b6b' : '#2ed573',
                        boxShadow: `inset 2px 2px 5px ${neuDark}, inset -2px -2px 5px ${neuLight}`,
                        '&:hover': { background: neuCard },
                      }}
                      size="small"
                      title={coord.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {coord.isActive ? <Block /> : <CheckCircle />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: neuCard,
              borderRadius: '18px',
              boxShadow: `
                10px 10px 24px ${neuDark},
                -10px -10px 24px ${neuLight}
              `,
            },
          }}
        >
          <DialogTitle sx={{ color: '#e5ecff', fontWeight: 600 }}>
            Create Department Coordinator
          </DialogTitle>

          <DialogContent>
            {[
              {
                label: 'Full Name',
                value: coordinatorData.name,
                key: 'name',
                type: 'text',
              },
              {
                label: 'Email',
                value: coordinatorData.email,
                key: 'email',
                type: 'email',
              },
              {
                label: 'Department',
                value: coordinatorData.department,
                key: 'department',
                type: 'text',
              },
              {
                label: 'Password (leave empty for auto-generated)',
                value: coordinatorData.password,
                key: 'password',
                type: 'password',
              },
            ].map((field) => (
              <TextField
                key={field.key}
                fullWidth
                label={field.label}
                type={field.type}
                margin="normal"
                value={field.value}
                onChange={(e) =>
                  setCoordinatorData({
                    ...coordinatorData,
                    [field.key]: e.target.value,
                  })
                }
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: '#e5e7eb',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#d1d5db',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#38bdf8',
                  },
                  '& .MuiInputBase-input::placeholder': { 
                    color: '#d1d5db', 
                    opacity: 1 
                  },
                }}
              />
            ))}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              sx={{
                color: '#9fb4ff',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCoordinator}
              sx={{
                background: neuBg,
                color: '#fff',
                borderRadius: '12px',
                px: 3,
                boxShadow: `
                  6px 6px 14px ${neuDark},
                  -6px -6px 14px ${neuLight}
                `,
                '&:hover': {
                  background: neuLight,
                },
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Coordinator Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setEditingCoordinator(null);
            setCoordinatorData({ name: '', email: '', department: '', password: '' });
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: neuCard,
              borderRadius: '18px',
              boxShadow: `10px 10px 24px ${neuDark}, -10px -10px 24px ${neuLight}`,
            },
          }}
        >
          <DialogTitle sx={{ color: '#e5ecff', fontWeight: 600 }}>
            Edit Coordinator
          </DialogTitle>
          <DialogContent>
            {[
              { label: 'Full Name', value: coordinatorData.name, key: 'name', type: 'text' },
              { label: 'Email', value: coordinatorData.email, key: 'email', type: 'email' },
              { label: 'Department', value: coordinatorData.department, key: 'department', type: 'text' },
            ].map((field) => (
              <TextField
                key={field.key}
                fullWidth
                label={field.label}
                type={field.type}
                margin="normal"
                value={field.value}
                onChange={(e) =>
                  setCoordinatorData({ ...coordinatorData, [field.key]: e.target.value })
                }
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: '#e5e7eb',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#d1d5db',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#38bdf8',
                  },
                  '& .MuiInputBase-input::placeholder': { 
                    color: '#d1d5db', 
                    opacity: 1 
                  },
                }}
              />
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setEditingCoordinator(null);
              }}
              sx={{ color: '#9fb4ff' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCoordinator}
              sx={{
                background: neuBg,
                color: '#fff',
                borderRadius: '12px',
                px: 3,
                boxShadow: `6px 6px 14px ${neuDark}, -6px -6px 14px ${neuLight}`,
                '&:hover': { background: neuLight },
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminCoordinatorsPage;