import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Box, Typography } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DrivesPage from './pages/DrivesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ResourcesPage from './pages/ResourcesPage';
import CoordinatorDrivesPage from './pages/CoordinatorDrivesPage';
import CoordinatorStudentsPage from './pages/CoordinatorStudentsPage';
import CoordinatorResourcesPage from './pages/CoordinatorResourcesPage';
import AdminCoordinatorsPage from './pages/AdminCoordinatorsPage';
import AdminDrivesPage from './pages/AdminDrivesPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import CoordinatorSettingsPage from './pages/CoordinatorSettingsPage';
import CoordinatorNotificationsPage from './pages/CoordinatorNotificationsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';

// Components
import PrivateRoute from './components/PrivateRoute';
import DashboardRouter from './components/DashboardRouter';
import RoleBasedLayout from './components/RoleBasedLayout';

function App() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={userInfo ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={userInfo ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardRouter />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/drives"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <DrivesPage />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <PrivateRoute>
              <ApplicationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute>
              <RoleBasedLayout>
                <ResourcesPage />
              </RoleBasedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        {/* Coordinator Routes */}
        <Route
          path="/coordinator/students"
          element={
            <PrivateRoute>
              <CoordinatorStudentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/coordinator/drives"
          element={
            <PrivateRoute>
              <CoordinatorDrivesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/coordinator/resources"
          element={
            <PrivateRoute>
              <CoordinatorResourcesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/coordinator/settings"
          element={
            <PrivateRoute>
              <CoordinatorSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/coordinator/notifications"
          element={
            <PrivateRoute>
              <CoordinatorNotificationsPage />
            </PrivateRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/coordinators"
          element={
            <PrivateRoute>
              <AdminCoordinatorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/drives"
          element={
            <PrivateRoute>
              <AdminDrivesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute>
              <AdminSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <PrivateRoute>
              <AdminNotificationsPage />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;

