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
      <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 800,
            mb: 4,
            fontSize: '2rem',
            color: '#e5e7eb',
            letterSpacing: 0.3,
          }}
        >
          Coordinator Dashboard
        </Typography>

        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <Card sx={{ 
              boxShadow: '0 18px 45px rgba(15,23,42,0.7)', 
              borderRadius: 3,
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'rgba(15,23,42,0.96)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 24px 70px rgba(15,23,42,0.9)',
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: '#e5e7eb', fontWeight: 700, mb: 2 }}
                >
                  Assigned Drives
                </Typography>
                <TableContainer
                  sx={{
                    bgcolor: 'rgba(15,23,42,0.9)',
                    borderRadius: 2,
                    border: '1px solid rgba(148,163,184,0.35)',
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.95rem' }}>Company</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.95rem' }}>Role</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {drives.map((drive) => (
                        <TableRow
                          key={drive._id}
                          sx={{ '&:hover': { bgcolor: 'rgba(30,64,175,0.35)' } }}
                        >
                          <TableCell sx={{ color: '#e5e7eb' }}>{drive.companyName}</TableCell>
                          <TableCell sx={{ color: 'rgba(209,213,219,0.9)' }}>{drive.jobRole}</TableCell>
                          <TableCell>
                            <Chip
                              label={drive.status}
                              size="small"
                              sx={{
                                bgcolor:
                                  drive.status === 'Active'
                                    ? 'rgba(34,197,94,0.9)'
                                    : 'rgba(55,65,81,0.9)',
                                color: 'white',
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
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    color: 'white',
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 12px 32px rgba(37, 99, 235, 0.6)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)',
                      boxShadow: '0 16px 42px rgba(37, 99, 235, 0.8)',
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

          <Grid item xs={12}>
            <Card sx={{ 
              boxShadow: '0 18px 45px rgba(15,23,42,0.7)', 
              borderRadius: 3, 
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'rgba(15,23,42,0.96)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 24px 70px rgba(15,23,42,0.9)',
                transform: 'translateY(-4px)',
              }
            }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: '#e5e7eb', fontWeight: 700, mb: 2 }}
                >
                  Recent Applications
                </Typography>
                <TableContainer
                  sx={{
                    bgcolor: 'rgba(15,23,42,0.9)',
                    borderRadius: 2,
                    border: '1px solid rgba(148,163,184,0.35)',
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.95rem' }}>Student</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.95rem' }}>Company</TableCell>
                        <TableCell sx={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow
                          key={app._id}
                          sx={{ '&:hover': { bgcolor: 'rgba(30,64,175,0.35)' } }}
                        >
                          <TableCell sx={{ color: '#e5e7eb' }}>{app.student?.name}</TableCell>
                          <TableCell sx={{ color: 'rgba(209,213,219,0.9)' }}>{app.drive?.companyName}</TableCell>
                          <TableCell>
                            <Chip
                              label={app.status}
                              size="small"
                              sx={{
                                bgcolor:
                                  app.status === 'Selected'
                                    ? 'rgba(34,197,94,0.9)'
                                    : app.status === 'Rejected'
                                    ? 'rgba(239,68,68,0.9)'
                                    : 'rgba(55,65,81,0.9)',
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
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    color: 'white',
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 12px 32px rgba(37, 99, 235, 0.6)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)',
                      boxShadow: '0 16px 42px rgba(37, 99, 235, 0.8)',
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
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    color: 'white',
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 12px 32px rgba(37, 99, 235, 0.6)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)',
                      boxShadow: '0 16px 42px rgba(37, 99, 235, 0.8)',
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

