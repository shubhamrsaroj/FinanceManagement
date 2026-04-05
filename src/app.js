import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import config from './config/env.js';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import recordRoutes from './routes/record.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API',
    version: '1.0.0',
    documentation: '/api/v1/docs'
  });
});

// Swagger UI – interactive API docs
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;