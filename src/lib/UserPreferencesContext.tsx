import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";
import { translations, type Language } from "./translations";

const DEFAULT_PRIMARY = "#7A0019";
const DEFAULT_DASHBOARD_ORDER = ['upcoming', 'recommended', 'tracking', 'news'];
const DEFAULT_NAV_ORDER = ['home', 'discussion', 'book', 'activity', 'profile'];

interface UserPreferences {
  theme_mode: 0 | 1 | 2;
  theme_color: string;
  language_code: Language;
  dashboard_order: string[];
  nav_order: string[];
}

const INITIAL_PREFERENCES: UserPreferences = {
  theme_mode: 0,
  theme_color: DEFAULT_PRIMARY,
  language_code: "en",
  dashboard_order: DEFAULT_DASHBOARD_ORDER,
  nav_order: DEFAULT_NAV_ORDER,
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  theme: any;
  t: (key: string) => string;
  updateTheme: (mode: 0 | 1 | 2, color?: string) => Promise<void>;
  updateLanguage: (lang: Language) => Promise<void>;
  updateInterface: (type: 'dashboard' | 'nav', order: string[]) => Promise<void>;
  updateNavOrder: (order: string[]) => Promise<void>;
  resetInterface: (type: 'dashboard' | 'nav') => Promise<void>;
  clearPreferences: () => void;
  isLoading: boolean;
  userRole: string | null;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMounted = useRef(true);

  const getTableName = (role: string | null) => role === 'staff' ? 'staff_preferences' : 'user_preferences';
  const getProfileTable = (role: string | null) => role === 'staff' ? 'staff_profiles' : 'profiles';

  // --- 1. VISUAL SYNC ---
  useEffect(() => {
    const isDark = preferences.theme_mode === 1;
    const bgColor = isDark ? "#121212" : "#FFFFFF";
    document.documentElement.style.setProperty("--primary-color", preferences.theme_color);
    document.body.style.backgroundColor = bgColor;
    document.body.style.overflow = "auto"; 
  }, [preferences.theme_mode, preferences.theme_color]);

  // --- 2. LOAD PREFERENCES ---
  const loadPrefs = useCallback(async (pId: string, role: string) => {
    const tableName = getTableName(role);
    try {
      const { data, error } = await supabase.from(tableName).select("*").eq("id", pId).maybeSingle();
      if (data && !error && isMounted.current) {
        setPreferences({
          theme_mode: data.theme_mode ?? 0,
          theme_color: data.theme_color ?? DEFAULT_PRIMARY,
          language_code: (data.language_code as Language) ?? "en",
          dashboard_order: data.dashboard_order ? (typeof data.dashboard_order === 'string' ? JSON.parse(data.dashboard_order) : data.dashboard_order) : DEFAULT_DASHBOARD_ORDER,
          nav_order: data.navbar_order ? (typeof data.navbar_order === 'string' ? JSON.parse(data.navbar_order) : data.navbar_order) : DEFAULT_NAV_ORDER,
        });
      }
    } catch (e) {
      console.error("[Context] Load Error:", e);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  // --- 3. PROFILE SYNC ---
  const fetchAndSyncUser = useCallback(async (authId: string, role: string) => {
    const profileTable = getProfileTable(role);
    const idColumn = role === 'staff' ? 'user_id' : 'id';

    try {
      let { data, error } = await supabase.from(profileTable).select('id').eq(idColumn, authId).maybeSingle();
      let validId = data?.id;

      if (!validId) {
        const { data: newData } = await supabase.from(profileTable)
          .insert({ [idColumn]: authId, full_name: 'UTM User', role })
          .select('id').single();
        validId = newData?.id;
      }

      if (validId && isMounted.current) {
        setActiveProfileId(validId);
        await loadPrefs(validId, role);
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.error("[Context] Sync Error:", e);
      setIsLoading(false);
    }
  }, [loadPrefs]);

  // --- 4. AUTH LIFECYCLE ---
  useEffect(() => {
    isMounted.current = true;

    const handleAuthChange = async (session: any) => {
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'student';
        setUserRole(role);
        await fetchAndSyncUser(session.user.id, role);
      } else {
        if (isMounted.current) {
          setPreferences(INITIAL_PREFERENCES);
          setActiveProfileId(null); // PEMBETULAN: Guna activeProfileId, bukan setUserId
          setUserRole(null);
          setIsLoading(false);
        }
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => handleAuthChange(session));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      handleAuthChange(session);
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [fetchAndSyncUser]);

  // --- 5. PERSISTENCE ---
  const saveToDatabase = async (currentPrefs: UserPreferences) => {
    if (!activeProfileId) return;
    const tableName = getTableName(userRole);
    
    const payload: any = { 
      id: activeProfileId, 
      last_updated: new Date().toISOString(),
      validation_status: true,
      theme_mode: currentPrefs.theme_mode,
      theme_color: currentPrefs.theme_color || DEFAULT_PRIMARY,
      language_code: currentPrefs.language_code
    };

    if (userRole !== 'staff') {
      payload.dashboard_order = currentPrefs.dashboard_order;
      payload.navbar_order = currentPrefs.nav_order;
    }

    try {
        await supabase.from(tableName).upsert(payload);
    } catch (err) {
        console.error("Save Error:", err);
    }
  };

  const updateTheme = async (mode: 0 | 1 | 2, color?: string) => {
    const newPrefs = { ...preferences, theme_mode: mode, theme_color: color || preferences.theme_color };
    setPreferences(newPrefs);
    await saveToDatabase(newPrefs);
  };

  const updateLanguage = async (lang: Language) => {
    const newPrefs = { ...preferences, language_code: lang };
    setPreferences(newPrefs);
    await saveToDatabase(newPrefs);
  };

  const updateInterface = async (type: 'dashboard' | 'nav', order: string[]) => {
    const stateKey = type === 'dashboard' ? 'dashboard_order' : 'nav_order';
    const newPrefs = { ...preferences, [stateKey]: order };
    setPreferences(newPrefs);
    if (userRole !== 'staff') await saveToDatabase(newPrefs);
  };

  const updateNavOrder = async (order: string[]) => await updateInterface('nav', order);
  
  const resetInterface = async (type: 'dashboard' | 'nav') => {
    const defaultOrder = type === 'dashboard' ? DEFAULT_DASHBOARD_ORDER : DEFAULT_NAV_ORDER;
    await updateInterface(type, defaultOrder);
  };

  const clearPreferences = () => {
      setPreferences(INITIAL_PREFERENCES);
      setActiveProfileId(null);
      setUserRole(null);
  };

  const t = (key: string) => translations[preferences.language_code]?.[key] || translations['en']?.[key] || key;

  const theme = {
    primary: preferences.theme_color,
    background: preferences.theme_mode === 1 ? "#121212" : "#FFFFFF",
    cardBg: preferences.theme_mode === 1 ? "#1E1E1E" : "#FFFFFF",
    text: preferences.theme_mode === 1 ? "#FFFFFF" : "#1A1A1A",
    textSecondary: preferences.theme_mode === 1 ? "#A0A0A0" : "#6A6A6A",
    border: preferences.theme_mode === 1 ? "#333333" : "#E5E5E5",
  };

  return (
    <UserPreferencesContext.Provider value={{ 
      preferences, theme, t, updateTheme, updateLanguage, updateInterface, updateNavOrder, resetInterface, clearPreferences, isLoading, userRole 
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) throw new Error("useUserPreferences error");
  return context;
};