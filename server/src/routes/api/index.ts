import { Router } from 'express';
import itemsRouter from './items';
import userRouter from './users';

const apiRouter = Router();

apiRouter.use('/items', itemsRouter);
apiRouter.use('/users', userRouter);

export default apiRouter;
