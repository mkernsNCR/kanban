import express from 'express';
import cors from 'cors';
import { kanbanRouter } from './src/api/kanban.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/kanban', kanbanRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
