import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Register from "@/pages/Register";
// import Dashboard from "./pages/Dashboard";
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
import NotFound from "@/pages/NotFound";
import { AuthGuard } from "@/components/AuthGuard";

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
            <Route index element={<Navigate to="/manage-home" replace />} />
            <Route path="manage-home" element={<ManageHome />} />
            <Route path="manage-header" element={<ManageHeader />} />
            <Route path="manage-header/category/:categoryId" element={<CategoryFormPage />} />
            <Route path="manage-header/:categoryId/game/:subItemId" element={<GameFormPage />} />
            <Route path="manage-header/:categoryId/group-activity/:subItemId" element={<GroupActivityFormPage />} />
            <Route path="manage-header/:categoryId/team-parties/:subItemId" element={<TeamPartiesFormPage />} />
            <Route path="manage-header/:categoryId/boom-bundle/:subItemId" element={<BoomBundleFormPage />} />
            <Route path="manage-header/:categoryId/queens-night/:subItemId" element={<QueensNightFormPage />} />
            <Route path="manage-footer" element={<ManageFooter />} />
            <Route path="game-venue" element={<Games />} />
            <Route path="food-drinks" element={<Bites />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="payments" element={<Payments />} />
            <Route path="promotion" element={<Promotions />} />
            <Route path="customers" element={<Customers />} />
            <Route path="staff-roles" element={<StaffRoles />} />
            <Route path="staff-roles/:id" element={<StaffDetail />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="social-reviews" element={<SocialReviews />} />
            <Route path="venues" element={<Venues />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="insight" element={<Insights />} />
            <Route path="security" element={<Security />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}


export default App;
