import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import incomeRoutes from './modules/income/income.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import expensesRoutes from './modules/expenses/expenses.routes';
import insightsRoutes from './modules/insights/insights.routes';
import simulationsRoutes from './modules/simulations/simulations.routes';
import goalsRoutes from './modules/goals/goals.routes';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(apiLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/income', incomeRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/insights', insightsRoutes);
app.use('/api/v1/simulations', simulationsRoutes);
app.use('/api/v1/goals', goalsRoutes);

app.use(errorHandler);

export default app;
