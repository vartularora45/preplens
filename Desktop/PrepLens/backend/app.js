import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './models/db.js';
import userRoutes from './routes/User.routes.js';
import submissionRoutes from './routes/Submission.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
db();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    res.send('Hello World');
});
app.use('/api/users', userRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/feedback', feedbackRoutes);

export default app; 

