import {
  ArrowLeft,
  Bell,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  BellOff
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";
import { useUserPreferences } from "../../lib/UserPreferencesContext";

interface EventReminder {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  startTime: string;
  location: string;
  read: boolean;
}

interface EventRemindersScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function EventRemindersScreen({ onNavigate }: EventRemindersScreenProps) {
  const { theme, preferences } = useUserPreferences();
  const isMs = preferences.language_code === 'ms';
  const isDark = preferences.theme_mode === 1;

  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useEffect(() => {
    if (remindersEnabled) loadReminders();
  }, [remindersEnabled]);

  const loadReminders = async () => {
    setIsLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("event_reminders")
      .select(`
        id,
        read,
        activity_events (
          id,
          title,
          event_date,
          start_time,
          location
        )
      `)
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      toast.error(isMs ? "Gagal memuatkan peringatan" : "Failed to load reminders");
      setIsLoading(false);
      return;
    }

    const formatted: EventReminder[] =
      data?.map((r: any) => ({
        id: r.id,
        read: r.read,
        eventId: r.activity_events.id,
        eventTitle: r.activity_events.title,
        eventDate: r.activity_events.event_date,
        startTime: r.activity_events.start_time,
        location: r.activity_events.location
      })) || [];

    setReminders(formatted);
    setIsLoading(false);
  };

  const markReminderAsRead = async (id: number) => {
    await supabase
      .from("event_reminders")
      .update({ read: true })
      .eq("id", id);
  };

  const handleReminderClick = async (reminder: EventReminder) => {
    if (!reminder.read) {
      await markReminderAsRead(reminder.id);
      setReminders(prev =>
        prev.map(r =>
          r.id === reminder.id ? { ...r, read: true } : r
        )
      );
    }
    onNavigate("event-detail", { eventId: reminder.eventId });
  };

  const handleToggleReminders = () => {
    const newState = !remindersEnabled;
    setRemindersEnabled(newState);

    if (newState) {
      toast.success(isMs ? "Peringatan aktiviti dihidupkan" : "Activity reminders enabled");
      loadReminders();
    } else {
      toast.info(isMs ? "Peringatan aktiviti dimatikan" : "Activity reminders disabled");
      setReminders([]);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isMs ? "ms-MY" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    const hour = Number(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const getDaysUntilEvent = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: isDark ? theme.background : "#ffffff" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-6 border-b" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("activity-main")}>
            <ArrowLeft className="w-6 h-6" style={{ color: theme.primary }} />
          </button>
          <div>
            <h2 className="text-[20px] font-semibold" style={{ color: theme.text }}>
              {isMs ? "Peringatan Aktiviti" : "Activity Reminders"}
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {remindersEnabled
                ? isMs ? "Acara akan datang yang anda sertai" : "Upcoming events you've joined"
                : isMs ? "Peringatan sedang dimatikan" : "Reminders are currently disabled"}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="px-6 py-4 border bg-gray-50 border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2" style={{ color: theme.text }}>
          <Bell className="text-red-900"/>
          <div>
              <p style={{ color: "#1A1A1A", fontWeight: "500" }}>{isMs ? "Hidupkan Peringatan" : "Enable Reminders"}</p>
              <p style={{ color: "#6A6A6A", fontSize: "12px" }}>
                {isMs ? "Dapatkan notifikasi berkaitan acara akan datang" : "Get notified about upcoming events"}
              </p>
            </div>
        </div>
        <button
            onClick={handleToggleReminders}
            className="relative w-14 h-8 rounded-full transition-colors"
            style={{ 
              backgroundColor: remindersEnabled ? "#7A0019" : "#E5E5E5"
            }}
          >
            <div 
              className="absolute top-1 w-6 h-6 bg-white rounded-full transition-transform"
              style={{ 
                left: remindersEnabled ? "calc(100% - 28px)" : "4px"
              }}
            />
        </button>
      </div>

      {/* List */}
      <div className="px-6 py-6">
        {!remindersEnabled ? (
          <div className="text-center py-12">
            <BellOff className="w-16 h-16 mx-auto mb-4" style={{ color: "#E5E5E5" }} />
            <h3 className="mb-2" style={{ color: "#1A1A1A" }}>{isMs ? "Peringatan Dimatikan" : "Reminders Disabled"}</h3>
            <p style={{ color: "#6A6A6A", fontSize: "14px" }}>
              {isMs ? "Hidupkan peringatan untuk menerima notifikasi berkaitan acara akan datang" : "Enable reminders to receive notifications about your upcoming events"}
            </p>
          </div>
        ) : isLoading ? (
          <p style={{ color: theme.textSecondary }}>{isMs ? "Memuatkan peringatan..." : "Loading reminders..."}</p>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12">
          <p style={{ color: theme.textSecondary }}>{isMs ? "Tiada acara akan datang" : "No upcoming events"}</p>
          <p style={{ color: "#6A6A6A", fontSize: "14px" }}>
              {isMs ? "Sertai acara untuk menerima peringatan sebelum program bermula" : "Join events to receive reminders before they start"}
            </p>
            <button
              onClick={() => onNavigate("activity-events")}
              className="mt-4 px-6 py-3 rounded-lg"
              style={{ 
                backgroundColor: "#7A0019",
                color: "#FFFFFF"
              }}
            >
              {isMs ? "Cari Program" : "Browse Events"}
            </button>
            </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(reminder => {
              const daysUntil = getDaysUntilEvent(reminder.eventDate);
              const isToday = daysUntil === 0;
              const isTomorrow = daysUntil === 1;

              return(
              <button
                key={reminder.id}
                onClick={() => handleReminderClick(reminder)}
                className="w-full text-left"
              >
                <div
                  className={`p-4 rounded-xl border`}
                  style={{
                    borderColor: reminder.read ? theme.border : "#dc2626",
                    backgroundColor: theme.cardBg,
                    color: theme.text
                  }}
                >
                  {/* Unread Indicator */}
                    {!reminder.read && (
                      <div 
                        className="absolute top-4 right-4 w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#7A0019" }}
                      />
                    )}

                  {/* Reminder Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="p-2 rounded-lg shrink-0"
                        style={{ 
                          backgroundColor: isToday ? "#FEF2F2" : isTomorrow ? "#FFF7ED" : "#F0F9FF"
                        }}
                      >
                        <Bell 
                          className="w-5 h-5" 
                          style={{ 
                            color: isToday ? "#DC2626" : isTomorrow ? "#EA580C" : "#0369A1"
                          }} 
                        />
                      </div>
                      <div className="flex-1 pr-4">
                        <h3 
                          className="mb-1"
                          style={{ 
                            color: "#1A1A1A", 
                            fontSize: "16px", 
                            fontWeight: "600"
                          }}
                        >
                          {reminder.eventTitle}
                        </h3>
                        <div 
                          className="inline-block px-2 py-1 rounded text-xs"
                          style={{ 
                            backgroundColor: isToday ? "#FEF2F2" : isTomorrow ? "#FFF7ED" : "#F0FDF4",
                            color: isToday ? "#DC2626" : isTomorrow ? "#EA580C" : "#15803D"
                          }}
                        >
                          {isToday ? "Today" : isTomorrow ? "Tomorrow" : `In ${daysUntil} days`}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm opacity-70 space-y-2 ml-11">
                        <div className="flex gap-2 items-center">
                        <Calendar size={14} /> {formatDate(reminder.eventDate)}
                        </div>
                        <div className="flex gap-2 items-center">
                        <Clock size={14} /> {formatTime(reminder.startTime)}
                        </div>
                        <div className="flex gap-2 items-center">
                        <MapPin size={14} /> {reminder.location}
                        </div>
                    </div>

                  {reminder.read && (
                    <div className="flex items-center gap-2 mt-3 ml-11 text-green-700 text-xs">
                      <CheckCircle size={14} /> {isMs ? "Telah Dilihat" : "Viewed"}
                    </div>
                  )}
                </div>
              </button>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
