import { useEffect, useState } from 'react';
import CoordinatorLayout from '../components/CoordinatorLayout';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchDrives();
    fetchApplications();
  }, []);

  const fetchDrives = async () => {
    try {
      const { data } = await axiosInstance.get('/drives');
      // Filter drives for coordinator's department
      const filteredDrives = data.filter(drive => 
        drive.department === userInfo?.department || 
        drive.assignedTo?.some(assignment => assignment.department === userInfo?.department)
      );
      setDrives(filteredDrives.slice(0, 5));
    } catch (error) {
      console.error('Error fetching drives:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await axiosInstance.get('/applications');
      setApplications(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  return (
    <CoordinatorLayout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#1e3a5f', fontSize: '2rem' }}>
          Coordinator Dashboard
        </Typography>

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
                  Assigned Drives
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
                  onClick={() => navigate('/coordinator/drives')}
                >
                  View All Drives
                </Button>
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
                  Recent Applications
                </Typography>
                <TableContainer sx={{ bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Student</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Company</TableCell>
                        <TableCell sx={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app._id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                          <TableCell sx={{ color: '#333' }}>{app.student?.name}</TableCell>
                          <TableCell sx={{ color: '#666' }}>{app.drive?.companyName}</TableCell>
                          <TableCell>
                            <Chip
                              label={app.status}
                              size="small"
                              sx={{
                                bgcolor:
                                  app.status === 'Selected'
                                    ? 'rgba(76, 175, 80, 0.9)'
                                    : app.status === 'Rejected'
                                    ? 'rgba(244, 67, 54, 0.9)'
                                    : 'rgba(158, 158, 158, 0.9)',
                                color: 'white'
                              }}
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
                  onClick={() => navigate('/applications')}
                >
                  View All Applications
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
                  onClick={() => navigate('/coordinator/students')}
                >
                  View Students
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </CoordinatorLayout>
  );
};

export default CoordinatorDashboard;

