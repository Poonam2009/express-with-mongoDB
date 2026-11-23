import 'dotenv/config';
import express from 'express';
import { connectMongoDB } from './connection.js';
import userRouter from './routers/user.router.js'
import { authMiddleware } from './middlewares/auth.middleware.js';

const app = express();

const PORT = process.env.PORT ?? 8000;

await connectMongoDB(process.env.MONGODB_URL);
console.log('Mongo DB connected');

app.use(express.json())
app.use(authMiddleware)
app.use('/user', userRouter)


app.listen(PORT, () => console.log(`Server is up and running PORT ${PORT}`));