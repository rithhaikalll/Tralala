// src/App.tsx
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

import { LoginScreen } from "./pages/LoginScreen";
import { RegisterScreen } from "./pages/RegisterScreen";
import { ResetPasswordRequestScreen } from "./pages/ResetPasswordRequestScreen";
import { ResetPasswordNewScreen } from "./pages/ResetPasswordNewScreen";
import { ResetLinkSentScreen } from "./pages/ResetLinkSentScreen";
import { HomeScreen, HomeScreenHeader } from "./pages/HomeScreen";
import { BottomNav } from "./pages/BottomNav";
import { ProfileScreen } from "./pages/ProfileScreen";
import { ActivityHistoryScreen } from "./pages/ActivityHistoryScreen";
import {
  ActivityDetailScreen,
  ActivityDetailHeader,
} from "./pages/ActivityDetailScreen";
import { ActivityMainScreen } from "./pages/ActivityMainScreen";
import { RecordActivityScreen } from "./pages/RecordActivityScreen";
import { EditActivityScreen } from "./pages/EditActivityScreen";
import { FacilityListScreen, BookListHeader } from "./pages/FacilityListScreen";
import {
  MyBookingsScreen,
  MyBookingsScreenHeader,
} from "./pages/MyBookingsScreen";
import {
  DiscussionScreen,
  DiscussionScreenHeader,
} from "./pages/DiscussionScreen";
import { DiscussionDetailScreen } from "./pages/DiscussionDetailScreen";
import { CreateDiscussionScreen } from "./pages/CreateDiscussionScreen";
import {
  FacilityDetailsScreen,
  FacilityDetailsHeader,
} from "./pages/FacilityDetailsScreen";
import { TimeSlotSelectionScreen } from "./pages/TimeSlotSelectionScreen";
import { BookingConfirmationScreen } from "./pages/BookingConfirmationScreen";
import { SuccessScreen } from "./pages/SuccessScreen";

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

