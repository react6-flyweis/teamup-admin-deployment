import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Register from "@/pages/Register";
import ManageHome from "@/pages/ManageHome";
import ManageHeader from "@/pages/ManageHeader";
import ManageFooter from "@/pages/ManageFooter";
import CategoryFormPage from "@/pages/ManageHeader/CategoryFormPage";
import GameFormPage from "@/pages/ManageHeader/GameFormPage";
import GroupActivityFormPage from "@/pages/ManageHeader/GroupActivityFormPage";
import TeamPartiesFormPage from "@/pages/ManageHeader/TeamPartiesFormPage";
import BoomBundleFormPage from "@/pages/ManageHeader/BoomBundleFormPage";
import QueensNightFormPage from "@/pages/ManageHeader/QueensNightFormPage";
import Games from "@/pages/Games";
import Bites from "@/pages/Bites";
import Bookings from "@/pages/Bookings";
import Payments from "@/pages/Payments";
import Promotions from "@/pages/Promotions";
import Customers from "@/pages/Customers";
import StaffRoles from "@/pages/StaffRoles";
import Alerts from "@/pages/Alerts";
import Insights from "@/pages/Insights";
import Security from "@/pages/Security";
import Login from "./pages/Login";
import StaffDetail from "./pages/StaffDetail";
import Venues from "./pages/Venues";
import SocialReviews from "./pages/SocialReviews";
import Enquiries from "@/pages/Enquiries";
import RolesPermissions from "@/pages/RolesPermissions";
import AdminUsers from "@/pages/AdminUsers";
import AuditLogs from "@/pages/AuditLogs";
import ProfileSettings from "@/pages/ProfileSettings";
import NotFound from "@/pages/NotFound";
import { AuthGuard } from "@/components/AuthGuard";
import { PermissionGuard } from "@/components/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { navigationItems } from "@/config/navigation";
import { ROLES } from "@/types";

const DefaultRedirect: React.FC = () => {
  const { canAccessTab, isSuperAdmin } = usePermissions();

  if (isSuperAdmin || canAccessTab("manage_home")) {
    return <Navigate to="/manage-home" replace />;
  }

  const firstAllowed = navigationItems.find((item) => {
    if (item.tabId && canAccessTab(item.tabId)) return true;
    if (item.permission && canAccessTab(item.permission)) return true;
    return canAccessTab(item.id);
  });

  if (firstAllowed) {
    return <Navigate to={firstAllowed.path} replace />;
  }

  return <Navigate to="/manage-home" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes - No Layout */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Dashboard Routes - With Layout & Protected by AuthGuard */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<DefaultRedirect />} />
            <Route
              path="manage-home"
              element={
                <PermissionGuard tabId="manage_home">
                  <ManageHome />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-header"
              element={
                <PermissionGuard tabId="manage_header">
                  <ManageHeader />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-header/category/:categoryId"
              element={
                <PermissionGuard tabId="manage_header">
                  <CategoryFormPage />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-header/:categoryId/game/:subItemId"
              element={
                <PermissionGuard tabId="manage_header">
                  <GameFormPage />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-header/:categoryId/group-activity/:subItemId"
              element={
                <PermissionGuard tabId="manage_header">
                  <GroupActivityFormPage />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-header/:categoryId/team-parties/:subItemId"
              element={
                <PermissionGuard tabId="manage_header">
                  <TeamPartiesFormPage />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-header/:categoryId/boom-bundle/:subItemId"
              element={
                <PermissionGuard tabId="manage_header">
                  <BoomBundleFormPage />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-header/:categoryId/queens-night/:subItemId"
              element={
                <PermissionGuard tabId="manage_header">
                  <QueensNightFormPage />
                </PermissionGuard>
              }
            />
            <Route
              path="manage-footer"
              element={
                <PermissionGuard tabId="manage_footer">
                  <ManageFooter />
                </PermissionGuard>
              }
            />
            <Route
              path="game-venue"
              element={
                <PermissionGuard tabId="game_venue">
                  <Games />
                </PermissionGuard>
              }
            />
            <Route
              path="food-drinks"
              element={
                <PermissionGuard tabId="bites_drinks">
                  <Bites />
                </PermissionGuard>
              }
            />
            <Route
              path="bookings"
              element={
                <PermissionGuard tabId="bookings">
                  <Bookings />
                </PermissionGuard>
              }
            />
            <Route path="payments" element={<Payments />} />
            <Route path="promotion" element={<Promotions />} />
            <Route path="customers" element={<Customers />} />
            <Route
              path="staff-roles"
              element={
                <PermissionGuard tabId="users">
                  <StaffRoles />
                </PermissionGuard>
              }
            />
            <Route
              path="staff-roles/:id"
              element={
                <PermissionGuard tabId="users">
                  <StaffDetail />
                </PermissionGuard>
              }
            />
            <Route path="alerts" element={<Alerts />} />
            <Route
              path="social-reviews"
              element={
                <PermissionGuard tabId="social_reviews">
                  <SocialReviews />
                </PermissionGuard>
              }
            />
            <Route
              path="venues"
              element={
                <PermissionGuard tabId="venues">
                  <Venues />
                </PermissionGuard>
              }
            />
            <Route
              path="enquiries"
              element={
                <PermissionGuard tabId="enquiries">
                  <Enquiries />
                </PermissionGuard>
              }
            />
            <Route path="insight" element={<Insights />} />
            <Route path="security" element={<Security />} />
            <Route
              path="roles-permissions"
              element={
                <PermissionGuard roles={ROLES.SUPER_ADMIN}>
                  <RolesPermissions />
                </PermissionGuard>
              }
            />
            <Route
              path="admin-users"
              element={
                <PermissionGuard roles={ROLES.SUPER_ADMIN}>
                  <AdminUsers />
                </PermissionGuard>
              }
            />
            <Route
              path="audit-logs"
              element={
                <PermissionGuard roles={ROLES.SUPER_ADMIN}>
                  <AuditLogs />
                </PermissionGuard>
              }
            />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="profile-settings" element={<Navigate to="/profile" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
