import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { PremiumBadge } from '../Premium/PremiumBadge';

interface SidebarProps {
  onClose: () => void;
}

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  overflow-y: auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const LogoIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${({ theme }) => theme.spacing.sm};
`;

const NavLink = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.textSecondary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceLight : 'transparent'};
  text-align: left;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NavLinkIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const NavLinkContent = styled.span`
  flex: 1;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
  margin: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.danger};
  text-align: left;
  width: calc(100% - ${({ theme }) => theme.spacing.sm} * 2);
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(225, 112, 85, 0.1);
  }
`;

const navItems = [
  { path: '/dashboard', icon: 'D', key: 'dashboard' },
  { path: '/income', icon: 'I', key: 'income' },
  { path: '/insights', icon: 'S', key: 'insights' },
  { path: '/simulations', icon: 'G', key: 'simulations', premium: true },
  { path: '/goals', icon: 'T', key: 'goals', premium: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');
  const logout = useAuthStore((state) => state.logout);

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarWrapper>
      <Logo onClick={() => handleNavClick('/dashboard')}>
        <LogoIcon>LC</LogoIcon>
        {t('appName')}
      </Logo>
      <Nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            $active={location.pathname === item.path}
            onClick={() => handleNavClick(item.path)}
          >
            <NavLinkIcon>{item.icon}</NavLinkIcon>
            <NavLinkContent>{t(item.key)}</NavLinkContent>
            {item.premium && <PremiumBadge />}
          </NavLink>
        ))}
      </Nav>
      <Divider />
      <LogoutButton onClick={handleLogout}>
        <NavLinkIcon>L</NavLinkIcon>
        <NavLinkContent>{t('logout')}</NavLinkContent>
      </LogoutButton>
    </SidebarWrapper>
  );
};
