import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">DS</span>
          <span className="brand__text">DevStart Jobs</span>
        </Link>

        <nav className="nav" aria-label="Principal">
          <NavLink to="/vagas">Vagas</NavLink>
          {isAuthenticated && user?.role === 'dev' && (
            <>
              <NavLink to="/preferencias">Preferências</NavLink>
              <NavLink to="/minhas-candidaturas">Candidaturas</NavLink>
            </>
          )}
          {isAuthenticated && user?.role === 'recruiter' && (
            <NavLink to="/recrutador/vagas">Minhas vagas</NavLink>
          )}
        </nav>

        <div className="site-header__actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.name?.split(' ')[0]}</span>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn--ghost" to="/login">
                Entrar
              </Link>
              <Link className="btn btn--primary" to="/register">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
