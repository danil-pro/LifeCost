import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Spinner } from '../../components/UI/Spinner';
import { ProgressBar } from '../../components/UI/ProgressBar';
import { Badge } from '../../components/UI/Badge';
import { goalsApi } from '../../api/goals.api';
import { useCurrencyStore } from '../../store/currencyStore';
import { useLocaleStore } from '../../store/localeStore';
import { formatDate } from '../../utils/formatters';
import type { Goal, GoalProjection } from '../../types/models';
import type { ApiResponse } from '../../types/api';

interface GoalDeposit {
  id: string;
  goalId: string;
  amount: number;
  createdAt: string;
}

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
`;

const CenteredSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
`;

const GoalCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

const GoalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const GoalName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const GoalActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const GoalStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.base};
  flex-wrap: wrap;
`;

const GoalStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const GoalStatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GoalStatValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const ProjectionBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GoalDeadline = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* -- Savings comparison row -- */

const SavingsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SavingsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SavingsLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SavingsValue = styled.span<{ $color?: string }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ $color, theme }) => ($color ?? theme.colors.text)};
`;

/* -- Deposit section -- */

const DepositSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
  padding: ${({ theme }) => theme.spacing.base} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const DepositRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceLight};
`;

const DepositDate = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DepositAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.success};
`;

const DepositForm = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const DepositInput = styled.input`
  width: 120px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

/* -- Form -- */

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.base};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FormFullWidth = styled.div`
  grid-column: 1 / -1;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.base};
`;

const AddFormWrapper = styled.div<{ $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
`;

