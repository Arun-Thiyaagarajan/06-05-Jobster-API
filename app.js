import 'express-async-errors';
import express, { json, static as static_ } from 'express';
import { config } from 'dotenv';
// error handler
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';
import authenticateUser from './middleware/authentication.js';
//routers
import authRouter from './routes/auth.js'
import jobsRouter from './routes/jobs.js'
//connectDB
import connectDB from './db/connect.js'
// extra packages
import helmet from 'helmet';
import xss from 'xss-clean';
import {resolve, dirname} from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
config();

app.set('trust proxy', 1);

app.use(static_(resolve(__dirname, './client/build')));
app.use(json());
app.use(helmet());
app.use(xss());

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, './client/build', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('Database connected successfully');
    app.listen(port, () =>
      console.log(`Server is listening on port http://localhost:${port}`)
    );
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

start();
