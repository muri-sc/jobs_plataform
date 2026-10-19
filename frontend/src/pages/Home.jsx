import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const primaryCta =
    isAuthenticated && user?.role === 'recruiter'
      ? { to: '/recrutador/vagas', label: 'Gerenciar vagas' }
      : isAuthenticated
        ? { to: '/vagas', label: 'Buscar vagas' }
        : { to: '/register', label: 'Começar agora' };

  return (
    <section className="home-hero">
      <div className="home-hero__content">
        <p className="home-hero__eyebrow">Plataforma de carreira em tech</p>
        <h1 className="home-hero__brand">DevStart Jobs</h1>
        <p className="home-hero__lead">
          Encontre vagas júnior, estágio e primeiros passos na tecnologia — com
          filtros que respeitam o seu momento de carreira.
        </p>
        <div className="home-hero__actions">
          <Link className="btn btn--primary btn--lg" to={primaryCta.to}>
            {primaryCta.label}
          </Link>
          {!isAuthenticated && (
            <Link className="btn btn--ghost btn--lg" to="/vagas">
              Explorar vagas
            </Link>
          )}
        </div>
      </div>
      <div className="home-hero__visual" aria-hidden="true">
        <div className="hero-panel">
          <span className="hero-panel__label">Foco em iniciantes</span>
          <strong>Backend Jr · Frontend Jr · Estágio</strong>
          <span>Remoto · Híbrido · Presencial</span>
        </div>
      </div>
    </section>
  );
}
