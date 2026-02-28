import { useSelector } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';
import StudentDashboard from '../pages/StudentDashboard';
import CoordinatorDashboard from '../pages/CoordinatorDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const DashboardRouter = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Debug logging
  console.log('DashboardRouter - userInfo:', userInfo);
  console.log('DashboardRouter - userInfo.role:', userInfo?.role);

  if (!userInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading user information...
        </Typography>
      </Box>
    );
  }

  switch (userInfo.role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'DEPT_COORDINATOR':
      return <CoordinatorDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Unknown user role: {userInfo.role || 'undefined'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Available roles: STUDENT, DEPT_COORDINATOR, ADMIN
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please contact administrator or try logging out and logging in again.
          </Typography>
          <pre style={{ marginTop: '20px', textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </Box>
      );
  }
};

export default DashboardRouter;

