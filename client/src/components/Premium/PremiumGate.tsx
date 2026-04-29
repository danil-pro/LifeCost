import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  children?: React.ReactNode;
}

const GateWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const BlurredContent = styled.div`
  filter: blur(8px);
  pointer-events: none;
  user-select: none;
  width: 100%;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.base};
  background-color: rgba(15, 15, 26, 0.7);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  z-index: 10;
`;

const LockIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(108, 92, 231, 0.15);
  color: ${({ theme }) => theme.colors.primaryLight};
  font-size: 28px;
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const UpgradeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: #ffffff;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

export const PremiumGate: React.FC<PremiumGateProps> = ({ children }) => {
  const { t } = useTranslation('premium');
  const navigate = useNavigate();

  return (
    <GateWrapper>
      {children && <BlurredContent>{children}</BlurredContent>}
      <Overlay>
        <LockIcon>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.76-2.24-5-5-5zm-3 5c0-1.66 1.34-3 3-3s3 1.34 3 3v3H9V7z"
              fill="currentColor"
            />
          </svg>
        </LockIcon>
        <Message>{t('locked')}</Message>
        <UpgradeButton onClick={() => navigate('/settings')}>
          {t('upgrade')}
        </UpgradeButton>
      </Overlay>
    </GateWrapper>
  );
};
