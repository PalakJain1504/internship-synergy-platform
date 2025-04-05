import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import ProjectPortal from '@/pages/ProjectPortal';
import InternshipPortal from '@/pages/InternshipPortal';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/context/AuthContext';
import OAuth2Callback from '@/pages/OAuth2Callback';
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/project-portal" element={<ProjectPortal />} />
          <Route path="/internship-portal" element={<InternshipPortal />} />
          <Route path="/oauth2callback" element={<OAuth2Callback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;
