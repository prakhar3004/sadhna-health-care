// Sadhna Health Care — Admin Control Panel
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useTheme';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { AdminService, AdminStats } from '@/src/services/adminService';
import { DashboardConfigService, DashboardRule, resolveVisibility } from '@/src/services/dashboardConfigService';
import { DASHBOARD_WIDGETS, ROLES_WITH_DASHBOARDS } from '@/src/utils/dashboardWidgets';
import { Profile, Post } from '@/src/types';
import { UserRole, RoleConfig, FontSize, Spacing, Radius } from '@/src/utils/constants';
import { formatRelativeTime } from '@/src/utils/helpers';

type AdminTab = 'overview' | 'users' | 'widgets' | 'moderation' | 'broadcast';

const TABS: { key: AdminTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'overview', label: 'Overview', icon: 'speedometer-outline' },
  { key: 'users', label: 'Users', icon: 'people-outline' },
  { key: 'widgets', label: 'Dashboards', icon: 'grid-outline' },
  { key: 'moderation', label: 'Moderation', icon: 'shield-outline' },
  { key: 'broadcast', label: 'Broadcast', icon: 'megaphone-outline' },
];

export function AdminDashboard() {
  const colors = useThemeColors();
  const [tab, setTab] = useState<AdminTab>('overview');

  // Shared data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rules, setRules] = useState<DashboardRule[]>([]);

  const loadRules = useCallback(async () => {
    try {
      setRules(await DashboardConfigService.fetchRules());
    } catch (e) {
      console.warn('Failed to load dashboard rules:', e);
    }
  }, []);

  useEffect(() => {
    AdminService.getStats().then(setStats).catch((e) => console.warn('stats:', e));
    loadRules();
  }, [loadRules]);

  return (
    <View style={styles.flex}>
      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.tabBar}
      >
        {TABS.map((tDef) => {
          const active = tab === tDef.key;
          return (
            <TouchableOpacity
              key={tDef.key}
              style={[
                styles.tabChip,
                { backgroundColor: active ? colors.primary : colors.surfaceSecondary, borderColor: active ? colors.primary : colors.border },
              ]}
              onPress={() => setTab(tDef.key)}
            >
              <Ionicons name={tDef.icon} size={15} color={active ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.tabChipText, { color: active ? '#FFF' : colors.textSecondary }]}>{tDef.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {tab === 'overview' && <OverviewTab stats={stats} colors={colors} />}
      {tab === 'users' && <UsersTab colors={colors} rules={rules} onRulesChanged={loadRules} />}
      {tab === 'widgets' && <WidgetsTab colors={colors} rules={rules} onRulesChanged={loadRules} />}
      {tab === 'moderation' && <ModerationTab colors={colors} />}
      {tab === 'broadcast' && <BroadcastTab colors={colors} />}
    </View>
  );
}

// ─── Overview ─────────────────────────────────────────────────────
function OverviewTab({ stats, colors }: { stats: AdminStats | null; colors: any }) {
  if (!stats) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: 'people', color: '#0D9488' },
    { label: 'Doctors', value: stats.doctors, icon: 'medkit', color: '#6366F1' },
    { label: 'Caregivers', value: stats.caregivers, icon: 'heart', color: '#F59E0B' },
    { label: 'Patients', value: stats.patients, icon: 'person', color: '#10B981' },
    { label: 'Posts', value: stats.posts, icon: 'newspaper', color: '#3B82F6' },
    { label: 'Suspended', value: stats.suspended, icon: 'ban', color: '#DC2626' },
  ];
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.statGrid}>
        {cards.map((c) => (
          <View key={c.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={[styles.statIcon, { backgroundColor: c.color + '20' }]}>
              <Ionicons name={c.icon as any} size={20} color={c.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{c.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{c.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Users ────────────────────────────────────────────────────────
function UsersTab({ colors, rules, onRulesChanged }: { colors: any; rules: DashboardRule[]; onRulesChanged: () => void }) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await AdminService.listUsers(query, roleFilter));
    } catch (e) {
      console.warn('listUsers:', e);
    } finally {
      setLoading(false);
    }
  }, [query, roleFilter]);

  useEffect(() => {
    const h = setTimeout(load, 250);
    return () => clearTimeout(h);
  }, [load]);

  return (
    <View style={styles.flex}>
      <View style={styles.body}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'doctor', 'caregiver', 'patient', 'admin'] as const).map((r) => {
            const active = roleFilter === r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.surfaceSecondary, borderColor: active ? colors.primary : colors.border }]}
                onPress={() => setRoleFilter(r)}
              >
                <Text style={[styles.filterChipText, { color: active ? '#FFF' : colors.textSecondary }]}>{r === 'all' ? 'All' : RoleConfig[r].label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: 120 }}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}
        {users.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[styles.userRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={() => setSelected(u)}
            activeOpacity={0.7}
          >
            <Avatar uri={u.avatar_url} name={u.full_name} size={44} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{u.full_name}</Text>
                {u.is_verified && <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />}
                {(u as any).is_suspended && <Ionicons name="ban" size={14} color="#DC2626" />}
              </View>
              <Text style={[styles.userSub, { color: colors.textTertiary }]}>@{u.username}</Text>
            </View>
            <RoleBadge role={u.role} size="sm" />
          </TouchableOpacity>
        ))}
        {!loading && users.length === 0 && (
          <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: 30 }}>No users found</Text>
        )}
      </ScrollView>

      <UserActionModal
        user={selected}
        colors={colors}
        rules={rules}
        onClose={() => setSelected(null)}
        onChanged={() => { load(); onRulesChanged(); }}
      />
    </View>
  );
}

