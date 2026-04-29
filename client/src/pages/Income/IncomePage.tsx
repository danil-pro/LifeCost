import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { incomeApi } from '../../api/income.api';
import { useCurrencyStore } from '../../store/currencyStore';
import { useLocaleStore } from '../../store/localeStore';
import { getCurrentMonth, formatMonth } from '../../utils/dates';
import { formatDate } from '../../utils/formatters';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Spinner } from '../../components/UI/Spinner';
import type { Income } from '../../types/models';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const FormCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.base};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IncomeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IncomeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const IncomeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const IncomeLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const IncomeDate = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IncomeAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.success};
  white-space: nowrap;
`;

const IncomeItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.base};
  min-height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  text-align: center;
`;

const TotalBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const TotalLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const TotalAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.success};
`;

const CenteredSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

const IncomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const formatAmount = useCurrencyStore((s) => s.formatAmount);
  const toBase = useCurrencyStore((s) => s.toBase);
  const locale = useLocaleStore((s) => s.locale);

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formAmount, setFormAmount] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formMonth, setFormMonth] = useState(() => getCurrentMonth());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentMonth = useMemo(() => getCurrentMonth(), []);

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await incomeApi.list(formMonth);
      const data = response.data?.data ?? response.data;
      setIncomes(Array.isArray(data) ? data : []);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [formMonth, t]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + Number(i.amount), 0),
    [incomes],
  );

  const handleSubmit = async () => {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) {
      setFormError(t('incomeAmount'));
      return;
    }
    if (!formLabel.trim()) {
      setFormError(t('incomeLabel'));
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await incomeApi.create({
        amount: toBase(amount),
        month: formMonth,
        label: formLabel.trim(),
      });
      setFormAmount('');
      setFormLabel('');
      setShowForm(false);
      await fetchIncomes();
    } catch {
      setFormError(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    setDeletingId(id);
    try {
      await incomeApi.remove(id);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError(t('error'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormAmount('');
    setFormLabel('');
    setFormMonth(currentMonth);
    setFormError(null);
  };

  const formattedMonth = useMemo(
    () => formatMonth(formMonth, locale),
    [formMonth, locale],
  );

  return (
    <PageWrapper>
      <PageHeader>
        <Title>{t('income')}</Title>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          {t('addIncome')}
        </Button>
      </PageHeader>

      {showForm && (
        <FormCard>
          <FormRow>
            <Input
              label={t('incomeAmount')}
              type="number"
              placeholder="0.00"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <Input
              label={t('incomeLabel')}
              type="text"
              placeholder="Salary"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
            />
            <Input
              label={t('incomeMonth')}
              type="month"
              value={formMonth}
              onChange={(e) => setFormMonth(e.target.value)}
            />
          </FormRow>
          {formError && <ErrorText>{formError}</ErrorText>}
          <FormActions>
            <Button variant="ghost" onClick={handleCancelForm}>
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
            >
              {t('submit')}
            </Button>
          </FormActions>
        </FormCard>
      )}

      {loading && (
        <CenteredSpinner>
          <Spinner size="md" />
        </CenteredSpinner>
      )}

      {error && (
        <Card>
          <EmptyState>
            <span>{error}</span>
            <Button variant="secondary" onClick={fetchIncomes}>
              {t('retry')}
            </Button>
          </EmptyState>
        </Card>
      )}

      {!loading && !error && incomes.length === 0 && (
        <Card>
          <EmptyState>
            <span>{t('noIncomes')}</span>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              {t('addFirstIncome')}
            </Button>
          </EmptyState>
        </Card>
      )}

      {!loading && !error && incomes.length > 0 && (
        <>
          <Card header={<span>{formattedMonth}</span>}>
            <IncomeList>
              {incomes.map((income) => (
                <IncomeItem key={income.id}>
                  <IncomeInfo>
                    <IncomeLabel>{income.label || t('income')}</IncomeLabel>
                    <IncomeDate>
                      {formatDate(income.createdAt, locale)}
                    </IncomeDate>
                  </IncomeInfo>
                  <IncomeItemActions>
                    <IncomeAmount>
                      {formatAmount(Number(income.amount))}
                    </IncomeAmount>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingId === income.id}
                      onClick={() => handleDelete(income.id)}
                    >
                      {t('delete')}
                    </Button>
                  </IncomeItemActions>
                </IncomeItem>
              ))}
            </IncomeList>
          </Card>

          <TotalBar>
            <TotalLabel>{t('totalIncome')}</TotalLabel>
            <TotalAmount>{formatAmount(totalIncome)}</TotalAmount>
          </TotalBar>
        </>
      )}
    </PageWrapper>
  );
};

export default IncomePage;
