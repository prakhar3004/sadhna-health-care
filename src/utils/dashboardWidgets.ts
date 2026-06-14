// Sadhna Health Care — Dashboard widget catalog.
// The admin control panel toggles these keys per role (and per user). Each
// dashboard gates its sections with `useWidgetVisibility(key)`.
import { UserRole } from '@/src/utils/constants';

export interface WidgetDef {
  key: string;
  label: string;
}

export const DASHBOARD_WIDGETS: Partial<Record<UserRole, WidgetDef[]>> = {
  patient: [
    { key: 'welcome_banner', label: 'Welcome & Streak Banner' },
    { key: 'care_reminders', label: 'Care Reminders Strip' },
    { key: 'life_goal_quest', label: 'Life Goal Quest Card' },
    { key: 'daily_wins', label: 'Daily Wins Checklist' },
    { key: 'vitals_sos', label: 'Vitals Log & SOS' },
    { key: 'feedback_notes', label: 'Doctor/Caregiver Feedback' },
    { key: 'life_goals', label: 'My Life Goals' },
  ],
  doctor: [
    { key: 'welcome_availability', label: 'Welcome & Availability' },
    { key: 'analytics_grid', label: 'Analytics & Progress' },
    { key: 'vitals_alerts', label: 'Critical Vitals Alerts' },
    { key: 'appointments_queue', label: 'Appointments Queue' },
    { key: 'seva_verification', label: 'Seva Verification Panel' },
    { key: 'clinical_shortcuts', label: 'Clinical Shortcuts' },
  ],
  caregiver: [
    { key: 'welcome_banner', label: 'Welcome Banner' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'care_checklist', label: 'Care Checklist' },
    { key: 'shortcuts', label: 'Shortcuts' },
  ],
};

export const ROLES_WITH_DASHBOARDS: UserRole[] = ['patient', 'doctor', 'caregiver'];
