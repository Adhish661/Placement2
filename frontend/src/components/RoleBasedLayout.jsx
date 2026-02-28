import { useSelector } from 'react-redux';
import StudentLayout from './StudentLayout';
import CoordinatorLayout from './CoordinatorLayout';
import AdminLayout from './AdminLayout';

const RoleBasedLayout = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    return null;
  }

  switch (userInfo.role) {
    case 'STUDENT':
      return <StudentLayout>{children}</StudentLayout>;
    case 'DEPT_COORDINATOR':
      return <CoordinatorLayout>{children}</CoordinatorLayout>;
    case 'ADMIN':
      return <AdminLayout>{children}</AdminLayout>;
    default:
      return <div>{children}</div>;
  }
};

export default RoleBasedLayout;

