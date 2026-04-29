import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.base};
  background-color: ${({ theme }) => theme.colors.background};
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 420px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

const Footer = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.base};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeights.medium};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  text-align: center;
  margin: 0;
`;

const RegisterPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('emailRequired'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordMin'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordsMismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/auth/register', { email, password });
      const { accessToken, refreshToken, user } = res.data.data;

      setTokens(accessToken, refreshToken);
      setUser(user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || t('registrationFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <RegisterCard>
        <Title>{t('registerTitle')}</Title>
        <Subtitle>{tc('appName')}</Subtitle>
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Input
            label={t('email')}
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('password')}
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label={t('confirmPassword')}
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            {t('register')}
          </Button>
        </Form>
        <Footer>
          {t('hasAccount')} <Link to="/login">{t('login')}</Link>
        </Footer>
      </RegisterCard>
    </PageWrapper>
  );
};

export default RegisterPage;