function UserActionModal({
  user, colors, rules, onClose, onChanged,
}: { user: Profile | null; colors: any; rules: DashboardRule[]; onClose: () => void; onChanged: () => void }) {
  if (!user) return null;
  const isSuspended = !!(user as any).is_suspended;
  const widgets = DASHBOARD_WIDGETS[user.role] || [];

  const act = async (fn: () => Promise<void>, successMsg?: string) => {
    try {
      await fn();
      onChanged();
      if (successMsg) Alert.alert('Done', successMsg);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Action failed');
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete user?', `This removes ${user.full_name}'s profile and content.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => act(async () => { await AdminService.deleteUser(user.id); onClose(); }) },
    ]);

  const userOverride = (key: string) =>
    resolveVisibility(rules.filter((r) => r.scope === 'user' && r.scope_id === user.id), user.id, undefined, key);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
              <Avatar uri={user.avatar_url} name={user.full_name} size={64} />
              <Text style={[styles.modalTitle, { color: colors.text, marginTop: 8 }]}>{user.full_name}</Text>
              <Text style={{ color: colors.textTertiary }}>@{user.username}</Text>
            </View>

            {/* Quick actions */}
            <ActionRow icon="checkmark-circle" label={user.is_verified ? 'Remove verification' : 'Verify user'} color="#3B82F6" colors={colors}
              onPress={() => act(() => AdminService.setVerified(user.id, !user.is_verified))} />
            <ActionRow icon={isSuspended ? 'play-circle' : 'ban'} label={isSuspended ? 'Unsuspend user' : 'Suspend user'} color="#F59E0B" colors={colors}
              onPress={() => act(() => AdminService.setSuspended(user.id, !isSuspended))} />
            <ActionRow icon="trash" label="Delete user" color="#DC2626" colors={colors} onPress={confirmDelete} />

            {/* Role change */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Change role</Text>
            <View style={styles.roleRow}>
              {(['doctor', 'caregiver', 'patient', 'admin'] as UserRole[]).map((r) => {
                const active = user.role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.rolePill, { backgroundColor: active ? RoleConfig[r].color : colors.surfaceSecondary, borderColor: active ? RoleConfig[r].color : colors.border }]}
                    onPress={() => act(() => AdminService.setRole(user.id, r))}
                  >
                    <Text style={[styles.rolePillText, { color: active ? '#FFF' : colors.textSecondary }]}>{RoleConfig[r].label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Per-user dashboard overrides */}
            {widgets.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Dashboard widgets (this user)</Text>
                {widgets.map((w) => (
                  <View key={w.key} style={styles.toggleRow}>
                    <Text style={[styles.toggleLabel, { color: colors.text }]}>{w.label}</Text>
                    <Switch
                      value={userOverride(w.key)}
                      onValueChange={(v) => act(() => DashboardConfigService.setRule('user', user.id, w.key, v))}
                      trackColor={{ true: colors.primary }}
                    />
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]} onPress={onClose}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ActionRow({ icon, label, color, colors, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.actionRow, { borderColor: colors.borderLight }]} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── Widgets (role defaults) ──────────────────────────────────────
function WidgetsTab({ colors, rules, onRulesChanged }: { colors: any; rules: DashboardRule[]; onRulesChanged: () => void }) {
  const [role, setRole] = useState<UserRole>('patient');
  const widgets = DASHBOARD_WIDGETS[role] || [];

  const toggle = async (key: string, value: boolean) => {
    try {
      await DashboardConfigService.setRule('role', role, key, value);
      onRulesChanged();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Role defaults — every user of this role sees these. Per-user overrides live in the Users tab.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {ROLES_WITH_DASHBOARDS.map((r) => {
          const active = role === r;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, { backgroundColor: active ? RoleConfig[r].color : colors.surfaceSecondary, borderColor: active ? RoleConfig[r].color : colors.border }]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.filterChipText, { color: active ? '#FFF' : colors.textSecondary }]}>{RoleConfig[r].label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {widgets.map((w) => (
        <View key={w.key} style={[styles.toggleRow, { borderBottomColor: colors.divider, borderBottomWidth: 1 }]}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>{w.label}</Text>
          <Switch
            value={resolveVisibility(rules, undefined, role, w.key)}
            onValueChange={(v) => toggle(w.key, v)}
            trackColor={{ true: colors.primary }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Moderation ───────────────────────────────────────────────────
function ModerationTab({ colors }: { colors: any }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await AdminService.listRecentPosts(50));
    } catch (e) {
      console.warn('moderation:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = (post: Post) =>
    Alert.alert('Delete post?', 'This permanently removes the post.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AdminService.deletePost(post.id);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not delete');
          }
        },
      },
    ]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.base, paddingBottom: 120 }}>
      {posts.map((p) => (
        <View key={p.id} style={[styles.modPost, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Avatar uri={p.author?.avatar_url} name={p.author?.full_name || 'User'} size={32} />
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{p.author?.full_name || 'Unknown'}</Text>
            <Text style={{ color: colors.textTertiary, fontSize: FontSize.xs }}>{formatRelativeTime(p.created_at)}</Text>
          </View>
          <Text style={{ color: colors.textSecondary }} numberOfLines={3}>{p.content}</Text>
          <TouchableOpacity style={[styles.modDelete, { backgroundColor: '#DC262615' }]} onPress={() => remove(p)}>
            <Ionicons name="trash" size={15} color="#DC2626" />
            <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: FontSize.xs }}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
      {posts.length === 0 && <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: 30 }}>No posts</Text>}
    </ScrollView>
  );
}

// ─── Broadcast ────────────────────────────────────────────────────
function BroadcastTab({ colors }: { colors: any }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim()) { Alert.alert('Title required', 'Please enter a title.'); return; }
    setSending(true);
    try {
      await AdminService.broadcast(title.trim(), body.trim());
      Alert.alert('Sent ✅', 'Announcement delivered to all users.');
      setTitle(''); setBody('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={[styles.hint, { color: colors.textTertiary }]}>Send a notification to every user on the platform.</Text>
      <TextInput
        style={[styles.bcInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
        placeholder="Title" placeholderTextColor={colors.textTertiary} value={title} onChangeText={setTitle}
      />
      <TextInput
        style={[styles.bcInput, styles.bcBody, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
        placeholder="Message (optional)" placeholderTextColor={colors.textTertiary} value={body} onChangeText={setBody} multiline
      />
      <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: sending ? 0.6 : 1 }]} onPress={send} disabled={sending}>
        {sending ? <ActivityIndicator color="#FFF" /> : <><Ionicons name="megaphone" size={18} color="#FFF" /><Text style={styles.sendBtnText}>Send to everyone</Text></>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabBar: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.sm },
  tabChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tabChipText: { fontSize: FontSize.xs, fontWeight: '700' },
  body: { padding: Spacing.base },
  hint: { fontSize: FontSize.xs, marginBottom: Spacing.md },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: { width: '47%', borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.base, gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize['2xl'], fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: FontSize.base },
  filterRow: { gap: Spacing.sm, paddingVertical: Spacing.md },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: FontSize.xs, fontWeight: '600' },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm },
  userName: { fontSize: FontSize.base, fontWeight: '700', flexShrink: 1 },
  userSub: { fontSize: FontSize.xs, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.base, maxHeight: '85%' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '800' },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  rolePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  rolePillText: { fontSize: FontSize.xs, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  toggleLabel: { fontSize: FontSize.sm, fontWeight: '500', flex: 1 },
  closeBtn: { marginTop: Spacing.lg, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center' },
  modPost: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  modDelete: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.md, marginTop: Spacing.sm },
  bcInput: { borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: FontSize.base, marginBottom: Spacing.md },
  bcBody: { minHeight: 120, textAlignVertical: 'top' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.md, marginTop: Spacing.sm },
  sendBtnText: { color: '#FFF', fontWeight: '700', fontSize: FontSize.base },
});
