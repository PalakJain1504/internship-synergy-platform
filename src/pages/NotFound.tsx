
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div 
        className="text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-blue/10 rounded-full mb-4">
            <span className="text-4xl font-bold text-brand-blue">404</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-brand-blue hover:bg-brand-darkBlue"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
