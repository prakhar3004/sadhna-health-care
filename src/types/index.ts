// Sadhna Health Care — Type Definitions
import { UserRole, PostType, ReactionType } from '@/src/utils/constants';

// ─── User / Profile ──────────────────────────────────────────
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  specialization: string | null;
  license_number: string | null;
  experience_years: number | null;
  location: string | null;
  phone: string | null;
  is_verified: boolean;
  is_online: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
  is_profile_complete?: boolean;
  caregiver_type?: 'professional' | 'family' | null;
  relation_to_patient?: string | null;
  associated_patient_username?: string | null;
  patient_id_card_number?: string | null;
  chronic_condition?: string | null;
}

// ─── Post ─────────────────────────────────────────────────────
export interface Post {
  id: string;
  author_id: string;
  author: Profile;
  content: string;
  media_urls: string[];
  post_type: PostType;
  visibility: 'public' | 'doctors_only' | 'care_team' | 'private';
  likes_count: number;
  reactions: Record<ReactionType, number>;
  user_reaction?: ReactionType | null;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  reposted_post?: Post;
}

// ─── Comment ──────────────────────────────────────────────────
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: Profile;
  content: string;
  parent_id: string | null;
  created_at: string;
}

// ─── Conversation & Message ──────────────────────────────────
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  participants: Profile[];
  last_message: Message | null;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: Profile;
  content: string;
  media_url: string | null;
  message_type: 'text' | 'image' | 'file' | 'appointment_link';
  created_at: string;
}

// ─── Appointment ──────────────────────────────────────────────
export interface Appointment {
  id: string;
  doctor_id: string;
  doctor: Profile;
  patient_id: string;
  patient: Profile;
  caregiver_id: string | null;
  caregiver: Profile | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'in_person' | 'video_call' | 'phone';
  notes: string | null;
  created_at: string;
}

// ─── Health Record ────────────────────────────────────────────
export interface HealthRecord {
  id: string;
  patient_id: string;
  uploaded_by: string;
  title: string;
  record_type: 'lab_report' | 'prescription' | 'scan' | 'note' | 'other';
  file_url: string;
  description: string | null;
  record_date: string;
  shared_with: string[];
  created_at: string;
}

// ─── Group ────────────────────────────────────────────────────
export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  group_type: 'specialty' | 'condition' | 'support' | 'general';
  visibility: 'public' | 'private';
  created_by: string;
  member_count: number;
  is_member: boolean;
  created_at: string;
}

// ─── Notification ─────────────────────────────────────────────
export interface AppNotification {
  id: string;
  recipient_id: string;
  actor_id: string;
  actor: Profile;
  type: 'like' | 'comment' | 'follow' | 'message' | 'appointment' | 'group_invite';
  entity_type: string;
  entity_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
