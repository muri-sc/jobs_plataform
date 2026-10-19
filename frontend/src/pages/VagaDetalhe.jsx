import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as applicationsApi from '../api/applications';
import * as jobsApi from '../api/jobs';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { formatApiError } from '../utils/errors';
import { formatDate, formatSalary, workModelLabel } from '../utils/format';

export default function VagaDetalhe() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await jobsApi.getJob(id);
        if (active) setJob(data);
      } catch (err) {
        if (active) setError(formatApiError(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleApply() {
    setApplyError('');
    setApplySuccess('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vagas/${id}` } });
      return;
    }

    if (user?.role !== 'dev') {
      setApplyError('Apenas contas de candidato podem se candidatar.');
      return;
    }

    setApplying(true);
    try {
      await applicationsApi.applyToJob(id);
      setApplySuccess('Candidatura enviada com sucesso!');
    } catch (err) {
      setApplyError(formatApiError(err));
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <section className="page">
        <p className="muted">Carregando vaga…</p>
      </section>
    );
  }

  if (error || !job) {
    return (
      <section className="page">
        <Alert>{error || 'Vaga não encontrada.'}</Alert>
        <Link to="/vagas">Voltar às vagas</Link>
      </section>
    );
  }

  return (
    <section className="page job-detail">
      <Link className="back-link" to="/vagas">
        ← Voltar às vagas
      </Link>

      <header className="job-detail__header">
        <p className="job-detail__company">{job.company}</p>
        <h1>{job.title}</h1>
        <ul className="job-detail__facts">
          <li>{job.location || 'Local a definir'}</li>
          <li>{workModelLabel(job.work_model)}</li>
          <li>{formatSalary(job.salary_min, job.salary_max)}</li>
          <li>Publicada em {formatDate(job.created_at)}</li>
        </ul>
      </header>

      <div className="job-detail__body">
        <article className="panel">
          <h2>Descrição</h2>
          <p className="pre-wrap">{job.description}</p>
        </article>
        {job.requirements && (
          <article className="panel">
            <h2>Requisitos</h2>
            <p className="pre-wrap">{job.requirements}</p>
          </article>
        )}
      </div>

      <div className="job-detail__apply">
        <Alert>{applyError}</Alert>
        {applySuccess && <Alert type="success">{applySuccess}</Alert>}
        {job.status === 'closed' ? (
          <p className="muted">Esta vaga está fechada.</p>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? 'Enviando…' : 'Candidatar-me'}
          </button>
        )}
        {isAuthenticated && user?.role === 'dev' && (
          <Link className="btn btn--ghost" to="/minhas-candidaturas">
            Ver minhas candidaturas
          </Link>
        )}
      </div>
    </section>
  );
}
