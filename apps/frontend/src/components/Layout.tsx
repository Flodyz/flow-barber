import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Scissors, 
  Calendar, 
  UserCheck, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { usuario, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Agendamentos', href: '/agendamentos', icon: Calendar },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Serviços', href: '/servicos', icon: Scissors },
    { name: 'Barbeiros', href: '/barbeiros', icon: UserCheck },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-primary-900 border-r border-silver-700">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="ml-3">
                <img src="/flow-logo-white.png" alt="" />
              </div>
            </div>
          </div>

          {/* Menu de navegação */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-silver-600 text-white'
                      : 'text-silver-300 hover:bg-silver-800 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-white' : 'text-silver-400 group-hover:text-white'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200`}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Usuário e logout */}
          <div className="flex-shrink-0 px-2 pb-2 space-y-1">
            <div className="px-2 py-2 border-t border-silver-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-silver-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {usuario?.nome?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    {usuario?.nome}
                  </p>
                  <p className="text-xs text-silver-300 capitalize">
                    {usuario?.tipo}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-silver-300 hover:bg-red-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors duration-200"
            >
              <LogOut className="text-silver-300 group-hover:text-white mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-primary-900 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-900 border-r border-silver-700">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Conteúdo da sidebar mobile (mesmo da desktop) */}
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <div className="flex items-center">
                  <div className="bg-silver-600 p-2 rounded-lg">
                    <Scissors className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-semibold text-white">
                      Barbearia
                    </h1>
                    <p className="text-sm text-silver-300">Sistema</p>
                  </div>
                </div>
              </div>

              {/* Menu de navegação */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`${
                        isActive
                          ? 'bg-silver-600 text-white'
                          : 'text-silver-300 hover:bg-silver-800 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                    >
                      <Icon
                        className={`${
                          isActive ? 'text-white' : 'text-silver-400 group-hover:text-white'
                        } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200`}
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Usuário e logout */}
              <div className="flex-shrink-0 px-2 pb-2 space-y-1">
                <div className="px-2 py-2 border-t border-silver-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-silver-600 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {usuario?.nome?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white">
                        {usuario?.nome}
                      </p>
                      <p className="text-xs text-silver-300 capitalize">
                        {usuario?.tipo}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-silver-300 hover:bg-red-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors duration-200"
                >
                  <LogOut className="text-silver-400 group-hover:text-white mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header mobile */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-silver-300">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 border-r border-silver-300 text-silver-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-silver-500 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
              <h1 className="text-lg font-semibold text-primary-900">
                Sistema Barbearia
              </h1>
            </div>
          </div>
        </div>

        {/* Área do conteúdo */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}