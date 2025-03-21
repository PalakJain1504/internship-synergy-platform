
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Won't render during redirect
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Progress Port" />
      
      <main className="page-container">
        <motion.div
          className="w-full max-w-5xl mx-auto py-8 px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-block p-4 rounded-full bg-brand-blue/10 mb-4">
              <img 
                src="/placeholder.svg" 
                alt="Logo" 
                className="h-24 w-24 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}</h1>
            <p className="text-gray-500">
              Access and manage student projects and internships
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="p-8">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6 text-brand-blue" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Portal</h2>
                <p className="text-gray-500 mb-6">
                  View and assess student projects, track milestones, and provide guidance.
                </p>
                <Button
                  onClick={() => navigate('/project-portal')}
                  className="w-full bg-brand-blue hover:bg-brand-darkBlue"
                >
                  Access Project Portal
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="p-8">
                <div className="w-12 h-12 bg-brand-red/10 rounded-lg flex items-center justify-center mb-6">
                  <BookOpen className="h-6 w-6 text-brand-red" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Internship Portal</h2>
                <p className="text-gray-500 mb-6">
                  Oversee student internships, verify reports, and evaluate progress.
                </p>
                <Button
                  disabled={true}
                  variant="outline"
                  className="w-full border-gray-200 text-gray-500"
                >
                  Coming Soon
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
