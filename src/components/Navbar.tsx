
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Home } from 'lucide-react';

interface NavbarProps {
  showAuthButtons?: boolean;
  transparent?: boolean;
  logo?: string;
  title?: string;
}

const Navbar = ({ 
  showAuthButtons = true, 
  transparent = false,
  logo = '',
  title = 'K.R. Mangalam University'
}: NavbarProps) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300
    ${isScrolled || !transparent ? 'bg-white/90 shadow-sm backdrop-blur-md' : 'bg-transparent'}
  `;

  return (
    <>
      <header className={navbarClasses}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {logo && (
              <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            )}
            <h1 className={`text-xl font-semibold ${isScrolled || !transparent ? 'text-brand-blue' : 'text-white'}`}>
              {title}
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {location.pathname !== '/' && location.pathname !== '/home' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-brand-blue"
                onClick={() => navigate('/home')}
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Button>
            )}
            
            {showAuthButtons && (
              <>
                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="border-gray-200"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <Button 
                    className="bg-brand-blue hover:bg-brand-darkBlue"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                )}
              </>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              className={`${isScrolled || !transparent ? 'text-gray-700' : 'text-white'}`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 animate-fade-in md:hidden">
          <nav className="flex flex-col space-y-4">
            {location.pathname !== '/' && location.pathname !== '/home' && (
              <Button
                variant="ghost"
                className="justify-start text-gray-700 hover:text-brand-blue"
                onClick={() => {
                  navigate('/home');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Home className="mr-2 h-5 w-5" />
                Home
              </Button>
            )}
            
            {showAuthButtons && (
              <>
                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    className="justify-start border-gray-200"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                ) : (
                  <Button 
                    className="justify-start bg-brand-blue hover:bg-brand-darkBlue"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      )}
      
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;
