// Sadhna Health Care — Appointments Service (dual-mode)
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';
import { Appointment, Profile } from '@/src/types';
import { mockAppointments, mockProfiles } from '@/src/data/mockData';

let demoAppointments: Appointment[] | null = null;
const getDemoAppointments = (): Appointment[] => {
  if (!demoAppointments) demoAppointments = mockAppointments.map((a) => ({ ...a }));
  return demoAppointments;
};

const mapAppointment = (row: any): Appointment => ({
  id: row.id,
  doctor_id: row.doctor_id,
  doctor: row.doctor as Profile,
  patient_id: row.patient_id,
  patient: row.patient as Profile,
  caregiver_id: row.caregiver_id,
  caregiver: (row.caregiver as Profile) || null,
  scheduled_at: row.scheduled_at,
  duration_minutes: row.duration_minutes,
  status: row.status,
  type: row.type,
  notes: row.notes,
  created_at: row.created_at,
});

export interface CreateAppointmentInput {
  doctor_id: string;
  patient_id: string;
  caregiver_id?: string | null;
  scheduled_at: string;
  duration_minutes?: number;
  type?: Appointment['type'];
  notes?: string | null;
}

export const AppointmentsService = {
  /** All appointments where the user is the doctor, patient, or caregiver. */
  async fetchAppointments(currentUserId: string): Promise<Appointment[]> {
    if (isDemoMode()) {
      return getDemoAppointments()
        .filter((a) => a.doctor_id === currentUserId || a.patient_id === currentUserId || a.caregiver_id === currentUserId)
        .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(
        '*, doctor:profiles!appointments_doctor_id_fkey(*), patient:profiles!appointments_patient_id_fkey(*), caregiver:profiles!appointments_caregiver_id_fkey(*)'
      )
      .or(`doctor_id.eq.${currentUserId},patient_id.eq.${currentUserId},caregiver_id.eq.${currentUserId}`)
      .order('scheduled_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapAppointment);
  },

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    if (isDemoMode()) {
      // Demo: resolve the related profiles so the UI can render the card safely
      // (the appointments screen reads appt.doctor / appt.patient directly).
      const findProfile = (id: string | null | undefined) =>
        (id ? mockProfiles.find((p) => p.id === id) : undefined) ?? null;
      const stub: Appointment = {
        id: `a_${Date.now()}`,
        doctor_id: input.doctor_id,
        doctor: findProfile(input.doctor_id) as Profile,
        patient_id: input.patient_id,
        patient: findProfile(input.patient_id) as Profile,
        caregiver_id: input.caregiver_id ?? null,
        caregiver: findProfile(input.caregiver_id),
        scheduled_at: input.scheduled_at,
        duration_minutes: input.duration_minutes ?? 30,
        status: 'pending',
        type: input.type ?? 'in_person',
        notes: input.notes ?? null,
        created_at: new Date().toISOString(),
      };
      getDemoAppointments().push(stub);
      return stub;
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: input.doctor_id,
        patient_id: input.patient_id,
        caregiver_id: input.caregiver_id ?? null,
        scheduled_at: input.scheduled_at,
        duration_minutes: input.duration_minutes ?? 30,
        type: input.type ?? 'in_person',
        notes: input.notes ?? null,
      })
      .select(
        '*, doctor:profiles!appointments_doctor_id_fkey(*), patient:profiles!appointments_patient_id_fkey(*), caregiver:profiles!appointments_caregiver_id_fkey(*)'
      )
      .single();
    if (error) throw error;
    return mapAppointment(data);
  },

  async updateStatus(appointmentId: string, status: Appointment['status']): Promise<void> {
    if (isDemoMode()) {
      const appt = getDemoAppointments().find((a) => a.id === appointmentId);
      if (appt) appt.status = status;
      return;
    }
    const { error } = await supabase.from('appointments').update({ status }).eq('id', appointmentId);
    if (error) throw error;
  },
};
