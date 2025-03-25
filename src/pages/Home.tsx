
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Folder, FileText, ChevronRight, Briefcase } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Progress Port" />
      
      <main className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-8">
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold text-gray-900">Welcome to Progress Port</h1>
              <p className="text-gray-600 mt-2">
                Manage and track student projects, internships, and academic progress
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-brand-blue">
                      <Folder className="h-5 w-5 mr-2" />
                      <span>Project Portal</span>
                    </CardTitle>
                    <CardDescription>
                      Manage student projects across courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Track project submissions, forms, reports, and presentations. Filter by course, year, semester, and faculty.
                    </p>
                    <Button 
                      variant="default" 
                      className="bg-brand-blue hover:bg-brand-darkBlue w-full"
                      onClick={() => navigate('/project-portal')}
                    >
                      Access Project Portal
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-green-600">
                      <Briefcase className="h-5 w-5 mr-2" />
                      <span>Internship Portal</span>
                    </CardTitle>
                    <CardDescription>
                      Manage student internships and industry experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Track internship documentation, attendance, and final reports. Monitor student progress at partner organizations.
                    </p>
                    <Button 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700 w-full"
                      onClick={() => navigate('/internship-portal')}
                    >
                      Access Internship Portal
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-gray-600 mt-1">
                Recent updates and activity in the system
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">System Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="p-3 bg-gray-50 rounded-md flex items-start">
                      <FileText className="h-5 w-5 text-brand-blue mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Project Portal Launched</p>
                        <p className="text-xs text-gray-500">Added new features for tracking project submissions</p>
                      </div>
                    </li>
                    <li className="p-3 bg-gray-50 rounded-md flex items-start">
                      <FileText className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Internship Portal Released</p>
                        <p className="text-xs text-gray-500">New portal for managing student internships</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
