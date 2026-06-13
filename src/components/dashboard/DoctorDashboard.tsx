// Sadhna Health Care — Premium Industry-Grade Doctor Dashboard
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { AppointmentsService } from '@/src/services/appointmentsService';
import { ApiService, EmergencyRequestRecord, VitalsLogRecord } from '@/src/services/api';
import { Appointment, Profile } from '@/src/types';
import { Radius, FontSize, Spacing } from '@/src/utils/constants';
import { formatTime } from '@/src/utils/helpers';

interface VitalsAlert {
  patient: Profile;
  vitals: VitalsLogRecord;
  type: 'sugar' | 'bp' | 'heart_rate';
  value: string;
  desc: string;
  severity: 'high' | 'critical';
}

export function DoctorDashboard() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { language, t } = useLanguageStore();

  // Dashboard state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitalsAlerts, setVitalsAlerts] = useState<VitalsAlert[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequestRecord[]>([]);
  const [availability, setAvailability] = useState<'available' | 'consulting' | 'break' | 'offline'>('available');
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [selectedCase, setSelectedCase] = useState<EmergencyRequestRecord | null>(null);
  const [verifyingCase, setVerifyingCase] = useState(false);

  // Load all doctor panel data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch appointments
      const appts = await AppointmentsService.fetchAppointments(user.id);
      setAppointments(appts);

      // 2. Derive unique patients from appointments to check latest vitals
      const uniquePatients = new Map<string, Profile>();
      appts.forEach((a) => {
        if (a.patient) uniquePatients.set(a.patient_id, a.patient);
      });
      const patientsList = Array.from(uniquePatients.values());

      // 3. Scan latest vitals logs for abnormalities to trigger alerts
      const alerts: VitalsAlert[] = [];
      for (const patient of patientsList) {
        const vitals = await ApiService.fetchLatestVitals(patient.id);
        if (vitals) {
          // Check abnormal limits
          if (vitals.sugar > 180) {
            alerts.push({
              patient,
              vitals,
              type: 'sugar',
              value: `${vitals.sugar} mg/dL`,
              desc: vitals.sugar > 240 ? 'Critical Hyperglycemia' : 'High Blood Sugar',
              severity: vitals.sugar > 240 ? 'critical' : 'high',
            });
          }
          if (vitals.bp > 140) {
            alerts.push({
              patient,
              vitals,
              type: 'bp',
              value: `${vitals.bp} mmHg`,
              desc: vitals.bp > 160 ? 'Critical Hypertension' : 'High Blood Pressure',
              severity: vitals.bp > 160 ? 'critical' : 'high',
            });
          }
          if (vitals.heartRate > 100 || vitals.heartRate < 50) {
            alerts.push({
              patient,
              vitals,
              type: 'heart_rate',
              value: `${vitals.heartRate} bpm`,
              desc: vitals.heartRate > 110 ? 'Tachycardia Alert' : 'Bradycardia Alert',
              severity: 'high',
            });
          }
        }
      }
      setVitalsAlerts(alerts);

      // 4. Fetch Seva emergency funding requests awaiting review
      const defaultRequests: EmergencyRequestRecord[] = [
        {
          id: 'req1',
          patientName: 'Rahul Verma',
          hospital: 'Apollo Hospitals, Bangalore',
          reason: 'Emergency Diabetic Ketoacidosis (DKA) Treatment & ICU Care',
          requiredAmount: 150000,
          raisedAmount: 45000,
          status: 'pending',
          partnerNGO: 'Care Foundation India',
          documentName: 'medical_certificate.pdf',
          date: '2024-06-13',
        },
        {
          id: 'req2',
          patientName: 'Meera Joshi',
          hospital: 'Tata Memorial Hospital, Mumbai',
          reason: 'Chemotherapy Session 4 & Oncological Support',
          requiredAmount: 250000,
          raisedAmount: 180000,
          status: 'pending',
          partnerNGO: 'Cancer Relief Society',
          documentName: 'oncology_prescription.pdf',
          date: '2024-06-12',
        },
      ];
      const reqs = await ApiService.fetchEmergencyRequests(defaultRequests);
      setEmergencyRequests(reqs.filter((r) => r.status === 'pending'));
    } catch (e) {
      console.warn('Error fetching doctor dashboard details:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Appointment actions
  const handleCompleteAppointment = async (apptId: string) => {
    try {
      await AppointmentsService.updateStatus(apptId, 'completed');
      Alert.alert('Success', 'Appointment marked as completed');
      loadDashboardData();
    } catch (e) {
      Alert.alert('Error', 'Failed to complete appointment');
    }
  };

  const handleApproveAppointment = async (apptId: string) => {
    try {
      await AppointmentsService.updateStatus(apptId, 'confirmed');
      Alert.alert('Success', 'Appointment confirmed successfully');
      loadDashboardData();
    } catch (e) {
      Alert.alert('Error', 'Failed to approve appointment');
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    try {
      await AppointmentsService.updateStatus(apptId, 'cancelled');
      Alert.alert('Cancelled', 'Appointment has been cancelled');
      loadDashboardData();
    } catch (e) {
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  // Seva case verification actions
  const handleVerifyCase = async (status: 'verified' | 'rejected') => {
    if (!selectedCase) return;
    setVerifyingCase(true);
    try {
      await ApiService.verifyEmergencyRequest(selectedCase.id, status);
      Alert.alert(
        status === 'verified' ? 'Case Approved' : 'Case Rejected',
        `Patient emergency request has been successfully marked as ${status}.`
      );
      setSelectedCase(null);
      loadDashboardData();
    } catch (e) {
      Alert.alert('Error', 'Failed to update case verification status');
    } finally {
      setVerifyingCase(false);
    }
  };

  // Telehealth Consultation dialer
  const launchTelehealth = (patientName: string) => {
    Alert.alert(
      labels().video_alert_title,
      `${labels().video_alert_msg} (${patientName})`
    );
  };

  // Vitals alert notifier
  const triggerCaregiverAlert = (patientName: string, alertDesc: string) => {
    Alert.alert(
      'Alert Caregiver',
      `Sent urgent care alert notification regarding "${alertDesc}" to ${patientName}'s registered caregiver.`
    );
  };

  // Multilingual localization support
  const labels = () => {
    const maps: Record<string, Record<string, string>> = {
      en: {
        workspace_analytics: 'Workspace Analytics',
        active_patients: 'Active Patients',
        visits_today: 'Visits Today',
        open_queries: 'Open Queries',
        appt_queue: "Today's Clinical Queue",
        video_consult: 'Video Consultation',
        clinical_shortcuts: 'Clinical Shortcuts',
        doctor_tip: 'Doctor Tip',
        awareness_post: 'Awareness Post',
        video_alert_title: 'Video Consultation',
        video_alert_msg: 'Connecting to secure patient video call...',
        status_lbl: 'Status',
        status_available: 'Available',
        status_consulting: 'Consulting',
        status_break: 'On Break',
        status_offline: 'Offline',
        vitals_alerts: 'Vitals Alerts Monitor',
        no_alerts: 'No abnormal vitals logged by patients today.',
        seva_verification: 'Seva Verification Queue',
        no_cases: 'No pending co-funding requests.',
        active_queue: 'Active Queue',
        pending_requests: 'Pending Requests',
        completed_past: 'Completed',
        consult_goal: 'Goal Progress',
        verify_case: 'Review & Verify',
        review_modal_title: 'Seva Clinical Case Review',
        approve_for_funding: 'Approve & Release to Seva Pool',
        reject_case: 'Reject Case',
        case_details: 'Case Details',
        medical_files: 'Medical Certificates',
        reason_lbl: 'Reason',
        hospital_lbl: 'Hospital',
        required_funding: 'Required Funding',
        no_appts: 'No appointments in this category',
      },
      hi: {
        workspace_analytics: 'कार्यक्षेत्र विश्लेषण',
        active_patients: 'सक्रिय मरीज',
        visits_today: 'आज की मुलाक़ातें',
        open_queries: 'खुले प्रश्न',
        appt_queue: 'आज की क्लिनिकल कतार',
        video_consult: 'वीडियो परामर्श',
        clinical_shortcuts: 'क्लीनिकल शॉर्टकट',
        doctor_tip: 'डॉक्टर की सलाह',
        awareness_post: 'जागरूकता पोस्ट',
        video_alert_title: 'वीडियो परामर्श',
        video_alert_msg: 'मरीज के सुरक्षित वीडियो कॉल से जुड़ रहे हैं...',
        status_lbl: 'स्थिति',
        status_available: 'उपलब्ध',
        status_consulting: 'परामर्श में',
        status_break: 'अवकाश पर',
        status_offline: 'ऑफलाइन',
        vitals_alerts: 'वाइटल्स अलर्ट मॉनिटर',
        no_alerts: 'आज मरीजों द्वारा कोई असामान्य वाइटल्स दर्ज नहीं किए गए।',
        seva_verification: 'सेवा सत्यापन कतार',
        no_cases: 'कोई लंबित सह-वित्तपोषण अनुरोध नहीं।',
        active_queue: 'सक्रिय कतार',
        pending_requests: 'लंबित अनुरोध',
        completed_past: 'पूर्ण',
        consult_goal: 'लक्ष्य प्रगति',
        verify_case: 'समीक्षा और सत्यापित करें',
        review_modal_title: 'सेवा क्लिनिकल केस समीक्षा',
        approve_for_funding: 'स्वीकृत करें और सेवा पूल में भेजें',
        reject_case: 'केस खारिज करें',
        case_details: 'केस का विवरण',
        medical_files: 'चिकित्सा प्रमाण पत्र',
        reason_lbl: 'कारण',
        hospital_lbl: 'अस्पताल',
        required_funding: 'आवश्यक राशि',
        no_appts: 'इस श्रेणी में कोई अपॉइंटमेंट नहीं',
      },
      hinglish: {
        workspace_analytics: 'Workspace Analytics',
        active_patients: 'Active Patients',
        visits_today: 'Aaj ke Visits',
        open_queries: 'Open Queries',
        appt_queue: "Today's Clinical Queue",
        video_consult: 'Video Consultation',
        clinical_shortcuts: 'Clinical Shortcuts',
        doctor_tip: 'Doctor Tip',
        awareness_post: 'Awareness Post',
        video_alert_title: 'Video Consultation',
        video_alert_msg: 'Secure patient video call se connect ho rahe hain...',
        status_lbl: 'Status',
        status_available: 'Available',
        status_consulting: 'In Consult',
        status_break: 'On Break',
        status_offline: 'Offline',
        vitals_alerts: 'Vitals Alerts Monitor',
        no_alerts: 'Aaj kisi patient ne abnormal vitals log nahi kiye.',
        seva_verification: 'Seva Verification Queue',
        no_cases: 'Review ke liye koi request pending nahi hai.',
        active_queue: 'Active Queue',
        pending_requests: 'Pending Requests',
        completed_past: 'Completed',
        consult_goal: 'Goal Progress',
        verify_case: 'Review & Verify',
        review_modal_title: 'Seva Clinical Case Review',
        approve_for_funding: 'Approve & Seva Pool me dalo',
        reject_case: 'Reject Case',
        case_details: 'Case Details',
        medical_files: 'Medical Certificates',
        reason_lbl: 'Reason',
        hospital_lbl: 'Hospital',
        required_funding: 'Required Funding',
        no_appts: 'Is category me koi appointment nahi hai',
      },
    };

    // Fallback dictionary map for remaining languages
    const fallbackMap = maps[language] || maps['en'];
    const otherLangs = ['bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or'];

    if (otherLangs.includes(language)) {
      // Return regional translation or default English fallback
      return {
        ...maps['en'],
        status_lbl: language === 'bn' ? 'অবস্থা' : 'Status',
        vitals_alerts: language === 'bn' ? 'ভাইটাল অ্যালার্ট মনিটর' : 'Vitals Alerts Monitor',
        seva_verification: language === 'bn' ? 'সেবা যাচাইকরণ সারি' : 'Seva Verification Queue',
      };
    }
    return fallbackMap;
  };

  if (!user) return null;

  const dict = labels();

  // Derived metrics
  const myAppts = appointments.filter((a) => a.doctor_id === user.id);
  const visitsToday = myAppts.filter(
    (a) =>
      a.status === 'completed' &&
      new Date(a.scheduled_at).toDateString() === new Date().toDateString()
  ).length;
  
  // Filter queues
  const activeQueue = myAppts.filter(
    (a) =>
      (a.status === 'confirmed' || a.status === 'pending') &&
      new Date(a.scheduled_at).toDateString() === new Date().toDateString()
  );
  
  const pendingRequests = myAppts.filter((a) => a.status === 'pending');
  const completedQueue = myAppts.filter((a) => a.status === 'completed');

  const totalGoal = 8; // Daily clinical consultation goal
  const progressRatio = Math.min(visitsToday / totalGoal, 1);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Clinician Welcome & Availability Selector */}
      <Card style={[styles.welcomeCard, { backgroundColor: colors.surface }]}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeInfo}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {t('hello')}, {user.full_name.split(' ')[0]}! 🩺
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {user.specialization || 'Clinical Practitioner'} · Reg #{user.license_number || 'N/A'}
            </Text>
          </View>
          <View style={styles.avatarWrapper}>
            <Avatar uri={user.avatar_url} name={user.full_name} size={54} />
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    availability === 'available'
                      ? colors.success
                      : availability === 'consulting'
                      ? colors.warning
                      : availability === 'break'
                      ? colors.primary
                      : colors.textTertiary,
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Availability Pills */}
        <Text style={[styles.statusTitle, { color: colors.textSecondary }]}>{dict.status_lbl}</Text>
        <View style={styles.statusPillsRow}>
          {(['available', 'consulting', 'break', 'offline'] as const).map((status) => {
            const isSelected = availability === status;
            const statusLabel =
              status === 'available'
                ? dict.status_available
                : status === 'consulting'
                ? dict.status_consulting
                : status === 'break'
                ? dict.status_break
                : dict.status_offline;

            let pillColor = colors.textTertiary;
            let pillBg = colors.surfaceSecondary;

            if (isSelected) {
              if (status === 'available') {
                pillColor = colors.success;
                pillBg = colors.successFaded;
              } else if (status === 'consulting') {
                pillColor = colors.warning;
                pillBg = 'rgba(251, 146, 60, 0.08)';
              } else if (status === 'break') {
                pillColor = colors.primary;
                pillBg = colors.primaryFaded;
              } else {
                pillColor = colors.textSecondary;
                pillBg = colors.border;
              }
            }

            return (
              <TouchableOpacity
                key={status}
                onPress={() => setAvailability(status)}
                style={[
                  styles.statusPill,
                  { backgroundColor: pillBg, borderColor: isSelected ? pillColor : colors.border },
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.statusPillDot,
                    {
                      backgroundColor:
                        status === 'available'
                          ? colors.success
                          : status === 'consulting'
                          ? colors.warning
                          : status === 'break'
                          ? colors.primary
                          : colors.textTertiary,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusPillText,
                    { color: isSelected ? colors.text : colors.textSecondary },
                  ]}
                >
                  {statusLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Analytics & Progress Grid */}
      <View style={styles.metricsWrapper}>
        <Card style={styles.progressWidget}>
          <Text style={[styles.widgetTitle, { color: colors.text }]}>{dict.consult_goal}</Text>
          <View style={styles.progressRow}>
            {/* Health App Progress Ring Indicator */}
            <View style={[styles.progressRing, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
              <Text style={[styles.progressValue, { color: colors.primary }]}>
                {Math.round(progressRatio * 100)}%
              </Text>
            </View>
            <View style={styles.progressMeta}>
              <Text style={[styles.progressCount, { color: colors.text }]}>
                {visitsToday} / {totalGoal}
              </Text>
              <Text style={[styles.progressSubLabel, { color: colors.textSecondary }]}>
                Completed Consults
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.analyticsGrid}>
          <Card style={styles.gridCard}>
            <View style={[styles.gridIconBg, { backgroundColor: colors.secondaryFaded }]}>
              <Ionicons name="people" size={18} color={colors.secondary} />
            </View>
            <Text style={[styles.gridValue, { color: colors.text }]}>
              {new Set(myAppts.map((a) => a.patient_id)).size}
            </Text>
            <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
              {dict.active_patients}
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <View style={[styles.gridIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.gridValue, { color: colors.text }]}>
              {emergencyRequests.length}
            </Text>
            <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
              Pending Reviews
            </Text>
          </Card>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Critical Care Vitals Alert Panel */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{dict.vitals_alerts}</Text>
            {vitalsAlerts.length > 0 && (
              <View style={[styles.badgeContainer, { backgroundColor: colors.errorFaded }]}>
                <Text style={[styles.badgeText, { color: colors.error }]}>
                  {vitalsAlerts.length} Action Needed
                </Text>
              </View>
            )}
          </View>

          {vitalsAlerts.length === 0 ? (
            <Card style={styles.emptyAlertsCard}>
              <Ionicons name="heart-outline" size={24} color={colors.textTertiary} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyAlertText, { color: colors.textSecondary }]}>{dict.no_alerts}</Text>
            </Card>
          ) : (
            vitalsAlerts.map((alert, idx) => (
              <Card
                key={`${alert.patient.id}-${idx}`}
                style={[
                  styles.alertItemCard,
                  { borderColor: alert.severity === 'critical' ? colors.error : colors.warning },
                ]}
              >
                <View style={styles.alertContent}>
                  <Avatar uri={alert.patient.avatar_url} name={alert.patient.full_name} size={40} />
                  <View style={styles.alertPatientMeta}>
                    <View style={styles.alertHeaderRow}>
                      <Text style={[styles.alertPatientName, { color: colors.text }]}>
                        {alert.patient.full_name}
                      </Text>
                      <View
                        style={[
                          styles.alertSeverityTag,
                          {
                            backgroundColor:
                              alert.severity === 'critical' ? colors.errorFaded : 'rgba(245, 158, 11, 0.08)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.alertSeverityText,
                            { color: alert.severity === 'critical' ? colors.error : '#D97706' },
                          ]}
                        >
                          {alert.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.alertLabel, { color: colors.error }]}>
                      {alert.desc}: {alert.value}
                    </Text>
                  </View>
                </View>
                <View style={[styles.alertActionsRow, { borderTopColor: colors.borderLight }]}>
                  <TouchableOpacity
                    style={[styles.alertActionBtn, { borderRightColor: colors.borderLight }]}
                    onPress={() => triggerCaregiverAlert(alert.patient.full_name, alert.desc)}
                  >
                    <Ionicons name="notifications" size={16} color={colors.primary} />
                    <Text style={[styles.alertActionText, { color: colors.primary }]}>Alert Caregiver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.alertActionBtn}
                    onPress={() => router.push(`/chat/${alert.patient.id}` as any)}
                  >
                    <Ionicons name="chatbubble-ellipses" size={16} color={colors.textSecondary} />
                    <Text style={[styles.alertActionText, { color: colors.textSecondary }]}>Send Message</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          {/* Interactive Clinical Appointments Queue */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            {dict.appt_queue}
          </Text>

          {/* Queue Tab Buttons */}
          <View style={[styles.queueTabContainer, { backgroundColor: colors.surfaceSecondary }]}>
            {(['active', 'pending', 'completed'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const queueLabel =
                tab === 'active'
                  ? dict.active_queue
                  : tab === 'pending'
                  ? dict.pending_requests
                  : dict.completed_past;

              let count = 0;
              if (tab === 'active') count = activeQueue.length;
              else if (tab === 'pending') count = pendingRequests.length;
              else if (tab === 'completed') count = completedQueue.length;

              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.queueTabBtn,
                    isActive && { backgroundColor: colors.surface, borderRadius: Radius.sm },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.queueTabLabel,
                      { color: isActive ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {queueLabel}
                  </Text>
                  {count > 0 && (
                    <View
                      style={[
                        styles.queueTabCount,
                        { backgroundColor: isActive ? colors.primary : colors.textTertiary },
                      ]}
                    >
                      <Text style={styles.queueTabCountText}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Appointments Render */}
          <Card style={styles.apptQueueCard}>
            {(activeTab === 'active'
              ? activeQueue
              : activeTab === 'pending'
              ? pendingRequests
              : completedQueue
            ).length === 0 ? (
              <View style={styles.emptyQueue}>
                <Ionicons name="calendar-outline" size={28} color={colors.textTertiary} style={{ marginBottom: 6 }} />
                <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>{dict.no_appts}</Text>
              </View>
            ) : (
              (activeTab === 'active'
                ? activeQueue
                : activeTab === 'pending'
                ? pendingRequests
                : completedQueue
              ).map((appt) => (
                <View key={appt.id} style={[styles.apptRowItem, { borderBottomColor: colors.borderLight }]}>
                  <View style={styles.apptInfoWrapper}>
                    <Avatar uri={appt.patient?.avatar_url} name={appt.patient?.full_name || 'Patient'} size={40} />
                    <View style={styles.apptMeta}>
                      <Text style={[styles.patientName, { color: colors.text }]}>
                        {appt.patient?.full_name || 'Patient'}
                      </Text>
                      <Text style={[styles.apptTimeLabel, { color: colors.textSecondary }]}>
                        {formatTime(appt.scheduled_at)} ·{' '}
                        {appt.type === 'video_call'
                          ? dict.video_consult
                          : appt.type === 'phone'
                          ? 'Phone Consult'
                          : 'In Clinic'}
                      </Text>
                      {appt.notes && (
                        <Text style={[styles.apptNote, { color: colors.textTertiary }]} numberOfLines={1}>
                          "{appt.notes}"
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Actions depending on Tab */}
                  <View style={styles.apptActionBtns}>
                    {activeTab === 'active' && (
                      <>
                        {appt.type === 'video_call' && (
                          <TouchableOpacity
                            style={[styles.apptIconBtn, { backgroundColor: colors.primaryFaded }]}
                            onPress={() => launchTelehealth(appt.patient?.full_name || '')}
                          >
                            <Ionicons name="videocam" size={18} color={colors.primary} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.apptIconBtn, { backgroundColor: colors.surfaceSecondary }]}
                          onPress={() => router.push(`/chat/${appt.patient_id}` as any)}
                        >
                          <Ionicons name="chatbubbles" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.apptIconBtn, { backgroundColor: colors.successFaded }]}
                          onPress={() => handleCompleteAppointment(appt.id)}
                        >
                          <Ionicons name="checkmark" size={18} color={colors.success} />
                        </TouchableOpacity>
                      </>
                    )}

                    {activeTab === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={[styles.apptIconBtn, { backgroundColor: colors.successFaded }]}
                          onPress={() => handleApproveAppointment(appt.id)}
                        >
                          <Ionicons name="checkmark" size={18} color={colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.apptIconBtn, { backgroundColor: colors.errorFaded }]}
                          onPress={() => handleCancelAppointment(appt.id)}
                        >
                          <Ionicons name="close" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </>
                    )}

                    {activeTab === 'completed' && (
                      <View style={[styles.completedBadge, { backgroundColor: colors.successFaded }]}>
                        <Text style={[styles.completedBadgeText, { color: colors.success }]}>COMPLETED</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </Card>

          {/* Seva Co-Funding Emergency Verification Panel */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            {dict.seva_verification}
          </Text>

          {emergencyRequests.length === 0 ? (
            <Card style={styles.emptyAlertsCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.textTertiary} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyAlertText, { color: colors.textSecondary }]}>{dict.no_cases}</Text>
            </Card>
          ) : (
            emergencyRequests.map((req) => (
              <Card key={req.id} style={styles.sevaCaseCard}>
                <View style={styles.sevaCaseHeader}>
                  <View>
                    <Text style={[styles.sevaCasePatient, { color: colors.text }]}>{req.patientName}</Text>
                    <Text style={[styles.sevaCaseHospital, { color: colors.textSecondary }]}>
                      {req.hospital}
                    </Text>
                  </View>
                  <View style={[styles.sevaCaseStatusBadge, { backgroundColor: colors.primaryFaded }]}>
                    <Text style={[styles.sevaCaseStatusText, { color: colors.primary }]}>
                      {req.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.sevaCaseReason, { color: colors.textSecondary }]} numberOfLines={2}>
                  {dict.reason_lbl}: {req.reason}
                </Text>

                <View style={[styles.sevaCaseAmountRow, { borderTopColor: colors.borderLight }]}>
                  <View>
                    <Text style={[styles.amountLabel, { color: colors.textTertiary }]}>{dict.required_funding}</Text>
                    <Text style={[styles.amountValue, { color: colors.primary }]}>
                      ₹{req.requiredAmount.toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.verifyButton, { backgroundColor: colors.primary }]}
                    onPress={() => setSelectedCase(req)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.verifyButtonText}>{dict.verify_case}</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          {/* Clinical Shortcuts & Health Action Center */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            {dict.clinical_shortcuts}
          </Text>
          <View style={styles.shortcutsRow}>
            <TouchableOpacity
              style={[styles.shortcutBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => router.push({ pathname: '/post/create', params: { prefilledType: 'doctor_tip' } } as any)}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: colors.primaryFaded }]}>
                <Ionicons name="medkit" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.shortcutLabel, { color: colors.text }]}>{dict.doctor_tip}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => router.push({ pathname: '/post/create', params: { prefilledType: 'awareness' } } as any)}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: colors.secondaryFaded }]}>
                <Ionicons name="megaphone" size={22} color={colors.secondary} />
              </View>
              <Text style={[styles.shortcutLabel, { color: colors.text }]}>{dict.awareness_post}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Seva Verification Case Overlay Modal */}
      {selectedCase && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedCase}
          onRequestClose={() => setSelectedCase(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setSelectedCase(null)}
            />
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>{dict.review_modal_title}</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>
                  {dict.case_details}
                </Text>
                <Card style={[styles.detailsSectionCard, { backgroundColor: colors.surfaceSecondary }]}>
                  <View style={styles.metaLabelRow}>
                    <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>Patient Name</Text>
                    <Text style={[styles.metaVal, { color: colors.text }]}>{selectedCase.patientName}</Text>
                  </View>
                  <View style={styles.metaLabelRow}>
                    <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>{dict.hospital_lbl}</Text>
                    <Text style={[styles.metaVal, { color: colors.text }]}>{selectedCase.hospital}</Text>
                  </View>
                  <View style={styles.metaLabelRow}>
                    <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>{dict.reason_lbl}</Text>
                    <Text style={[styles.metaVal, { color: colors.text, flex: 1, textAlign: 'right' }]}>
                      {selectedCase.reason}
                    </Text>
                  </View>
                  <View style={styles.metaLabelRow}>
                    <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>{dict.required_funding}</Text>
                    <Text style={[styles.metaVal, { color: colors.primary, fontWeight: '800' }]}>
                      ₹{selectedCase.requiredAmount.toLocaleString()}
                    </Text>
                  </View>
                </Card>

                <Text style={[styles.modalSubheading, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                  {dict.medical_files}
                </Text>
                <View style={[styles.documentFileCard, { borderColor: colors.border }]}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={[styles.docName, { color: colors.text }]}>
                      {selectedCase.documentName || 'clinical_report_summary.pdf'}
                    </Text>
                    <Text style={[styles.docSize, { color: colors.textTertiary }]}>PDF · 1.4 MB</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.viewDocBtn, { backgroundColor: colors.primaryFaded }]}
                    onPress={() => Alert.alert('View Document', 'Opening secure PDF document reader...')}
                  >
                    <Text style={[styles.viewDocBtnText, { color: colors.primary }]}>View</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.modalActionsWrapper}>
                {verifyingCase ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionConfirmBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleVerifyCase('verified')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnText}>{dict.approve_for_funding}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionRejectBtn, { borderColor: colors.error }]}
                      onPress={() => handleVerifyCase('rejected')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.actionRejectBtnText, { color: colors.error }]}>
                        {dict.reject_case}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.base,
    paddingBottom: 120,
  },
  welcomeCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
    }),
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  avatarWrapper: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  statusPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  metricsWrapper: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressWidget: {
    flex: 1.2,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  widgetTitle: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  progressValue: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  progressMeta: {
    flex: 1,
  },
  progressCount: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  progressSubLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  analyticsGrid: {
    flex: 1,
    gap: Spacing.md,
  },
  gridCard: {
    flex: 1,
    padding: Spacing.md,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  gridIconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  centerLoader: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  badgeContainer: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyAlertsCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyAlertText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  alertItemCard: {
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertPatientMeta: {
    marginLeft: 10,
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertPatientName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  alertSeverityTag: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  alertSeverityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  alertLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  alertActionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  alertActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  alertActionText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  queueTabContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  queueTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  queueTabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  queueTabCount: {
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  queueTabCountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  apptQueueCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  emptyQueue: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  apptRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  apptInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  apptMeta: {
    marginLeft: 10,
    flex: 1,
  },
  patientName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  apptTimeLabel: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  apptNote: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  apptActionBtns: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  apptIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  completedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  sevaCaseCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sevaCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  sevaCasePatient: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  sevaCaseHospital: {
    fontSize: FontSize.xs,
  },
  sevaCaseStatusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  sevaCaseStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  sevaCaseReason: {
    fontSize: FontSize.xs,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  sevaCaseAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
    marginTop: 1,
  },
  verifyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  shortcutBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  shortcutIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 16 },
      web: { boxShadow: '0px -4px 16px rgba(0,0,0,0.1)' },
    }),
  },
  modalIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalScroll: {
    marginBottom: Spacing.md,
  },
  modalSubheading: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  detailsSectionCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metaLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    width: 100,
  },
  metaVal: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  documentFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  docName: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  docSize: {
    fontSize: 10,
    marginTop: 1,
  },
  viewDocBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewDocBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalActionsWrapper: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  actionRejectBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actionRejectBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
