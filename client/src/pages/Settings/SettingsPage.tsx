import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { CurrencySelector } from '../../components/Currency/CurrencySelector';
import { useLocaleStore } from '../../store/localeStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../../components/UI/Badge';
import client from '../../api/client';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
`;

const SettingValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DisplayNameRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.base};
  padding: ${({ theme }) => theme.spacing.base} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const DisplayNameInput = styled.div`
  flex: 1;
`;

const LanguageToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const LangButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? '#ffffff' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TierToggleNote = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  padding-top: ${({ theme }) => theme.spacing.xs};
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

const SettingsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { locale, setLocale } = useLocaleStore();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;

    setSavingName(true);
    setSaveError(null);
    try {
      const res = await client.patch('/users/profile', { displayName: displayName.trim() });
      const updatedUser = res.data?.data ?? res.data;
      if (updatedUser && setUser) {
        setUser({ ...user!, ...updatedUser });
      }
    } catch {
      setSaveError(t('error'));
    } finally {
      setSavingName(false);
    }
  };

  const handleToggleTier = () => {
    if (!user) return;
    const newTier = user.tier === 'premium' ? 'free' : 'premium';
    setUser({ ...user, tier: newTier });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PageWrapper>
      <Title>{t('settings')}</Title>

      {/* Account Info */}
      <Card header={<SectionTitle>{t('appName')}</SectionTitle>}>
        <SettingRow>
          <SettingLabel>{t('email')}</SettingLabel>
          <SettingValue>{user?.email}</SettingValue>
        </SettingRow>
        <SettingRow>
          <SettingLabel>{t('premium')}</SettingLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant={user?.tier === 'premium' ? 'premium' : 'info'}>
              {user?.tier === 'premium' ? t('premium') : t('free')}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleToggleTier}>
              {user?.tier === 'premium' ? t('switchToFree') : t('switchToPremium')}
            </Button>
          </div>
        </SettingRow>
        <TierToggleNote>{t('testingNote')}</TierToggleNote>
        {user?.createdAt && (
          <SettingRow>
            <SettingLabel>{t('joined')}</SettingLabel>
            <SettingValue>{formatDate(user.createdAt, locale)}</SettingValue>
          </SettingRow>
        )}
      </Card>

      {/* Display Name */}
      <Card header={<SectionTitle>{t('displayName')}</SectionTitle>}>
        <DisplayNameRow>
          <DisplayNameInput>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('enterName')}
            />
          </DisplayNameInput>
          <Button
            variant="primary"
            size="sm"
            loading={savingName}
            disabled={!displayName.trim() || displayName === (user?.displayName || '')}
            onClick={() => void handleSaveName()}
          >
            {t('save')}
          </Button>
        </DisplayNameRow>
        {saveError && <ErrorText>{saveError}</ErrorText>}
      </Card>

      {/* Language */}
      <Card header={<SectionTitle>{t('language')}</SectionTitle>}>
        <SettingRow>
          <SettingLabel>{t('language')}</SettingLabel>
          <LanguageToggle>
            <LangButton $active={locale === 'en'} onClick={() => setLocale('en')}>
              EN
            </LangButton>
            <LangButton $active={locale === 'ru'} onClick={() => setLocale('ru')}>
              RU
            </LangButton>
          </LanguageToggle>
        </SettingRow>
      </Card>

      {/* Currency */}
      <Card header={<SectionTitle>{t('currency')}</SectionTitle>}>
        <SettingRow>
          <SettingLabel>{t('currency')}</SettingLabel>
          <CurrencySelector />
        </SettingRow>
      </Card>

      {/* Logout */}
      <Card>
        <Button variant="danger" fullWidth onClick={handleLogout}>
          {t('logout')}
        </Button>
      </Card>
    </PageWrapper>
  );
};

export default SettingsPage;
