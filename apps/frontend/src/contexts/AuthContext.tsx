import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { AuthContextType, Usuario, LoginResponse } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se já existe token armazenado
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');

    if (storedToken && storedUsuario) {
      try {
        const parsedUsuario = JSON.parse(storedUsuario);
        setToken(storedToken);
        setUsuario(parsedUsuario);
        
        // Verificar se token ainda é válido
        verificarToken(storedToken);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const verificarToken = async (tokenToVerify: string) => {
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      
      if (response.data.success) {
        setUsuario(response.data.data.usuario);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token inválido:', error);
      logout();
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        senha,
      });

      if (response.data.success) {
        const { usuario: usuarioLogado, token: tokenRecebido } = response.data.data;
        
        setUsuario(usuarioLogado);
        setToken(tokenRecebido);
        
        // Salvar no localStorage
        localStorage.setItem('token', tokenRecebido);
        localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
        
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      const mensagem = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(mensagem);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    toast.success('Logout realizado com sucesso!');
  };

  const value: AuthContextType = {
    usuario,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!usuario && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}