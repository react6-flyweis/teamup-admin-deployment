import React from 'react';
import ManageEventsPage from '@/components/ManageEvents/ManageEventsPage';

const ManageCorporateEvents: React.FC = () => {
  return (
    <ManageEventsPage
      pageType="corporateEvents"
      pageTitle="Corporate Events Management"
      pageDescription="Configure hero banners, corporate team packages, and company event highlights for team building and business gatherings."
    />
  );
};

export default ManageCorporateEvents;
