import { Home, Globe, Book, Compass, User } from "lucide-react";
import { useUserPreferences } from "../lib/UserPreferencesContext";

export function BottomNav({ activeTab, onTabChange }: any) {
  const { theme, preferences, t } = useUserPreferences();

  const tabData: Record<string, { labelKey: string; icon: any }> = {
    home: { labelKey: "nav_home", icon: Home },
    // Updated Icon to Globe
    community: { labelKey: "Community", icon: Globe },
    book: { labelKey: "nav_book", icon: Book },
    activity: { labelKey: "nav_activity", icon: Compass },
    profile: { labelKey: "nav_profile", icon: User },
  };

  /**
   * 🔒 SAFETY:
   * - Maps old "discussion" → "community"
   * - Filters out invalid tabs to prevent crashes
   */
  const orderedTabs = preferences.nav_order
    .map((key: string) => {
      const normalizedKey = key === "discussion" ? "community" : key;
      return tabData[normalizedKey]
        ? { id: normalizedKey, ...tabData[normalizedKey] }
        : null;
    })
    .filter(Boolean);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-50 px-2 lg:hidden"
      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
    >
      {orderedTabs.map((tab: any) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1"
          style={{
            color:
              activeTab === tab.id ? theme.primary : theme.textSecondary,
          }}
        >
          <tab.icon
            size={20}
            strokeWidth={activeTab === tab.id ? 2.5 : 2}
          />
          <span className="text-[10px] font-medium">
            {t(tab.labelKey)}
          </span>
        </button>
      ))}
    </nav>
  );
}