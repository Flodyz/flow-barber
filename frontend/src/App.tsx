import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Servicos } from './pages/Servicos';
import { Agendamentos } from './pages/Agendamentos';
import { Barbeiros } from './pages/Barbeiros';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-primary-900">
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Servicos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Agendamentos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/barbeiros"
            element={
              <ProtectedRoute>
                <Layout>
                  <Barbeiros />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirecionar raiz para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rota 404 - redirecionar para dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;