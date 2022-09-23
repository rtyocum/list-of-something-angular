import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/user';
import Token from '../../models/token';

const authRouter = Router();

authRouter.post('/token', async (req, res) => {
  try {
    if (!req.cookies.jwt) throw Error('No token exists');
    const isToken = await Token.findOne({ token: req.cookies.jwt });
    if (!isToken) throw Error('Token is not valid');
    const user = jwt.verify(req.cookies.jwt, process.env['REFRESH_TOKEN_SECRET'] as string);
    console.log(user);
    const currentUser = await User.findOne({ _id: (user as any).id });
    console.log(currentUser);
    if (!currentUser) throw Error('No user exists for this token');
    const access_token = jwt.sign(
      { id: currentUser._id, permissionLevel: currentUser.permissionLevel },
      process.env['ACCESS_TOKEN_SECRET'] as string,
      {
        expiresIn: '15m',
      }
    );
    if (!access_token) throw Error('Failed to sign token');
    res.json({
      access_token,
      user: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        permissionLevel: currentUser.permissionLevel,
      },
    });
  } catch (e: any) {
    res.status(400).json({
      message: e.message,
    });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) throw Error('Missing parameters');

    const currentUser = await User.findOne({ email: req.body.email });
    if (!currentUser) throw Error('Invalid Credentials');
    const match = await bcrypt.compare(req.body.password, currentUser.password);
    if (!match) throw Error('Invalid Credentials');

    const access_token = jwt.sign(
      { id: currentUser._id, permissionLevel: currentUser.permissionLevel },
      process.env['ACCESS_TOKEN_SECRET'] as string,
      {
        expiresIn: '15m',
      }
    );
    if (!access_token) throw Error('Failed to sign token');

    const refresh_token = jwt.sign({ id: currentUser._id }, process.env['REFRESH_TOKEN_SECRET'] as string);
    if (!refresh_token) throw Error('Failed to sign token');
    await new Token({ token: refresh_token }).save();
    res.cookie('jwt', refresh_token, {
      path: '/auth',
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
    res.json({
      access_token,
      user: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        permissionLevel: currentUser.permissionLevel,
      },
    });
  } catch (e: any) {
    res.status(400).json({
      message: e.message,
    });
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    if (req.cookies.jwt) {
      res.clearCookie('jwt', { path: '/auth' });
      await Token.findOneAndDelete({ token: req.cookies.jwt });
    }
    res.json({
      message: 'Logged out',
    });
  } catch (e: any) {
    res.status(400).json({
      message: e.message,
    });
  }
});

authRouter.post('/register', async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) throw Error('Missing parameters');

    const currentUser = await User.findOne({ email: req.body.email });
    if (currentUser) throw Error('User already exists');

    const salt = await bcrypt.genSalt(10);
    if (!salt) throw Error('bcrypt failed');

    const hash = await bcrypt.hash(req.body.password, salt);
    if (!hash) throw Error('Failed to hash the password');

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    });
    const savedUser = await user.save();

    const access_token = jwt.sign(
      { id: savedUser._id, permissionLevel: savedUser.permissionLevel },
      process.env['ACCESS_TOKEN_SECRET'] as string,
      {
        expiresIn: 3600,
      }
    );
    if (!access_token) throw Error('Failed to generate a token');

    const refresh_token = jwt.sign({ id: savedUser._id }, process.env['REFRESH_TOKEN_SECRET'] as string);
    if (!refresh_token) throw Error('Failed to sign token');
    await new Token({ token: refresh_token }).save();
    res.cookie('jwt', refresh_token, {
      path: '/auth',
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });

    res.json({
      access_token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        permissionLevel: savedUser.permissionLevel,
      },
    });
  } catch (e: any) {
    res.status(400).json({
      message: e.message,
    });
  }
});

export default authRouter;
