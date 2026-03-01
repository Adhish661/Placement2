import AdminLayout from '../components/AdminLayout';
import DrivesPage from './DrivesPage';
import { Box } from '@mui/material';

const neuBg = '#0f1b2d';

const AdminDrivesPage = () => {
  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: '100vh',
          background: neuBg,
          p: 10,
          animation: 'fadeIn 0.4s ease-out',
          borderRadius: 4,

          /* 0.1 bigger */
          transform: 'scale(1.1)',
          transformOrigin: 'top center',

          /* no shadow at all */
          boxShadow: 'none',
        }}
      >
        <DrivesPage />
      </Box>
    </AdminLayout>
  );
};

export default AdminDrivesPage;