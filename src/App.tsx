import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "./lib/supabaseClient";
import { UserPreferencesProvider } from "./lib/UserPreferencesContext";
import { Toaster, toast } from "sonner";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

// --- IMPORTS ---
import { LoginScreen } from "./pages/Authentication/LoginScreen";
import { RegisterScreen } from "./pages/Authentication/RegisterScreen";
import { ResetPasswordRequestScreen } from "./pages/Authentication/ResetPasswordRequestScreen";
import { ResetPasswordNewScreen } from "./pages/Authentication/ResetPasswordNewScreen";
import { ResetLinkSentScreen } from "./pages/Authentication/ResetLinkSentScreen";
import { HomeScreen, HomeScreenHeader } from "./pages/StudentDashboard";
import { StaffCheckInDashboardScreen } from "./pages/StaffDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { BottomNav } from "./pages/BottomNav";
import { ProfileScreen } from "./pages/ProfileScreen";
import { EditProfileScreen } from "./pages/EditProfileScreen";

import { ActivityHistoryScreen } from "./pages/Activity Tracking/ActivityHistoryScreen";
import { ActivityDetailScreen, ActivityDetailHeader } from "./pages/Activity Tracking/ActivityDetailScreen";
import { ActivityMainScreen } from "./pages/Activity Tracking/ActivityMainScreen";
import { RecordActivityScreen } from "./pages/Activity Tracking/RecordActivityScreen";
import { EditActivityScreen } from "./pages/Activity Tracking/EditActivityScreen";
import DetailActivityScreen from "./pages/Activity Tracking/DetailActivityScreen";
import { ActivityReportScreen } from "./pages/Activity Tracking/ActivityReportScreen";
import { BadgeCollectionScreen } from "./pages/Activity Tracking/ActivityBadgeScreen";
import { ActivityEventsScreen } from "./pages/Activity Tracking/ActivityEventScreen";
import { CreateEventScreen } from "./pages/Activity Tracking/CreateEventScreen";
import EventDetailsScreen from "./pages/Activity Tracking/EventDetailsScreen";
import { EventRemindersScreen } from "./pages/Activity Tracking/EventReminderScreen";

import { FacilityListScreen, BookListHeader } from "./pages/Facility/FacilityListScreen";
import { MyBookingsScreen, MyBookingsScreenHeader } from "./pages/Facility/MyBookingsScreen";
import { FacilityDetailsScreen, FacilityDetailsHeader } from "./pages/Facility/FacilityDetailsScreen";
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

import { CommunityScreen } from "./pages/Community/CommunityScreen";
import { DiscussionScreen, DiscussionScreenHeader } from "./pages/Community/DiscussionScreen";
import { DiscussionDetailScreen } from "./pages/Community/DiscussionDetailScreen";
import { CreateDiscussionScreen } from "./pages/Community/CreateDiscussionScreen";

import { NewsFeedScreen } from "./pages/Community/NewsFeedScreen";
import { CreateNewsPostScreen } from "./pages/Community/CreateNewsPostScreen";
import { NewsPostDetailScreen } from "./pages/Community/NewsPostDetailScreen";
import { EditNewsPostScreen } from "./pages/Community/EditNewsPostScreen";

import { MarketplaceScreen } from "./pages/Community/MarketplaceScreen";
import { CreateListingScreen } from "./pages/Community/CreateListingScreen";
import { MarketplaceItemDetailScreen } from "./pages/Community/MarketplaceItemDetailScreen";

import { BuddyHubScreen } from "./pages/Community/BuddyHubScreen";
import { FindBuddyScreen } from "./pages/Community/FindBuddyScreen";
import { BuddyRequestsScreen } from "./pages/Community/BuddyRequestsScreen";
import { MyBuddiesScreen } from "./pages/Community/MyBuddyScreen"; // Ensure correct filename

import { listStudentComplaints, listStaffComplaints, getComplaintById, createComplaint, updateComplaintAsStaff } from "./lib/complaints";

// --- WRAPPERS ---

