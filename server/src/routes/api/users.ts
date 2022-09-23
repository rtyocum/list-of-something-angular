import express from 'express';
import auth from '../../middleware/auth';
import User from '../../models/user';
import { permissionLevels } from '../auth/permissionLevels';

const userRouter = express.Router();

userRouter.get('/', auth(permissionLevels.admin + permissionLevels.owner), async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
});

userRouter.put('/:id', auth(permissionLevels.admin + permissionLevels.owner), async (req, res) => {
    const user = await User.findById(req.params['id']);
});

export default userRouter;
