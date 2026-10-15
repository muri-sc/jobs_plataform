import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import { loginSchema, registerSchema } from '../schemas/authSchema.js';
import { AppError } from '../utils/AppError.js';

export async function register(req, res) {
  const { password, ...data } = registerSchema.parse(req.body);
  const password_hash = await bcrypt.hash(password, 10);
  res.status(201).json(await userModel.create({ ...data, password_hash }));
}

export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await userModel.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('E-mail ou senha inválidos', 401);
  }

  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
}

export async function me(req, res) {
  res.json(await userModel.findById(req.user.id));
}
