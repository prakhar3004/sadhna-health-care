// Sadhna Health Care — Dashboard visibility config (dual-mode).
// Stores which dashboard widgets are visible, at role scope (defaults) and
// user scope (per-user overrides). Admin writes; everyone reads.
import { supabase } from '@/src/lib/supabase';
import { isDemoMode } from '@/src/lib/config';

export type ConfigScope = 'role' | 'user';

export interface DashboardRule {
  scope: ConfigScope;
  scope_id: string; // role name, or user uuid (as text)
  widget_key: string;
  is_visible: boolean;
}

// In-memory store used in demo mode (no backend).
let demoRules: DashboardRule[] = [];

export const DashboardConfigService = {
  async fetchRules(): Promise<DashboardRule[]> {
    if (isDemoMode()) return demoRules.map((r) => ({ ...r }));

    const { data, error } = await supabase
      .from('dashboard_config')
      .select('scope, scope_id, widget_key, is_visible');
    if (error) throw error;
    return (data || []) as DashboardRule[];
  },

  async setRule(scope: ConfigScope, scopeId: string, widgetKey: string, isVisible: boolean): Promise<void> {
    if (isDemoMode()) {
      const idx = demoRules.findIndex(
        (r) => r.scope === scope && r.scope_id === scopeId && r.widget_key === widgetKey
      );
      if (idx >= 0) demoRules[idx].is_visible = isVisible;
      else demoRules.push({ scope, scope_id: scopeId, widget_key: widgetKey, is_visible: isVisible });
      return;
    }

    const { error } = await supabase
      .from('dashboard_config')
      .upsert(
        { scope, scope_id: scopeId, widget_key: widgetKey, is_visible: isVisible, updated_at: new Date().toISOString() },
        { onConflict: 'scope,scope_id,widget_key' }
      );
    if (error) throw error;
  },
};

/**
 * Resolve a widget's effective visibility: a per-user override wins over the
 * role default, which wins over the built-in default (visible).
 */
export const resolveVisibility = (
  rules: DashboardRule[],
  userId: string | undefined,
  role: string | undefined,
  widgetKey: string
): boolean => {
  if (userId) {
    const userRule = rules.find(
      (r) => r.scope === 'user' && r.scope_id === userId && r.widget_key === widgetKey
    );
    if (userRule) return userRule.is_visible;
  }
  if (role) {
    const roleRule = rules.find(
      (r) => r.scope === 'role' && r.scope_id === role && r.widget_key === widgetKey
    );
    if (roleRule) return roleRule.is_visible;
  }
  return true; // default: visible
};
