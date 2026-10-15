import * as jobModel from '../models/jobModel.js';
import { idSchema } from '../schemas/commonSchema.js';
import { jobQuerySchema, jobSchema, jobUpdateSchema } from '../schemas/jobSchema.js';
import { AppError } from '../utils/AppError.js';

export async function list(req, res) {
  res.json(await jobModel.findAll(jobQuerySchema.parse(req.query)));
}

export async function getOne(req, res) {
  const job = await jobModel.findById(idSchema.parse(req.params.id));
  if (!job) throw new AppError('Vaga não encontrada', 404);
  res.json(job);
}

export async function create(req, res) {
  res.status(201).json(await jobModel.create(jobSchema.parse(req.body)));
}

export async function update(req, res) {
  const id = idSchema.parse(req.params.id);
  const job = await jobModel.update(id, jobUpdateSchema.parse(req.body));
  if (!job) throw new AppError('Vaga não encontrada', 404);
  res.json(job);
}

export async function remove(req, res) {
  const deleted = await jobModel.remove(idSchema.parse(req.params.id));
  if (!deleted) throw new AppError('Vaga não encontrada', 404);
  res.status(204).end();
}
