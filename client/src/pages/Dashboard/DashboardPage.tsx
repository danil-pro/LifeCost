import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { useLocaleStore } from '../../store/localeStore';
import { insightsApi } from '../../api/insights.api';
import { incomeApi } from '../../api/income.api';
import { expensesApi } from '../../api/expenses.api';
import { categoriesApi } from '../../api/categories.api';
import { getCurrentMonth, getDaysInMonth, formatMonth } from '../../utils/dates';
import { formatDate } from '../../utils/formatters';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Spinner } from '../../components/UI/Spinner';
import { Badge } from '../../components/UI/Badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExpenseItem {
  id: string;
  amount: number;
  description: string | null;
  expenseDate: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    nameRu: string | null;
    type: 'fixed' | 'variable';
    icon: string | null;
  };
}

interface ExpenseSummary {
  totalFixed: number;
  totalVariable: number;
  grandTotal: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
  }>;
}

interface IncomeData {
  id: string;
  amount: number;
  currency: string;
  label?: string;
  month: string;
}

interface IncomeRecord {
  id: string;
  amount: number;
  currency: string;
  label: string | null;
  month: string;
  createdAt: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'info' | 'achievement';
  priority?: number;
  amount?: number;
  percentage?: number;
}

interface CategoryData {
  id: string;
  name: string;
  nameRu: string | null;
  type: 'fixed' | 'variable';
  icon: string | null;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
}

// ---------------------------------------------------------------------------
// Category color mapping (2.3 - color markers instead of icons)
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#6C5CE7',
  Food: '#00B894',
  Transport: '#0984E3',
  Insurance: '#FDCB6E',
  Taxes: '#E17055',
  Subscriptions: '#00CEC9',
  Coffee: '#6C5CE7',
  Snacks: '#E84393',
  'Fast Food': '#FDCB6E',
  Entertainment: '#A29BFE',
  Shopping: '#FD79A8',
  'Quick Expenses': '#E17055',
  Other: '#636E72',
};

const CATEGORY_COLORS_RU: Record<string, string> = {
  'Аренда': '#6C5CE7',
  'Еда': '#00B894',
  'Транспорт': '#0984E3',
  'Страховка': '#FDCB6E',
  'Налоги': '#E17055',
  'Подписки': '#00CEC9',
  'Кофе': '#6C5CE7',
  'Снеки': '#E84393',
  'Фастфуд': '#FDCB6E',
  'Развлечения': '#A29BFE',
  'Покупки': '#FD79A8',
  'Быстрые траты': '#E17055',
  'Другое': '#636E72',
};

function getCategoryColor(name: string, nameRu: string | null, locale: string): string {
  if (locale === 'ru' && nameRu && CATEGORY_COLORS_RU[nameRu]) {
    return CATEGORY_COLORS_RU[nameRu];
  }
  return CATEGORY_COLORS[name] || '#636E72';
}

