import React from 'react';
import ManageEventsPage from '@/components/ManageEvents/ManageEventsPage';

const ManageSocialEvents: React.FC = () => {
  return (
    <ManageEventsPage
      pageType="socialEvents"
      pageTitle="Social Events Management"
      pageDescription="Configure hero banners, age group booking packages, and experience highlight cards for social events and private parties."
    />
  );
};

export default ManageSocialEvents;
