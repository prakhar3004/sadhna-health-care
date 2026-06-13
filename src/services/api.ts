// Sadhna Health Care — API Services Layer
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces mapping database schemas
export interface VitalsLogRecord {
  sugar: number;
  bp: number;
  heartRate: number;
  logDate: string;
}

export interface LifeGoalStepRecord {
  id: number;
  title: string;
  desc: string;
  completed: boolean;
  milestones: string[];
}

export interface LifeGoalRecord {
  id: string;
  title: string;
  desc: string;
  steps: LifeGoalStepRecord[];
}

export interface CareAlertRecord {
  id: string;
  type: 'medicine' | 'test' | 'appointment';
  title: string;
  desc: string;
  date: string;
  details: string;
  ctaText: string;
  completed?: boolean;
}

export interface HistoryItemRecord {
  id: string;
  type: 'prescription' | 'vitals' | 'report';
  title: string;
  date: string;
  details: string;
  fileName?: string;
  hospital?: string;
}

export interface SosContactRecord {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface EmergencyRequestRecord {
  id: string;
  patientName: string;
  hospital: string;
  reason: string;
  requiredAmount: number;
  raisedAmount: number;
  status: 'verified' | 'pending' | 'rejected';
  partnerNGO: string;
  documentName?: string;
  date: string;
}

export interface SevaPoolRecord {
  amount: number;
  contributors: number;
}

export const ApiService = {
  // ─── Vitals Log Operations ──────────────────────────────────
  async saveVitalsLog(patientId: string, record: VitalsLogRecord): Promise<void> {
    if (isDemoMode()) {
      try {
        await AsyncStorage.setItem(
          'user_vitals_logged',
          JSON.stringify({ sugar: record.sugar, bp: record.bp, heartRate: record.heartRate })
        );
      } catch (e) {
        console.error('Local AsyncStorage save vitals error:', e);
      }
      return;
    }

    try {
      const { error } = await supabase.from('vitals_logs').insert({
        patient_id: patientId,
        sugar: record.sugar,
        bp: record.bp,
        heart_rate: record.heartRate,
        log_date: record.logDate,
      });
      if (error) throw error;
    } catch (err) {
      console.error('Supabase saveVitalsLog error:', err);
      throw err;
    }
  },

  async fetchLatestVitals(patientId: string): Promise<VitalsLogRecord | null> {
    if (isDemoMode()) {
      try {
        const stored = await AsyncStorage.getItem('user_vitals_logged');
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            sugar: parsed.sugar || 120,
            bp: parsed.bp || 115,
            heartRate: parsed.heartRate || 72,
            logDate: '',
          };
        }
      } catch (e) {}
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('vitals_logs')
        .select('sugar, bp, heart_rate, log_date')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        sugar: data.sugar,
        bp: data.bp,
        heartRate: data.heart_rate,
        logDate: data.log_date,
      };
    } catch (err) {
      console.error('Supabase fetchLatestVitals error:', err);
      return null;
    }
  },

  // ─── Life Goals Operations ──────────────────────────────────
  async fetchLifeGoals(patientId: string, fallbackDefaults: LifeGoalRecord[]): Promise<LifeGoalRecord[]> {
    if (isDemoMode()) {
      try {
        const stored = await AsyncStorage.getItem('user_life_goals');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return fallbackDefaults;
    }

    try {
      const { data, error } = await supabase
        .from('life_goals')
        .select('id, title, description, steps')
        .eq('patient_id', patientId);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((g) => ({
          id: g.id,
          title: g.title,
          desc: g.description || '',
          steps: g.steps as LifeGoalStepRecord[],
        }));
      }
      return fallbackDefaults;
    } catch (err) {
      console.error('Supabase fetchLifeGoals error:', err);
      return fallbackDefaults;
    }
  },

  async saveLifeGoals(patientId: string, goals: LifeGoalRecord[]): Promise<void> {
    if (isDemoMode()) {
      try {
        await AsyncStorage.setItem('user_life_goals', JSON.stringify(goals));
      } catch (e) {}
      return;
    }

    try {
      // Perform UPSERT operations for each goal
      for (const goal of goals) {
        const { error } = await supabase.from('life_goals').upsert({
          id: goal.id,
          patient_id: patientId,
          title: goal.title,
          description: goal.desc,
          steps: goal.steps,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Supabase saveLifeGoals error:', err);
      throw err;
    }
  },

  async deleteLifeGoal(goalId: string): Promise<void> {
    if (isDemoMode()) {
      return; // Handled locally by filtering array and saving back
    }

    try {
      const { error } = await supabase.from('life_goals').delete().eq('id', goalId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase deleteLifeGoal error:', err);
      throw err;
    }
  },

  // ─── Care Alerts Operations ─────────────────────────────────
  async fetchCareAlerts(patientId: string, fallbackDefaults: CareAlertRecord[]): Promise<CareAlertRecord[]> {
    if (isDemoMode()) {
      try {
        const stored = await AsyncStorage.getItem('user_care_alerts');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return fallbackDefaults;
    }

    try {
      const { data, error } = await supabase
        .from('care_alerts')
        .select('id, type, title, "desc", details, cta_text, completed, date')
        .eq('patient_id', patientId);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((a) => ({
          id: a.id,
          type: a.type as any,
          title: a.title,
          desc: a.desc,
          details: a.details,
          ctaText: a.cta_text,
          completed: a.completed,
          date: a.date,
        }));
      }
      return fallbackDefaults;
    } catch (err) {
      console.error('Supabase fetchCareAlerts error:', err);
      return fallbackDefaults;
    }
  },

  async saveCareAlerts(patientId: string, alerts: CareAlertRecord[]): Promise<void> {
    if (isDemoMode()) {
      try {
        await AsyncStorage.setItem('user_care_alerts', JSON.stringify(alerts));
      } catch (e) {}
      return;
    }

    try {
      for (const alert of alerts) {
        const { error } = await supabase.from('care_alerts').upsert({
          id: alert.id,
          patient_id: patientId,
          type: alert.type,
          title: alert.title,
          desc: alert.desc,
          details: alert.details,
          cta_text: alert.ctaText,
          completed: alert.completed || false,
          date: alert.date,
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Supabase saveCareAlerts error:', err);
      throw err;
    }
  },

  // ─── Treatment & Lab Report History ─────────────────────────
  async fetchTreatmentHistory(patientId: string, fallbackDefaults: HistoryItemRecord[]): Promise<HistoryItemRecord[]> {
    if (isDemoMode()) {
      try {
        const stored = await AsyncStorage.getItem('user_treatment_history');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return fallbackDefaults;
    }

    try {
      const { data, error } = await supabase
        .from('treatment_history')
        .select('id, type, title, details, file_name, hospital, date')
        .eq('patient_id', patientId);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((h) => ({
          id: h.id,
          type: h.type as any,
          title: h.title,
          details: h.details,
          fileName: h.file_name || undefined,
          hospital: h.hospital || undefined,
          date: h.date,
        }));
      }
      return fallbackDefaults;
    } catch (err) {
      console.error('Supabase fetchTreatmentHistory error:', err);
      return fallbackDefaults;
    }
  },

  async saveTreatmentHistory(patientId: string, history: HistoryItemRecord[]): Promise<void> {
    if (isDemoMode()) {
      try {
        await AsyncStorage.setItem('user_treatment_history', JSON.stringify(history));
      } catch (e) {}
      return;
    }

    try {
      for (const item of history) {
        const { error } = await supabase.from('treatment_history').upsert({
          id: item.id,
          patient_id: patientId,
          type: item.type,
          title: item.title,
          details: item.details,
          file_name: item.fileName || null,
          hospital: item.hospital || null,
          date: item.date,
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Supabase saveTreatmentHistory error:', err);
      throw err;
    }
  },

  // ─── SOS Emergency Contacts ─────────────────────────────────
  async fetchSosContacts(patientId: string, fallbackDefaults: SosContactRecord[]): Promise<SosContactRecord[]> {
    if (isDemoMode()) {
      try {
        const stored = await AsyncStorage.getItem('user_sos_contacts');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return fallbackDefaults;
    }

    try {
      const { data, error } = await supabase
        .from('sos_contacts')
        .select('id, name, relation, phone')
        .eq('patient_id', patientId);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          name: c.name,
          relation: c.relation,
          phone: c.phone,
        }));
      }
      return fallbackDefaults;
    } catch (err) {
      console.error('Supabase fetchSosContacts error:', err);
      return fallbackDefaults;
    }
  },

  async saveSosContacts(patientId: string, contacts: SosContactRecord[]): Promise<void> {
    if (isDemoMode()) {
      try {
        await AsyncStorage.setItem('user_sos_contacts', JSON.stringify(contacts));
      } catch (e) {}
      return;
    }

    try {
      for (const contact of contacts) {
        const { error } = await supabase.from('sos_contacts').upsert({
          id: contact.id,
          patient_id: patientId,
          name: contact.name,
          relation: contact.relation,
          phone: contact.phone,
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Supabase saveSosContacts error:', err);
      throw err;
    }
  },

  async deleteSosContact(contactId: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    try {
      const { error } = await supabase.from('sos_contacts').delete().eq('id', contactId);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase deleteSosContact error:', err);
      throw err;
    }
  },

  // ─── Seva Ecosystem Pool Operations ─────────────────────────
  async fetchSevaPool(): Promise<SevaPoolRecord> {
    const defaultPool = { amount: 485200, contributors: 1240 };
    if (isDemoMode()) {
      try {
        const amt = await AsyncStorage.getItem('user_seva_pool_amount');
        const contrib = await AsyncStorage.getItem('user_seva_pool_contributors');
        return {
          amount: amt ? parseInt(amt) : defaultPool.amount,
          contributors: contrib ? parseInt(contrib) : defaultPool.contributors,
        };
      } catch (e) {}
      return defaultPool;
    }

    try {
      const { data, error } = await supabase
        .from('seva_pool')
        .select('amount, contributors')
        .eq('id', 'main_pool')
        .maybeSingle();

      if (error) throw error;
      return data ? { amount: data.amount, contributors: data.contributors } : defaultPool;
    } catch (err) {
      console.error('Supabase fetchSevaPool error:', err);
      return defaultPool;
    }
  },

  // Note: the pool is mutated only through donateToPool / donateToRequest
  // (atomic SECURITY DEFINER RPCs). There is intentionally no client-side
  // "set the pool to an arbitrary value" method.

  // ─── Emergency Medical Funding Requests ──────────────────────
  async fetchEmergencyRequests(fallbackDefaults: EmergencyRequestRecord[]): Promise<EmergencyRequestRecord[]> {
    if (isDemoMode()) {
      try {
        const stored = await AsyncStorage.getItem('user_seva_emergency_requests');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return fallbackDefaults;
    }

    try {
      const { data, error } = await supabase
        .from('emergency_requests')
        .select('id, patient_name, hospital, reason, required_amount, raised_amount, status, partner_ngo, document_name, date');

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          patientName: r.patient_name,
          hospital: r.hospital,
          reason: r.reason,
          requiredAmount: r.required_amount,
          raisedAmount: r.raised_amount,
          status: r.status as any,
          partnerNGO: r.partner_ngo,
          documentName: r.document_name || undefined,
          date: r.date,
        }));
      }
      return fallbackDefaults;
    } catch (err) {
      console.error('Supabase fetchEmergencyRequests error:', err);
      return fallbackDefaults;
    }
  },

  // ─── Donations (atomic, server-authoritative) ────────────────
  // Money mutations never trust client-computed totals. In live mode they go
  // through SECURITY DEFINER Postgres functions that increment atomically and
  // return the authoritative new values; direct table UPDATEs are blocked by RLS.

  /** Contribute to the general Seva pool. Returns the updated pool. */
  async donateToPool(amount: number): Promise<SevaPoolRecord> {
    if (amount <= 0) throw new Error('Donation amount must be positive');

    if (isDemoMode()) {
      const pool = await ApiService.fetchSevaPool();
      const updated = { amount: pool.amount + amount, contributors: pool.contributors + 1 };
      try {
        await AsyncStorage.setItem('user_seva_pool_amount', updated.amount.toString());
        await AsyncStorage.setItem('user_seva_pool_contributors', updated.contributors.toString());
      } catch (e) {}
      return updated;
    }

    const { data, error } = await supabase.rpc('donate_to_pool', { p_amount: amount });
    if (error) throw error;
    return { amount: data.amount, contributors: data.contributors };
  },

  /**
   * Contribute to a specific emergency request. Returns the updated request list
   * (with the request's new raised amount) and the updated pool contributor count.
   */
  async donateToRequest(
    requestId: string,
    amount: number,
    currentRequests: EmergencyRequestRecord[]
  ): Promise<{ requests: EmergencyRequestRecord[]; pool: SevaPoolRecord }> {
    if (amount <= 0) throw new Error('Donation amount must be positive');

    if (isDemoMode()) {
      const requests = currentRequests.map((r) =>
        r.id === requestId
          ? { ...r, raisedAmount: Math.min(r.requiredAmount, r.raisedAmount + amount) }
          : r
      );
      try {
        await AsyncStorage.setItem('user_seva_emergency_requests', JSON.stringify(requests));
      } catch (e) {}
      const pool = await ApiService.fetchSevaPool();
      const newPool = { amount: pool.amount, contributors: pool.contributors + 1 };
      try {
        await AsyncStorage.setItem('user_seva_pool_contributors', newPool.contributors.toString());
      } catch (e) {}
      return { requests, pool: newPool };
    }

    const { data, error } = await supabase.rpc('donate_to_request', {
      p_request_id: requestId,
      p_amount: amount,
    });
    if (error) throw error;

    const requests = currentRequests.map((r) =>
      r.id === requestId ? { ...r, raisedAmount: data.raised_amount } : r
    );
    return {
      requests,
      pool: { amount: data.pool_amount, contributors: data.pool_contributors },
    };
  },

  /**
   * Create a single new emergency request. In live mode this inserts only the
   * one new row (it never re-writes other patients' requests); in demo mode it
   * persists the caller's full list to AsyncStorage.
   */
  async addEmergencyRequest(
    patientId: string,
    request: EmergencyRequestRecord,
    fullList: EmergencyRequestRecord[]
  ): Promise<void> {
    if (isDemoMode()) {
      try {
        await AsyncStorage.setItem('user_seva_emergency_requests', JSON.stringify(fullList));
      } catch (e) {}
      return;
    }

    const { error } = await supabase.from('emergency_requests').insert({
      id: request.id,
      patient_id: patientId,
      patient_name: request.patientName,
      hospital: request.hospital,
      reason: request.reason,
      required_amount: request.requiredAmount,
      raised_amount: request.raisedAmount,
      status: request.status,
      partner_ngo: request.partnerNGO,
      document_name: request.documentName || null,
      date: request.date,
    });
    if (error) throw error;
  },

  /**
   * Verify or reject a patient emergency medical funding request (doctor-scoped action).
   */
  async verifyEmergencyRequest(requestId: string, status: 'verified' | 'rejected'): Promise<void> {
    if (isDemoMode()) {
      try {
        const stored = await AsyncStorage.getItem('user_seva_emergency_requests');
        if (stored) {
          const list = JSON.parse(stored) as EmergencyRequestRecord[];
          const updated = list.map((r) => (r.id === requestId ? { ...r, status } : r));
          await AsyncStorage.setItem('user_seva_emergency_requests', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Local AsyncStorage verify request error:', e);
      }
      return;
    }

    const { error } = await supabase
      .from('emergency_requests')
      .update({ status })
      .eq('id', requestId);
    if (error) throw error;
  },
};
