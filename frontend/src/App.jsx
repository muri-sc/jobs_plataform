import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import MinhasCandidaturas from './pages/MinhasCandidaturas';
import Preferencias from './pages/Preferencias';
import Register from './pages/Register';
import VagaDetalhe from './pages/VagaDetalhe';
import Vagas from './pages/Vagas';
import RecruiterCandidatos from './pages/recrutador/RecruiterCandidatos';
import RecruiterVagas from './pages/recrutador/RecruiterVagas';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="vagas" element={<Vagas />} />
        <Route path="vagas/:id" element={<VagaDetalhe />} />

        <Route
          path="preferencias"
          element={
            <ProtectedRoute role="dev">
              <Preferencias />
            </ProtectedRoute>
          }
        />
        <Route
          path="minhas-candidaturas"
          element={
            <ProtectedRoute role="dev">
              <MinhasCandidaturas />
            </ProtectedRoute>
          }
        />
        <Route
          path="recrutador/vagas"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterVagas />
            </ProtectedRoute>
          }
        />
        <Route
          path="recrutador/vagas/:id/candidatos"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterCandidatos />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
