import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as applicationsApi from '../../api/applications';
import * as jobsApi from '../../api/jobs';
import Alert from '../../components/Alert';
import { formatApiError } from '../../utils/errors';
import { formatDate, statusLabel } from '../../utils/format';

const STATUS_OPTIONS = ['submitted', 'reviewing', 'approved', 'rejected'];

export default function RecruiterCandidatos() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [jobData, apps] = await Promise.all([
          jobsApi.getJob(id),
          jobsApi.listJobApplications(id),
        ]);
        if (!active) return;
        setJob(jobData);
        setCandidates(apps);
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

  async function handleStatusChange(applicationId, status) {
    setUpdatingId(applicationId);
    setError('');
    try {
      await applicationsApi.updateApplicationStatus(applicationId, status);
      setCandidates((prev) =>
        prev.map((c) => (c.id === applicationId ? { ...c, status } : c))
      );
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="page">
      <Link className="back-link" to="/recrutador/vagas">
        ← Voltar às vagas
      </Link>

      <header className="page-header">
        <h1>Candidatos</h1>
        {job && (
          <p className="muted">
            {job.title} · {job.company}
          </p>
        )}
      </header>

      <Alert>{error}</Alert>

      {loading ? (
        <p className="muted">Carregando…</p>
      ) : candidates.length === 0 ? (
        <p className="empty-state">Nenhuma candidatura nesta vaga ainda.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Interesse</th>
                <th>Enviada em</th>
                <th>Status</th>
                <th>Chat</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.preferred_role || '—'}</td>
                  <td>{formatDate(c.applied_at)}</td>
                  <td>
                    <select
                      value={c.status}
                      disabled={updatingId === c.id}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      aria-label={`Status de ${c.name}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Link className="btn btn--ghost btn--sm" to={`/mensagens/${c.id}`}>
                      Conversar
                    </Link>
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
