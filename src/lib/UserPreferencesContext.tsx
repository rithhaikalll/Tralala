import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { translations, type Language } from "./translations";

// Defaults
const DEFAULT_PRIMARY = "#7A0019";
const DARK_BG = "#121212";
const LIGHT_BG = "#FFFFFF";
const DEFAULT_DASHBOARD_ORDER = ['upcoming', 'recommended', 'tracking', 'news'];
const DEFAULT_NAV_ORDER = ['home', 'discussion', 'book', 'activity', 'profile'];

interface UserPreferences {
  theme_mode: 0 | 1;
  theme_color: string;
  language_code: Language;
  dashboard_order: string[];
  nav_order: string[];
}

interface ThemeObject {
  primary: string;
  background: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  theme: ThemeObject;
  t: (key: string) => string;
  updateTheme: (mode: 0 | 1, color?: string) => Promise<void>;
  updateLanguage: (lang: Language) => Promise<void>;
  updateInterface: (type: 'dashboard' | 'nav', order: string[]) => Promise<void>;
  resetInterface: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme_mode: 0,
    theme_color: DEFAULT_PRIMARY,
    language_code: "en",
    dashboard_order: DEFAULT_DASHBOARD_ORDER,
    nav_order: DEFAULT_NAV_ORDER,
  });

  useEffect(() => {
    const loadPrefs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("theme_mode, theme_color, language_code, dashboard_order, nav_order")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setPreferences({
            theme_mode: data.theme_mode ?? 0,
            theme_color: data.theme_color ?? DEFAULT_PRIMARY,
            language_code: (data.language_code as Language) ?? "en",
            dashboard_order: data.dashboard_order ?? DEFAULT_DASHBOARD_ORDER,
            nav_order: data.nav_order ?? DEFAULT_NAV_ORDER,
          });
        }
      }
    };
    loadPrefs();
  }, []);

  // Update CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const isDark = preferences.theme_mode === 1;
    root.style.setProperty("--primary-color", preferences.theme_color);
    root.style.setProperty("--bg-primary", isDark ? DARK_BG : "#FFFFFF");
    root.style.setProperty("--bg-secondary", isDark ? "#1E1E1E" : "#F7F7F6");
    root.style.setProperty("--text-primary", isDark ? "#FFFFFF" : "#1A1A1A");
    root.style.setProperty("--text-secondary", isDark ? "#A0A0A0" : "#6A6A6A");
    root.style.setProperty("--border-color", isDark ? "#333333" : "#E5E5E5");
  }, [preferences]);

  const theme: ThemeObject = {
    primary: preferences.theme_color,
    background: preferences.theme_mode === 1 ? DARK_BG : LIGHT_BG,
    cardBg: preferences.theme_mode === 1 ? "#1E1E1E" : "#FFFFFF",
    text: preferences.theme_mode === 1 ? "#FFFFFF" : "#1A1A1A",
    textSecondary: preferences.theme_mode === 1 ? "#A0A0A0" : "#6A6A6A",
    border: preferences.theme_mode === 1 ? "#333333" : "#E5E5E5",
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[preferences.language_code][key] || translations['en'][key] || key;
  };

  // Actions
  const updateTheme = async (mode: 0 | 1, color?: string) => {
    const newPrefs = { ...preferences, theme_mode: mode, theme_color: color || preferences.theme_color };
    setPreferences(newPrefs);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ theme_mode: mode, theme_color: color || preferences.theme_color }).eq("id", user.id);
  };

  const updateLanguage = async (lang: Language) => {
    const newPrefs = { ...preferences, language_code: lang };
    setPreferences(newPrefs);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ language_code: lang }).eq("id", user.id);
  };

  const updateInterface = async (type: 'dashboard' | 'nav', order: string[]) => {
    const newPrefs = { 
        ...preferences, 
        [type === 'dashboard' ? 'dashboard_order' : 'nav_order']: order 
    };
    setPreferences(newPrefs);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const updateData = type === 'dashboard' ? { dashboard_order: order } : { nav_order: order };
        await supabase.from("profiles").update(updateData).eq("id", user.id);
    }
  };

  const resetInterface = async () => {
    const newPrefs = { 
        ...preferences, 
        dashboard_order: DEFAULT_DASHBOARD_ORDER,
        nav_order: DEFAULT_NAV_ORDER
    };
    setPreferences(newPrefs);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from("profiles").update({ 
            dashboard_order: DEFAULT_DASHBOARD_ORDER, 
            nav_order: DEFAULT_NAV_ORDER 
        }).eq("id", user.id);
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, theme, t, updateTheme, updateLanguage, updateInterface, resetInterface }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  return context;
};