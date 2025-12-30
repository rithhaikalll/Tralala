import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "./lib/supabaseClient";
import { UserPreferencesProvider } from "./lib/UserPreferencesContext";
import { Toaster } from "sonner";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

// ... (Keep all your existing imports)
import { LoginScreen } from "./pages/Authentication/LoginScreen";
import { RegisterScreen } from "./pages/Authentication/RegisterScreen";
import { ResetPasswordRequestScreen } from "./pages/Authentication/ResetPasswordRequestScreen";
import { ResetPasswordNewScreen } from "./pages/Authentication/ResetPasswordNewScreen";
import { ResetLinkSentScreen } from "./pages/Authentication/ResetLinkSentScreen";
import { HomeScreen, HomeScreenHeader } from "./pages/StudentDashboard";
import { StaffCheckInDashboardScreen } from "./pages/StaffDashboard";
// Import the Admin Dashboard
import { AdminDashboard } from "./pages/AdminDashboard";

import { BottomNav } from "./pages/BottomNav";
import { ProfileScreen } from "./pages/ProfileScreen";
import { EditProfileScreen } from "./pages/EditProfileScreen";
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

import { FacilityComplaintsScreen } from "./pages/Facility/FacilityComplaintsScreen";
import { ComplaintDetailScreen } from "./pages/Facility/ComplaintDetailScreen";
import { SubmitComplaintScreen } from "./pages/Facility/SubmitComplaintScreen";
import { StaffComplaintsScreen } from "./pages/Facility/StaffComplaintsScreen";
import { StaffComplaintDetailScreen } from "./pages/Facility/StaffComplaintDetailScreen";

import {
  listStudentComplaints,
  listStaffComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintAsStaff,
} from "./lib/complaints";


