import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getUnreadCount } from '../api/conversations';
import { useAuth } from '../context/AuthContext';

const UNREAD_POLL_MS = 30000;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  // Atualiza ao trocar de página e a cada 30s
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return undefined;
    }
    async function load() {
      try {
        const data = await getUnreadCount();
        setUnread(data.unread);
      } catch {
        // contador é secundário: ignora falhas
      }
    }
    load();
    const timer = setInterval(load, UNREAD_POLL_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, location.pathname]);

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
          {isAuthenticated && (
            <NavLink to="/mensagens">
              Mensagens
              {unread > 0 && (
                <span className="badge" aria-label={`${unread} não lidas`}>
                  {unread}
                </span>
              )}
            </NavLink>
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
