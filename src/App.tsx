import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "./lib/supabaseClient";
import { UserPreferencesProvider } from "./lib/UserPreferencesContext"; 

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

import { LoginScreen } from "./pages/Authentication/LoginScreen";
import { RegisterScreen } from "./pages/Authentication/RegisterScreen";
import { ResetPasswordRequestScreen } from "./pages/Authentication/ResetPasswordRequestScreen";
import { ResetPasswordNewScreen } from "./pages/Authentication/ResetPasswordNewScreen";
import { ResetLinkSentScreen } from "./pages/Authentication/ResetLinkSentScreen";
import { HomeScreen, HomeScreenHeader } from "./pages/StudentDashboard";
import { StaffCheckInDashboardScreen } from "./pages/StaffDashboard";
import { BottomNav } from "./pages/BottomNav";
import { ProfileScreen } from "./pages/ProfileScreen";
import { ActivityHistoryScreen } from "./pages/Activity Tracking/ActivityHistoryScreen";
import {
  ActivityDetailScreen,
  ActivityDetailHeader,
} from "./pages/Activity Tracking/ActivityDetailScreen";
import { ActivityMainScreen } from "./pages/Activity Tracking/ActivityMainScreen";
import { RecordActivityScreen } from "./pages/Activity Tracking/RecordActivityScreen";
import { EditActivityScreen } from "./pages/Activity Tracking/EditActivityScreen";
import DetailActivityScreen from "./pages/Activity Tracking/DetailActivityScreen";
import { ActivityReportScreen } from "./pages/Activity Tracking/ActivityReportScreen";
import { BadgeCollectionScreen } from "./pages/Activity Tracking/ActivityBadgeScreen";
import {
  FacilityListScreen,
  BookListHeader,
} from "./pages/Facility/FacilityListScreen";
import {
  MyBookingsScreen,
  MyBookingsScreenHeader,
} from "./pages/Facility/MyBookingsScreen";
import {
  DiscussionScreen,
  DiscussionScreenHeader,
} from "./pages/Community/DiscussionScreen";
import { DiscussionDetailScreen } from "./pages/Community/DiscussionDetailScreen";
import { CreateDiscussionScreen } from "./pages/Community/CreateDiscussionScreen";
import {
  FacilityDetailsScreen,
  FacilityDetailsHeader,
} from "./pages/Facility/FacilityDetailsScreen";
import { TimeSlotSelectionScreen } from "./pages/Facility/TimeSlotSelectionScreen";
import { BookingConfirmationScreen } from "./pages/Facility/BookingConfirmationScreen";
import { SuccessScreen } from "./pages/Facility/SuccessScreen";

import { InterfaceSettingsScreen } from "./pages/InterfaceSettingsScreen";
import { NavbarSettingsScreen } from "./pages/NavbarSettingsScreen";

function DiscussionDetailWrapper({
  onNavigate,
  studentName,
}: {
  onNavigate: (screen: string) => void;
  studentName: string;
}) {
  const { id } = useParams();
  return (
    <DiscussionDetailScreen
      postId={(id as string) || ""}
      onNavigate={onNavigate}
      studentName={studentName}
    />
  );
}

function ActivityDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <ActivityDetailScreen
      activityId={(id as string) || ""}
      onNavigate={(screen) => {
        if (screen === "activity-history") navigate("/activity-history");
      }}
    />
  );
}

function FacilityDetailsWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const facilityId = (id as string) || "";
  return (
    <FacilityDetailsScreen
      facilityId={facilityId}
      onNavigate={(screen, data) => {
        if (screen === "time-slot" && data)
          navigate(`/facility/${data}/time-slot`);
        if (screen === "book") navigate("/book");
      }}
    />
  );
}

function TimeSlotWrapper() {
  const { id } = useParams();
  const facilityId = (id as string) || "";
  const navigate = useNavigate();
  return (
    <TimeSlotSelectionScreen
      facilityId={facilityId}
      onNavigate={(screen, data) => {
        if (screen === "booking-confirmation") {
          navigate(`/booking/confirmation`, { state: data });
        }
        if (screen === "facility-details") navigate(`/facility/${facilityId}`);
      }}
    />
  );
}

function BookingConfirmationWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = (location.state as any) || null;
  const facilityId = bookingData?.facilityId || "";
  return (
    <BookingConfirmationScreen
      bookingData={bookingData || { facilityName: "", date: "", time: "" }}
      onNavigate={(screen, data) => {
        if (screen === "time-slot") {
          navigate(`/facility/${facilityId}/time-slot`);
        }
        if (screen === "success") {
          navigate("/booking/success", { state: data });
        }
      }}
    />
  );
}

function BookingSuccessWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData =
    (location.state as any) ||
    ({ facilityName: "", date: "", time: "" } as any);
  return (
    <SuccessScreen
      bookingData={bookingData}
      onNavigate={(screen) => {
        if (screen === "upcoming" || screen === "my-bookings")
          navigate("/my-bookings");
        if (screen === "home") navigate("/home");
      }}
    />
  );
}

function EditActivityWrapper({ userId, userRole }: { userId: string; userRole: "student" | "staff" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <EditActivityScreen
      activityId={id || ""}
      userId={userId}
      userRole={userRole}
      onNavigate={(screen) => {
        if (screen === "activity-main") navigate("/activity-main");
      }}
    />
  );
}

function DetailActivityWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <DetailActivityScreen
      activityId={id || ""}
      onNavigate={(screen) => {
        if (screen === "activity-main") navigate("/activity-main");
      }}
    />
  );
}

