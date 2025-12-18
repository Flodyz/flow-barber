import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { LoginFormData } from '../types';

export function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  // Redirecionar se já está logado
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.senha);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
          </div>
          <img
            className="mx-auto"
            src="/flowbarber.png"
            alt="Logo Barbearia"
          />
          <p className="mt-2 text-silver-600">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-silver-600" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    type="email"
                    className={`input-field pl-10 w-full ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-primary-900 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-silver-600" />
                  </div>
                  <input
                    {...register('senha', {
                      required: 'Senha é obrigatória',
                      minLength: {
                        value: 6,
                        message: 'Senha deve ter pelo menos 6 caracteres'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pl-10 pr-10 w-full ${
                      errors.senha ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-silver-600 hover:text-primary-900" />
                    ) : (
                      <Eye className="h-5 w-5 text-silver-600 hover:text-primary-900" />
                    )}
                  </button>
                </div>
                {errors.senha && (
                  <p className="mt-1 text-sm text-red-500">{errors.senha.message}</p>
                )}
              </div>

              {/* Botão de submissão */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>

            {/* Informações de acesso */}
            <div className="mt-8 pt-6 border-t border-silver-300">
              <div className="text-center">
                <h3 className="text-sm font-medium text-primary-900 mb-3">
                  Acesso de demonstração:
                </h3>
                <div className="space-y-2 text-xs text-silver-700">
                  <div>
                    <strong className="text-primary-900">Admin:</strong> admin@barbearia.com | admin123
                  </div>
                  <div>
                    <strong className="text-primary-900">Barbeiro:</strong> joao@barbearia.com | barbeiro123
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}