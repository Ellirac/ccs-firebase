// src/components/layout/AppLayout.jsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import { Loading } from "../common";

export function ProtectedRoute({ roles }) {
  const { currentUser, role, loading } = useAuth();
  if (loading) return <div style={{minHeight:"100vh"}}><Loading text="Authenticating…"/></div>;
  if (!currentUser) return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(role)) return <Navigate to="/login" replace/>;
  return <Outlet/>;
}

export default function AppLayout() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{minHeight:"100vh"}}><Loading text="Loading…"/></div>;
  if (!currentUser) return <Navigate to="/login" replace/>;
  return (
    <div className="app-layout">
      <Sidebar/>
      <div className="main-content"><Outlet/></div>
    </div>
  );
}
