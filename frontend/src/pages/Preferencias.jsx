import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { loadPreferences, savePreferences } from '../utils/preferences';

export default function Preferencias() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = loadPreferences();
  const [form, setForm] = useState({
    preferred_role: initial.preferred_role || user?.preferred_role || '',
    location: initial.location || '',
    work_model: initial.work_model || '',
  });
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    savePreferences(form);
    setSaved(true);
  }

  function goToJobs() {
    savePreferences(form);
    const params = new URLSearchParams();
    if (form.preferred_role) params.set('search', form.preferred_role);
    if (form.location) params.set('location', form.location);
    if (form.work_model) params.set('work_model', form.work_model);
    navigate(`/vagas?${params.toString()}`);
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Preferências de vaga</h1>
        <p className="muted">
          Defina o que você busca. Usamos isso para pré-preencher a busca de
          vagas (salvo neste navegador).
        </p>
      </header>

      {saved && <Alert type="success">Preferências salvas.</Alert>}

      <form className="form panel" onSubmit={handleSubmit}>
        <label>
          Cargo / área de interesse
          <input
            placeholder="Ex.: Node, Frontend Jr, Estágio"
            value={form.preferred_role}
            onChange={(e) => update('preferred_role', e.target.value)}
          />
        </label>
        <label>
          Região
          <input
            placeholder="Ex.: São Paulo, Remoto"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </label>
        <label>
          Modalidade
          <select
            value={form.work_model}
            onChange={(e) => update('work_model', e.target.value)}
          >
            <option value="">Qualquer</option>
            <option value="remote">Remoto</option>
            <option value="hybrid">Híbrido</option>
            <option value="onsite">Presencial</option>
          </select>
        </label>
        <div className="form-actions">
          <button className="btn btn--primary" type="submit">
            Salvar preferências
          </button>
          <button className="btn btn--ghost" type="button" onClick={goToJobs}>
            Buscar com essas preferências
          </button>
          <Link className="btn btn--ghost" to="/vagas">
            Ir para vagas
          </Link>
        </div>
      </form>
    </section>
  );
}
