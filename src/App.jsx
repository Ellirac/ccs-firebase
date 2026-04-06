// src/App.jsx — CCS Firebase Profiling System
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppLayout, { ProtectedRoute } from "./components/layout/AppLayout";
import "./index.css";

// Auth
import Login   from "./pages/auth/Login";
import Landing from "./pages/Landing";

// All pages from single file
import {
  ProfileSettings,
  // Admin
  AdminDashboard, OrgStructure, AdminStudentProfiles, AdminFacultyProfiles,
  // Faculty
  FacultyDashboard, FacultyMyStudents, FacultyModules, FacultyManageGrades,
  // Student
  StudentDashboard, StudentGrades, StudentGradeHistory, StudentActivities, StudentAwards, StudentModulesView,
  // Shared
  EventsPage, CurriculumPage, ResearchPage,
} from "./pages/AllPages";

// Schedule page (reused across roles)
import { SchedulePage } from "./pages/shared/Schedule";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style:{ background:"#131922", color:"#E8EFF8", border:"1px solid rgba(255,255,255,0.08)", fontFamily:"'DM Sans',sans-serif", fontSize:13 },
          success:{ iconTheme:{ primary:"#34D399", secondary:"#131922" } },
          error:  { iconTheme:{ primary:"#F87171", secondary:"#131922" } },
        }}/>

        <Routes>
          <Route path="/"      element={<Landing/>}/>
          <Route path="/login" element={<Login/>}/>

          {/* ADMIN */}
          <Route element={<ProtectedRoute roles={["admin"]}/>}>
            <Route element={<AppLayout/>}>
              <Route path="/admin/dashboard"     element={<AdminDashboard/>}/>
              <Route path="/admin/profile"       element={<ProfileSettings/>}/>
              <Route path="/admin/org-structure" element={<OrgStructure/>}/>
              <Route path="/admin/students"      element={<AdminStudentProfiles/>}/>
              <Route path="/admin/faculty"       element={<AdminFacultyProfiles/>}/>
              <Route path="/admin/events"        element={<EventsPage/>}/>
              <Route path="/admin/schedule"      element={<SchedulePage/>}/>
              <Route path="/admin/curriculum"    element={<CurriculumPage/>}/>
              <Route path="/admin/research"      element={<ResearchPage/>}/>
            </Route>
          </Route>

          {/* FACULTY */}
          <Route element={<ProtectedRoute roles={["faculty"]}/>}>
            <Route element={<AppLayout/>}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard/>}/>
              <Route path="/faculty/profile"   element={<ProfileSettings/>}/>
              <Route path="/faculty/students"  element={<FacultyMyStudents/>}/>
              <Route path="/faculty/modules"   element={<FacultyModules/>}/>
              <Route path="/faculty/grades"    element={<FacultyManageGrades/>}/>
              <Route path="/faculty/schedule"  element={<SchedulePage/>}/>
              <Route path="/faculty/research"  element={<ResearchPage/>}/>
              <Route path="/faculty/events"    element={<EventsPage/>}/>
            </Route>
          </Route>

          {/* STUDENT */}
          <Route element={<ProtectedRoute roles={["student"]}/>}>
            <Route element={<AppLayout/>}>
              <Route path="/student/dashboard"     element={<StudentDashboard/>}/>
              <Route path="/student/profile"       element={<ProfileSettings/>}/>
              <Route path="/student/schedule"      element={<SchedulePage/>}/>
              <Route path="/student/grades"        element={<StudentGrades/>}/>
              <Route path="/student/grade-history" element={<StudentGradeHistory/>}/>
              <Route path="/student/modules"       element={<StudentModulesView/>}/>
              <Route path="/student/activities"    element={<StudentActivities/>}/>
              <Route path="/student/awards"        element={<StudentAwards/>}/>
              <Route path="/student/events"        element={<EventsPage/>}/>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