const SectionHeader = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ToggleButton = styled.button<{ $expanded: boolean }>`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

/** Calculate months remaining from now until a deadline date string. */
function monthsUntilDeadline(deadline: string): number {
  const now = new Date();
  const target = new Date(deadline);
  const diff = (target.getFullYear() - now.getFullYear()) * 12
    + (target.getMonth() - now.getMonth());
  return Math.max(diff, 0);
}

const GoalsContent: React.FC = () => {
  const { t } = useTranslation('premium');
  const { t: tc } = useTranslation('common');
  const { formatAmount, toBase } = useCurrencyStore();
  const locale = useLocaleStore((s) => s.locale);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [depositsMap, setDepositsMap] = useState<Record<string, GoalDeposit[]>>({});
  const [projections, setProjections] = useState<Record<string, GoalProjection>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Deposit form state per goal
  const [depositInputs, setDepositInputs] = useState<Record<string, string>>({});
  const [depositSubmitting, setDepositingSubmitting] = useState<Record<string, boolean>>({});
  const [expandedDeposits, setExpandedDeposits] = useState<Record<string, boolean>>({});

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalsApi.list();
      const data = (res.data as ApiResponse<Goal[]>).data;
      const goalList = Array.isArray(data) ? data : [];
      setGoals(goalList);

      // Fetch deposits for each goal
      const depositEntries = await Promise.all(
        goalList.map(async (g) => {
          try {
            const depRes = await goalsApi.listDeposits(g.id);
            const depData = (depRes.data as ApiResponse<GoalDeposit[]>).data;
            return [g.id, Array.isArray(depData) ? depData : []] as const;
          } catch {
            return [g.id, []] as const;
          }
        })
      );

      const depMap: Record<string, GoalDeposit[]> = {};
      for (const [id, deps] of depositEntries) {
        depMap[id] = deps as GoalDeposit[];
      }
      setDepositsMap(depMap);

      const projectionEntries = await Promise.all(
        goalList
          .filter((g) => !g.isCompleted)
          .map(async (g) => {
            try {
              const projRes = await goalsApi.projection(g.id);
              const projData = (projRes.data as ApiResponse<GoalProjection>).data;
              return [g.id, projData] as const;
            } catch {
              return [g.id, null] as const;
            }
          })
      );

      const projMap: Record<string, GoalProjection> = {};
      for (const [id, proj] of projectionEntries) {
        if (proj) {
          projMap[id] = proj;
        }
      }
      setProjections(projMap);
    } catch {
      setGoals([]);
      setProjections({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = async () => {
    if (!formName.trim() || !formTarget) return;

    setSubmitting(true);
    try {
      await goalsApi.create({
        name: formName.trim(),
        targetAmount: toBase(parseFloat(formTarget)),
        deadline: formDeadline || undefined,
      });
      setFormName('');
      setFormTarget('');
      setFormDeadline('');
      setShowForm(false);
      await fetchGoals();
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await goalsApi.update(id, { savedAmount: goals.find((g) => g.id === id)?.targetAmount ?? 0 });
      await fetchGoals();
    } catch {
      // Error handled silently
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await goalsApi.remove(id);
      await fetchGoals();
    } catch {
      // Error handled silently
    }
  };

  const handleAddDeposit = async (goalId: string) => {
    const amount = parseFloat(depositInputs[goalId] || '');
    if (!amount || amount <= 0) return;

    setDepositingSubmitting((prev) => ({ ...prev, [goalId]: true }));
    try {
      await goalsApi.addDeposit(goalId, toBase(amount));
      setDepositInputs((prev) => ({ ...prev, [goalId]: '' }));
      await fetchGoals();
    } catch {
      // Error handled silently
    } finally {
      setDepositingSubmitting((prev) => ({ ...prev, [goalId]: false }));
    }
  };

  const toggleDeposits = (goalId: string) => {
    setExpandedDeposits((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  if (loading) {
    return (
      <PageWrapper>
        <PageHeader>
          <Title>{tc('goals')}</Title>
        </PageHeader>
        <CenteredSpinner>
          <Spinner size="lg" />
        </CenteredSpinner>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader>
        <Title>{tc('goals')}</Title>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? tc('cancel') : t('addGoal')}
        </Button>
      </PageHeader>

      <AddFormWrapper $visible={showForm}>
        <Card>
          <FormGrid>
            <FormFullWidth>
              <Input
                label={t('goalName')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t('goalName')}
              />
            </FormFullWidth>
            <Input
              label={t('targetAmount')}
              type="number"
              min="0"
              step="0.01"
              value={formTarget}
              onChange={(e) => setFormTarget(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label={t('deadline')}
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
            />
          </FormGrid>
          {/* Quick achievability preview */}
          {formTarget && formDeadline && (
            <SavingsRow>
              <SavingsBlock>
                <SavingsLabel>{t('requiredSavings')}</SavingsLabel>
                <SavingsValue>
                  {(() => {
                    const remaining = parseFloat(formTarget);
                    const months = monthsUntilDeadline(formDeadline);
                    if (months <= 0) return '--';
                    return formatAmount(remaining / months);
                  })()}
                </SavingsValue>
              </SavingsBlock>
              <SavingsBlock>
                <SavingsLabel>{t('deadline')}</SavingsLabel>
                <SavingsValue>{formatDate(formDeadline, locale)}</SavingsValue>
              </SavingsBlock>
            </SavingsRow>
          )}
          <FormActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              {tc('cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={submitting}
              disabled={!formName.trim() || !formTarget}
              onClick={handleAddGoal}
            >
              {t('addGoal')}
            </Button>
          </FormActions>
        </Card>
      </AddFormWrapper>

      {goals.length === 0 ? (
        <Card>
          <EmptyState>{t('noGoals')}</EmptyState>
        </Card>
      ) : (
        goals.map((goal) => {
          const progress = goal.targetAmount > 0
            ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
            : 0;
          const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
          const projection = projections[goal.id];
          const deposits = depositsMap[goal.id] ?? [];
          const isExpanded = expandedDeposits[goal.id] ?? false;

          // Calculate required monthly savings from deadline
          const monthsLeft = goal.deadline
            ? monthsUntilDeadline(goal.deadline)
            : projection?.monthsRemaining ?? 0;
          const requiredPerMonth = monthsLeft > 0
            ? remaining / monthsLeft
            : 0;

          return (
            <Card key={goal.id}>
              <GoalCard>
                <GoalHeader>
                  <GoalName>
                    {goal.name}
                    {goal.isCompleted && (
                      <Badge variant="success">
                        {t('completed')}
                      </Badge>
                    )}
                  </GoalName>
                  <GoalActions>
                    {!goal.isCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleComplete(goal.id)}
                      >
                        {t('complete')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDelete(goal.id)}
                    >
                      {tc('delete')}
                    </Button>
                  </GoalActions>
                </GoalHeader>

                {goal.deadline && (
                  <GoalDeadline>
                    {t('deadline')}: {formatDate(goal.deadline, locale)}
                  </GoalDeadline>
                )}

                <ProgressBar percentage={progress} height="10px" />

                <GoalStats>
                  <GoalStat>
                    <GoalStatLabel>{t('saved')}</GoalStatLabel>
                    <GoalStatValue>{formatAmount(goal.savedAmount)}</GoalStatValue>
                  </GoalStat>
                  <GoalStat>
                    <GoalStatLabel>{t('remaining')}</GoalStatLabel>
                    <GoalStatValue>{formatAmount(remaining)}</GoalStatValue>
                  </GoalStat>
                  <GoalStat>
                    <GoalStatLabel>{t('targetAmount')}</GoalStatLabel>
                    <GoalStatValue>{formatAmount(goal.targetAmount)}</GoalStatValue>
                  </GoalStat>
                  {monthsLeft > 0 && (
                    <GoalStat>
                      <GoalStatLabel>{t('monthsLeft')}</GoalStatLabel>
                      <ProjectionBadge>
                        {monthsLeft}
                      </ProjectionBadge>
                    </GoalStat>
                  )}
                </GoalStats>

                {/* Required per month */}
                {monthsLeft > 0 && remaining > 0 && !goal.isCompleted && (
                  <SavingsRow>
                    <SavingsBlock>
                      <SavingsLabel>{t('requiredPerMonth')}</SavingsLabel>
                      <SavingsValue>{formatAmount(requiredPerMonth)}</SavingsValue>
                    </SavingsBlock>
                  </SavingsRow>
                )}

                {/* Deposit section */}
                {!goal.isCompleted && (
                  <DepositSection>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <SectionHeader>{t('savings')}</SectionHeader>
                      {deposits.length > 0 && (
                        <ToggleButton $expanded={isExpanded} onClick={() => toggleDeposits(goal.id)}>
                          {isExpanded
                            ? String.fromCharCode(9650)
                            : `${t('depositHistory')} (${deposits.length})`}
                        </ToggleButton>
                      )}
                    </div>

                    <DepositForm>
                      <DepositInput
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t('depositAmount')}
                        value={depositInputs[goal.id] || ''}
                        onChange={(e) =>
                          setDepositInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleAddDeposit(goal.id);
                          }
                        }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        loading={depositSubmitting[goal.id] ?? false}
                        disabled={
                          !depositInputs[goal.id] ||
                          parseFloat(depositInputs[goal.id] || '0') <= 0
                        }
                        onClick={() => void handleAddDeposit(goal.id)}
                      >
                        {t('addDeposit')}
                      </Button>
                    </DepositForm>

                    {/* Deposit history */}
                    {isExpanded && deposits.length > 0 && (
                      <div>
                        {deposits.map((dep) => (
                          <DepositRow key={dep.id}>
                            <DepositDate>{formatDate(dep.createdAt, locale)}</DepositDate>
                            <DepositAmount>+{formatAmount(dep.amount)}</DepositAmount>
                          </DepositRow>
                        ))}
                      </div>
                    )}

                    {deposits.length === 0 && (
                      <span style={{ fontSize: '14px', color: '#8888AA' }}>{t('noDeposits')}</span>
                    )}
                  </DepositSection>
                )}
              </GoalCard>
            </Card>
          );
        })
      )}
    </PageWrapper>
  );
};

const GoalsPage: React.FC = () => {
  return <GoalsContent />;
};

export default GoalsPage;
