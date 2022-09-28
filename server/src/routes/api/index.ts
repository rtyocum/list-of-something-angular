import { Router } from 'express';
import itemsRouter from './items';
import usersRouter from './users';

const apiRouter = Router();

apiRouter.use('/items', itemsRouter);
apiRouter.use('/users', usersRouter);

export default apiRouter;
