import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import empresasRoutes from './routes/empresas.routes.js';
import balancesRoutes from './routes/balances.routes.js';
import analisisRoutes from './routes/analisis.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.nodeEnv === 'production' ? env.frontendUrl : '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/balances', balancesRoutes);
app.use('/api/analisis', analisisRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`ContIA backend escuchando en puerto ${env.port}`);
});
