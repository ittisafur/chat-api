import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { userSpecs, adminSpecs } from './config/swagger';
import logger from './config/logger';
import { createServer } from 'http';
import { Server } from 'socket.io';
import setupSocketIO from './socket';
import rateLimiter from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Define allowed origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['https://chat-frontend-phi-ten.vercel.app', 'http://localhost:3000', 'http://localhost:5173'];

// Set up Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set up CORS for Express
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Apply middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: Apply Helmet with CSP disabled ONLY for Swagger routes
app.use(
  '/api/docs',
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// Apply standard Helmet security for all other routes
app.use(helmet());

// Apply rate limiter
app.use(rateLimiter);

// Set up Swagger
app.use('/api/docs/user', swaggerUi.serve, swaggerUi.setup(userSpecs));
app.use('/api/docs/admin', swaggerUi.serve, swaggerUi.setup(adminSpecs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
});

// Set up Socket.IO event handlers
setupSocketIO(io);

export { app, httpServer };
