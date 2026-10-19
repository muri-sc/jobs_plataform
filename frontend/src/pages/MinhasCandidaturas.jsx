import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as applicationsApi from '../api/applications';
import Alert from '../components/Alert';
import { formatApiError } from '../utils/errors';
import { formatDate, statusLabel } from '../utils/format';

export default function MinhasCandidaturas() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await applicationsApi.listMyApplications();
        if (active) setItems(data);
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
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <h1>Minhas candidaturas</h1>
        <p className="muted">Acompanhe o andamento das vagas em que você se candidatou.</p>
      </header>

      <Alert>{error}</Alert>

      {loading ? (
        <p className="muted">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="empty-state">
          Você ainda não se candidatou a nenhuma vaga.{' '}
          <Link to="/vagas">Explorar vagas</Link>
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Empresa</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/vagas/${item.job_id}`}>{item.title}</Link>
                  </td>
                  <td>{item.company}</td>
                  <td>
                    <span className={`status status--${item.status}`}>
                      {statusLabel(item.status)}
                    </span>
                  </td>
                  <td>{formatDate(item.applied_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
