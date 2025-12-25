import { Home, MessageSquare, Calendar, Activity, User } from "lucide-react";
import { useUserPreferences } from "../lib/UserPreferencesContext";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t, theme, preferences } = useUserPreferences();

  // Define all possible items
  const allItems: Record<string, any> = {
    home: { icon: Home, label: t("nav_home") },
    discussion: { icon: MessageSquare, label: t("nav_discuss") },
    book: { icon: Calendar, label: t("nav_book") },
    activity: { icon: Activity, label: t("nav_activity") },
    profile: { icon: User, label: t("nav_profile") },
  };

  // Use the order from preferences
  const navOrder = preferences.nav_order || ['home', 'discussion', 'book', 'activity', 'profile'];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-20 border-t flex items-center justify-around px-2 z-50 transition-colors duration-300"
      style={{ 
        backgroundColor: "var(--bg-primary)",
        borderColor: theme.border 
      }}
    >
      {navOrder.map((id) => {
        const item = allItems[id];
        if (!item) return null; // Safety check
        
        const isActive = activeTab === id;
        const Icon = item.icon;

        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center w-16 h-full space-y-1 group"
          >
            <Icon
              className="w-6 h-6 transition-colors duration-300"
              style={{ color: isActive ? theme.primary : theme.textSecondary }}
            />
            <span
              className="text-[10px] font-medium transition-colors duration-300"
              style={{ color: isActive ? theme.primary : theme.textSecondary }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}