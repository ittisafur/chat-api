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

const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

app.use('/api/docs/user', swaggerUi.serve, swaggerUi.setup(userSpecs));
app.use('/api/docs/admin', swaggerUi.serve, swaggerUi.setup(adminSpecs));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
});

setupSocketIO(io);

export { app, httpServer };