const useBuddyData = (userId: string) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [connectedBuddies, setConnectedBuddies] = useState<any[]>([]);
  
  const refresh = async () => {
    if (!userId) return;

    const { data: reqs } = await supabase
      .from("buddy_requests")
      .select(`
        id,
        status,
        created_at,
        requester_id,
        recipient_id,
        requester:profiles!requester_id(id, full_name, matric_id, faculty, year, favorite_sports),
        recipient:profiles!recipient_id(id, full_name, matric_id, faculty, year, favorite_sports)
      `)
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    if (reqs) {
      const mappedRequests = reqs.map((r: any) => ({
        id: r.id,
        requesterId: r.requester_id === userId ? r.recipient?.matric_id : r.requester?.matric_id, 
        requesterName: r.requester_id === userId ? r.recipient?.full_name : r.requester?.full_name,
        recipientId: r.recipient_id === userId ? "You" : r.recipient?.matric_id,
        status: r.status,
        createdAt: r.created_at,
        isIncoming: r.recipient_id === userId
      }));
      setRequests(mappedRequests);

      const connected = reqs
        .filter((r: any) => r.status === "Accepted")
        .map((r: any) => {
          const buddyProfile = r.requester_id === userId ? r.recipient : r.requester;
          return {
            id: buddyProfile?.id,
            userId: buddyProfile?.matric_id,
            name: buddyProfile?.full_name,
            faculty: buddyProfile?.faculty || "Unknown Faculty",
            year: buddyProfile?.year || "Unknown Year",
            favoriteSports: buddyProfile?.favorite_sports || [],
            connectedSince: r.created_at
          };
        });
      setConnectedBuddies(connected);
    }
  };

  useEffect(() => { refresh(); }, [userId]);
  return { requests, connectedBuddies, refresh };
};

function DiscussionDetailWrapper({ onNavigate, studentName }: any) { const { id } = useParams(); return <DiscussionDetailScreen postId={id || ""} onNavigate={onNavigate} studentName={studentName} />; }
function NewsDetailWrapper({ userRole, onNavigate }: any) { const { id } = useParams(); return <NewsPostDetailScreen postId={id || ""} userRole={userRole} onNavigate={onNavigate} />; }
function EditNewsWrapper({ onNavigate }: any) { const { id } = useParams(); return <EditNewsPostScreen postId={id || ""} onNavigate={onNavigate} />; }
function MarketplaceDetailWrapper({ userId, onNavigate }: any) { 
  const { id } = useParams(); const [item, setItem] = useState<any>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const fetchItem = async () => { const { data } = await supabase.from("marketplace_listings").select("*").eq("id", id).single(); setItem(data); setLoading(false); }; if (id) fetchItem(); }, [id]);
  if (loading) return <div className="p-6">Loading...</div>; if (!item) return <div className="p-6">Item not found</div>;
  return <MarketplaceItemDetailScreen item={item} onNavigate={onNavigate} isFavourite={false} onToggleFavourite={() => {}} isOwner={item.seller_id === userId} onCreateMarketplaceChat={() => {}} />;
}

