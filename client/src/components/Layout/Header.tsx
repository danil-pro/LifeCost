import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: 992px) {
    padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.xxl};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.base};
`;

const HamburgerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }

  @media (min-width: 992px) {
    display: none;
  }
`;

const ProfileSection = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }
`;

const Avatar = styled.div<{ $bgColor: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  flex-shrink: 0;
`;

const ProfileName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 576px) {
    display: none;
  }
`;

// Deterministic color from a string
function stringToColor(str: string): string {
  const colors = ['#6C5CE7', '#00CEC9', '#E17055', '#FD79A8', '#00B894', '#FDCB6E', '#0984E3', '#D63031'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitial(str: string): string {
  if (!str) return '?';
  return str.charAt(0).toUpperCase();
}

export const Header: React.FC = () => {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const displayName = user?.displayName || user?.email || '';
  const initial = getInitial(displayName);
  const avatarColor = stringToColor(displayName);

  const handleProfileClick = () => {
    navigate('/settings');
  };

  return (
    <HeaderWrapper>
      <LeftSection>
        <HamburgerButton onClick={toggleSidebar} aria-label={t('toggleMenu')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </HamburgerButton>
      </LeftSection>
      <ProfileSection onClick={handleProfileClick} aria-label={t('settings')}>
        <Avatar $bgColor={avatarColor}>{initial}</Avatar>
        <ProfileName>{displayName}</ProfileName>
      </ProfileSection>
    </HeaderWrapper>
  );
};
