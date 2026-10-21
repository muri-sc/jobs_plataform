import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as jobsApi from '../api/jobs';
import Alert from '../components/Alert';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { formatApiError } from '../utils/errors';
import { loadPreferences } from '../utils/preferences';

export default function Vagas() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefs = loadPreferences();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || prefs.preferred_role || user?.preferred_role || '',
    location: searchParams.get('location') || prefs.location || '',
    work_model: searchParams.get('work_model') || prefs.work_model || '',
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchJobs(nextFilters) {
    setLoading(true);
    setError('');
    try {
      const data = await jobsApi.listJobs({
        search: nextFilters.search || undefined,
        location: nextFilters.location || undefined,
        work_model: nextFilters.work_model || undefined,
        status: 'open',
      });
      setJobs(data);
    } catch (err) {
      setError(formatApiError(err));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.work_model) params.work_model = filters.work_model;
    setSearchParams(params);
    fetchJobs(filters);
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Vagas abertas</h1>
        <p className="muted">
          Filtre por cargo, região e modalidade para achar oportunidades no seu
          nível.
        </p>
      </header>

      <form className="filters" onSubmit={handleSubmit}>
        <label>
          Busca
          <input
            placeholder="Cargo, empresa ou tecnologia"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </label>
        <label>
          Local
          <input
            placeholder="Cidade ou região"
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </label>
        <label>
          Modalidade
          <select
            value={filters.work_model}
            onChange={(e) => handleChange('work_model', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="remote">Remoto</option>
            <option value="hybrid">Híbrido</option>
            <option value="onsite">Presencial</option>
          </select>
        </label>
        <button className="btn btn--primary" type="submit">
          Filtrar
        </button>
      </form>

      <Alert>{error}</Alert>

      {loading ? (
        <p className="muted">Carregando vagas…</p>
      ) : jobs.length === 0 ? (
        <p className="empty-state">Nenhuma vaga encontrada com esses filtros.</p>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
