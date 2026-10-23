import express from 'express';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/error-handler.js';
import AppError from './utils/app-error.js';
import itemRoutes from './routes/item.routes.js';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/items', itemRoutes);

app.use((req, res, next) => {
  next(new AppError('Endpoint tidak ditemukan', 404));
});

app.use(errorHandler);

export default app;