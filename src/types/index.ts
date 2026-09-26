export type UserRole = 'admin' | 'operador' | 'consultor';

export interface User {
  id: number;
  username: string;
  nombre_completo: string;
  rol: UserRole;
  departamento: string;
  creado_en?: string;
  activo?: number;
}

export type TipoMantenimiento = 'No' | 'Sí (Preventivo)' | 'Sí (Correctivo)';
export type EstadoActivo = 'Operativo' | 'En Mantenimiento' | 'Dañado / En Revisión' | 'Desincorporado';

export interface Activo {
  id: number;
  nombre: string;
  categoria: string;
  asignado_a: string;
  ubicacion: string;
  estado: EstadoActivo;
  mantenimiento: TipoMantenimiento;
  fecha_mant: string;
  proximo_mant: string;
  desc_mant: string;
  creado_por?: string;
  actualizado_en?: string;
}

export interface Baja {
  id: number;
  activo_id: number;
  nombre: string;
  asignado_a: string;
  categoria: string;
  mantenimiento: string;
  fecha_ultimo_mant: string;
  desc_mant: string;
  motivo_baja: string;
  responsable_baja: string;
  autorizado_por: string;
  fecha_baja: string;
}

export interface DashboardStats {
  totalActivos: number;
  operativos: number;
  enMantenimiento: number;
  preventivos: number;
  correctivos: number;
  totalBajas: number;
  totalUsuarios: number;
}