/** Map server insight titles to translated strings */
function translateInsight(
  insight: Insight,
  t: (key: string) => string,
  locale: string,
): { title: string; description: string } {
  const title = insight.title || '';
  if (title === 'High category spending') return { title: t('percentageOfIncome'), description: insight.description };
  if (title === 'Subscription spending') return { title: t('subscriptionDrain'), description: insight.description };
  if (title === 'Small purchases') return { title: t('smallPurchases'), description: insight.description };
  if (title === 'Low disposable income') return { title: t('lowDisposable'), description: insight.description };
  if (title === 'No expenses') return {
    title: locale === 'ru' ? 'Нет расходов' : 'No expenses',
    description: locale === 'ru' ? 'Нет расходов за этот месяц' : insight.description,
  };
  return { title, description: insight.description };
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeHeading = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CenteredLoader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
`;

// ---- Balance Card (top) ----

const BalanceCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.base};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}px) {
    grid-template-columns: 1fr;
  }
`;

const BalanceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
`;

const BalanceLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BalanceValue = styled.span<{ $color?: string }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ $color, theme }) => ($color ?? theme.colors.text)};
`;

// ---- Budget bar ----

const BudgetBarTrack = styled.div`
  width: 100%;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const BudgetBarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => Math.min($percent, 100)}%;
  background-color: ${({ $percent, theme }) =>
    $percent > 90
      ? theme.colors.danger
      : $percent > 70
        ? theme.colors.warning
        : theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.4s ease;
`;

const BudgetMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BudgetSubtext = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ---- Quick add ----

const QuickAddSection = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

const QuickAddTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const QuickButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const RoundButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 480px) {
    width: 56px;
    height: 56px;
    font-size: ${({ theme }) => theme.typography.fontSizes.md};
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CustomRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CustomInput = styled.input`
  width: 80px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};

  @media (min-width: 480px) {
    width: 100px;
  }

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

const CustomLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ---- Month Navigation ----

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MonthLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  min-width: 140px;
  text-align: center;
  text-transform: capitalize;

  @media (min-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSizes.xl};
    min-width: 200px;
  }
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

// ---- Calendar ----

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
  min-width: 0;
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

const CalendarCell = styled.div<{ $isToday: boolean; $isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xs} 1px;
  min-height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.md};

  @media (min-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm} 2px;
    min-height: 64px;
  }
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
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};

  @media (min-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  }
  font-weight: ${({ theme, $isToday }) =>
    $isToday
      ? theme.typography.fontWeights.bold
      : theme.typography.fontWeights.medium};
  color: ${({ theme, $isToday }) =>
    $isToday ? theme.colors.success : theme.colors.text};
  line-height: 1;
`;

const DayTotal = styled.span`
  font-size: 9px;
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 2px;
  line-height: 1;
  white-space: nowrap;

  @media (min-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSizes.xs};
    margin-top: 4px;
  }
`;

// ---- Expense List ----

const ExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ExpenseItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (min-width: 480px) {
    gap: ${({ theme }) => theme.spacing.base};
    padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.md};
  }
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  opacity: 0.85;
  flex-shrink: 0;

  @media (min-width: 480px) {
    width: 36px;
    height: 36px;
  }
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
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.danger};
  white-space: nowrap;

  @media (min-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  }
`;

const ExpenseItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-shrink: 0;

  @media (min-width: 480px) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

// ---- Forms ----

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.base};

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr 2fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`;

// ---- Totals ----

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

// ---- Income Section ----

const IncomeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
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

const IncomeFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.base};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// ---- Insights ----

const SectionHeader = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const InsightsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const InsightCardWrapper = styled(Card)`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.base};
`;

const InsightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const InsightTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const InsightDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: ${({ theme }) => theme.typography.lineHeights.normal};
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.base} 0;
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const badgeVariantForType = (
  type: Insight['type'],
): 'success' | 'warning' | 'danger' | 'info' | 'premium' => {
  switch (type) {
    case 'achievement':
      return 'premium';
    case 'warning':
      return 'warning';
    case 'tip':
      return 'success';
    case 'info':
    default:
      return 'info';
  }
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildCalendarDays(month: string): CalendarDay[] {
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const totalDays = getDaysInMonth(month);

  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: CalendarDay[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, mon - 1, -i);
    days.push({ date: d, dayOfMonth: d.getDate(), isCurrentMonth: false });
  }

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, mon - 1, day);
    days.push({ date: d, dayOfMonth: day, isCurrentMonth: true });
  }

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

