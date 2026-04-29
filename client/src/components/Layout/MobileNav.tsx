import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  padding-bottom: calc(${({ theme }) => theme.spacing.sm} + env(safe-area-inset-bottom));
  z-index: 50;

  @media (min-width: 992px) {
    display: none;
  }
`;

const NavItem = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  transition: color 0.2s ease;
  min-width: 60px;
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const mobileNavItems = [
  { path: '/dashboard', icon: 'D', key: 'dashboard' },
  { path: '/income', icon: 'I', key: 'income' },
  { path: '/insights', icon: 'S', key: 'insights' },
  { path: '/goals', icon: 'T', key: 'goals' },
  { path: '/settings', icon: 'G', key: 'settings' },
];

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  return (
    <NavWrapper>
      {mobileNavItems.map((item) => (
        <NavItem
          key={item.path}
          $active={location.pathname === item.path}
          onClick={() => navigate(item.path)}
        >
          <NavIcon>{item.icon}</NavIcon>
          {t(item.key)}
        </NavItem>
      ))}
    </NavWrapper>
  );
};