function ActivityDetailWrapper() { const { id } = useParams(); const navigate = useNavigate(); return <ActivityDetailScreen activityId={id || ""} onNavigate={(s) => { if (s === "activity-history") navigate("/activity-history"); }} />; }
function FacilityDetailsWrapper() { const { id } = useParams(); const navigate = useNavigate(); return <FacilityDetailsScreen facilityId={id || ""} onNavigate={(s, data) => { if (s === "time-slot") navigate(`/facility/${data}/time-slot`); if (s === "book") navigate("/book"); }} />; }
function TimeSlotWrapper() { const { id } = useParams(); const navigate = useNavigate(); return <TimeSlotSelectionScreen facilityId={id || ""} onNavigate={(s, data) => { if (s === "booking-confirmation") navigate(`/booking/confirmation`, { state: data }); if (s === "facility-details") navigate(`/facility/${id}`); }} />; }
function BookingConfirmationWrapper() { const location = useLocation(); const navigate = useNavigate(); return <BookingConfirmationScreen bookingData={location.state || null} onNavigate={(s, data) => { if (s === "time-slot") navigate(-1); if (s === "success") navigate("/booking/success", { state: data }); }} />; }
function BookingSuccessWrapper() { const location = useLocation(); const navigate = useNavigate(); return <SuccessScreen bookingData={location.state || {}} onNavigate={(s) => { if (s === "upcoming" || s === "my-bookings") navigate("/my-bookings"); if (s === "home") navigate("/home"); }} />; }
function EditActivityWrapper({ userId, userRole }: any) { const { id } = useParams(); const navigate = useNavigate(); return <EditActivityScreen activityId={id || ""} userId={userId} userRole={userRole} onNavigate={() => navigate("/activity-main")} />; }
function DetailActivityWrapper() { const { id } = useParams(); const navigate = useNavigate(); return <DetailActivityScreen activityId={id || ""} onNavigate={() => navigate("/activity-main")} />; }
function EventDetailWrapper({ userId, userRole }: any) { const { id } = useParams(); const navigate = useNavigate(); return <EventDetailsScreen eventId={id || ""} userId={userId} userRole={userRole} onNavigate={() => navigate("/activity-events")} />; }
function StudentComplaintsWrapper() { const navigate = useNavigate(); const [loading, setLoading] = useState(true); const [complaints, setComplaints] = useState([]); useEffect(() => { (async () => { const list = await listStudentComplaints(); setComplaints(list); setLoading(false); })(); }, []); if (loading) return <div>Loading...</div>; return <FacilityComplaintsScreen complaints={complaints} onUpdateComplaints={setComplaints} onNavigate={(s, d) => { if (s === "submit-complaint") navigate("/submit-complaint"); if (s === "complaint-detail") navigate(`/complaint/${d.complaint.id}`); if (s === "profile") navigate("/profile"); }} />; }
function SubmitComplaintWrapper() { const navigate = useNavigate(); return <SubmitComplaintScreen onNavigate={() => navigate("/facility-complaints")} onSubmitComplaint={createComplaint} />; }
function StudentComplaintDetailWrapper() { const { id } = useParams(); const navigate = useNavigate(); const [c, setC] = useState<any>(null); useEffect(() => { (async () => { const row = await getComplaintById(id || ""); setC(row); })(); }, [id]); if (!c) return <div>Loading...</div>; return <ComplaintDetailScreen complaint={{ id: c.id, facilityName: c.facility_name, title: c.title, category: c.category, description: c.description, status: c.status, submittedDate: new Date(c.created_at).toLocaleDateString(), photoEvidence: c.photo_url, staffRemarks: c.staff_remarks }} onNavigate={() => navigate("/facility-complaints")} />; }
function StaffComplaintsWrapper() { const navigate = useNavigate(); const [loading, setLoading] = useState(true); const [complaints, setComplaints] = useState([]); useEffect(() => { (async () => { const list = await listStaffComplaints(); setComplaints(list); setLoading(false); })(); }, []); if (loading) return <div>Loading...</div>; return <StaffComplaintsScreen complaints={complaints} onNavigate={(s, d) => { if (s === "staff-complaint-detail") navigate(`/staff/complaints/${d.complaint.id}`); if (s === "staff-checkin-dashboard") navigate("/home"); }} />; }
function StaffComplaintDetailWrapper() { const { id } = useParams(); const navigate = useNavigate(); const [c, setC] = useState<any>(null); useEffect(() => { (async () => { const row = await getComplaintById(id || ""); setC(row); })(); }, [id]); if (!c) return <div>Loading...</div>; return <StaffComplaintDetailScreen complaint={{ id: c.id, studentName: c.student_name, studentId: c.student_matric_id, facilityName: c.facility_name, title: c.title, category: c.category, description: c.description, status: c.status, submittedDate: new Date(c.created_at).toLocaleDateString(), photoEvidence: c.photo_url, staffRemarks: c.staff_remarks, priority: c.priority, assignedTo: c.assigned_to }} onNavigate={() => navigate("/staff-complaints")} onUpdateComplaint={async (u) => updateComplaintAsStaff(u.id, { status: u.status, staffRemarks: u.staffRemarks, priority: u.priority, assignedTo: u.assignedTo })} />; }

