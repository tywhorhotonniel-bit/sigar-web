/**
 * Calculates +3 calendar months and ensures the resulting date is a business day (Monday-Friday).
 * If it falls on Saturday -> jumps to Monday (+2 days)
 * If it falls on Sunday -> jumps to Monday (+1 day)
 */
export function calcularFechaHabil3Meses(fechaBaseStr: string): string {
  let d: number, m: number, y: number;

  // Handle DD/MM/YYYY or YYYY-MM-DD
  if (fechaBaseStr.includes('/')) {
    const parts = fechaBaseStr.split('/');
    if (parts.length !== 3) return 'Formato Inválido';
    d = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10) - 1; // 0-indexed in JS
    y = parseInt(parts[2], 10);
  } else if (fechaBaseStr.includes('-')) {
    const parts = fechaBaseStr.split('-');
    if (parts.length !== 3) return 'Formato Inválido';
    y = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10) - 1;
    d = parseInt(parts[2], 10);
  } else {
    return 'Formato Inválido';
  }

  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    return 'Formato Inválido';
  }

  // Add 3 months
  const targetMonthTotal = m + 3;
  const targetYear = y + Math.floor(targetMonthTotal / 12);
  const targetMonth = targetMonthTotal % 12;

  // Get max days in target month
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(d, daysInTargetMonth);

  const resultDate = new Date(targetYear, targetMonth, targetDay);

  // Check day of week: 0 = Sunday, 6 = Saturday
  const dayOfWeek = resultDate.getDay();
  if (dayOfWeek === 6) {
    // Saturday -> Add 2 days to Monday
    resultDate.setDate(resultDate.getDate() + 2);
  } else if (dayOfWeek === 0) {
    // Sunday -> Add 1 day to Monday
    resultDate.setDate(resultDate.getDate() + 1);
  }

  const resD = String(resultDate.getDate()).padStart(2, '0');
  const resM = String(resultDate.getMonth() + 1).padStart(2, '0');
  const resY = resultDate.getFullYear();

  return `${resD}/${resM}/${resY}`;
}

export function getTodayFormatted(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'Formato Inválido') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
}

export function getMaintenanceStatus(proximoMant: string): {
  status: 'hoy' | 'vencido' | 'proximo' | 'al_dia' | 'na';
  label: string;
  daysRemaining?: number;
  esAlarma: boolean;
} {
  const dt = parseDate(proximoMant);
  if (!dt) {
    return { status: 'na', label: 'Sin mantenimiento programado', esAlarma: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);

  const diffTime = dt.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      status: 'hoy',
      label: '¡Mantenimiento Pautado Para Hoy!',
      daysRemaining: 0,
      esAlarma: true
    };
  } else if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      status: 'vencido',
      label: `Vencido / Pendiente hace ${absDays} ${absDays === 1 ? 'día' : 'días'}`,
      daysRemaining: diffDays,
      esAlarma: true
    };
  } else if (diffDays <= 7) {
    return {
      status: 'proximo',
      label: `Próximo en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`,
      daysRemaining: diffDays,
      esAlarma: false
    };
  } else {
    return {
      status: 'al_dia',
      label: `Vigente (${diffDays} días)`,
      daysRemaining: diffDays,
      esAlarma: false
    };
  }
}

/**
 * Emits a synthesized institutional audio alert chime via Web Audio API.
 * Safe to call in modern browsers without needing external mp3 files.
 */
export function reproducirAlarmaAudio(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Beep 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(784, now); // G5 note
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Beep 2 (higher, alert chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.16); // C6 note
    gain2.gain.setValueAtTime(0, now + 0.16);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.20);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.6);
  } catch {
    // Audio context may be restricted before user gesture; gracefully ignore
  }
}

/**
 * Triggers a browser native notification if permitted
 */
export function notificarAlarmaNavegador(totalEquipos: number, nombres: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification('🚨 Alerta de Mantenimiento SIGART (UNELLEZ)', {
      body: `Hay ${totalEquipos} equipo(s) con mantenimiento hoy o pendiente: ${nombres}. Se repetirá diariamente hasta su registro.`,
      icon: '/favicon.ico',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

