import React, { useState } from 'react';
import { Database, ShieldCheck, Wrench, Eye, ArrowRight, Lock } from 'lucide-react';
import { UnellezLogo, SigartLogo } from './logos';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading, error }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username.trim(), password.trim());
    }
  };

  const handleQuickSelect = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    onLogin(u, p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002244] via-[#003366] to-[#0c3c60] flex flex-col justify-center items-center p-4">
      {/* Container Card */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Card Header with UNELLEZ and SIGART official logos */}
        <div className="pt-7 pb-6 px-8 text-center bg-gradient-to-b from-[#003366] to-[#002850] text-white relative">
          <div className="flex items-center justify-center gap-3.5 mb-3">
            {/* UNELLEZ Emblem */}
            <div className="w-16 h-16 rounded-full bg-white p-0.5 shadow-lg border-2 border-[#E65100] flex items-center justify-center shrink-0">
              <UnellezLogo size={58} />
            </div>

            <div className="h-10 w-px bg-white/25"></div>

            {/* SIGART Official Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg border-2 border-[#003366] flex items-center justify-center shrink-0">
              <SigartLogo size={54} showText={false} />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-wider text-[#F4B41A]">SIGART</h1>
          <p className="text-xs text-slate-100 font-semibold mt-1">
            Sistema de Gestión de Activos y Reportes Tecnológicos
          </p>
          <div className="text-[11px] text-amber-200/90 font-medium mt-1">
            UNELLEZ · “La Universidad que Siembra”
          </div>
          {/* Subtle gold line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F4B41A]"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#003366] mb-1.5">
              Usuario Institucional:
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario..."
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] text-slate-900 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#003366] mb-1.5">
              Contraseña de Acceso:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña..."
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366] text-slate-900 font-medium transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Verificando sesión...' : 'Ingresar al Sistema'}</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </button>

          {/* Institutional note on role policy */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-950 space-y-1">
            <div className="font-bold text-[#003366] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#003366]" />
              <span>Seguridad Institucional: Roles Inmutables</span>
            </div>
            <p className="text-[10.5px] leading-tight text-slate-600">
              Los roles no son intercambiables por los usuarios. Únicamente el Administrador puede dar de alta
              cuentas y asignar los roles correspondientes.
            </p>
          </div>

          {/* Quick Test Accounts Switcher */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Ingreso rápido con cuentas de prueba:</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSelect('admin', 'admin123')}
                className="w-full flex items-center justify-between p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">admin</span>
                  <span className="text-[10px] text-slate-400 font-mono">/ admin123</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Administrador (Control Total)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('tecnico_sistemas', 'tecnico123')}
                className="w-full flex items-center justify-between p-2 text-left bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#003366]" />
                  <span className="font-bold text-slate-800">tecnico_sistemas</span>
                  <span className="text-[10px] text-slate-400 font-mono">/ tecnico123</span>
                </div>
                <span className="text-[10px] font-bold text-[#003366] bg-sky-100 px-2 py-0.5 rounded-full">
                  Técnico / Operador
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('auditor_bienes', 'auditor123')}
                className="w-full flex items-center justify-between p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-slate-800">auditor_bienes</span>
                  <span className="text-[10px] text-slate-400 font-mono">/ auditor123</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                  Consultor (Solo Lectura)
                </span>
              </button>
            </div>
          </div>

          {/* Database status footer */}
          <div className="pt-1 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Almacenamiento Local: SQLite Activo (sigar_local.sqlite)</span>
          </div>
        </form>
      </div>
    </div>
  );
};
