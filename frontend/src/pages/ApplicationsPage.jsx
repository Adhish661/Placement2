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
  InputLabel,
  Button,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          {userInfo?.role === 'STUDENT' ? 'My Applications' : 'Applications'}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {userInfo?.role !== 'STUDENT' && <TableCell>Student</TableCell>}
                <TableCell>Company</TableCell>
                <TableCell>Job Role</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                {userInfo?.role !== 'STUDENT' && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  {userInfo?.role !== 'STUDENT' && (
                    <TableCell>{app.student?.name}</TableCell>
                  )}
                  <TableCell>{app.drive?.companyName}</TableCell>
                  <TableCell>{app.drive?.jobRole}</TableCell>
                  <TableCell>
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
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        >
                          <MenuItem value="Applied">Applied</MenuItem>
                          <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                          <MenuItem value="Selected">Selected</MenuItem>
                          <MenuItem value="Pending">Pending</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </TableCell>
                  {userInfo?.role !== 'STUDENT' && (
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => window.open(`/drives/${app.drive?._id}`, '_blank')}
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
      </Box>
    </RoleBasedLayout>
  );
};

export default ApplicationsPage;

