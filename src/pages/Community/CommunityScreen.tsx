import React from "react";
import {
  MessageCircle,
  Newspaper,
  UserPlus,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

// Helper component for the cards
const MenuCard = ({ title, description, icon: Icon, colorScheme, onClick, theme }: any) => {
  const isDark = theme.mode === 1;

  // Dynamic color logic based on scheme
  const getColors = () => {
    switch (colorScheme) {
      case 'orange':
        return {
          bg: isDark ? "#3A1E14" : "#FEF3EC",
          icon: isDark ? "#FF8A65" : "#D96C47"
        };
      case 'blue':
        return {
          bg: isDark ? "#14283A" : "#ECF6FC",
          icon: isDark ? "#64B5F6" : "#3D8BB3"
        };
      case 'pink':
        return {
          bg: isDark ? "#3A1420" : "#FEF2F4",
          icon: isDark ? "#F48FB1" : "#BD3E63"
        };
      case 'teal':
        return {
          bg: isDark ? "#102E29" : "#F0FDFA",
          icon: isDark ? "#4DB6AC" : "#4A9D8F"
        };
      default:
        return {
          bg: theme.cardBg,
          icon: theme.textSecondary
        };
    }
  };

  const colors = getColors();

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-5 border rounded-[20px] shadow-sm text-left transition-colors w-full active:scale-95 duration-200"
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.border,
      }}
    >
      <div className={`p-3 rounded-[18px] mb-4`} style={{ backgroundColor: colors.bg }}>
        <Icon size={24} strokeWidth={2} style={{ color: colors.icon }} />
      </div>
      <h3 className="text-lg font-bold mb-1" style={{ color: theme.text }}>{title}</h3>
      <p className="text-sm leading-tight" style={{ color: theme.textSecondary }}>{description}</p>
    </button>
  );
};

// Helper for activity stats
const ActivityStat = ({ count, label, theme }: any) => (
  <div className="flex flex-col items-center">
    <span className="text-xl font-bold text-[#8B1E3F]">{count}</span>
    <span className="text-xs" style={{ color: theme.textSecondary }}>{label}</span>
  </div>
);

export function CommunityScreen() {
  const navigate = useNavigate();
  const { theme, t } = useUserPreferences();

  return (
    <div className="min-h-screen p-6 pb-32 transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>{t('community_title')}</h1>
        <p className="mt-1" style={{ color: theme.textSecondary }}>{t('community_subtitle')}</p>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <MenuCard
          title={t('comm_discussion')}
          description={t('comm_discussion_desc')}
          icon={MessageCircle}
          colorScheme="orange"
          onClick={() => navigate('/community/discussion')}
          theme={theme}
        />
        <MenuCard
          title={t('comm_news')}
          description={t('comm_news_desc')}
          icon={Newspaper}
          colorScheme="blue"
          onClick={() => navigate('/community/news')}
          theme={theme}
        />
        <MenuCard
          title={t('comm_find_buddy')}
          description={t('comm_find_buddy_desc')}
          icon={UserPlus}
          colorScheme="pink"
          onClick={() => navigate('/community/buddy')}
          theme={theme}
        />
        <MenuCard
          title={t('comm_marketplace')}
          description={t('comm_marketplace_desc')}
          icon={ShoppingBag}
          colorScheme="teal"
          onClick={() => navigate('/community/marketplace')}
          theme={theme}
        />
        <MenuCard
          title={t('comm_chats')}
          description={t('comm_chats_desc')}
          icon={MessageSquare}
          colorScheme="pink"
          onClick={() => navigate('/private-chat-list')}
          theme={theme}
        />
      </div>

      {/* Community Activity Footer */}
      <div className="p-5 rounded-[20px] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>{t('comm_activity_title')}</h3>
        <div className="flex justify-around items-center">
          <ActivityStat count={4} label={t('comm_stat_posts')} theme={theme} />
          <div className="h-8 w-[1px]" style={{ backgroundColor: theme.border }}></div>
          <ActivityStat count={1} label={t('comm_stat_buddies')} theme={theme} />
          <div className="h-8 w-[1px]" style={{ backgroundColor: theme.border }}></div>
          <ActivityStat count={6} label={t('comm_stat_items')} theme={theme} />
        </div>
      </div>
    </div>
  );
}
