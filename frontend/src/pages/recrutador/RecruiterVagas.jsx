import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as jobsApi from '../../api/jobs';
import Alert from '../../components/Alert';
import { formatApiError } from '../../utils/errors';
import { formatSalary, statusLabel, workModelLabel } from '../../utils/format';

const EMPTY_FORM = {
  company: '',
  title: '',
  description: '',
  requirements: '',
  location: '',
  work_model: 'remote',
  salary_min: '',
  salary_max: '',
};

export default function RecruiterVagas() {
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadJobs(status = statusFilter) {
    setLoading(true);
    setError('');
    try {
      const data = await jobsApi.listJobs({ status });
      setJobs(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(job) {
    setEditingId(job.id);
    setForm({
      company: job.company || '',
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      work_model: job.work_model || 'remote',
      salary_min: job.salary_min ?? '',
      salary_max: job.salary_max ?? '',
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function buildPayload() {
    const payload = {
      company: form.company.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      work_model: form.work_model,
    };
    if (form.requirements.trim()) payload.requirements = form.requirements.trim();
    if (form.location.trim()) payload.location = form.location.trim();
    if (form.salary_min !== '') payload.salary_min = Number(form.salary_min);
    if (form.salary_max !== '') payload.salary_max = Number(form.salary_max);
    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = buildPayload();
      if (editingId) {
        await jobsApi.updateJob(editingId, payload);
        setSuccess('Vaga atualizada.');
      } else {
        await jobsApi.createJob(payload);
        setSuccess('Vaga criada.');
      }
      resetForm();
      await loadJobs();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(job) {
    setError('');
    try {
      const next = job.status === 'open' ? 'closed' : 'open';
      await jobsApi.updateJob(job.id, { status: next });
      await loadJobs();
    } catch (err) {
      setError(formatApiError(err));
    }
  }

  async function handleDelete(job) {
    if (!window.confirm(`Excluir a vaga "${job.title}"?`)) return;
    setError('');
    try {
      await jobsApi.deleteJob(job.id);
      if (editingId === job.id) resetForm();
      await loadJobs();
    } catch (err) {
      setError(formatApiError(err));
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Vagas do recrutador</h1>
        <p className="muted">Crie, edite, abra/feche e acompanhe candidatos.</p>
      </header>

      <Alert>{error}</Alert>
      {success && <Alert type="success">{success}</Alert>}

      <form className="form panel" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Editar vaga' : 'Nova vaga'}</h2>
        <div className="form-grid">
          <label>
            Empresa
            <input
              required
              minLength={2}
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
            />
          </label>
          <label>
            Título
            <input
              required
              minLength={2}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </label>
          <label className="span-2">
            Descrição
            <textarea
              required
              minLength={10}
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>
          <label className="span-2">
            Requisitos
            <textarea
              rows={3}
              value={form.requirements}
              onChange={(e) => update('requirements', e.target.value)}
            />
          </label>
          <label>
            Local
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </label>
          <label>
            Modalidade
            <select
              required
              value={form.work_model}
              onChange={(e) => update('work_model', e.target.value)}
            >
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
              <option value="onsite">Presencial</option>
            </select>
          </label>
          <label>
            Salário mín.
            <input
              type="number"
              min="0"
              step="100"
              value={form.salary_min}
              onChange={(e) => update('salary_min', e.target.value)}
            />
          </label>
          <label>
            Salário máx.
            <input
              type="number"
              min="0"
              step="100"
              value={form.salary_max}
              onChange={(e) => update('salary_max', e.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Publicar vaga'}
          </button>
          {editingId && (
            <button className="btn btn--ghost" type="button" onClick={resetForm}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <div className="toolbar">
        <label>
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="open">Abertas</option>
            <option value="closed">Fechadas</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="muted">Carregando…</p>
      ) : jobs.length === 0 ? (
        <p className="empty-state">Nenhuma vaga neste filtro.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Empresa</th>
                <th>Modalidade</th>
                <th>Salário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>{workModelLabel(job.work_model)}</td>
                  <td>{formatSalary(job.salary_min, job.salary_max)}</td>
                  <td>
                    <span className={`status status--${job.status}`}>
                      {statusLabel(job.status)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => startEdit(job)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => toggleStatus(job)}
                    >
                      {job.status === 'open' ? 'Fechar' : 'Reabrir'}
                    </button>
                    <Link
                      className="btn btn--ghost btn--sm"
                      to={`/recrutador/vagas/${job.id}/candidatos`}
                    >
                      Candidatos
                    </Link>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(job)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
