import { useEffect, useState } from 'react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import ResourcesPage from './ResourcesPage';

const CoordinatorResourcesPage = () => {
  // ResourcesPage now handles its own content, just needs the layout wrapper
  return (
    <CoordinatorLayout>
      <ResourcesPage />
    </CoordinatorLayout>
  );
};

export default CoordinatorResourcesPage;