function RequireAuth({
  authed,
  children,
}: {
  authed: boolean;
  children: ReactNode;
}) {
  // Ditambah div wrapper dengan bg-primary dan height penuh untuk elak bocor warna putih
  return authed ? (
    <div className="w-full flex-1 flex flex-col bg-[--bg-primary)]">
      {children as any}
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [studentName, setStudentName] = useState<string>("Student");
  const [userRole, setUserRole] = useState<"student" | "staff">("student");
  const [userId, setUserId] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = (session.user.user_metadata?.role as "student" | "staff") || "student";
        const name = (session.user.user_metadata?.full_name as string) || "UTM Sports Staff";
        setUserId(session.user.id);
        setUserRole(role);
        setStudentName(name);
        setAuthed(true);
      }
    };
    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = (session.user.user_metadata?.role as "student" | "staff") || "student";
        setUserRole(role);
        setAuthed(true);
      } else {
        setAuthed(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isFacilityRoute = location.pathname.startsWith("/facility");
  const isBookRoute = location.pathname.startsWith("/book");
  const isHomeRoute = location.pathname === "/home";
  const isDiscussionRoute = location.pathname.startsWith("/discussion") && !location.pathname.includes("/discussion/");
  const isUpcomingRoute = location.pathname === "/my-bookings";
  const isActivityDetailRoute = location.pathname.match(/^\/activity\/[^/]+$/) && !location.pathname.startsWith("/activity/record");

  const hideBottomNav =
    location.pathname === "/" ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/facility") ||
    location.pathname.startsWith("/booking") ||
    location.pathname.startsWith("/discussion/create") ||
    location.pathname.match(/^\/discussion\/[^/]+$/) || 
    location.pathname.startsWith("/activity-history") ||
    location.pathname.match(/^\/activity\/[^/]+$/) ||
    location.pathname.startsWith("/activity/edit") ||
    location.pathname.startsWith("/badges") ||
    location.pathname.startsWith("/settings/") || 
    location.pathname.startsWith("/my-bookings");

  const showBottomNav = authed && !hideBottomNav;

  const hasHeader = authed && (isFacilityRoute || isBookRoute || (isHomeRoute && userRole === "student") || isDiscussionRoute || isUpcomingRoute || isActivityDetailRoute);

  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/discussion")) return "discussion";
    if (p.startsWith("/book") || p.startsWith("/facilities") || p.startsWith("/facility")) return "book";
    if (p.startsWith("/activity") || p.startsWith("/detailactivity") || p.startsWith("/badges") || p.startsWith("/activity-main"))
      return "activity";
    if (p.startsWith("/profile")) return "profile";
    return "home";
  }, [location.pathname]);

  const handleLogin = async (name: string, id?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const role = (user?.user_metadata?.role as "student" | "staff") || "student";
    const displayName = (user?.user_metadata?.full_name as string) || name || "User";
    setStudentName(displayName);
    setUserRole(role);
    setUserId(user?.id || id || "");
    setAuthed(true);
    navigate("/home", { replace: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    navigate("/", { replace: true });
  };

  const onTabChange = (tab: string) => {
    const map: Record<string, string> = {
      home: "/home",
      discussion: "/discussion",
      book: "/book",
      activity: "/activity-main", 
      profile: "/profile",
    };
    navigate(map[tab] || "/home");
  };

  return (
    <UserPreferencesProvider>
      {/* Container utama dengan flex-col dan bg-primary */}
      <div className="h-full w-full bg-[--bg-primary)] text-[--text-primary)] transition-colors duration-300 flex flex-col overflow-hidden">
        
        {/* FIXED HEADER AREA - Dibungkus dalam header tag untuk kawalan z-index */}
        {hasHeader && (
          <header className="fixed-header-top">
            {isFacilityRoute && <FacilityDetailsHeader onBack={() => navigate("/book")} />}
            {isBookRoute && <BookListHeader />}
            {isHomeRoute && userRole === "student" && <HomeScreenHeader studentName={studentName} />}
            {isDiscussionRoute && <DiscussionScreenHeader onNavigate={() => navigate("/discussion/create")} />}
            {isUpcomingRoute && <MyBookingsScreenHeader onBack={() => navigate("/home")} />}
            {isActivityDetailRoute && <ActivityDetailHeader onBack={() => navigate("/activity-history")} />}
          </header>
        )}

        <main
          className={`content flex-1 overflow-y-auto bg-[--bg-primary)] ${showBottomNav ? "with-bottom-nav" : ""}`}
          style={{ 
            paddingTop: hasHeader ? "70px" : "0px",
            minHeight: "100%", 
          }}
        >
          {/* Wrapper tambahan untuk memastikan latar belakang penuh di dalam skrin Routes */}
          <div className="flex-1 flex flex-col w-full bg-[--bg-primary)]">
            <Routes>
              <Route path="/" element={<LoginScreen onLogin={handleLogin} onNavigate={(p) => navigate(p === "register" ? "/register" : "/reset-password-request")} />} />
              <Route path="/register" element={<RegisterScreen onNavigate={(p) => navigate(p === "login" ? "/" : "/register")} />} />
              <Route path="/reset-password-request" element={<ResetPasswordRequestScreen onNavigate={(p) => navigate(p)} />} />
              <Route path="/reset-link-sent" element={<ResetLinkSentScreen onNavigate={(p) => navigate(p)} />} />
              <Route path="/reset-password-new" element={<ResetPasswordNewScreen onNavigate={(p) => navigate(p)} />} />

              <Route path="/home" element={<RequireAuth authed={authed}>{userRole === "staff" ? <StaffCheckInDashboardScreen staffName={studentName} onNavigate={(p) => navigate(p)} onLogout={handleLogout} /> : <HomeScreen studentName={studentName} onNavigate={(s, d) => { if(s==="book") navigate("/book"); if(s==="discussion") navigate("/discussion"); if(s==="facility-details" && d) navigate(`/facility/${d}`); if(s==="activity-record") navigate("/activity/record"); if(s==="activity-main") navigate("/activity-main"); if(s==="my-bookings") navigate("/my-bookings"); }} />}</RequireAuth>} />
              
              <Route path="/discussion" element={<RequireAuth authed={authed}><DiscussionScreen onNavigate={(s, d) => navigate(d ? `/discussion/${d}` : "/discussion/create")} /></RequireAuth>} />
              <Route path="/discussion/create" element={<RequireAuth authed={authed}><CreateDiscussionScreen studentName={studentName} onNavigate={() => navigate("/discussion")} /></RequireAuth>} />
              <Route path="/discussion/:id" element={<RequireAuth authed={authed}><DiscussionDetailWrapper studentName={studentName} onNavigate={() => navigate("/discussion")} /></RequireAuth>} />
              <Route path="/book" element={<RequireAuth authed={authed}><FacilityListScreen onNavigate={(s, d) => navigate(`/facility/${d}`)} /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth authed={authed}><ProfileScreen studentName={studentName} onNavigate={(s) => navigate(s.startsWith("settings/") ? `/${s}` : `/${s}`)} onLogout={handleLogout} /></RequireAuth>} />
              
              <Route path="/activity-main" element={<RequireAuth authed={authed}><ActivityMainScreen userId={userId} userRole={userRole} onNavigate={(s, d) => { if (s === "activity-record") navigate("/activity/record"); else if (s === "activity-report") navigate("/activity-report"); else if (s === "badges") navigate("/badges"); else if (s === "detailactivity" && d) navigate(`/detailactivity/${d}`); else if (s === "edit-activity" && d) navigate(`/activity/edit/${d}`); else navigate("/activity-main"); }} /></RequireAuth>} />
              <Route path="/activity/record" element={<RequireAuth authed={authed}><RecordActivityScreen studentName={studentName} userRole={userRole} onNavigate={() => navigate("/activity-main")} /></RequireAuth>} />
              <Route path="/activity/edit/:id" element={<RequireAuth authed={authed}><EditActivityWrapper userId={userId} userRole={userRole} /></RequireAuth>} />
              <Route path="/activity-history" element={<RequireAuth authed={authed}><ActivityHistoryScreen onNavigate={(s, d) => navigate(d ? `/activity/${d}` : "/profile")} /></RequireAuth>} />
              <Route path="/activity/:id" element={<RequireAuth authed={authed}><ActivityDetailWrapper /></RequireAuth>} />
              <Route path="/detailactivity/:id" element={<RequireAuth authed={authed}><DetailActivityWrapper /></RequireAuth>} />
              <Route path="/activity-report" element={<RequireAuth authed={authed}><ActivityReportScreen onNavigate={() => navigate("/activity-main")} /></RequireAuth>} />
              <Route path="/badges" element={<RequireAuth authed={authed}><BadgeCollectionScreen onNavigate={(s) => navigate(s === "activity-main" ? "/activity-main" : "/profile")} /></RequireAuth>} />
              
              <Route path="/facility/:id" element={<RequireAuth authed={authed}><FacilityDetailsWrapper /></RequireAuth>} />
              <Route path="/facility/:id/time-slot" element={<RequireAuth authed={authed}><TimeSlotWrapper /></RequireAuth>} />
              <Route path="/booking/confirmation" element={<RequireAuth authed={authed}><BookingConfirmationWrapper /></RequireAuth>} />
              <Route path="/booking/success" element={<RequireAuth authed={authed}><BookingSuccessWrapper /></RequireAuth>} />
              <Route path="/my-bookings" element={<RequireAuth authed={authed}><MyBookingsScreen /></RequireAuth>} />
              <Route path="/settings/interface" element={<RequireAuth authed={authed}><InterfaceSettingsScreen onBack={() => navigate("/profile")} /></RequireAuth>} />
              <Route path="/settings/navbar" element={<RequireAuth authed={authed}><NavbarSettingsScreen onBack={() => navigate("/profile")} /></RequireAuth>} />

              <Route path="*" element={<Navigate to={authed ? "/home" : "/"} replace />} />
            </Routes>
          </div>
        </main>

        {showBottomNav && (
          <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        )}
      </div>
    </UserPreferencesProvider>
  );
}