function EditActivityWrapper({ userId }: { userId: string }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <EditActivityScreen
      activityId={id || ""}
      userId={userId}
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

  const hideBottomNav =
    location.pathname.startsWith("/facility") ||
    location.pathname.startsWith("/booking") ||
    location.pathname.startsWith("/discussion/create") ||
    location.pathname.match(/^\/discussion\/\d+$/) ||
    location.pathname.startsWith("/activity-history") ||
    location.pathname.match(/^\/activity\/[^/]+$/) || // /activity/:id
    location.pathname.startsWith("/activity/edit") || // /activity/edit/:id
    location.pathname.startsWith("/my-bookings"); // 🔴 hide on My Bookings

  const showBottomNav = authed && !hideBottomNav;

  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/discussion")) return "discussion";
    if (p.startsWith("/book") || p.startsWith("/facilities")) return "book";
    if (p.startsWith("/activity") || p.startsWith("/activity"))
      return "activity";
    if (p.startsWith("/profile")) return "profile";
    return "home";
  }, [location.pathname]);

  const [userId, setUserId] = useState<string>("");

  const handleLogin = async (name: string, id?: string) => {
    setStudentName(name || "Student");
    if (id) setUserId(id);
    setAuthed(true);
    navigate("/home", { replace: true });
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
    if (screen === "activity-main") navigate("activity-main");
    if (screen === "my-bookings") navigate("/my-bookings");
  };

  const handleNavigateFromDiscussion = (screen: string) => {
    if (screen === "create-discussion") navigate("/discussion/create");
  };

  const onTabChange = (tab: string) => {
    const map: Record<string, string> = {
      home: "/home",
      discussion: "/discussion",
      book: "/book",
      activity: "/activity",
      profile: "/profile",
    };
    navigate(map[tab] || "/home");
  };

  return (
    <div className="h-full w-full overflow-hidden">
      {/* Headers rendered at app level so they stay fixed */}
      {authed && isFacilityRoute && (
        <FacilityDetailsHeader onBack={() => navigate("/book")} />
      )}
      {authed && isBookRoute && <BookListHeader />}
      {authed && isHomeRoute && <HomeScreenHeader studentName={studentName} />}
      {authed && isDiscussionRoute && (
        <DiscussionScreenHeader onNavigate={handleNavigateFromDiscussion} />
      )}
      {authed && isUpcomingRoute && (
        <MyBookingsScreenHeader onBack={() => navigate("/home")} />
      )}
      {authed && isActivityDetailRoute && (
        <ActivityDetailHeader onBack={() => navigate("/activity-history")} />
      )}

      <main
        className={`content ${showBottomNav ? "with-bottom-nav" : ""} ${
          isProfileRoute
            ? "overflow-hidden"
            : isActivityDetailRoute
            ? "pt-4"
            : isFacilityRoute ||
              isBookRoute ||
              isHomeRoute ||
              isDiscussionRoute ||
              isUpcomingRoute
            ? "pt-[72px]"
            : ""
        }`}
      >
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              <LoginScreen
                onLogin={handleLogin}
                onNavigate={handleNavigateFromLogin}
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterScreen
                onNavigate={(path: string) => {
                  if (path === "login") navigate("/");
                }}
              />
            }
          />
          <Route
            path="/reset-password-request"
            element={
              <ResetPasswordRequestScreen
                onNavigate={(path: string) => {
                  if (path === "reset-link-sent") navigate("/reset-link-sent");
                  if (path === "login") navigate("/");
                }}
              />
            }
          />
          <Route
            path="/reset-link-sent"
            element={
              <ResetLinkSentScreen
                onNavigate={(path: string) => {
                  if (path === "login") navigate("/");
                }}
              />
            }
          />
          <Route
            path="/reset-password-new"
            element={
              <ResetPasswordNewScreen
                onNavigate={(path: string) => {
                  if (path === "login") navigate("/");
                }}
              />
            }
          />

          {/* Protected */}
          <Route
            path="/home"
            element={
              <RequireAuth authed={authed}>
                <HomeScreen
                  studentName={studentName}
                  onNavigate={handleNavigateFromHome}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/discussion"
            element={
              <RequireAuth authed={authed}>
                <DiscussionScreen
                  onNavigate={(screen, data) => {
                    if (screen === "create-discussion")
                      navigate("/discussion/create");
                    if (screen === "discussion-detail" && data)
                      navigate(`/discussion/${data}`);
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/discussion/create"
            element={
              <RequireAuth authed={authed}>
                <CreateDiscussionScreen
                  studentName={studentName}
                  onNavigate={(screen) => {
                    if (screen === "discussion") navigate("/discussion");
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/discussion/:id"
            element={
              <RequireAuth authed={authed}>
                <DiscussionDetailWrapper
                  studentName={studentName}
                  onNavigate={(screen) => {
                    if (screen === "discussion") navigate("/discussion");
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/book"
            element={
              <RequireAuth authed={authed}>
                <FacilityListScreen
                  onNavigate={(screen, data) => {
                    if (screen === "facility-details" && data)
                      navigate(`/facility/${data}`);
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/activity"
            element={<Navigate to="/activity-main" replace />}
          />

          <Route
            path="/activity-main"
            element={
              <RequireAuth authed={authed}>
                <ActivityMainScreen
                  userId={userId}
                  onNavigate={(screen, data) => {
                    if (screen === "profile") navigate("/profile");
                    if (screen === "activity-detail" && data)
                      navigate(`/activity/${data}`);
                    if (screen === "activity-record")
                      navigate("/activity/record");
                    if (screen === "edit-activity" && data)
                      navigate(`/activity/edit/${data}`);
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/activity/record"
            element={
              <RequireAuth authed={authed}>
                <RecordActivityScreen
                  studentName={studentName}
                  userId={userId}
                  onNavigate={(screen) => {
                    if (screen === "activity-main") navigate("/activity-main");
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/activity/edit/:id"
            element={
              <RequireAuth authed={authed}>
                <EditActivityWrapper userId={userId} />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth authed={authed}>
                <ProfileScreen
                  studentName={studentName}
                  onNavigate={(screen) => {
                    if (screen === "my-bookings") navigate("/my-bookings");
                    if (screen === "activity-history")
                      navigate("/activity-history");
                  }}
                  onLogout={() => {
                    setAuthed(false);
                    navigate("/", { replace: true });
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/activity-history"
            element={
              <RequireAuth authed={authed}>
                <ActivityHistoryScreen
                  onNavigate={(screen, data) => {
                    if (screen === "profile") navigate("/profile");
                    if (screen === "activity-detail" && data)
                      navigate(`/activity/${data}`);
                  }}
                />
              </RequireAuth>
            }
          />

          <Route
            path="/activity/:id"
            element={
              <RequireAuth authed={authed}>
                <ActivityDetailWrapper />
              </RequireAuth>
            }
          />

          <Route
            path="/facility/:id"
            element={
              <RequireAuth authed={authed}>
                <FacilityDetailsWrapper />
              </RequireAuth>
            }
          />

          <Route
            path="/facility/:id/time-slot"
            element={
              <RequireAuth authed={authed}>
                <TimeSlotWrapper />
              </RequireAuth>
            }
          />

          <Route
            path="/booking/confirmation"
            element={
              <RequireAuth authed={authed}>
                <BookingConfirmationWrapper />
              </RequireAuth>
            }
          />

          <Route
            path="/booking/success"
            element={
              <RequireAuth authed={authed}>
                <BookingSuccessWrapper />
              </RequireAuth>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <RequireAuth authed={authed}>
                <MyBookingsScreen />
              </RequireAuth>
            }
          />

          <Route
            path="*"
            element={<Navigate to={authed ? "/home" : "/"} replace />}
          />
        </Routes>
      </main>

      {(() => {
        const hide =
          location.pathname.startsWith("/facility") ||
          location.pathname.startsWith("/booking") ||
          location.pathname.startsWith("/discussion/create") ||
          location.pathname.match(/^\/discussion\/\d+$/) ||
          location.pathname.startsWith("/activity-history") ||
          location.pathname.match(/^\/activity\/[^/]+$/) || // /activity/:id
          location.pathname.startsWith("/activity/edit") || // /activity/edit/:id
          location.pathname.startsWith("/my-bookings"); // 🔴 also hide here

        const show = authed && !hide;
        return show ? (
          <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        ) : null;
      })()}
    </div>
  );
}
