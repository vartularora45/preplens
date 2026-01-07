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
const allowedOrigins = [
  "http://localhost:5173",
  "https://preplens-l7ek.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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

