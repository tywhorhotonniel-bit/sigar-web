import { User, Activo, Baja, DashboardStats, UserRole } from '../types';

const TOKEN_KEY = 'sigar_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || `Error en la solicitud (${response.status})`);
    }

    return data as T;
  },

  // Auth
  async login(username: string, password: string): Promise<{ ok: boolean; token: string; user: User }> {
    const res = await this.request<{ ok: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  },

  // Activos
  async getActivos(): Promise<Activo[]> {
    return this.request<Activo[]>('/api/activos');
  },

  async createActivo(activo: Partial<Activo>): Promise<{ ok: boolean; message: string }> {
    return this.request('/api/activos', {
      method: 'POST',
      body: JSON.stringify(activo),
    });
  },

  async updateActivo(id: number, activo: Partial<Activo>): Promise<{ ok: boolean; message: string }> {
    return this.request(`/api/activos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activo),
    });
  },

  async darDeBaja(id: number, motivo: string, responsable_baja?: string): Promise<{ ok: boolean; message: string; baja: Baja }> {
    return this.request(`/api/activos/${id}/baja`, {
      method: 'POST',
      body: JSON.stringify({ motivo, responsable_baja }),
    });
  },

  async deleteActivo(id: number): Promise<{ ok: boolean; message: string }> {
    return this.request(`/api/activos/${id}`, {
      method: 'DELETE',
    });
  },

  // Bajas
  async getBajas(): Promise<Baja[]> {
    return this.request<Baja[]>('/api/bajas');
  },

  // Departamentos
  async getDepartamentos(): Promise<string[]> {
    return this.request<string[]>('/api/departamentos');
  },

  async createDepartamento(nombre: string): Promise<{ ok: boolean; message: string }> {
    return this.request('/api/departamentos', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
  },

  // Dashboard Stats
  async getStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/stats');
  },

  // Usuarios y Roles (Exclusivo Administrador)
  async getUsuarios(): Promise<User[]> {
    return this.request<User[]>('/api/usuarios');
  },

  async createUsuario(user: {
    username: string;
    password: string;
    nombre_completo: string;
    rol: UserRole;
    departamento?: string;
  }): Promise<{ ok: boolean; message: string }> {
    return this.request('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async updateUsuarioRol(userId: number, rol: UserRole): Promise<{ ok: boolean; message: string }> {
    return this.request(`/api/usuarios/${userId}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ rol }),
    });
  },

  async updateUsuario(userId: number, data: Partial<User> & { password?: string }): Promise<{ ok: boolean; message: string }> {
    return this.request(`/api/usuarios/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUsuario(userId: number): Promise<{ ok: boolean; message: string }> {
    return this.request(`/api/usuarios/${userId}`, {
      method: 'DELETE',
    });
  },
};