// ... (Keep wrapper functions defined here) ...
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
  return (
    <FacilityDetailsScreen
      facilityId={id || ""}
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
  const navigate = useNavigate();
  return (
    <TimeSlotSelectionScreen
      facilityId={id || ""}
      onNavigate={(screen, data) => {
        if (screen === "booking-confirmation")
          navigate(`/booking/confirmation`, { state: data });
        if (screen === "facility-details") navigate(`/facility/${id}`);
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
        if (screen === "time-slot")
          navigate(`/facility/${facilityId}/time-slot`);
        if (screen === "success") navigate("/booking/success", { state: data });
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

function EditActivityWrapper({
  userId,
  userRole,
}: {
  userId: string;
  userRole: "student" | "staff";
}) {
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

function StudentComplaintsWrapper() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await listStudentComplaints();
        setComplaints(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <FacilityComplaintsScreen
      complaints={complaints}
      onUpdateComplaints={(next) => setComplaints(next)}
      onNavigate={(screen, data) => {
        if (screen === "profile") navigate("/profile");
        if (screen === "submit-complaint") navigate("/submit-complaint");
        if (screen === "complaint-detail") navigate(`/complaint/${data?.complaint?.id}`);
      }}
    />
  );
}

function StudentComplaintDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const row = await getComplaintById(id || "");
        setComplaint(row ? {
          id: row.id,
          facilityName: row.facility_name,
          title: row.title,
          category: row.category,
          description: row.description,
          status: row.status,
          submittedDate: new Date(row.created_at).toLocaleDateString(),
          photoEvidence: row.photo_url || undefined,
          staffRemarks: row.staff_remarks || undefined,
        } : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!complaint) return <div className="p-6">Complaint not found</div>;

  return (
    <ComplaintDetailScreen
      complaint={complaint}
      onNavigate={(screen) => {
        if (screen === "facility-complaints") navigate("/facility-complaints");
      }}
    />
  );
}

function SubmitComplaintWrapper() {
  const navigate = useNavigate();

  return (
    <SubmitComplaintScreen
      onNavigate={(screen) => {
        if (screen === "facility-complaints") navigate("/facility-complaints");
      }}
      onSubmitComplaint={async (payload) => {
        await createComplaint(payload);
      }}
    />
  );
}

function StaffComplaintsWrapper() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await listStaffComplaints();
        setComplaints(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <StaffComplaintsScreen
      complaints={complaints}
      onNavigate={(screen, data) => {
        if (screen === "staff-checkin-dashboard") navigate("/home");
        if (screen === "staff-complaint-detail")
          navigate(`/staff/complaints/${data?.complaint?.id}`);
      }}
    />
  );
}

function StaffComplaintDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const row = await getComplaintById(id || "");
        setComplaint(row ? {
          id: row.id,
          studentName: row.student_name || "—",
          studentId: row.student_matric_id || "—",
          facilityName: row.facility_name,
          title: row.title,
          category: row.category,
          description: row.description,
          status: row.status,
          submittedDate: new Date(row.created_at).toLocaleDateString(),
          photoEvidence: row.photo_url || undefined,
          staffRemarks: row.staff_remarks || undefined,
          priority: row.priority || "Medium",
          assignedTo: row.assigned_to || "",
        } : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!complaint) return <div className="p-6">Complaint not found</div>;

  return (
    <StaffComplaintDetailScreen
      complaint={complaint}
      onNavigate={(screen) => {
        if (screen === "staff-complaints") navigate("/staff-complaints");
      }}
      onUpdateComplaint={async (updated) => {
        await updateComplaintAsStaff(updated.id, {
          status: updated.status,
          staffRemarks: updated.staffRemarks,
          priority: updated.priority,
          assignedTo: updated.assignedTo,
        });
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
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // UPDATED: Added "admin" to role type
  const [userRole, setUserRole] = useState<"student" | "staff" | "admin">(
    "student"
  );
  const [userId, setUserId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>(
    localStorage.getItem("utm-student-id") || ""
  );

  const navigate = useNavigate();
  const location = useLocation();

  // Helper to fetch all necessary data centrally
  const fetchUserData = async (uid: string, role: string) => {
    // 1. Fetch editable details (profile_details) for Picture and Custom Name
    const { data: details } = await supabase
      .from("profile_details")
      .select("full_name, profile_picture_url")
      .eq("user_id", uid)
      .maybeSingle();

    // 2. Fetch core identity
    let coreName = "User";
    let matric = "";

    if (role === "staff") {
      const { data } = await supabase
        .from("staff_profiles")
        .select("full_name")
        .eq("user_id", uid)
        .maybeSingle();
      if (data) coreName = data.full_name;
    } else if (role === "admin") {
      // Fallback for Admin
      coreName = "Admin";
      if (details?.full_name) coreName = details.full_name;
    } else {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, matric_id")
        .eq("id", uid)
        .maybeSingle();
      if (data) {
        coreName = data.full_name;
        matric = data.matric_id || "";
      }
    }

    // Prioritize edited name, fallback to core name
    setStudentName(details?.full_name || coreName);
    // Set profile picture globally
    setProfilePicture(details?.profile_picture_url || null);

    if (matric) {
      setStudentId(matric);
      localStorage.setItem("utm-student-id", matric);
    } else if (role === "staff") {
      setStudentId("Staff");
    } else if (role === "admin") {
      setStudentId("Admin");
    }
  };

  useEffect(() => {
    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const role =
          (session.user.user_metadata?.role as "student" | "staff" | "admin") ||
          "student";
        setUserId(session.user.id);
        setUserRole(role);
        setAuthed(true);
        fetchUserData(session.user.id, role);
      }
    };
    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        const role =
          (session.user.user_metadata?.role as "student" | "staff" | "admin") ||
          "student";
        setUserRole(role);
        setAuthed(true);
        fetchUserData(session.user.id, role);
      } else {
        setAuthed(false);
        localStorage.removeItem("utm-student-id");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // UPDATED: Hide bottom nav if role is ADMIN (Admin has its own internal nav)
  const hideBottomNav =
    userRole === "admin" ||
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
    location.pathname === "/edit-profile" ||
    location.pathname.startsWith("/my-bookings") ||
    location.pathname === "/admin-dashboard" ||
    location.pathname.startsWith("/facility-complaints") ||
location.pathname.startsWith("/submit-complaint") ||
location.pathname.startsWith("/complaint/") ||
location.pathname.startsWith("/staff-complaints") ||
location.pathname.startsWith("/staff/complaints/")


  const showBottomNav = authed && !hideBottomNav;

  // UPDATED: Header Logic
  const hasHeader =
    authed &&
    userRole !== "admin" &&
    ((location.pathname.startsWith("/facility") &&
      !location.pathname.startsWith("/facility-complaints")) ||
      location.pathname.startsWith("/book") ||
      (location.pathname === "/home" && userRole === "student") ||
      (location.pathname.startsWith("/discussion") &&
        !location.pathname.includes("/discussion/")) ||
      location.pathname === "/my-bookings" ||
      (location.pathname.match(/^\/activity\/[^/]+$/) &&
        !location.pathname.startsWith("/activity/record")));

  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/discussion")) return "discussion";
    if (
      p.startsWith("/book") ||
      p.startsWith("/facilities") ||
      p.startsWith("/facility")
    )
      return "book";
    if (
      p.startsWith("/activity") ||
      p.startsWith("/detailactivity") ||
      p.startsWith("/badges") ||
      p.startsWith("/activity-main")
    )
      return "activity";
    if (p.startsWith("/profile") || p === "/edit-profile") return "profile";
    return "home";
  }, [location.pathname]);

  const handleLogin = async (name: string, id?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const role =
      (user?.user_metadata?.role as "student" | "staff" | "admin") || "student";
    fetchUserData(user?.id || "", role);
    setStudentName(name);
    setUserRole(role);
    setUserId(user?.id || id || "");
    setAuthed(true);

    // UPDATED: Redirect Admin to specific dashboard
    if (role === "admin") {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    localStorage.removeItem("utm-student-id");
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

  // Fixed: Removed unused parameter
  const handleProfileUpdate = () => {
    fetchUserData(userId, userRole);
  };

  return (
    <UserPreferencesProvider>
      <Toaster position="top-center" richColors />
      <div className="h-full w-full bg-[--bg-primary)] text-[--text-primary)] transition-colors duration-300 flex flex-col overflow-hidden">
        {hasHeader && (
          <header className="fixed-header-top">
            {location.pathname === "/home" && userRole === "student" && (
              <HomeScreenHeader studentName={studentName} />
            )}
            {location.pathname.startsWith("/facility") &&
              !location.pathname.startsWith("/facility-complaints") && (
                <FacilityDetailsHeader onBack={() => navigate("/book")} />
              )}
            {location.pathname.startsWith("/book") && <BookListHeader />}
            {location.pathname.startsWith("/discussion") &&
              !location.pathname.includes("/discussion/") && (
                <DiscussionScreenHeader
                  onNavigate={() => navigate("/discussion/create")}
                />
              )}
            {location.pathname === "/my-bookings" && (
              <MyBookingsScreenHeader onBack={() => navigate("/home")} />
            )}
            {location.pathname.match(/^\/activity\/[^/]+$/) &&
              !location.pathname.startsWith("/activity/record") && (
                <ActivityDetailHeader
                  onBack={() => navigate("/activity-history")}
                />
              )}
          </header>
        )}

        <main
          className={`content flex-1 overflow-y-auto bg-[--bg-primary)] ${
            showBottomNav ? "with-bottom-nav" : ""
          }`}
          style={{ paddingTop: hasHeader ? "70px" : "0px", minHeight: "100%" }}
        >
          <div className="flex-1 flex flex-col w-full bg-[--bg-primary)]">
            <Routes>
              {/* ... (Auth Routes) ... */}
              <Route
                path="/"
                element={
                  <LoginScreen
                    onLogin={handleLogin}
                    onNavigate={(p) =>
                      navigate(
                        p === "register"
                          ? "/register"
                          : "/reset-password-request"
                      )
                    }
                  />
                }
              />
              <Route
                path="/register"
                element={
                  <RegisterScreen
                    onNavigate={(p) =>
                      navigate(p === "login" ? "/" : "/register")
                    }
                  />
                }
              />
              <Route
                path="/reset-password-request"
                element={
                  <ResetPasswordRequestScreen onNavigate={(p) => navigate(p)} />
                }
              />
              <Route
                path="/reset-link-sent"
                element={
                  <ResetLinkSentScreen onNavigate={(p) => navigate(p)} />
                }
              />
              <Route
                path="/reset-password-new"
                element={
                  <ResetPasswordNewScreen onNavigate={(p) => navigate(p)} />
                }
              />

              {/* UPDATED: Admin Route */}
              <Route
                path="/admin-dashboard"
                element={
                  <RequireAuth authed={authed}>
                    <AdminDashboard
                      onNavigate={(screen) => navigate(screen)}
                      onLogout={handleLogout}
                    />
                  </RequireAuth>
                }
              />

              <Route
                path="/home"
                element={
                  <RequireAuth authed={authed}>
                    {userRole === "staff" ? (
                      <StaffCheckInDashboardScreen
                        staffName={studentName}
                        onNavigate={(p) => navigate(p)}
                        onLogout={handleLogout}
                      />
                    ) : userRole === "admin" ? (
                      <Navigate to="/admin-dashboard" replace />
                    ) : (
                      <HomeScreen
                        studentName={studentName}
                        onNavigate={(s, d) => {
                          if (s === "book") navigate("/book");
                          if (s === "discussion") navigate("/discussion");
                          if (s === "facility-details" && d)
                            navigate(`/facility/${d}`);
                          if (s === "activity-record")
                            navigate("/activity/record");
                          if (s === "activity-main") navigate("/activity-main");
                          if (s === "my-bookings") navigate("/my-bookings");
                        }}
                      />
                    )}
                  </RequireAuth>
                }
              />

              <Route
                path="/discussion"
                element={
                  <RequireAuth authed={authed}>
                    <DiscussionScreen
                      onNavigate={(s, d) =>
                        navigate(d ? `/discussion/${d}` : "/discussion/create")
                      }
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
                      onNavigate={() => navigate("/discussion")}
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
                      onNavigate={() => navigate("/discussion")}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/book"
                element={
                  <RequireAuth authed={authed}>
                    <FacilityListScreen
                      onNavigate={(s, d) => navigate(`/facility/${d}`)}
                    />
                  </RequireAuth>
                }
              />

              <Route
                path="/profile"
                element={
                  <RequireAuth authed={authed}>
                    <ProfileScreen
                      studentName={studentName}
                      profilePictureUrl={profilePicture}
                      studentId={studentId}
                      userRole={userRole as "student" | "staff"}
                      onNavigate={(s) =>
                        navigate(s.startsWith("settings/") ? `/${s}` : `/${s}`)
                      }
                      onLogout={handleLogout}
                    />
                  </RequireAuth>
                }
              />

              <Route
                path="/edit-profile"
                element={
                  <RequireAuth authed={authed}>
                    <EditProfileScreen
                      userId={userId}
                      userRole={userRole as "student" | "staff"}
                      studentId={studentId}
                      onNavigate={(s) => navigate(`/${s}`)}
                      onSaveProfile={handleProfileUpdate}
                    />
                  </RequireAuth>
                }
              />

              <Route
                path="/activity-main"
                element={
                  <RequireAuth authed={authed}>
                    <ActivityMainScreen
                      userId={userId}
                      userRole={userRole as "student" | "staff"}
                      onNavigate={(s, d) => {
                        if (s === "activity-record")
                          navigate("/activity/record");
                        else if (s === "activity-report")
                          navigate("/activity-report");
                        else if (s === "badges") navigate("/badges");
                        else if (s === "detailactivity" && d)
                          navigate(`/detailactivity/${d}`);
                        else if (s === "edit-activity" && d)
                          navigate(`/activity/edit/${d}`);
                        else navigate("/activity-main");
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
                      userRole={userRole as "student" | "staff"}
                      onNavigate={() => navigate("/activity-main")}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/activity/edit/:id"
                element={
                  <RequireAuth authed={authed}>
                    <EditActivityWrapper
                      userId={userId}
                      userRole={userRole as "student" | "staff"}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/activity-history"
                element={
                  <RequireAuth authed={authed}>
                    <ActivityHistoryScreen
                      onNavigate={(s, d) =>
                        navigate(d ? `/activity/${d}` : "/profile")
                      }
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
                path="/detailactivity/:id"
                element={
                  <RequireAuth authed={authed}>
                    <DetailActivityWrapper />
                  </RequireAuth>
                }
              />
              <Route
                path="/activity-report"
                element={
                  <RequireAuth authed={authed}>
                    <ActivityReportScreen
                      onNavigate={() => navigate("/activity-main")}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/badges"
                element={
                  <RequireAuth authed={authed}>
                    <BadgeCollectionScreen
                      onNavigate={(s) =>
                        navigate(
                          s === "activity-main" ? "/activity-main" : "/profile"
                        )
                      }
                    />
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
                path="/settings/interface"
                element={
                  <RequireAuth authed={authed}>
                    <InterfaceSettingsScreen
                      onBack={() => navigate("/profile")}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings/navbar"
                element={
                  <RequireAuth authed={authed}>
                    <NavbarSettingsScreen onBack={() => navigate("/profile")} />
                  </RequireAuth>
                }
              />
              <Route
                path="*"
                element={<Navigate to={authed ? "/home" : "/"} replace />}
              />

            <Route
  path="/facility-complaints"
  element={
    <RequireAuth authed={authed}>
      <StudentComplaintsWrapper />
    </RequireAuth>
  }
/>

<Route
  path="/submit-complaint"
  element={
    <RequireAuth authed={authed}>
      <SubmitComplaintWrapper />
    </RequireAuth>
  }
/>

<Route
  path="/complaint/:id"
  element={
    <RequireAuth authed={authed}>
      <StudentComplaintDetailWrapper />
    </RequireAuth>
  }
/>

<Route
  path="/staff-complaints"
  element={
    <RequireAuth authed={authed}>
      <StaffComplaintsWrapper />
    </RequireAuth>
  }
/>

<Route
  path="/staff/complaints/:id"
  element={
    <RequireAuth authed={authed}>
      <StaffComplaintDetailWrapper />
    </RequireAuth>
  }
/>
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
