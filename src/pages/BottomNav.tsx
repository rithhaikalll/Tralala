import { Home, MessageSquare, Book, Compass, User } from "lucide-react";
import { useUserPreferences } from "../lib/UserPreferencesContext";

export function BottomNav({ activeTab, onTabChange }: any) {
  // Mengambil theme, preferences, dan fungsi t daripada context
  const { theme, preferences, t } = useUserPreferences();
  
  const tabData: Record<string, { labelKey: string; icon: any }> = {
    home: { labelKey: 'nav_home', icon: Home },
    discussion: { labelKey: 'nav_discuss', icon: MessageSquare },
    book: { labelKey: 'nav_book', icon: Book },
    activity: { labelKey: 'nav_activity', icon: Compass },
    profile: { labelKey: 'nav_profile', icon: User }
  };

  // Menggunakan nav_order yang disimpan secara dinamik daripada DB
  const orderedTabs = preferences.nav_order.map(key => ({
    id: key,
    ...tabData[key]
  }));

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-50 px-2 transition-colors duration-300"
      // Memastikan latar belakang (cardBg) dan garis sempadan (border) mengikut tema
      style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
    >
      {orderedTabs.map((tab) => (
        <button 
          key={tab.id} 
          onClick={() => onTabChange(tab.id)}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all"
          // Warna ikon dan teks bertukar mengikut status aktif dan tema
          style={{ color: activeTab === tab.id ? theme.primary : theme.textSecondary }}
        >
          <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          {/* Label diterjemah menggunakan fungsi t() */}
          <span className="text-[10px] font-medium">{t(tab.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}