import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { expensesApi } from '../../api/expenses.api';
import { categoriesApi } from '../../api/categories.api';
import { useCurrencyStore } from '../../store/currencyStore';
import { useLocaleStore } from '../../store/localeStore';
import { getCurrentMonth, getDaysInMonth, formatMonth } from '../../utils/dates';
import { formatDate } from '../../utils/formatters';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Badge } from '../../components/UI/Badge';
import { Spinner } from '../../components/UI/Spinner';
import type { Category, Expense, ExpenseSummary } from '../../types/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
}

/* ------------------------------------------------------------------ */
/*  Styled Components                                                  */
/* ------------------------------------------------------------------ */

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

/* -- Month Navigation -- */

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MonthLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  min-width: 200px;
  text-align: center;
  text-transform: capitalize;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  transition: background-color 0.2s ease;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

/* -- Side-by-side Layout -- */

const ContentLayout = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: flex-start;

  @media (max-width: 860px) {
    flex-direction: column;
  }
`;

const CalendarColumn = styled.div`
  flex: 0 0 auto;
  min-width: 320px;
  max-width: 480px;
  width: 100%;

  @media (max-width: 860px) {
    max-width: 100%;
  }
`;

const ExpensesColumn = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

/* -- Calendar -- */

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const CalendarHeaderCell = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
`;

const CalendarCell = styled.div<{ $isToday: boolean; $isSelected: boolean; $hasExpenses: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm} 2px;
  min-height: 64px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: ${({ $isSelected, $isToday }) => {
    if ($isSelected) return 'rgba(108, 92, 231, 0.2)';
    if ($isToday) return 'rgba(0, 184, 148, 0.1)';
    return 'transparent';
  }};
  border: 1.5px solid ${({ theme, $isSelected, $isToday }) => {
    if ($isSelected) return theme.colors.primary;
    if ($isToday) return theme.colors.success;
    return 'transparent';
  }};

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected ? 'rgba(108, 92, 231, 0.25)' : theme.colors.surfaceLight};
  }
`;

const DayNumber = styled.span<{ $isToday: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme, $isToday }) =>
    $isToday
      ? theme.typography.fontWeights.bold
      : theme.typography.fontWeights.medium};
  color: ${({ theme, $isToday }) =>
    $isToday ? theme.colors.success : theme.colors.text};
  line-height: 1;
`;

const DayTotal = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 4px;
  line-height: 1;
  white-space: nowrap;
`;

/* -- Quick Add (round buttons) -- */

const QuickAddRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  align-items: center;
`;

const QuickLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RoundButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
  }

  &:active {
    transform: scale(0.92);
  }
`;

const CustomAmountRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CustomInput = styled.input`
  width: 80px;
  height: 40px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

/* -- Forms -- */

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: ${({ theme }) => theme.spacing.base};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

/* -- Expense List -- */

const ExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ExpenseItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.base};
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ExpenseIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  flex-shrink: 0;
`;

const ExpenseInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ExpenseCategoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ExpenseCategoryName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const ExpenseDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ExpenseAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.danger};
  white-space: nowrap;
`;

const ExpenseItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
`;

/* -- Totals -- */

const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} 0;
  margin-top: ${({ theme }) => theme.spacing.sm};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
`;

const TotalLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const TotalAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

/* -- Fixed Expenses Summary Card -- */

const FixedSummaryCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.base};
`;

const FixedSummaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FixedSummaryValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

/* -- Misc -- */

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.base};
  min-height: 120px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  text-align: center;
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

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Format "YYYY-MM-DD" from a Date object. */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Build the calendar grid for a given "YYYY-MM" month string. */
function buildCalendarDays(month: string): CalendarDay[] {
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const totalDays = getDaysInMonth(month);

  // getDay(): 0=Sun. We want Mon=0.
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: CalendarDay[] = [];

  // Leading empty cells (previous month days for context)
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, mon - 1, -i);
    days.push({ date: d, dayOfMonth: d.getDate(), isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, mon - 1, day);
    days.push({ date: d, dayOfMonth: day, isCurrentMonth: true });
  }

  // Trailing cells to complete last week
  const remainder = days.length % 7;
  if (remainder > 0) {
    const needed = 7 - remainder;
    for (let i = 1; i <= needed; i++) {
      const d = new Date(year, mon, i);
      days.push({ date: d, dayOfMonth: d.getDate(), isCurrentMonth: false });
    }
  }

  return days;
}

/** Group expenses by their expenseDate (YYYY-MM-DD). */
function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  const map = new Map<string, Expense[]>();
  for (const exp of expenses) {
    const key = exp.expenseDate.slice(0, 10);
    const arr = map.get(key);
    if (arr) {
      arr.push(exp);
    } else {
      map.set(key, [exp]);
    }
  }
  return map;
}

/** Sum amounts for a list of expenses. */
function sumExpenses(list: Expense[]): number {
  return list.reduce((sum, e) => sum + Number(e.amount), 0);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const QUICK_AMOUNTS = [5, 10, 20, 50];

const ExpensesPage: React.FC = () => {
  const { t } = useTranslation('expenses');
  const { t: tc } = useTranslation('common');
  const formatAmount = useCurrencyStore((s) => s.formatAmount);
  const toBase = useCurrencyStore((s) => s.toBase);
  const locale = useLocaleStore((s) => s.locale);

  /* -- core data -------------------------------------------------- */

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -- navigation ------------------------------------------------- */

  const [activeMonth, setActiveMonth] = useState(() => getCurrentMonth());

  /* -- calendar selection (auto-initialized to today) ------------- */

  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [customAmount, setCustomAmount] = useState('');

  /* -- daily add form --------------------------------------------- */

  const [showDailyForm, setShowDailyForm] = useState(false);
  const [dailyAmount, setDailyAmount] = useState('');
  const [dailyCategoryId, setDailyCategoryId] = useState('');
  const [dailyDesc, setDailyDesc] = useState('');
  const [dailySubmitting, setDailySubmitting] = useState(false);
  const [dailyFormError, setDailyFormError] = useState<string | null>(null);

  /* -- swipe gesture ---------------------------------------------- */

  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      shiftMonth(deltaX > 0 ? -1 : 1);
    }
  };

  /* -- delete tracking -------------------------------------------- */

  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* -- derived data ----------------------------------------------- */

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const variableCategories = useMemo(
    () => categories.filter((c) => c.type === 'variable'),
    [categories],
  );

  const variableCategoryOptions = useMemo(() => {
    const opts = variableCategories.map((c) => ({
      value: c.id,
      label: locale === 'ru' && c.nameRu ? c.nameRu : c.name,
    }));
    return [{ value: '', label: t('selectCategory') }, ...opts];
  }, [variableCategories, locale, t]);

  const expensesByDate = useMemo(() => groupByDate(expenses), [expenses]);

  const fixedExpenses = useMemo(
    () => expenses.filter((e) => {
      const cat = e.category || categoryMap.get(e.categoryId);
      return cat?.type === 'fixed';
    }),
    [expenses, categoryMap],
  );

  const fixedTotal = useMemo(() => sumExpenses(fixedExpenses), [fixedExpenses]);

  const selectedDayExpenses = useMemo(
    () => expensesByDate.get(selectedDate) ?? [],
    [expensesByDate, selectedDate],
  );

  const selectedDayTotal = useMemo(
    () => sumExpenses(selectedDayExpenses),
    [selectedDayExpenses],
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(activeMonth),
    [activeMonth],
  );

  const formattedMonth = useMemo(
    () => formatMonth(activeMonth, locale),
    [activeMonth, locale],
  );

  const weekdays = locale === 'ru' ? WEEKDAYS_RU : WEEKDAYS_EN;

  const today = useMemo(() => toISODate(new Date()), []);

  /* -- helpers ---------------------------------------------------- */

  const getCategoryName = useCallback(
    (expense: Expense): string => {
      if (expense.category) {
        return locale === 'ru' && expense.category.nameRu
          ? expense.category.nameRu
          : expense.category.name;
      }
      const cat = categoryMap.get(expense.categoryId);
      if (cat) {
        return locale === 'ru' && cat.nameRu ? cat.nameRu : cat.name;
      }
      return expense.categoryId;
    },
    [categoryMap, locale],
  );

  const getCategoryIcon = useCallback(
    (expense: Expense): string => {
      if (expense.category?.icon) return expense.category.icon;
      return categoryMap.get(expense.categoryId)?.icon || '';
    },
    [categoryMap],
  );

  /* -- data fetching ---------------------------------------------- */

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.list();
      const data = response.data?.data ?? response.data;
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
    } catch {
      // categories remain empty
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        expensesApi.list({ month: activeMonth }),
        expensesApi.summary(activeMonth),
      ]);

      const expenseData = expensesRes.data?.data ?? expensesRes.data;
      setExpenses(Array.isArray(expenseData) ? expenseData : []);

      const summaryData = summaryRes.data?.data ?? summaryRes.data;
      setSummary(summaryData && typeof summaryData === 'object' ? summaryData : null);
    } catch {
      setError(tc('error'));
    } finally {
      setLoading(false);
    }
  }, [activeMonth, tc]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* -- auto-switch selected date to today every minute ------------- */

  useEffect(() => {
    const updateToday = () => {
      setSelectedDate(toISODate(new Date()));
    };

    // Check every 60 seconds if the date rolled over
    const interval = setInterval(updateToday, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* -- month navigation ------------------------------------------- */

  const shiftMonth = useCallback(
    (direction: -1 | 1) => {
      const [year, mon] = activeMonth.split('-').map(Number);
      const d = new Date(year, mon - 1 + direction, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      setActiveMonth(`${y}-${m}`);
    },
    [activeMonth],
  );

  /* -- quick add -------------------------------------------------- */

  const handleQuickAdd = useCallback(
    async (amount: number) => {
      try {
        await expensesApi.quickAdd(toBase(amount));
        await fetchData();
      } catch {
        setError(tc('error'));
      }
    },
    [toBase, fetchData, tc],
  );

  const handleCustomQuickAdd = useCallback(() => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) return;
    setCustomAmount('');
    void handleQuickAdd(amount);
  }, [customAmount, handleQuickAdd]);

  /* -- daily expense submit --------------------------------------- */

  const handleDailySubmit = useCallback(async () => {
    const amount = parseFloat(dailyAmount);
    if (!amount || amount <= 0) {
      setDailyFormError(t('amount'));
      return;
    }
    if (!dailyCategoryId) {
      setDailyFormError(t('category'));
      return;
    }

    setDailySubmitting(true);
    setDailyFormError(null);
    try {
      await expensesApi.create({
        amount: toBase(amount),
        categoryId: dailyCategoryId,
        description: dailyDesc.trim() || undefined,
        date: selectedDate,
      });
      setDailyAmount('');
      setDailyCategoryId('');
      setDailyDesc('');
      setShowDailyForm(false);
      await fetchData();
    } catch {
      setDailyFormError(tc('error'));
    } finally {
      setDailySubmitting(false);
    }
  }, [
    dailyAmount, dailyCategoryId, dailyDesc, selectedDate,
    toBase, fetchData, t, tc,
  ]);

  const handleDailyCancel = useCallback(() => {
    setShowDailyForm(false);
    setDailyAmount('');
    setDailyCategoryId('');
    setDailyDesc('');
    setDailyFormError(null);
  }, []);

  /* -- delete ----------------------------------------------------- */

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm(t('deleteConfirm'))) return;

      setDeletingId(id);
      try {
        await expensesApi.remove(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        await fetchData();
      } catch {
        setError(tc('error'));
      } finally {
        setDeletingId(null);
      }
    },
    [fetchData, t, tc],
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <PageWrapper>
      {/* ---- Header ---- */}
      <PageHeader>
        <Title>{t('title')}</Title>
      </PageHeader>

      {/* ---- Month Selector ---- */}
      <Card>
        <MonthNav>
          <NavButton onClick={() => shiftMonth(-1)} aria-label="Previous month">
            &lsaquo;
          </NavButton>
          <MonthLabel>{formattedMonth}</MonthLabel>
          <NavButton onClick={() => shiftMonth(1)} aria-label="Next month">
            &rsaquo;
          </NavButton>
        </MonthNav>
      </Card>

      {/* ---- Loading ---- */}
      {loading && (
        <CenteredSpinner>
          <Spinner size="md" />
        </CenteredSpinner>
      )}

      {/* ---- Error ---- */}
      {error && !loading && (
        <Card>
          <EmptyState>
            <span>{error}</span>
            <Button variant="secondary" onClick={fetchData}>
              {tc('retry')}
            </Button>
          </EmptyState>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  MAIN CONTENT (side-by-side on wide, stacked on mobile)      */}
      {/* ============================================================ */}
      {!loading && !error && (
        <>
          {/* -- Quick Add -- */}
          <Card header={<span>{t('quickAdd')}</span>}>
            <QuickAddRow>
              <QuickLabel>{t('selectDay')}</QuickLabel>
              {QUICK_AMOUNTS.map((amt) => (
                <RoundButton
                  key={amt}
                  type="button"
                  onClick={() => void handleQuickAdd(amt)}
                  title={`+${amt}`}
                >
                  +{amt}
                </RoundButton>
              ))}
              <CustomAmountRow>
                <CustomInput
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomQuickAdd();
                    }
                  }}
                />
                <RoundButton
                  type="button"
                  onClick={handleCustomQuickAdd}
                  title="+"
                  disabled={!customAmount || parseFloat(customAmount) <= 0}
                >
                  +
                </RoundButton>
              </CustomAmountRow>
            </QuickAddRow>
          </Card>

          <ContentLayout>
            {/* ---- Calendar (left on wide) ---- */}
            <CalendarColumn>
              <Card header={<SectionTitle>{t('dailyExpenses')}</SectionTitle>}>
              <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <CalendarGrid>
                  {/* Weekday headers */}
                  {weekdays.map((wd) => (
                    <CalendarHeaderCell key={wd}>{wd}</CalendarHeaderCell>
                  ))}

                  {/* Day cells */}
                  {calendarDays.map((calDay, idx) => {
                    const dateStr = toISODate(calDay.date);
                    const dayExpenses = expensesByDate.get(dateStr) ?? [];
                    const dayTotal = sumExpenses(dayExpenses);
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate && calDay.isCurrentMonth;

                    return (
                      <CalendarCell
                        key={`${idx}-${dateStr}`}
                        $isToday={isToday && calDay.isCurrentMonth}
                        $isSelected={isSelected}
                        $hasExpenses={dayTotal > 0}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setShowDailyForm(false);
                        }}
                      >
                        <DayNumber $isToday={isToday && calDay.isCurrentMonth}>
                          {calDay.dayOfMonth}
                        </DayNumber>
                        {dayTotal > 0 && calDay.isCurrentMonth && (
                          <DayTotal>{formatAmount(dayTotal)}</DayTotal>
                        )}
                      </CalendarCell>
                    );
                  })}
                </CalendarGrid>
              </div>

                {/* Month total */}
                {summary && (
                  <TotalRow>
                    <TotalLabel>{t('monthTotal')}</TotalLabel>
                    <TotalAmount>{formatAmount(summary.grandTotal)}</TotalAmount>
                  </TotalRow>
                )}

                {/* Fixed expenses summary */}
                {fixedTotal > 0 && (
                  <FixedSummaryCard>
                    <FixedSummaryLabel>{t('totalFixed')}</FixedSummaryLabel>
                    <FixedSummaryValue>{formatAmount(fixedTotal)}</FixedSummaryValue>
                  </FixedSummaryCard>
                )}
              </Card>
            </CalendarColumn>

            {/* ---- Selected Day Expenses (right on wide) ---- */}
            <ExpensesColumn>
              <Card
                header={
                  <SectionTitle>
                    {formatDate(selectedDate, locale)}{' '}
                    {selectedDayTotal > 0 && (
                      <Badge variant="danger">
                        {t('totalDay')}: {formatAmount(selectedDayTotal)}
                      </Badge>
                    )}
                  </SectionTitle>
                }
              >
                {/* Add expense button for selected day */}
                {!showDailyForm && (
                  <div style={{ marginBottom: '16px' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowDailyForm(true)}
                    >
                      {t('addExpense')}
                    </Button>
                  </div>
                )}

                {/* Inline add form */}
                {showDailyForm && (
                  <div style={{ marginBottom: '16px' }}>
                    <FormRow>
                      <Input
                        label={t('amount')}
                        type="number"
                        placeholder={t('amountPlaceholder')}
                        value={dailyAmount}
                        onChange={(e) => setDailyAmount(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                      <Select
                        label={t('category')}
                        options={variableCategoryOptions}
                        value={dailyCategoryId}
                        onChange={(e) => setDailyCategoryId(e.target.value)}
                      />
                      <Input
                        label={t('description')}
                        type="text"
                        placeholder={t('descPlaceholder')}
                        value={dailyDesc}
                        onChange={(e) => setDailyDesc(e.target.value)}
                      />
                    </FormRow>
                    {dailyFormError && (
                      <ErrorText>{dailyFormError}</ErrorText>
                    )}
                    <FormActions>
                      <Button variant="ghost" size="sm" onClick={handleDailyCancel}>
                        {tc('cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDailySubmit}
                        loading={dailySubmitting}
                      >
                        {tc('add')}
                      </Button>
                    </FormActions>
                  </div>
                )}

                {/* Day expenses list */}
                {selectedDayExpenses.length > 0 ? (
                  <ExpenseList>
                    {selectedDayExpenses.map((expense) => (
                      <ExpenseItem key={expense.id}>
                        <ExpenseIcon>
                          {getCategoryIcon(expense) || tc('noIcon')}
                        </ExpenseIcon>
                        <ExpenseInfo>
                          <ExpenseCategoryRow>
                            <ExpenseCategoryName>
                              {getCategoryName(expense)}
                            </ExpenseCategoryName>
                            {expense.category && (
                              <Badge variant={expense.category.type === 'fixed' ? 'info' : 'warning'}>
                                {t(expense.category.type)}
                              </Badge>
                            )}
                          </ExpenseCategoryRow>
                          {expense.description && (
                            <ExpenseDescription>{expense.description}</ExpenseDescription>
                          )}
                        </ExpenseInfo>
                        <ExpenseItemActions>
                          <ExpenseAmount>
                            {formatAmount(Number(expense.amount))}
                          </ExpenseAmount>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deletingId === expense.id}
                            onClick={() => handleDelete(expense.id)}
                          >
                            {tc('delete')}
                          </Button>
                        </ExpenseItemActions>
                      </ExpenseItem>
                    ))}
                  </ExpenseList>
                ) : (
                  <EmptyState>
                    <span>{t('noExpensesDay')}</span>
                  </EmptyState>
                )}
              </Card>
            </ExpensesColumn>
          </ContentLayout>
        </>
      )}
    </PageWrapper>
  );
};

export default ExpensesPage;
