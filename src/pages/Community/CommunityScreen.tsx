import React, { useEffect, useState } from "react";
import {
  MessageCircle,
  Newspaper,
  UserPlus,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../lib/UserPreferencesContext";
import { supabase } from "../../lib/supabaseClient";

// Helper component for the cards
const MenuCard = ({ title, description, icon: Icon, colorScheme, onClick, theme }: any) => {
  const isDark = theme.mode === 1;

  // Dynamic color logic based on scheme
  const getColors = () => {
    switch (colorScheme) {
      case "orange":
        return {
          bg: isDark ? "#3A1E14" : "#FEF3EC",
          icon: isDark ? "#FF8A65" : "#D96C47"
        };
      case "blue":
        return {
          bg: isDark ? "#14283A" : "#ECF6FC",
          icon: isDark ? "#64B5F6" : "#3D8BB3"
        };
      case "pink":
        return {
          bg: isDark ? "#3A1420" : "#FEF2F4",
          icon: isDark ? "#F48FB1" : "#BD3E63"
        };
      case "teal":
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

  // --- REAL-TIME STATS STATE ---
  const [stats, setStats] = useState({
    newPosts: 0,
    buddies: 0,
    items: 0,
  });

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. New Posts: Count discussion posts created in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const postsPromise = supabase
        .from("discussion_posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString());

      // 2. Buddies: Count accepted buddy requests where current user is involved
      const buddiesPromise = supabase
        .from("buddy_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "Accepted")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      // 3. Items: Count all active marketplace listings
      const itemsPromise = supabase
        .from("marketplace_listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "Available"); // Optional: ensure we only count available items

      // Run all queries in parallel
      const [postsRes, buddiesRes, itemsRes] = await Promise.all([
        postsPromise,
        buddiesPromise,
        itemsPromise
      ]);

      setStats({
        newPosts: postsRes.count || 0,
        buddies: buddiesRes.count || 0,
        items: itemsRes.count || 0,
      });

    } catch (err) {
      console.error("Error fetching community stats:", err);
    }
  };

  useEffect(() => {
    // 1. Initial Fetch
    fetchStats();

    // 2. Set up Real-time Subscription
    const channel = supabase
      .channel('community_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'discussion_posts'
        },
        () => fetchStats() // Re-fetch on post changes
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buddy_requests'
        },
        () => fetchStats() // Re-fetch on buddy changes
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_listings'
        },
        () => fetchStats() // Re-fetch on marketplace changes
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: theme.background }}>
      {/* Header (MATCH BookListHeader format) */}
      <div
        className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b transition-colors duration-300 lg:hidden"
        style={{ backgroundColor: theme.cardBg, borderColor: theme.border, transform: "none" }}
      >
        <h2 style={{ color: theme.text, fontWeight: 600, fontSize: "20px" }}>
          {t("community_title")}
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: theme.textSecondary, lineHeight: "1.6" }}
        >
          {t("community_subtitle")}
        </p>
      </div>

      {/* Spacer so content starts below fixed header */}
      <div className="h-24 lg:hidden" />

      {/* Content */}
      <div className="container-dashboard lg:pt-8">
        <div className="p-6 pb-32">
          {/* Grid Menu */}
          <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-3">
            <MenuCard
              title={t("comm_discussion")}
              description={t("comm_discussion_desc")}
              icon={MessageCircle}
              colorScheme="orange"
              onClick={() => navigate("/community/discussion")}
              theme={theme}
            />
            <MenuCard
              title={t("comm_news")}
              description={t("comm_news_desc")}
              icon={Newspaper}
              colorScheme="blue"
              onClick={() => navigate("/community/news")}
              theme={theme}
            />
            <MenuCard
              title={t("comm_find_buddy")}
              description={t("comm_find_buddy_desc")}
              icon={UserPlus}
              colorScheme="pink"
              onClick={() => navigate("/community/buddy")}
              theme={theme}
            />
            <MenuCard
              title={t("comm_marketplace")}
              description={t("comm_marketplace_desc")}
              icon={ShoppingBag}
              colorScheme="teal"
              onClick={() => navigate("/community/marketplace")}
              theme={theme}
            />
            <MenuCard
              title={t("comm_chats")}
              description={t("comm_chats_desc")}
              icon={MessageSquare}
              colorScheme="pink"
              onClick={() => navigate("/private-chat-list")}
              theme={theme}
            />
          </div>

          {/* Community Activity Footer (Dynamic Data) */}
          <div className="p-5 rounded-[20px] border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>{t("comm_activity_title")}</h3>
            <div className="flex justify-around items-center">
              <ActivityStat count={stats.newPosts} label={t("comm_stat_posts")} theme={theme} />
              <div className="h-8 w-[1px]" style={{ backgroundColor: theme.border }}></div>
              <ActivityStat count={stats.buddies} label={t("comm_stat_buddies")} theme={theme} />
              <div className="h-8 w-[1px]" style={{ backgroundColor: theme.border }}></div>
              <ActivityStat count={stats.items} label={t("comm_stat_items")} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}