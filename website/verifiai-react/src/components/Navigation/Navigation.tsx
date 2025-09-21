import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  transition: all 0.3s ease;

  &.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: var(--shadow-md);
  }
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.25rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  .logo-icon {
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(79, 70, 229, 0.3));
  }

  .logo-text {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  text-decoration: none;
  color: ${props => props.$isActive ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$isActive ? '600' : '500'};
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    color: var(--primary-color);
    background: rgba(79, 70, 229, 0.05);
    transform: translateY(-1px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${props => props.$isActive ? '80%' : '0'};
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(79, 70, 229, 0.05);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  padding: 1rem 2rem 2rem;
  box-shadow: var(--shadow-lg);

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)<{ $isActive: boolean }>`
  display: block;
  text-decoration: none;
  color: ${props => props.$isActive ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$isActive ? '600' : '500'};
  font-size: 1.1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s ease;

  &:hover {
    color: var(--primary-color);
    padding-left: 0.5rem;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StatusIndicator = styled.div<{ $isOnline: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isOnline ? 'var(--success-color)' : 'var(--danger-color)'};
  margin-left: 0.5rem;
  animation: ${props => props.$isOnline ? 'pulse 2s infinite' : 'none'};
`;

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/report', label: 'Report' },
    { path: '/chat', label: 'AI Assistant' },
    { path: '/learn', label: 'Learn' },
    { path: '/about', label: 'About' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check API connectivity
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/health');
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <NavContainer className={isScrolled ? 'scrolled' : ''}>
        <NavContent>
          <Logo to="/">
            <span className="logo-text">VerifiAI</span>
            <StatusIndicator $isOnline={isOnline} title={isOnline ? 'API Online' : 'API Offline'} />
          </Logo>

          <NavLinks>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                $isActive={isActive(item.path)}
              >
                {item.label}
              </NavLink>
            ))}
          </NavLinks>

          <MobileMenuButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </MobileMenuButton>
        </NavContent>
      </NavContainer>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item) => (
              <MobileNavLink
                key={item.path}
                to={item.path}
                $isActive={isActive(item.path)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;