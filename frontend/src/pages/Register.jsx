import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { formatApiError } from '../utils/errors';
import { savePreferences } from '../utils/preferences';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'dev',
    preferred_role: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.role === 'dev' && form.preferred_role.trim()) {
        payload.preferred_role = form.preferred_role.trim();
      }

      const user = await register(payload);

      if (user.role === 'dev') {
        savePreferences({
          preferred_role: form.preferred_role,
          location: '',
          work_model: '',
        });
        navigate('/preferencias', { replace: true });
      } else {
        navigate('/recrutador/vagas', { replace: true });
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card--wide">
        <h1>Criar conta</h1>
        <p className="muted">Cadastre-se como candidato ou recrutador.</p>
        <Alert>{error}</Alert>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </label>
          <label>
            Telefone (opcional)
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </label>
          <fieldset className="role-fieldset">
            <legend>Tipo de conta</legend>
            <label className="radio-row">
              <input
                type="radio"
                name="role"
                checked={form.role === 'dev'}
                onChange={() => update('role', 'dev')}
              />
              Candidato (dev)
            </label>
            <label className="radio-row">
              <input
                type="radio"
                name="role"
                checked={form.role === 'recruiter'}
                onChange={() => update('role', 'recruiter')}
              />
              Recrutador
            </label>
          </fieldset>
          {form.role === 'dev' && (
            <label>
              Cargo de interesse (opcional)
              <input
                placeholder="Ex.: Backend Jr, Frontend Jr"
                value={form.preferred_role}
                onChange={(e) => update('preferred_role', e.target.value)}
              />
            </label>
          )}
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Cadastrando…' : 'Criar conta'}
          </button>
        </form>
        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}
