import { useMemo, useState } from "react";
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

// 1. Import InterfaceSettingsScreen
import { InterfaceSettingsScreen } from "./pages/InterfaceSettingsScreen";

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
  return authed ? (children as any) : <Navigate to="/" replace />;
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [studentName, setStudentName] = useState<string>("Student");
  const [userRole, setUserRole] = useState<"student" | "staff">("student");

  const navigate = useNavigate();
  const location = useLocation();

  const isFacilityRoute = location.pathname.startsWith("/facility");
  const isBookRoute =
    location.pathname.startsWith("/book") &&
    !location.pathname.startsWith("/booking");
  const isHomeRoute = location.pathname === "/home";
  const isDiscussionRoute =
    location.pathname.startsWith("/discussion") &&
    !location.pathname.includes("/discussion/");
  const isUpcomingRoute = location.pathname === "/my-bookings";
  const isProfileRoute = location.pathname === "/profile";
  const isActivityDetailRoute =
    location.pathname.match(/^\/activity\/[^/]+$/) &&
    !location.pathname.startsWith("/activity/record");

  // Logic to hide navbar (Added interface settings route)
  const hideBottomNav =
    location.pathname.startsWith("/facility") ||
    location.pathname.startsWith("/booking") ||
    location.pathname.startsWith("/discussion/create") ||
    location.pathname.match(/^\/discussion\/[^/]+$/) ||
    location.pathname.startsWith("/activity-history") ||
    location.pathname.match(/^\/activity\/[^/]+$/) ||
    location.pathname.startsWith("/activity/edit") ||
    location.pathname.startsWith("/badges") ||
    location.pathname.startsWith("/staff-dashboard") ||
    location.pathname.startsWith("/settings/interface") || 
    location.pathname.startsWith("/my-bookings");

  const showBottomNav = authed && !hideBottomNav;

  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/discussion")) return "discussion";
    if (p.startsWith("/book") || p.startsWith("/facilities")) return "book";
    if (p.startsWith("/activity") || p.startsWith("/detailactivity"))
      return "activity";
    if (p.startsWith("/profile")) return "profile";
    return "home";
  }, [location.pathname]);

  const [userId, setUserId] = useState<string>("");

  const handleLogin = async (name: string, id?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const role = (user?.user_metadata?.role as "student" | "staff") || "student";
    const displayName =
      (user?.user_metadata?.fullName as string) || name || "User";

    setStudentName(displayName);
    setUserRole(role);

    if (id || user?.id) {
      setUserId((id || user?.id) as string);
    } else {
      console.warn("Warning: user ID is missing");
      setUserId("");
    }

    setAuthed(true);

    if (role === "staff") {
      navigate("/staff-dashboard", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  };

  const handleNavigateFromLogin = (path: string) => {
    if (path === "register") navigate("/register");
    if (path === "reset-password-request") navigate("/reset-password-request");
  };

  const handleNavigateFromHome = (screen: string, data?: string) => {
    if (screen === "book") navigate("/book");
    if (screen === "discussion") navigate("/discussion");
    if (screen === "facility-details" && data) navigate(`/facility/${data}`);
    if (screen === "activity-record") navigate("/activity/record");
    if (screen === "activity-report") navigate("/activity-report");
    if (screen === "activity-main") navigate("/activity-main");
    if (screen === "my-bookings") navigate("/my-bookings");
  };

  const onTabChange = (tab: string) => {
    const map: Record<string, string> = {
      home: "/home",
      discussion: "/discussion",
      book: "/book",
      activity: "/activity-main", // Ensure it goes to main screen
      profile: "/profile",
    };
    navigate(map[tab] || "/home");
  };

  return (
    <UserPreferencesProvider>
      <div className="h-full w-full overflow-hidden bg-[--bg-primary)] text-[--text-primary)] transition-colors duration-300">
        
        {authed && isFacilityRoute && (
          <FacilityDetailsHeader onBack={() => navigate("/book")} />
        )}
        {authed && isBookRoute && <BookListHeader />}
        {authed && isHomeRoute && <HomeScreenHeader studentName={studentName} />}
        {authed && isDiscussionRoute && (
          <DiscussionScreenHeader onNavigate={(screen) => navigate("/discussion/create")} />
        )}
        {authed && isUpcomingRoute && (
          <MyBookingsScreenHeader onBack={() => navigate("/home")} />
        )}
        {authed && isActivityDetailRoute && (
          <ActivityDetailHeader onBack={() => navigate("/activity-history")} />
        )}

        <main
          className={`content ${showBottomNav ? "with-bottom-nav" : ""} ${
            isProfileRoute || location.pathname.startsWith("/settings/")
              ? "overflow-hidden"
              : isActivityDetailRoute
              ? "pt-4"
              : isFacilityRoute ||
                isBookRoute ||
                isHomeRoute ||
                isDiscussionRoute ||
                isUpcomingRoute
              ? "pt-18"
              : ""
          }`}
        >
          <Routes>
            <Route path="/" element={<LoginScreen onLogin={handleLogin} onNavigate={handleNavigateFromLogin} />} />
            <Route path="/register" element={<RegisterScreen onNavigate={(path) => navigate(path === "login" ? "/" : "/register")} />} />
            <Route path="/reset-password-request" element={<ResetPasswordRequestScreen onNavigate={(path) => navigate(path)} />} />
            <Route path="/reset-link-sent" element={<ResetLinkSentScreen onNavigate={(path) => navigate(path)} />} />
            <Route path="/reset-password-new" element={<ResetPasswordNewScreen onNavigate={(path) => navigate(path)} />} />

            {/* Protected */}
            <Route path="/home" element={<RequireAuth authed={authed}><HomeScreen studentName={studentName} onNavigate={handleNavigateFromHome} /></RequireAuth>} />
            <Route path="/discussion" element={<RequireAuth authed={authed}><DiscussionScreen onNavigate={(screen, data) => navigate(data ? `/discussion/${data}` : "/discussion/create")} /></RequireAuth>} />
            <Route path="/discussion/create" element={<RequireAuth authed={authed}><CreateDiscussionScreen studentName={studentName} onNavigate={() => navigate("/discussion")} /></RequireAuth>} />
            <Route path="/discussion/:id" element={<RequireAuth authed={authed}><DiscussionDetailWrapper studentName={studentName} onNavigate={() => navigate("/discussion")} /></RequireAuth>} />
            <Route path="/book" element={<RequireAuth authed={authed}><FacilityListScreen onNavigate={(screen, data) => navigate(`/facility/${data}`)} /></RequireAuth>} />
            
            {/* Added: Interface Settings Route */}
            <Route path="/settings/interface" element={<RequireAuth authed={authed}><InterfaceSettingsScreen onBack={() => navigate("/profile")} /></RequireAuth>} />

            <Route path="/activity-main" element={<RequireAuth authed={authed}><ActivityMainScreen userId={userId} userRole={userRole} onNavigate={(screen, data) => navigate(data ? `/${screen}/${data}` : `/${screen}`)} /></RequireAuth>} />
            <Route path="/activity/record" element={<RequireAuth authed={authed}><RecordActivityScreen studentName={studentName} userRole="student" onNavigate={() => navigate("/activity-main")} /></RequireAuth>} />
            <Route path="/activity/edit/:id" element={<RequireAuth authed={authed}><EditActivityWrapper userId={userId} userRole={userRole} /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth authed={authed}><ProfileScreen studentName={studentName} onNavigate={(screen) => navigate(screen === "settings/interface" ? "/settings/interface" : `/${screen}`)} onLogout={() => { setAuthed(false); navigate("/", { replace: true }); }} /></RequireAuth>} />
            <Route path="/activity-history" element={<RequireAuth authed={authed}><ActivityHistoryScreen onNavigate={(screen, data) => navigate(data ? `/activity/${data}` : "/profile")} /></RequireAuth>} />
            <Route path="/activity/:id" element={<RequireAuth authed={authed}><ActivityDetailWrapper /></RequireAuth>} />
            <Route path="/detailactivity/:id" element={<RequireAuth authed={authed}><DetailActivityWrapper /></RequireAuth>} />
            <Route path="/activity-report" element={<RequireAuth authed={authed}><ActivityReportScreen onNavigate={() => navigate("/activity-main")} /></RequireAuth>} />
            <Route path="/badges" element={<RequireAuth authed={authed}><BadgeCollectionScreen onNavigate={(screen) => navigate(screen === "activity-main" ? "/activity-main" : "/profile")} /></RequireAuth>} />
            <Route path="/facility/:id" element={<RequireAuth authed={authed}><FacilityDetailsWrapper /></RequireAuth>} />
            <Route path="/facility/:id/time-slot" element={<RequireAuth authed={authed}><TimeSlotWrapper /></RequireAuth>} />
            <Route path="/booking/confirmation" element={<RequireAuth authed={authed}><BookingConfirmationWrapper /></RequireAuth>} />
            <Route path="/booking/success" element={<RequireAuth authed={authed}><BookingSuccessWrapper /></RequireAuth>} />
            <Route path="/my-bookings" element={<RequireAuth authed={authed}><MyBookingsScreen /></RequireAuth>} />
            <Route path="/staff-dashboard" element={<RequireAuth authed={authed}><StaffCheckInDashboardScreen staffName={studentName} onNavigate={() => {}} onLogout={async () => { await supabase.auth.signOut(); setAuthed(false); navigate("/", { replace: true }); }} /></RequireAuth>} />

            <Route path="*" element={<Navigate to={authed ? "/home" : "/"} replace />} />
          </Routes>
        </main>

        {showBottomNav && (
          <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        )}
      </div>
    </UserPreferencesProvider>
  );
}