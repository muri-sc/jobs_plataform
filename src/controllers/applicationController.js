import * as applicationModel from '../models/applicationModel.js';
import * as jobModel from '../models/jobModel.js';
import { findOwnedJob } from './jobController.js';
import { applicationStatusSchema, applySchema } from '../schemas/applicationSchema.js';
import { idSchema } from '../schemas/commonSchema.js';
import { AppError } from '../utils/AppError.js';

export async function apply(req, res) {
  const { job_id } = applySchema.parse(req.body);
  const job = await jobModel.findById(job_id);
  if (!job) throw new AppError('Vaga não encontrada', 404);
  if (job.status !== 'open') throw new AppError('Esta vaga está fechada');

  // Candidatura repetida cai no UNIQUE do banco (409)
  res.status(201).json(await applicationModel.create(req.user.id, job_id));
}

export async function listMine(req, res) {
  res.json(await applicationModel.findByUser(req.user.id));
}

export async function listByJob(req, res) {
  const job = await findOwnedJob(idSchema.parse(req.params.id), req.user);
  res.json(await applicationModel.findByJob(job.id));
}

export async function updateStatus(req, res) {
  const id = idSchema.parse(req.params.id);
  const { status } = applicationStatusSchema.parse(req.body);
  const current = await applicationModel.findById(id);
  if (!current) throw new AppError('Candidatura não encontrada', 404);
  await findOwnedJob(current.job_id, req.user);
  res.json(await applicationModel.updateStatus(id, status));
}
