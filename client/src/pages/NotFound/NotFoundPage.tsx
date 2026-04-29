import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI/Button';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background};
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 96px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  max-width: 400px;
`;

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <ErrorCode>404</ErrorCode>
      <Title>Page not found</Title>
      <Description>
        The page you are looking for does not exist or has been moved.
      </Description>
      <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
    </PageWrapper>
  );
};

export default NotFoundPage;
