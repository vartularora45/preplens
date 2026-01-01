// ============= DASHBOARD ROUTES =============
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashLayout from "../components/Dashcomponents/DashLayout.jsx";
import DashPage from "../components/Dashcomponents/DashPage";
import SubmitProblemPage from "../components/Dashcomponents/SubmitProblemPage";
import Profile from "../components/Dashcomponents/Profile";
import SettingsPage from "../components/Dashcomponents/Setting";
import SubmissionsTable from "../components/Dashcomponents/Dashutils/SubmissionTable.jsx";
import SubmissionsChart from "../components/Dashcomponents/Dashutils/SubmissionChart.jsx";
// ============= MAIN APP =============
export default function Dashboard() {
  return (
    
      <DashLayout>
        <Routes>
          <Route path="/" element={<DashPage />} />
          <Route path="/dashboard" element={<DashPage />} />
          <Route path="/submit" element={<SubmitProblemPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/submissions" element={<SubmissionsTable />} />
          <Route path="/activity" element={<SubmissionsChart />} />
        </Routes>
      </DashLayout>
    
  );
}
