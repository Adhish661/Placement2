import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import DrivesPage from './DrivesPage';

const AdminDrivesPage = () => {
  return (
    <AdminLayout>
      <DrivesPage />
    </AdminLayout>
  );
};

export default AdminDrivesPage;