function RequireAuth({ authed, children }: any) { return authed ? <div className="w-full flex-1 flex flex-col bg-[--bg-primary)]">{children}</div> : <Navigate to="/" replace />; }

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"student" | "staff" | "admin">("student");
  const [userId, setUserId] = useState("");
  const [studentId, setStudentId] = useState(localStorage.getItem("utm-student-id") || "");

  const navigate = useNavigate();
  const location = useLocation();

  const { requests, connectedBuddies, refresh: refreshBuddyData } = useBuddyData(userId);

  const fetchUserData = async (uid: string, role: string) => {
    const { data: details } = await supabase.from("profile_details").select("full_name, profile_picture_url").eq("user_id", uid).maybeSingle();
    let coreName = "User";
    let matric = "";

    if (role === "staff") {
      const { data } = await supabase.from("staff_profiles").select("full_name").eq("user_id", uid).maybeSingle();
      if (data) coreName = data.full_name;
    } else if (role === "admin") {
      coreName = "Admin";
      if (details?.full_name) coreName = details.full_name;
    } else {
      const { data } = await supabase.from("profiles").select("full_name, matric_id").eq("id", uid).maybeSingle();
      if (data) { coreName = data.full_name; matric = data.matric_id || ""; }
    }
    setStudentName(details?.full_name || coreName);
    setProfilePicture(details?.profile_picture_url || null);
    if (matric) { setStudentId(matric); localStorage.setItem("utm-student-id", matric); }
  };

  useEffect(() => {
    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = (session.user.user_metadata?.role as "student" | "staff" | "admin") || "student";
        setUserId(session.user.id); setUserRole(role); setAuthed(true); fetchUserData(session.user.id, role);
      }
    };
    sync();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        const role = (session.user.user_metadata?.role as "student" | "staff" | "admin") || "student";
        setUserRole(role); setAuthed(true); setUserId(session.user.id); fetchUserData(session.user.id, role);
      } else {
        setAuthed(false); localStorage.removeItem("utm-student-id");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---
  const handleLogin = async (name: string, id?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || "");
    const role = user?.user_metadata?.role || "student";
    navigate(role === "admin" ? "/admin-dashboard" : "/home", { replace: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    localStorage.removeItem("utm-student-id");
    navigate("/", { replace: true });
  };

  const handleProfileUpdate = () => {
    fetchUserData(userId, userRole);
  };

  const handleSendBuddyRequest = async (recipientId: string) => {
    const { error } = await supabase.from("buddy_requests").insert({ requester_id: userId, recipient_id: recipientId });
    if (error) toast.error("Request failed"); else { toast.success("Request sent!"); refreshBuddyData(); }
  };

  const handleUpdateBuddyStatus = async (requestId: string, status: string) => {
    const { error } = await supabase.from("buddy_requests").update({ status }).eq("id", requestId);
    if (error) toast.error("Update failed"); else { toast.success("Updated!"); refreshBuddyData(); }
  };

  const handleRemoveBuddy = async (buddyId: string) => {
    const { error } = await supabase.from("buddy_requests").delete()
      .or(`and(requester_id.eq.${userId},recipient_id.eq.${buddyId}),and(requester_id.eq.${buddyId},recipient_id.eq.${userId})`);
    if (!error) { toast.success("Removed"); refreshBuddyData(); }
  };

  const hideBottomNav = userRole === "admin" || ["/", "/register"].some(p => location.pathname === p) || location.pathname.startsWith("/facility") || location.pathname.includes("/create") || location.pathname.includes("/edit") || location.pathname.includes("/find-buddy") || location.pathname.includes("/buddy-requests") || location.pathname.includes("/my-buddies");
  const showBottomNav = authed && !hideBottomNav;
  const hasHeader = authed && userRole !== "admin" && !hideBottomNav && !location.pathname.includes("/news") && !location.pathname.includes("/marketplace");

  // ✅ FIXED: RESTORED activeTab LOGIC
  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/community")) return "community"; 
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

  const onTabChange = (tab: string) => {
    const map: Record<string, string> = {
      home: "/home",
      community: "/community", 
      book: "/book",
      activity: "/activity-main",
      profile: "/profile",
    };
    navigate(map[tab] || "/home");
  };

  return (
    <UserPreferencesProvider>
      <Toaster position="top-center" richColors />
      <div className="h-full w-full bg-[--bg-primary)] flex flex-col">
        {hasHeader && (
          <header className="fixed-header-top">
            {location.pathname === "/home" && <HomeScreenHeader studentName={studentName} />}
            {location.pathname === "/community/discussion" && <DiscussionScreenHeader onNavigate={(s) => s === "create-discussion" && navigate("/community/discussion/create")} />}
            {location.pathname === "/my-bookings" && <MyBookingsScreenHeader onBack={() => navigate("/home")} />}
          </header>
        )}
        <main className={`flex-1 overflow-y-auto ${showBottomNav ? "with-bottom-nav" : ""}`} style={{ paddingTop: hasHeader ? "70px" : "0px" }}>
          <Routes>
            <Route path="/" element={<LoginScreen onLogin={handleLogin} onNavigate={(p) => navigate(p === "register" ? "/register" : "/reset-password-request")} />} />
            <Route path="/register" element={<RegisterScreen onNavigate={(p) => navigate(p === "login" ? "/" : "/register")} />} />
            <Route path="/reset-password-request" element={<ResetPasswordRequestScreen onNavigate={(p) => navigate(p)} />} />
            <Route path="/reset-link-sent" element={<ResetLinkSentScreen onNavigate={(p) => navigate(p)} />} />
            <Route path="/reset-password-new" element={<ResetPasswordNewScreen onNavigate={(p) => navigate(p)} />} />

            <Route path="/home" element={<RequireAuth authed={authed}><HomeScreen studentName={studentName} onNavigate={(s, d) => navigate(s === "book" ? "/book" : s === "discussion" ? "/community" : "/home")} /></RequireAuth>} />
            <Route path="/admin-dashboard" element={<RequireAuth authed={authed}><AdminDashboard onNavigate={navigate} onLogout={handleLogout} /></RequireAuth>} />
            
            {/* COMMUNITY */}
            <Route path="/community" element={<RequireAuth authed={authed}><CommunityScreen /></RequireAuth>} />
            <Route path="/community/buddy" element={<RequireAuth authed={authed}><BuddyHubScreen onNavigate={(s: string) => navigate(`/community/${s}`)} buddyRequests={requests} connectedBuddies={connectedBuddies} onSearch={() => navigate("/community/find-buddy")} onAcceptRequest={() => {}} onRejectRequest={() => {}} buddyChats={[]} /></RequireAuth>} />
            <Route path="/community/find-buddy" element={<RequireAuth authed={authed}><FindBuddyScreen onNavigate={() => navigate("/community/buddy")} studentId={userId} studentName={studentName} connectedBuddies={connectedBuddies.map(b => b.id)} onSendRequest={handleSendBuddyRequest} /></RequireAuth>} />
            <Route path="/community/buddy-requests" element={<RequireAuth authed={authed}><BuddyRequestsScreen onNavigate={() => navigate("/community/buddy")} studentId={userId} buddyRequests={requests} onAcceptRequest={(id) => handleUpdateBuddyStatus(id, "Accepted")} onRejectRequest={(id) => handleUpdateBuddyStatus(id, "Rejected")} /></RequireAuth>} />
            <Route path="/community/my-buddies" element={<RequireAuth authed={authed}><MyBuddiesScreen onNavigate={() => navigate("/community/buddy")} studentId={userId} connectedBuddies={connectedBuddies} onRemoveBuddy={handleRemoveBuddy} /></RequireAuth>} />

            {/* OTHER FEATURES */}
            <Route path="/community/discussion" element={<RequireAuth authed={authed}><DiscussionScreen onNavigate={(s,d) => navigate(s==="create-discussion" ? "/community/discussion/create" : `/community/discussion/${d}`)} /></RequireAuth>} />
            <Route path="/community/discussion/create" element={<RequireAuth authed={authed}><CreateDiscussionScreen studentName={studentName} onNavigate={() => navigate("/community/discussion")} /></RequireAuth>} />
            <Route path="/community/discussion/:id" element={<RequireAuth authed={authed}><DiscussionDetailWrapper studentName={studentName} onNavigate={() => navigate("/community/discussion")} /></RequireAuth>} />
            
            <Route path="/community/news" element={<RequireAuth authed={authed}><NewsFeedScreen userRole={userRole} onNavigate={(s,d) => navigate(s==="create-news-post" ? "/community/news/create" : `/community/news/${d}`)} /></RequireAuth>} />
            <Route path="/community/news/create" element={<RequireAuth authed={authed}><CreateNewsPostScreen onNavigate={() => navigate("/community/news")} /></RequireAuth>} />
            <Route path="/community/news/:id" element={<RequireAuth authed={authed}><NewsDetailWrapper userRole={userRole} onNavigate={() => navigate("/community/news")} /></RequireAuth>} />
            <Route path="/community/news/edit/:id" element={<RequireAuth authed={authed}><EditNewsWrapper onNavigate={(s,d) => navigate(`/community/news/${d}`)} /></RequireAuth>} />

            <Route path="/community/marketplace" element={<RequireAuth authed={authed}><MarketplaceScreen currentUserId={userId} onNavigate={(s,d) => navigate(s==="create-listing" ? "/community/marketplace/create" : s==="marketplace-item-detail" ? `/community/marketplace/${d.item.id}` : "/community")} listings={[]} favourites={[]} onToggleFavourite={()=>{}} /></RequireAuth>} />
            <Route path="/community/marketplace/create" element={<RequireAuth authed={authed}><CreateListingScreen studentId={userId} studentName={studentName} onNavigate={() => navigate("/community/marketplace")} onCreateListing={()=>{}} /></RequireAuth>} />
            <Route path="/community/marketplace/:id" element={<RequireAuth authed={authed}><MarketplaceDetailWrapper userId={userId} onNavigate={() => navigate("/community/marketplace")} /></RequireAuth>} />

            <Route path="/book" element={<RequireAuth authed={authed}><FacilityListScreen onNavigate={(s, d) => navigate(`/facility/${d}`)} /></RequireAuth>} />
            <Route path="/facility/:id" element={<RequireAuth authed={authed}><FacilityDetailsWrapper /></RequireAuth>} />
            <Route path="/facility/:id/time-slot" element={<RequireAuth authed={authed}><TimeSlotWrapper /></RequireAuth>} />
            <Route path="/booking/confirmation" element={<RequireAuth authed={authed}><BookingConfirmationWrapper /></RequireAuth>} />
            <Route path="/booking/success" element={<RequireAuth authed={authed}><BookingSuccessWrapper /></RequireAuth>} />
            <Route path="/my-bookings" element={<RequireAuth authed={authed}><MyBookingsScreen /></RequireAuth>} />

            <Route path="/profile" element={<RequireAuth authed={authed}><ProfileScreen studentName={studentName} profilePictureUrl={profilePicture} studentId={studentId} userRole={userRole} onNavigate={(s) => navigate(`/${s}`)} onLogout={handleLogout} /></RequireAuth>} />
            <Route path="/edit-profile" element={<RequireAuth authed={authed}><EditProfileScreen userId={userId} userRole={userRole} studentId={studentId} onNavigate={() => navigate("/profile")} onSaveProfile={handleProfileUpdate} /></RequireAuth>} />
            <Route path="/settings/interface" element={<RequireAuth authed={authed}><InterfaceSettingsScreen onBack={() => navigate("/profile")} /></RequireAuth>} />
            <Route path="/settings/navbar" element={<RequireAuth authed={authed}><NavbarSettingsScreen onBack={() => navigate("/profile")} /></RequireAuth>} />

            <Route path="/facility-complaints" element={<RequireAuth authed={authed}><StudentComplaintsWrapper /></RequireAuth>} />
            <Route path="/submit-complaint" element={<RequireAuth authed={authed}><SubmitComplaintWrapper /></RequireAuth>} />
            <Route path="/complaint/:id" element={<RequireAuth authed={authed}><StudentComplaintDetailWrapper /></RequireAuth>} />
            <Route path="/staff-complaints" element={<RequireAuth authed={authed}><StaffComplaintsWrapper /></RequireAuth>} />
            <Route path="/staff/complaints/:id" element={<RequireAuth authed={authed}><StaffComplaintDetailWrapper /></RequireAuth>} />

            <Route path="*" element={<Navigate to={authed ? "/home" : "/"} replace />} />
          </Routes>
        </main>
        {showBottomNav && <BottomNav activeTab={activeTab} onTabChange={onTabChange} />}
      </div>
    </UserPreferencesProvider>
  );
}