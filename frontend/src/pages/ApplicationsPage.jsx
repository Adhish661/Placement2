import { useEffect, useState } from 'react';
import RoleBasedLayout from '../components/RoleBasedLayout';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Button,
  Fade,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const neuBg = '#0f1b2d';
const neuCard = '#13243c';
const neuBorder = 'rgba(255,255,255,0.06)';

const ApplicationsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await axiosInstance.get('/applications');
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axiosInstance.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      toast.success('Application status updated');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Shortlisted':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <RoleBasedLayout>
      <Box
        sx={{
          minHeight: '100%',
          background: neuBg,
          borderRadius: 4,
          animation: 'fadeIn 0.4s ease-out',
          p: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#e5ecff',
            mb: 3,
            animation: 'fadeIn 0.6s ease',
          }}
        >
          {userInfo?.role === 'STUDENT' ? 'My Applications' : 'Applications'}
        </Typography>

        <Fade in>
          <Paper
            sx={{
              background: neuCard,
              borderRadius: 3,
              border: `1px solid ${neuBorder}`,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {userInfo?.role !== 'STUDENT' && (
                      <TableCell sx={{ color: '#cfd8ff', fontWeight: 600 }}>
                        Student
                      </TableCell>
                    )}
                    <TableCell sx={{ color: '#cfd8ff', fontWeight: 600 }}>
                      Company
                    </TableCell>
                    <TableCell sx={{ color: '#cfd8ff', fontWeight: 600 }}>
                      Job Role
                    </TableCell>
                    <TableCell sx={{ color: '#cfd8ff', fontWeight: 600 }}>
                      Applied Date
                    </TableCell>
                    <TableCell sx={{ color: '#cfd8ff', fontWeight: 600 }}>
                      Status
                    </TableCell>
                    {userInfo?.role !== 'STUDENT' && (
                      <TableCell sx={{ color: '#cfd8ff', fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {applications.map((app) => (
                    <TableRow
                      key={app._id}
                      sx={{
                        transition: 'all .2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.03)',
                        },
                      }}
                    >
                      {userInfo?.role !== 'STUDENT' && (
                        <TableCell sx={{ color: '#e5ecff' }}>
                          {app.student?.name}
                        </TableCell>
                      )}

                      <TableCell sx={{ color: '#e5ecff' }}>
                        {app.drive?.companyName}
                      </TableCell>

                      <TableCell sx={{ color: '#b8c3ff' }}>
                        {app.drive?.jobRole}
                      </TableCell>

                      <TableCell sx={{ color: '#b8c3ff' }}>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {userInfo?.role === 'STUDENT' ? (
                          <Chip
                            label={app.status}
                            color={getStatusColor(app.status)}
                            size="small"
                          />
                        ) : (
                          <FormControl
                            size="small"
                            sx={{
                              minWidth: 140,
                            }}
                          >
                            <Select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  app._id,
                                  e.target.value
                                )
                              }
                              sx={{
                                background: 'rgba(255,255,255,0.04)',
                                color: '#e5ecff',
                                borderRadius: 2,
                              }}
                            >
                              <MenuItem value="Applied">
                                Applied
                              </MenuItem>
                              <MenuItem value="Shortlisted">
                                Shortlisted
                              </MenuItem>
                              <MenuItem value="Rejected">
                                Rejected
                              </MenuItem>
                              <MenuItem value="Selected">
                                Selected
                              </MenuItem>
                              <MenuItem value="Pending">
                                Pending
                              </MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>

                      {userInfo?.role !== 'STUDENT' && (
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() =>
                              window.open(
                                `/drives/${app.drive?._id}`,
                                '_blank'
                              )
                            }
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              color: '#9fb4ff',
                            }}
                          >
                            View Drive
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </Box>
    </RoleBasedLayout>
  );
};

export default ApplicationsPage;