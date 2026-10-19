import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>DevStart Jobs — oportunidades de tech para quem está começando.</p>
      </footer>
    </div>
  );
}