function groupByDate(expenses: ExpenseItem[]): Map<string, ExpenseItem[]> {
  const map = new Map<string, ExpenseItem[]>();
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

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------

const DashboardPage: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const formatAmount = useCurrencyStore((s) => s.formatAmount);
  const toBase = useCurrencyStore((s) => s.toBase);
  const locale = useLocaleStore((s) => s.locale);

  // ---- Local state ----
  const [activeMonth, setActiveMonth] = useState(() => getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [customValue, setCustomValue] = useState('');
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [dailyAmount, setDailyAmount] = useState('');
  const [dailyCategoryId, setDailyCategoryId] = useState('');
  const [dailyDesc, setDailyDesc] = useState('');
  const [dailySubmitting, setDailySubmitting] = useState(false);
  const [dailyFormError, setDailyFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Income form
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [incomeFormAmount, setIncomeFormAmount] = useState('');
  const [incomeFormLabel, setIncomeFormLabel] = useState('');
  const [incomeFormSubmitting, setIncomeFormSubmitting] = useState(false);

  // ---- Queries ----
  const currentMonth = useMemo(() => getCurrentMonth(), []);

  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.list();
      const data = res.data?.data ?? res.data;
      return (Array.isArray(data) ? data : []) as CategoryData[];
    },
  });

  const { data: expensesRaw, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', activeMonth],
    queryFn: async () => {
      const res = await expensesApi.list({ month: activeMonth });
      return (res.data?.data ?? []) as ExpenseItem[];
    },
  });

  const { data: summaryRaw, isLoading: summaryLoading } = useQuery({
    queryKey: ['expenses-summary', activeMonth],
    queryFn: async () => {
      const res = await expensesApi.summary(activeMonth);
      return res.data?.data as ExpenseSummary | undefined;
    },
  });

  const { data: incomeListRaw, isLoading: incomeLoading } = useQuery({
    queryKey: ['income-list', currentMonth],
    queryFn: async () => {
      const res = await incomeApi.list(currentMonth);
      const data = res.data?.data ?? res.data;
      return (Array.isArray(data) ? data : []) as IncomeRecord[];
    },
  });

  useQuery({
    queryKey: ['income-current'],
    queryFn: async () => {
      const res = await incomeApi.current();
      return res.data?.data as IncomeData | undefined;
    },
  });

  const { data: insightsRaw, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights', currentMonth],
    queryFn: async () => {
      const res = await insightsApi.list(currentMonth);
      return (res.data?.data ?? []) as Insight[];
    },
  });

  // ---- Quick add mutation ----
  const quickAddMutation = useMutation({
    mutationFn: (amount: number) => expensesApi.quickAdd(toBase(amount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['cost-of-living'] });
    },
  });

  // ---- Derived state ----
  const categories = categoriesRaw ?? [];
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryData>();
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

  const allExpenses: ExpenseItem[] = Array.isArray(expensesRaw) ? expensesRaw : [];
  const expensesByDate = useMemo(() => groupByDate(allExpenses), [allExpenses]);

  const summary = summaryRaw;
  const incomes: IncomeRecord[] = Array.isArray(incomeListRaw) ? incomeListRaw : [];
  const insights: Insight[] = Array.isArray(insightsRaw) ? insightsRaw : [];
  const recentInsights = insights.slice(0, 3);

  const totalIncomeAmount = useMemo(
    () => incomes.reduce((sum, i) => sum + Number(i.amount), 0),
    [incomes],
  );

  const totalExpenses = summary?.grandTotal ?? 0;
  const balance = totalIncomeAmount - totalExpenses;

  const hasIncome = totalIncomeAmount > 0;

  const budgetPercent = useMemo(() => {
    if (!hasIncome) return 0;
    if (totalIncomeAmount === 0) return 0;
    return Math.round((totalExpenses / totalIncomeAmount) * 100);
  }, [hasIncome, totalIncomeAmount, totalExpenses]);

  const isLoading =
    expensesLoading || summaryLoading || incomeLoading || insightsLoading;

  const displayName = user?.displayName || user?.email || '';

  // Calendar
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

  const fixedExpenses = useMemo(
    () => allExpenses.filter((e) => {
      const cat = e.category || categoryMap.get(e.categoryId);
      return cat?.type === 'fixed';
    }),
    [allExpenses, categoryMap],
  );

  const fixedTotal = useMemo(
    () => fixedExpenses.reduce((sum, e) => sum + e.amount, 0),
    [fixedExpenses],
  );

  const selectedDayExpenses = useMemo(
    () => expensesByDate.get(selectedDate) ?? [],
    [expensesByDate, selectedDate],
  );

  const selectedDayTotal = useMemo(
    () => selectedDayExpenses.reduce((sum, e) => sum + e.amount, 0),
    [selectedDayExpenses],
  );

  // ---- Helpers ----
  const getCategoryName = useCallback(
    (expense: ExpenseItem): string => {
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

  // ---- Month navigation ----
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

  // ---- Quick add ----
  const handleQuickAdd = useCallback(
    (amount: number) => {
      quickAddMutation.mutate(amount);
    },
    [quickAddMutation],
  );

  const handleCustomAdd = useCallback(() => {
    const val = parseFloat(customValue);
    if (isNaN(val) || val <= 0) return;
    quickAddMutation.mutate(val);
    setCustomValue('');
  }, [customValue, quickAddMutation]);

  // ---- Daily expense submit ----
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
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    } catch {
      setDailyFormError(tc('error'));
    } finally {
      setDailySubmitting(false);
    }
  }, [dailyAmount, dailyCategoryId, dailyDesc, selectedDate, toBase, t, tc, queryClient]);

  // ---- Delete expense ----
  const handleDeleteExpense = useCallback(
    async (id: string) => {
      if (!window.confirm(t('deleteConfirm'))) return;
      setDeletingId(id);
      try {
        await expensesApi.remove(id);
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      } catch {
        // error handled silently
      } finally {
        setDeletingId(null);
      }
    },
    [t, queryClient],
  );

  // ---- Income submit ----
  const handleIncomeSubmit = useCallback(async () => {
    const amount = parseFloat(incomeFormAmount);
    if (!amount || amount <= 0) return;
    if (!incomeFormLabel.trim()) return;

    setIncomeFormSubmitting(true);
    try {
      await incomeApi.create({
        amount: toBase(amount),
        month: currentMonth,
        label: incomeFormLabel.trim(),
      });
      setIncomeFormAmount('');
      setIncomeFormLabel('');
      setShowIncomeForm(false);
      queryClient.invalidateQueries({ queryKey: ['income-list'] });
      queryClient.invalidateQueries({ queryKey: ['income-current'] });
    } catch {
      // error handled silently
    } finally {
      setIncomeFormSubmitting(false);
    }
  }, [incomeFormAmount, incomeFormLabel, currentMonth, toBase, queryClient]);

  const handleDeleteIncome = useCallback(
    async (id: string) => {
      if (!window.confirm(t('deleteConfirm'))) return;
      try {
        await incomeApi.remove(id);
        queryClient.invalidateQueries({ queryKey: ['income-list'] });
        queryClient.invalidateQueries({ queryKey: ['income-current'] });
      } catch {
        // error handled silently
      }
    },
    [t, queryClient],
  );

  // ---- Touch swipe for calendar ----
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

  // ---- Render ----

  if (isLoading) {
    return (
      <PageWrapper>
        <WelcomeHeading>
          {t('welcome')}, {displayName}
        </WelcomeHeading>
        <CenteredLoader>
          <Spinner size="lg" />
        </CenteredLoader>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Welcome */}
      <WelcomeHeading>
        {t('welcome')}, {displayName}
      </WelcomeHeading>

      {/* ============ 1. BALANCE (top) ============ */}
      <BalanceCard>
        <SectionHeader>{t('balance')}</SectionHeader>
        <BalanceGrid>
          <BalanceItem>
            <BalanceLabel>{t('income')}</BalanceLabel>
            <BalanceValue $color="#00B894">{formatAmount(totalIncomeAmount)}</BalanceValue>
          </BalanceItem>
          <BalanceItem>
            <BalanceLabel>{t('expenses')}</BalanceLabel>
            <BalanceValue $color="#E17055">{formatAmount(totalExpenses)}</BalanceValue>
          </BalanceItem>
          <BalanceItem>
            <BalanceLabel>{t('balance')}</BalanceLabel>
            <BalanceValue $color={balance >= 0 ? '#00B894' : '#E17055'}>
              {formatAmount(balance)}
            </BalanceValue>
          </BalanceItem>
        </BalanceGrid>

        {hasIncome && (
          <>
            <BudgetBarTrack>
              <BudgetBarFill $percent={budgetPercent} />
            </BudgetBarTrack>
            <BudgetMeta>
              <BudgetSubtext>
                {formatAmount(totalExpenses)} / {formatAmount(totalIncomeAmount)}
              </BudgetSubtext>
              <BudgetSubtext>
                {formatAmount(Math.max(0, balance))} {t('remaining')}
              </BudgetSubtext>
            </BudgetMeta>
          </>
        )}
        {!hasIncome && <EmptyText>{t('noIncome')}</EmptyText>}
      </BalanceCard>

      {/* ============ 2. EXPENSES (higher) ============ */}

      {/* Quick add */}
      <QuickAddSection>
        <QuickAddTitle>{t('quickAdd')}</QuickAddTitle>
        <QuickButtonRow>
          {[5, 10, 20, 50].map((amount) => (
            <RoundButton
              key={amount}
              disabled={quickAddMutation.isPending}
              onClick={() => handleQuickAdd(amount)}
            >
              +{amount}
            </RoundButton>
          ))}
          <CustomRow>
            <CustomLabel>{t('customAmount')}</CustomLabel>
            <CustomInput
              type="number"
              min="0"
              step="any"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="0"
            />
            <Button
              variant="primary"
              size="sm"
              disabled={
                quickAddMutation.isPending ||
                !customValue ||
                isNaN(parseFloat(customValue)) ||
                parseFloat(customValue) <= 0
              }
              onClick={handleCustomAdd}
            >
              {t('quickAdd')}
            </Button>
          </CustomRow>
        </QuickButtonRow>
      </QuickAddSection>

      {/* Month Selector */}
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

      {/* Calendar + Expenses side-by-side */}
      <ContentLayout>
        {/* Calendar */}
        <CalendarColumn>
          <Card header={<SectionHeader>{t('dailyExpenses')}</SectionHeader>}>
            <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <CalendarGrid>
                {weekdays.map((wd) => (
                  <CalendarHeaderCell key={wd}>{wd}</CalendarHeaderCell>
                ))}

                {calendarDays.map((calDay, idx) => {
                  const dateStr = toISODate(calDay.date);
                  const dayExpenses = expensesByDate.get(dateStr) ?? [];
                  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate && calDay.isCurrentMonth;

                  return (
                    <CalendarCell
                      key={`${idx}-${dateStr}`}
                      $isToday={isToday && calDay.isCurrentMonth}
                      $isSelected={isSelected}
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

            {summary && (
              <TotalRow>
                <TotalLabel>{t('monthTotal')}</TotalLabel>
                <TotalAmount>{formatAmount(summary.grandTotal)}</TotalAmount>
              </TotalRow>
            )}

            {fixedTotal > 0 && (
              <FixedSummaryCard>
                <FixedSummaryLabel>{t('totalFixed')}</FixedSummaryLabel>
                <FixedSummaryValue>{formatAmount(fixedTotal)}</FixedSummaryValue>
              </FixedSummaryCard>
            )}
          </Card>
        </CalendarColumn>

        {/* Selected Day Expenses */}
        <ExpensesColumn>
          <Card
            header={
              <SectionHeader>
                {formatDate(selectedDate, locale)}{' '}
                {selectedDayTotal > 0 && (
                  <Badge variant="danger">
                    {t('totalDay')}: {formatAmount(selectedDayTotal)}
                  </Badge>
                )}
              </SectionHeader>
            }
          >
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
                {dailyFormError && <ErrorText>{dailyFormError}</ErrorText>}
                <FormActions>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowDailyForm(false);
                    setDailyFormError(null);
                  }}>
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

            {selectedDayExpenses.length > 0 ? (
              <ExpenseList>
                {selectedDayExpenses.map((expense) => {
                  const cat = expense.category || categoryMap.get(expense.categoryId);
                  const color = cat
                    ? getCategoryColor(cat.name, cat.nameRu, locale)
                    : '#636E72';

                  return (
                    <ExpenseItemRow key={expense.id}>
                      <ColorDot $color={color} />
                      <ExpenseInfo>
                        <ExpenseCategoryRow>
                          <ExpenseCategoryName>
                            {getCategoryName(expense)}
                          </ExpenseCategoryName>
                          {cat && (
                            <Badge variant={cat.type === 'fixed' ? 'info' : 'warning'}>
                              {cat.type === 'fixed' ? t('fixedTotal') : t('variableTotal')}
                            </Badge>
                          )}
                        </ExpenseCategoryRow>
                        {expense.description && (
                          <ExpenseDescription>{expense.description}</ExpenseDescription>
                        )}
                      </ExpenseInfo>
                      <ExpenseItemActions>
                        <ExpenseAmount>
                          {formatAmount(expense.amount)}
                        </ExpenseAmount>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deletingId === expense.id}
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          {tc('delete')}
                        </Button>
                      </ExpenseItemActions>
                    </ExpenseItemRow>
                  );
                })}
              </ExpenseList>
            ) : (
              <EmptyText>{t('noExpensesDay')}</EmptyText>
            )}
          </Card>
        </ExpensesColumn>
      </ContentLayout>

      {/* ============ 3. INCOME ============ */}
      <Card header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionHeader>{t('income')}</SectionHeader>
          <Button variant="primary" size="sm" onClick={() => setShowIncomeForm(!showIncomeForm)}>
            {showIncomeForm ? tc('cancel') : t('addIncome')}
          </Button>
        </div>
      }>
        {showIncomeForm && (
          <div style={{ marginBottom: '16px' }}>
            <IncomeFormGrid>
              <Input
                label={t('incomeAmount')}
                type="number"
                placeholder="0.00"
                value={incomeFormAmount}
                onChange={(e) => setIncomeFormAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <Input
                label={t('incomeLabel')}
                type="text"
                placeholder={locale === 'ru' ? 'Зарплата' : 'Salary'}
                value={incomeFormLabel}
                onChange={(e) => setIncomeFormLabel(e.target.value)}
              />
              <Input
                label={t('incomeMonth')}
                type="month"
                value={currentMonth}
                disabled
              />
            </IncomeFormGrid>
            <FormActions>
              <Button variant="ghost" size="sm" onClick={() => setShowIncomeForm(false)}>
                {tc('cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={incomeFormSubmitting}
                disabled={!incomeFormAmount || !incomeFormLabel.trim() || parseFloat(incomeFormAmount) <= 0}
                onClick={handleIncomeSubmit}
              >
                {tc('add')}
              </Button>
            </FormActions>
          </div>
        )}

        {incomes.length > 0 ? (
          <>
            <ExpenseList>
              {incomes.map((inc) => (
                <IncomeRow key={inc.id}>
                  <IncomeInfo>
                    <IncomeLabel>{inc.label || t('income')}</IncomeLabel>
                    <IncomeDate>{formatDate(inc.createdAt, locale)}</IncomeDate>
                  </IncomeInfo>
                  <ExpenseItemActions>
                    <IncomeAmount>{formatAmount(Number(inc.amount))}</IncomeAmount>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteIncome(inc.id)}
                    >
                      {tc('delete')}
                    </Button>
                  </ExpenseItemActions>
                </IncomeRow>
              ))}
            </ExpenseList>
            <TotalRow>
              <TotalLabel>{t('totalIncome')}</TotalLabel>
              <TotalAmount>{formatAmount(totalIncomeAmount)}</TotalAmount>
            </TotalRow>
          </>
        ) : (
          <EmptyText>{t('noIncomes')}</EmptyText>
        )}
      </Card>

      {/* ============ 4. ANALYTICS (insights) ============ */}
      {recentInsights.length > 0 && (
        <>
          <SectionHeader>{t('recentInsights')}</SectionHeader>
          <InsightsGrid>
            {recentInsights.map((insight, idx) => {
                const translated = translateInsight(insight, t, locale);
                return (
              <InsightCardWrapper key={insight.id ?? idx}>
                <Badge variant={badgeVariantForType(insight.type)}>
                  {insight.type}
                </Badge>
                <InsightContent>
                  <InsightTitle>{translated.title}</InsightTitle>
                  <InsightDescription>{translated.description}</InsightDescription>
                </InsightContent>
                {insight.amount != null && insight.amount > 0 && (
                  <span style={{ fontWeight: 600, color: '#6C5CE7' }}>
                    {formatAmount(insight.amount)}
                  </span>
                )}
              </InsightCardWrapper>
                );
              })}
          </InsightsGrid>
        </>
      )}
    </PageWrapper>
  );
};

export default DashboardPage;
