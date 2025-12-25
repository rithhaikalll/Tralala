import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Megaphone,
  TrendingUp,
  Plus,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../lib/supabaseClient";
import { useUserPreferences } from "../lib/UserPreferencesContext";

interface HomeScreenProps {
  studentName: string;
  onNavigate: (screen: string, data?: string) => void;
}

export function HomeScreenHeader({ studentName }: { studentName: string }) {
  const { theme, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b transition-colors duration-300"
      style={{ 
        backgroundColor: theme.cardBg, 
        borderColor: theme.border,
        transform: "none" 
      }}
    >
      <h1
        className="mb-1"
        style={{
          color: theme.primary,
          fontWeight: 600,
          fontSize: "20px",
          letterSpacing: "-0.01em",
        }}
      >
        UTMGo+
      </h1>
      <p className="text-sm" style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
        {isMs ? `Selamat kembali, ${studentName}` : `Welcome back, ${studentName}`}
      </p>
    </div>
  );
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { theme, t, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';

  const [recommended, setRecommended] = useState<any>(null);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [stats, setStats] = useState({ total: 0, validated: 0, pending: 0 });
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const { data: act } = await supabase.from("recorded_activities").select("status, duration");
      if (act) {
        setStats({
          validated: act.filter((a) => a.status === "Validated").length,
          pending: act.filter((a) => a.status === "Pending").length,
          total: act.filter((a) => a.status === "Validated").reduce((sum, a) => sum + Number(a.duration), 0),
        });
      }
      const { data: fac } = await supabase.from("facilities").select("id, name, location, image_url").limit(1);
      if (fac) setRecommended(fac[0]);
      setLoadingRecommended(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: bookings } = await supabase.from("facility_bookings").select("id, date_label, time_label, status, facilities(name, location)").eq("user_id", user.id).in("status", ["pending", "approved", "confirmed", "checked_in"]).limit(1);
        if (bookings?.[0]) setUpcomingBooking(bookings[0]);
      }
      setLoadingUpcoming(false);
    };
    loadDashboardData();
  }, []);

  const newsItems = [
    { id: "n1", title: isMs ? "Kejohanan Futsal Antara Fakulti 2025" : "Inter-Faculty Futsal Tournament 2025", body: isMs ? "Daftar pasukan anda sebelum 15 Mac." : "Register your team by 15 March.", date: "10 March 2025" },
    { id: "n2", title: isMs ? "Peraturan Tempahan Baharu Waktu Puncak" : "New Booking Rules for Peak Hours", body: isMs ? "Setiap pelajar boleh menempah sehingga 2 slot seminggu." : "Each student can book up to 2 slots per week.", date: "8 March 2025" },
  ];

  const renderWidget = (key: string) => {
    switch (key) {
      case 'upcoming':
        return (
          <section key="upcoming" className="border shadow-sm transition-colors duration-300" style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "14px" }}>
            <div className="p-4">
              <p className="text-[10px] mb-1 font-bold tracking-widest" style={{ color: theme.primary }}>
                {isMs ? "TEMPAHAN AKAN DATANG" : "UPCOMING BOOKING"}
              </p>
              {upcomingBooking ? (
                <>
                  <h2 className="mb-2 font-bold text-lg" style={{ color: theme.text }}>{upcomingBooking.facilities?.name}</h2>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sm" style={{ color: theme.textSecondary }}>
                      <Calendar size={16} /> <span>{upcomingBooking.date_label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm" style={{ color: theme.textSecondary }}>
                      <Clock size={16} /> <span>{upcomingBooking.time_label}</span>
                    </div>
                  </div>
                </>
              ) : (
                <h2 className="mb-2 font-semibold" style={{ color: theme.textSecondary }}>
                  {isMs ? "Tiada tempahan akan datang" : "No upcoming bookings yet"}
                </h2>
              )}
              <button onClick={() => onNavigate("my-bookings")} className="w-full h-10 mt-4 rounded-lg font-bold text-white transition-all active:scale-95" style={{ backgroundColor: theme.primary }}>
                {isMs ? "Tempahan Saya" : "My Bookings"}
              </button>
            </div>
          </section>
        );

      case 'recommended':
        return (
          <section key="recommended" className="space-y-4">
            <h3 className="font-bold text-lg" style={{ color: theme.text }}>{isMs ? "Disyorkan untuk anda" : "Recommended for you"}</h3>
            {recommended && (
              <button onClick={() => onNavigate("facility-details", recommended.id)} className="w-full border shadow-sm overflow-hidden text-left transition-colors duration-300" style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "14px" }}>
                <div className="w-full h-40"><ImageWithFallback src={recommended.image_url ?? ""} className="w-full h-full object-cover" /></div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold" style={{ color: theme.text }}>{recommended.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.primary + '15', color: theme.primary }}>
                      {isMs ? "Popular minggu ini" : "Popular this week"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
                    <MapPin size={12} /> <span>{recommended.location || "Campus Facility"}</span>
                  </div>
                </div>
              </button>
            )}
          </section>
        );

      case 'tracking':
        return (
          <section key="tracking">
            <h3 className="mb-4 font-bold text-lg" style={{ color: theme.text }}>{isMs ? "Jejak Aktiviti" : "Activity Tracking"}</h3>
            <div className="border p-5 shadow-sm transition-colors duration-300" style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "14px" }}>
              <div className="flex gap-4 mb-5">
                <div className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl" style={{ backgroundColor: theme.primary + '10' }}>
                  <TrendingUp style={{ color: theme.primary }} />
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: theme.text }}>{isMs ? "Pantau Sukan Anda" : "Track Your Sports"}</h4>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>{isMs ? "Rakam aktiviti dan kumpul jam." : "Record activities and earn hours."}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: isMs ? "Jumlah Jam" : "Total Hours", val: stats.total, color: theme.primary },
                  { label: t("stat_validated"), val: stats.validated, color: "#0369A1" },
                  { label: t("stat_pending"), val: stats.pending, color: "#C2410C" }
                ].map((s, i) => (
                  <div key={i} className="p-3 text-center rounded-xl" style={{ backgroundColor: theme.background }}>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[10px]" style={{ color: theme.textSecondary }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onNavigate("activity-record")} className="flex-1 h-10 rounded-lg text-white font-bold flex items-center justify-center gap-2" style={{ backgroundColor: theme.primary }}><Plus size={16} /> {isMs ? "Rekod" : "Record"}</button>
                <button onClick={() => onNavigate("activity-main")} className="flex-1 h-10 rounded-lg border font-bold" style={{ borderColor: theme.primary, color: theme.primary }}>{t("view_all")}</button>
              </div>
            </div>
          </section>
        );

      case 'news':
        return (
          <section key="news" className="pb-4">
            <h3 className="mb-3 font-bold text-lg" style={{ color: theme.text }}>{isMs ? "Berita sukan kampus" : "Campus sports news"}</h3>
            <div className="space-y-3">
              {newsItems.map((item) => (
                <div key={item.id} className="border p-3 flex gap-3 shadow-sm transition-colors duration-300" style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: "12px" }}>
                  <Megaphone size={20} style={{ color: theme.primary }} className="shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] mb-1" style={{ color: theme.textSecondary }}>{item.date}</p>
                    <h4 className="text-sm font-bold" style={{ color: theme.text }}>{item.title}</h4>
                    <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      <div className="h-10" />
      <div className="px-6 py-2 space-y-8" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px) + 60px)" }}>
        {/* Render widgets mengikut urutan DB (UC15) */}
        {preferences.dashboard_order.map((key) => renderWidget(key))}
      </div>
    </div>
  );
}