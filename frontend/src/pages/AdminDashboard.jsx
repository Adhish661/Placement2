import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  Box,
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
  Stack,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const neuBg = '#0f1b2d';
const neuCard = '#13243c';
const neuLight = '#1c3354';
const neuDark = '#0a1220';

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

  const handleDeleteCoordinator = async (coordinatorId, coordinatorName) => {
    if (
      window.confirm(
        `Are you sure you want to delete coordinator "${coordinatorName}"?`
      )
    ) {
      try {
        await axiosInstance.delete(`/coordinators/${coordinatorId}`);
        toast.success('Coordinator deleted successfully');
        fetchCoordinators();
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Failed to delete coordinator'
        );
      }
    }
  };

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: '100vh',
          background: neuBg,
          p: 3,
          borderRadius: 4,
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
        {/* Page header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#e5ecff' }}
          >
            Admin Dashboard
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
              '&:hover': { background: neuLight },
            }}
          >
            Create Coordinator
          </Button>
        </Stack>

        {/* ===================== Coordinators Section ===================== */}

        <Card
          sx={{
            mb: 4,
            background: neuCard,
            borderRadius: '20px',
            boxShadow: `
              10px 10px 24px ${neuDark},
              -10px -10px 24px ${neuLight}
            `,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography
                variant="h6"
                sx={{ color: '#9fb4ff', fontWeight: 600 }}
              >
                Department Coordinators
              </Typography>

              <Button
                size="small"
                onClick={() => navigate('/admin/coordinators')}
                sx={{ color: '#9fb4ff' }}
              >
                View All
              </Button>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Name', 'Email', 'Department', 'Status', 'Action'].map(
                      (h) => (
                        <TableCell
                          key={h}
                          sx={{
                            color: '#9fb4ff',
                            fontWeight: 600,
                            borderBottom: '1px solid #1f3558',
                          }}
                        >
                          {h}
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
                        '&:hover': { background: '#162a48' },
                      }}
                    >
                      <TableCell sx={{ color: '#e5ecff' }}>
                        {coord.name}
                      </TableCell>
                      <TableCell sx={{ color: '#cfd8ff' }}>
                        {coord.email}
                      </TableCell>
                      <TableCell sx={{ color: '#cfd8ff' }}>
                        {coord.department}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={coord.isActive ? 'Active' : 'Inactive'}
                          sx={{
                            background: coord.isActive
                              ? 'rgba(46,213,115,0.15)'
                              : 'rgba(255,255,255,0.08)',
                            color: coord.isActive
                              ? '#2ed573'
                              : '#cfd8ff',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteCoordinator(
                              coord._id,
                              coord.name
                            )
                          }
                          sx={{
                            color: '#ff6b6b',
                            background: neuBg,
                            boxShadow: `
                              inset 2px 2px 5px ${neuDark},
                              inset -2px -2px 5px ${neuLight}
                            `,
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* ===================== Drives Section ===================== */}

        <Card
          sx={{
            background: neuCard,
            borderRadius: '20px',
            boxShadow: `
              10px 10px 24px ${neuDark},
              -10px -10px 24px ${neuLight}
            `,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography
                variant="h6"
                sx={{ color: '#9fb4ff', fontWeight: 600 }}
              >
                Recent Drives
              </Typography>

              <Button
                size="small"
                onClick={() => navigate('/admin/drives')}
                sx={{ color: '#9fb4ff' }}
              >
                View All
              </Button>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Company', 'Role', 'Status'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          color: '#9fb4ff',
                          fontWeight: 600,
                          borderBottom: '1px solid #1f3558',
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {drives.map((drive) => (
                    <TableRow
                      key={drive._id}
                      sx={{
                        '&:hover': { background: '#162a48' },
                      }}
                    >
                      <TableCell sx={{ color: '#e5ecff' }}>
                        {drive.companyName}
                      </TableCell>
                      <TableCell sx={{ color: '#cfd8ff' }}>
                        {drive.jobRole}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Button
                fullWidth
                onClick={() => navigate('/admin/drives')}
                sx={{
                  background: neuBg,
                  color: '#fff',
                  borderRadius: '12px',
                  boxShadow: `
                    6px 6px 14px ${neuDark},
                    -6px -6px 14px ${neuLight}
                  `,
                  '&:hover': { background: neuLight },
                }}
              >
                Manage Drives
              </Button>

              <Button
                fullWidth
                onClick={() => navigate('/admin/coordinators')}
                sx={{
                  background: neuBg,
                  color: '#fff',
                  borderRadius: '12px',
                  boxShadow: `
                    6px 6px 14px ${neuDark},
                    -6px -6px 14px ${neuLight}
                  `,
                  '&:hover': { background: neuLight },
                }}
              >
                Manage Coordinators
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ===================== Create Dialog ===================== */}

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
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'department', label: 'Department', type: 'text' },
              {
                key: 'password',
                label: 'Password (leave empty for auto-generated)',
                type: 'password',
              },
            ].map((field) => (
              <TextField
                key={field.key}
                fullWidth
                label={field.label}
                type={field.type}
                margin="normal"
                value={coordinatorData[field.key]}
                onChange={(e) =>
                  setCoordinatorData({
                    ...coordinatorData,
                    [field.key]: e.target.value,
                  })
                }
                InputLabelProps={{
                  sx: { color: '#9fb4ff' },
                }}
                InputProps={{
                  sx: {
                    color: '#fff',
                    borderRadius: '12px',
                    background: neuBg,
                    boxShadow: `
                      inset 4px 4px 8px ${neuDark},
                      inset -4px -4px 8px ${neuLight}
                    `,
                  },
                }}
              />
            ))}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button sx={{ color: '#9fb4ff' }} onClick={() => setOpenDialog(false)}>
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
                '&:hover': { background: neuLight },
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;