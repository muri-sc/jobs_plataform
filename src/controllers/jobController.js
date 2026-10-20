import * as jobModel from '../models/jobModel.js';
import { idSchema } from '../schemas/commonSchema.js';
import { jobQuerySchema, jobSchema, jobUpdateSchema } from '../schemas/jobSchema.js';
import { AppError } from '../utils/AppError.js';

export async function list(req, res) {
  res.json(await jobModel.findAll(jobQuerySchema.parse(req.query)));
}

// Busca a vaga e garante que o recrutador logado é o dono
export async function findOwnedJob(id, user) {
  const job = await jobModel.findById(id);
  if (!job) throw new AppError('Vaga não encontrada', 404);
  if (Number(job.recruiter_id) !== user.id) throw new AppError('Esta vaga pertence a outro recrutador', 403);
  return job;
}

export async function listMine(req, res) {
  const filters = jobQuerySchema.parse(req.query);
  res.json(await jobModel.findAll({ ...filters, recruiter_id: req.user.id }));
}

export async function getOne(req, res) {
  const job = await jobModel.findById(idSchema.parse(req.params.id));
  if (!job) throw new AppError('Vaga não encontrada', 404);
  res.json(job);
}

export async function create(req, res) {
  res.status(201).json(await jobModel.create(req.user.id, jobSchema.parse(req.body)));
}

export async function update(req, res) {
  const id = idSchema.parse(req.params.id);
  const data = jobUpdateSchema.parse(req.body);
  await findOwnedJob(id, req.user);
  res.json(await jobModel.update(id, data));
}

export async function remove(req, res) {
  const id = idSchema.parse(req.params.id);
  await findOwnedJob(id, req.user);
  await jobModel.remove(id);
  res.status(204).end();
}
