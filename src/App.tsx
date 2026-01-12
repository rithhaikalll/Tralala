import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "./lib/supabaseClient";
import { UserPreferencesProvider } from "./lib/UserPreferencesContext";
import { Toaster, toast } from "sonner";
import { getOrCreateChat } from "./lib/chatService"; // <--- MAKE SURE THIS IS IMPORTED

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

// ... Import your existing components ...
import { LoginScreen } from "./pages/Authentication/LoginScreen";
import { RegisterScreen } from "./pages/Authentication/RegisterScreen";
import { ResetPasswordRequestScreen } from "./pages/Authentication/ResetPasswordRequestScreen";
import { ResetPasswordNewScreen } from "./pages/Authentication/ResetPasswordNewScreen";
import { ResetLinkSentScreen } from "./pages/Authentication/ResetLinkSentScreen";
import { HomeScreen, HomeScreenHeader } from "./pages/StudentDashboard";
import { StaffCheckInDashboardScreen } from "./pages/StaffDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { BottomNav } from "./pages/BottomNav";
import { DesktopTopNav } from "./components/DesktopTopNav";
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
import { ActivityEventsScreen } from "./pages/Activity Tracking/ActivityEventScreen";
import { CreateEventScreen } from "./pages/Activity Tracking/CreateEventScreen";
import EventDetailsScreen from "./pages/Activity Tracking/EventDetailsScreen";
import { EventRemindersScreen } from "./pages/Activity Tracking/EventReminderScreen";
import {
  FacilityListScreen,
  BookListHeader,
} from "./pages/Facility/FacilityListScreen";
import {
  MyBookingsScreen,
  MyBookingsScreenHeader,
} from "./pages/Facility/MyBookingsScreen";

// --- COMMUNITY IMPORTS ---
import { CommunityScreen } from "./pages/Community/CommunityScreen";
import {
  DiscussionScreen,
  DiscussionScreenHeader,
} from "./pages/Community/DiscussionScreen";
import { DiscussionDetailScreen } from "./pages/Community/DiscussionDetailScreen";
import { CreateDiscussionScreen } from "./pages/Community/CreateDiscussionScreen";

// --- NEWS IMPORTS ---
import { NewsFeedScreen } from "./pages/Community/NewsFeedScreen";
import { CreateNewsPostScreen } from "./pages/Community/CreateNewsPostScreen";
import { NewsPostDetailScreen } from "./pages/Community/NewsPostDetailScreen";
import { EditNewsPostScreen } from "./pages/Community/EditNewsPostScreen";

import { MarketplaceScreen } from "./pages/Community/MarketplaceScreen";
import { CreateListingScreen } from "./pages/Community/CreateListingScreen";
import { MarketplaceItemDetailScreen } from "./pages/Community/MarketplaceItemDetailScreen";

// --- BUDDY SYSTEM IMPORTS ---
import { BuddyHubScreen } from "./pages/Community/BuddyHubScreen";
import { FindBuddyScreen } from "./pages/Community/FindBuddyScreen";
import { BuddyRequestsScreen } from "./pages/Community/BuddyRequestsScreen";
import { MyBuddiesScreen } from "./pages/Community/MyBuddyScreen";

// --- CHAT IMPORTS ---
import { PrivateChatListScreen } from "./pages/Community/PrivateChatListScreen";
import { PrivateChatScreen } from "./pages/Community/PrivateChatScreen";

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
import { useUserPreferences } from "./lib/UserPreferencesContext";

// --- WRAPPERS ---
const useBuddyData = (userId: string) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [connectedBuddies, setConnectedBuddies] = useState<any[]>([]);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]); // New state

  const refresh = async () => {
    if (!userId) return;

    // 1. Fetch Requests
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
      // 2. Extract all User IDs to fetch images in one go
      const allUserIds = new Set<string>();
      reqs.forEach((r: any) => {
        if (r.requester_id) allUserIds.add(r.requester_id);
        if (r.recipient_id) allUserIds.add(r.recipient_id);
      });

      // 3. Fetch Images from profile_details
      const { data: images } = await supabase
        .from("profile_details")
        .select("user_id, profile_picture_url")
        .in("user_id", Array.from(allUserIds));

      const imageMap: Record<string, string> = {};
      images?.forEach((img: any) => {
        if (img.profile_picture_url) {
          imageMap[img.user_id] = img.profile_picture_url;
        }
      });

      // 4. Map Requests with Images
      const mappedRequests = reqs.map((r: any) => {
        const isIncoming = r.recipient_id === userId;
        const otherId = isIncoming ? r.requester_id : r.recipient_id;
        
        return {
          id: r.id,
          requesterId: r.requester_id === userId ? r.recipient?.matric_id : r.requester?.matric_id,
          requesterName: r.requester_id === userId ? r.recipient?.full_name : r.requester?.full_name,
          recipientId: r.recipient_id === userId ? "You" : r.recipient?.matric_id,
          
          // Add Profile Picture
          profilePicture: imageMap[otherId] || null, 

          status: r.status,
          createdAt: r.created_at,
          isIncoming: isIncoming,
          otherUserId: otherId // Helper for pending check
        };
      });
      setRequests(mappedRequests);

      // 5. Track Pending Outgoing Requests (To disable button in Find Screen)
      const pending = mappedRequests
        .filter((r: any) => !r.isIncoming && r.status === "Pending")
        .map((r: any) => r.otherUserId);
      setPendingRequestIds(pending);

      // 6. Map Connected Buddies with Images
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
            connectedSince: r.created_at,
            profilePicture: imageMap[buddyProfile?.id] || null // Add Image
          };
        });
      setConnectedBuddies(connected);
    }
  };

  useEffect(() => { refresh(); }, [userId]);
  return { requests, connectedBuddies, pendingRequestIds, refresh };
};



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

// Wrapper for News Details to extract ID
function NewsDetailWrapper({
  userRole,
  onNavigate,
}: {
  userRole?: "student" | "staff";
  onNavigate: (screen: string, data?: string) => void;
}) {
  const { id } = useParams();
  return (
    <NewsPostDetailScreen
      postId={(id as string) || ""}
      userRole={userRole}
      onNavigate={onNavigate}
    />
  );
}

// Wrapper for Edit News to extract ID
function EditNewsWrapper({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: string) => void;
}) {
  const { id } = useParams();
  return (
    <EditNewsPostScreen
      postId={(id as string) || ""}
      onNavigate={onNavigate}
    />
  );
}


// ------------------------------------------------------------------
// COPY THIS INTO YOUR App.tsx (Replace the existing MarketplaceDetailWrapper)
// ------------------------------------------------------------------

// ============================================================================
// REPLACE THE ENTIRE MarketplaceDetailWrapper FUNCTION IN App.tsx
// ============================================================================

function MarketplaceDetailWrapper({ userId, onNavigate }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch Item Data
  useEffect(() => {
    const fetchItemAndFav = async () => {
      if (!id) return;
      try {
        const { data: itemData, error } = await supabase
          .from("marketplace_listings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setItem(itemData);

        if (userId) {
          const { data: favData } = await supabase
            .from("marketplace_favorites")
            .select("*")
            .eq("user_id", userId)
            .eq("listing_id", id)
            .maybeSingle();
          setIsFavourite(!!favData);
        }
      } catch (err) {
        console.error("Error loading item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemAndFav();
  }, [id, userId]);

  const handleToggleFav = async () => {
    if (isFavourite) {
      setIsFavourite(false);
      await supabase.from("marketplace_favorites").delete().eq("user_id", userId).eq("listing_id", id);
    } else {
      setIsFavourite(true);
      await supabase.from("marketplace_favorites").insert({ user_id: userId, listing_id: id });
    }
  };

  // 👇 THIS IS THE NEW CHAT FUNCTION 👇
  const handleCreateChat = async () => {
    if (!item || !userId) return;

    if (item.seller_id === userId) {
      toast.error("This is your own listing!");
      return;
    }

    const toastId = toast.loading("Opening chat...");

    try {
      // Create chat with "marketplace" type and Item ID metadata
      const chat = await getOrCreateChat(
        "marketplace",
        userId,
        item.seller_id,
        item.seller_name,
        item.id,       // Item ID
        item.title     // Item Title
      );

      toast.dismiss(toastId);

      if (chat) {
        navigate("/private-chat", { state: { chat, chatType: "marketplace" } });
      } else {
        toast.error("Could not connect to seller.");
      }
    } catch (err) {
      console.error("Chat error:", err);
      toast.dismiss(toastId);
      toast.error("Failed to start chat.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading details...</div>;
  if (!item) return <div className="p-10 text-center text-gray-400">Item not found.</div>;

  return (
    <MarketplaceItemDetailScreen
      item={item}
      onNavigate={onNavigate}
      isFavourite={isFavourite}
      onToggleFavourite={handleToggleFav}
      isOwner={item.seller_id === userId}
      onCreateMarketplaceChat={handleCreateChat} // <--- Pass the function
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

function EventDetailWrapper({
  userId,
  userRole,
}: {
  userId: string;
  userRole: "student" | "staff";
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <EventDetailsScreen
      eventId={id || ""}
      userId={userId}
      userRole={userRole}
      onNavigate={(screen) => {
        if (screen === "activity-events") navigate("/activity-events");
      }}
    />
  );
}

function StudentComplaintsWrapper() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);

  const { theme } = useUserPreferences();

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

  if (loading) return <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: theme.background, color: theme.text }}>Loading…</div>;

  return (
    <FacilityComplaintsScreen
      complaints={complaints}
      onUpdateComplaints={(next) => setComplaints(next)}
      onNavigate={(screen, data) => {
        if (screen === "profile") navigate("/profile", { replace: true });
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

  const { theme } = useUserPreferences();

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

  if (loading) return <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: theme.background, color: theme.text }}>Loading…</div>;
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

  const { theme } = useUserPreferences();

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

  if (loading) return <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: theme.background, color: theme.text }}>Loading…</div>;

  return (
    <StaffComplaintsScreen
      complaints={complaints}
      onNavigate={(screen, data) => {
        if (screen === "staff-checkin-dashboard") navigate("/profile", { replace: true });
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

  const { theme } = useUserPreferences();

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

  if (loading) return <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: theme.background, color: theme.text }}>Loading…</div>;
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

function PrivateChatListWrapper({ userId }: any) {
  const navigate = useNavigate();
  // We no longer need to pass chats as props, the component fetches them!
  return (
    <PrivateChatListScreen
      currentUserId={userId}
      onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
    />
  );
}

function PrivateChatWrapper({ userId }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  if (!state?.chat || !state?.chatType) {
    return <Navigate to="/private-chat-list" replace />;
  }

  return (
    <PrivateChatScreen
      chat={state.chat}
      chatType={state.chatType}
      currentUserId={userId}
      onNavigate={(screen) => navigate(`/${screen}`)}
    />
  );
}


export default function App() {
  const [authed, setAuthed] = useState(false);
  const [studentName, setStudentName] = useState<string>("Student");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<"student" | "staff" | "admin">("student");
  const [userId, setUserId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>(
    localStorage.getItem("utm-student-id") || ""
  );

  const navigate = useNavigate();
  const location = useLocation();

  const { requests, connectedBuddies, pendingRequestIds, refresh: refreshBuddyData } = useBuddyData(userId);


  // --- BUDDY SYSTEM HANDLERS ---
  const handleSendBuddyRequest = async (targetUserId: string) => {
    try {
      // Check if request already exists to prevent duplicates
      const { data: existing } = await supabase
        .from("buddy_requests")
        .select("*")
        .or(`and(requester_id.eq.${userId},recipient_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},recipient_id.eq.${userId})`)
        .maybeSingle();

      if (existing) return; // Request already exists

      const { error } = await supabase.from("buddy_requests").insert({
        requester_id: userId,
        recipient_id: targetUserId,
        status: "Pending"
      });

      if (error) throw error;
      refreshBuddyData();
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  const handleUpdateBuddyStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("buddy_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;
      refreshBuddyData();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleRemoveBuddy = async (buddyUserId: string) => {
    try {
      // Delete the connection where either user is the requester or recipient
      const { error } = await supabase
        .from("buddy_requests")
        .delete()
        .or(`and(requester_id.eq.${userId},recipient_id.eq.${buddyUserId}),and(requester_id.eq.${buddyUserId},recipient_id.eq.${userId})`);

      if (error) throw error;
      refreshBuddyData();
    } catch (err) {
      console.error("Error removing buddy:", err);
    }
  };

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

    setStudentName(details?.full_name || coreName);
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

  // UPDATED: Logic to hide bottom nav
  const hideBottomNav =
    userRole === "admin" ||
    location.pathname === "/" ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/facility") ||
    location.pathname.startsWith("/booking") ||
    location.pathname.startsWith("/private-chat") ||
    location.pathname.startsWith("/private-chat-list") ||
    location.pathname.includes("/community/marketplace/") ||

    // Updated discussion paths
    location.pathname.includes("/community/discussion/create") ||
    location.pathname.match(/\/community\/discussion\/[^/]+$/) ||
    // NEWS PATHS: Hide nav on create, edit, or detail view
    location.pathname.includes("/community/news/create") ||
    location.pathname.includes("/community/news/edit") ||
    location.pathname.match(/\/community\/news\/[^/]+$/) ||
    location.pathname.startsWith("/activity-history") ||
    location.pathname.match(/^\/activity\/[^/]+$/) ||
    location.pathname.startsWith("/activity/edit") ||
    location.pathname.startsWith("/badges") ||
    location.pathname.startsWith("/activity-event") ||
    location.pathname.startsWith("/create-event") ||
    location.pathname.startsWith("/event-detail") ||
    location.pathname.startsWith("/event-reminders") ||
    location.pathname.startsWith("/settings/") ||
    location.pathname === "/edit-profile" ||
    location.pathname.startsWith("/my-bookings") ||
    location.pathname === "/admin-dashboard" ||
    location.pathname.startsWith("/facility-complaints") ||
    location.pathname.startsWith("/submit-complaint") ||
    location.pathname.startsWith("/complaint/") ||
    location.pathname.startsWith("/staff-complaints") ||
    location.pathname.startsWith("/staff/complaints/");

  const showBottomNav = authed && !hideBottomNav;

  // UPDATED: Header Logic - Hide mobile headers on desktop (lg breakpoint)
  const hasHeader =
    authed &&
    userRole !== "admin" &&
    window.innerWidth < 1024 && // Only show mobile headers on mobile
    ((location.pathname.startsWith("/facility") && !location.pathname.startsWith("/facility-complaints")) ||
      (location.pathname.startsWith("/book") && !location.pathname.startsWith("/booking")) ||
      (location.pathname === "/home" && userRole === "student") ||
      // Show Discussion Header ONLY on list view
      (location.pathname === "/community/discussion") ||
      location.pathname === "/my-bookings" ||
      (location.pathname.match(/^\/activity\/[^/]+$/) && !location.pathname.startsWith("/activity/record")));
  // NOTE: We do NOT want the global header for News, as news screens have their own.

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
      community: "/community",
      book: "/book",
      activity: "/activity-main",
      profile: "/profile",
    };
    navigate(map[tab] || "/home");
  };

  const handleProfileUpdate = () => {
    fetchUserData(userId, userRole);
  };

  return (
    <UserPreferencesProvider>
      <Toaster position="top-center" richColors />
      <div className="h-full w-full bg-[--bg-primary)] text-[--text-primary)] transition-colors duration-300 flex flex-col overflow-hidden">
        {/* Desktop Top Navigation - Only show when authenticated AND not on auth pages */}
        {authed && 
         userRole !== "admin" && 
         !location.pathname.startsWith("/login") &&
         !location.pathname.startsWith("/register") &&
         !location.pathname.startsWith("/reset-password") && (
          <DesktopTopNav
            activeTab={activeTab}
            onTabChange={onTabChange}
            studentName={studentName}
            profilePictureUrl={profilePicture}
            onNavigate={(screen) => navigate(`/${screen}`)}
            onLogout={handleLogout}
          />
        )}

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

            {/* Discussion Header */}
            {location.pathname === "/community/discussion" && (
              <DiscussionScreenHeader
                onNavigate={(screen) => {
                  if (screen === "create-discussion") navigate("/community/discussion/create");
                }}
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
          className={`content flex-1 overflow-y-auto bg-[--bg-primary)] ${showBottomNav ? "with-bottom-nav" : ""
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
                          if (s === "discussion") navigate("/community");
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

              {/* --- COMMUNITY ROUTES --- */}
              <Route
                path="/community"
                element={
                  <RequireAuth authed={authed}>
                    <CommunityScreen />
                  </RequireAuth>
                }
              />

              {/* Discussion */}
              <Route
                path="/community/discussion"
                element={
                  <RequireAuth authed={authed}>
                    <DiscussionScreen
                      onNavigate={(_s, d) => {
                        if (_s === "create-discussion") navigate("/community/discussion/create");
                        if (_s === "discussion-detail" && d) navigate(`/community/discussion/${d}`);
                      }}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/community/discussion/create"
                element={
                  <RequireAuth authed={authed}>
                    <CreateDiscussionScreen
                      studentName={studentName}
                      onNavigate={(_s) => {
                        navigate("/community/discussion");
                      }}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/community/discussion/:id"
                element={
                  <RequireAuth authed={authed}>
                    <DiscussionDetailWrapper
                      studentName={studentName}
                      onNavigate={(_s) => {
                        navigate("/community/discussion");
                      }}
                    />
                  </RequireAuth>
                }
              />

              {/* News */}
              <Route
                path="/community/news"
                element={
                  <RequireAuth authed={authed}>
                    <NewsFeedScreen
                      userRole={userRole as "student" | "staff"}
                      onNavigate={(s, d) => {
                        if (s === "create-news-post") navigate("/community/news/create");
                        if (s === "news-detail" && d) navigate(`/community/news/${d}`);
                      }}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/community/news/create"
                element={
                  <RequireAuth authed={authed}>
                    <CreateNewsPostScreen
                      onNavigate={(_s) => navigate("/community/news")}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/community/news/:id"
                element={
                  <RequireAuth authed={authed}>
                    <NewsDetailWrapper
                      userRole={userRole as "student" | "staff"}
                      onNavigate={(s, d) => {
                        if (s === "news-feed") navigate("/community/news");
                        if (s === "edit-news-post") navigate(`/community/news/edit/${d}`);
                      }}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/community/news/edit/:id"
                element={
                  <RequireAuth authed={authed}>
                    <EditNewsWrapper
                      onNavigate={(s, d) => {
                        if (s === "news-detail") navigate(`/community/news/${d}`);
                      }}
                    />
                  </RequireAuth>
                }
              />
              {/* -------------------------------------- */}

              <Route
                path="/community/marketplace"
                element={
                  <RequireAuth authed={authed}>
                    <MarketplaceScreen
                      currentUserId={userId}
                      onNavigate={(screen, data) => {
                        if (screen === "create-listing") {
                          navigate("/community/marketplace/create");
                        } else if (screen === "marketplace-item-detail" && data?.item?.id) {
                          navigate(`/community/marketplace/${data.item.id}`);
                        } else {
                          navigate("/community");
                        }
                      }}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/community/marketplace/:id"
                element={
                  <RequireAuth authed={authed}>
                    <MarketplaceDetailWrapper
                      userId={userId}
                      onNavigate={(screen: string, data: any) => {
                        // 👇 THIS BLOCK HANDLES THE REDIRECT TO CHAT
                        if (screen === "private-chat") {
                          navigate("/private-chat", { state: data });
                        } else {
                          navigate("/community/marketplace");
                        }
                      }}
                    />
                  </RequireAuth>
                }
              />
              <Route path="/community/marketplace/create" element={
                <RequireAuth authed={authed}>
                  <CreateListingScreen
                    studentId={userId}
                    studentName={studentName}
                    onNavigate={() => navigate("/community/marketplace")}
                  />
                </RequireAuth>
              } />


              {/* BUDDY SYSTEM ROUTES */}

              <Route path="/community/my-buddies" element={
                <RequireAuth authed={authed}>
                  <MyBuddiesScreen
                    onNavigate={() => navigate("/community/buddy")}
                    studentId={userId}
                    connectedBuddies={connectedBuddies}
                    onRemoveBuddy={handleRemoveBuddy}

                    // 👇 DEBUGGING VERSION OF THE CHAT TRIGGER 👇
                    onChat={async (buddyId, buddyName) => {
                      console.log("🟢 1. Button Clicked! Trying to chat with:", buddyName);
                      console.log("   - My ID:", userId);
                      console.log("   - Buddy ID:", buddyId);

                      try {
                        const chat = await getOrCreateChat(
                          "buddy",
                          userId,
                          buddyId,
                          buddyName
                        );

                        console.log("🟡 2. Database returned chat object:", chat);

                        if (chat) {
                          console.log("🟢 3. Success! Navigating to /private-chat...");
                          navigate("/private-chat", { state: { chat, chatType: "buddy" } });
                        } else {
                          console.error("🔴 3. Failed: Chat object is null. Check RLS policies.");
                          alert("Error: Chat could not be created. Open Console (F12) for details.");
                        }
                      } catch (err) {
                        console.error("🔴 CRITICAL ERROR:", err);
                      }
                    }}
                  />
                </RequireAuth>
              } />

              <Route path="/community/buddy" element={
                <RequireAuth authed={authed}>
                  <BuddyHubScreen
                    onNavigate={(s: string) => navigate(s === "community" ? "/community" : `/community/${s}`)}
                    buddyRequests={requests}
                    connectedBuddies={connectedBuddies}
                    onSearch={() => navigate("/community/find-buddy")}
                    onAcceptRequest={async (id) => handleUpdateBuddyStatus(id, "Accepted")}
                    onRejectRequest={async (id) => handleUpdateBuddyStatus(id, "Rejected")}
                    buddyChats={[]}
                  />
                </RequireAuth>
              } />
              <Route path="/community/find-buddy" element={
                <RequireAuth authed={authed}>
                  <FindBuddyScreen
                    onNavigate={() => navigate("/community/buddy")}
                    studentId={userId}
                    connectedBuddies={connectedBuddies.map(b => b.id)}
                    pendingRequests={pendingRequestIds} // <--- PASS THIS PROP
                    onSendRequest={handleSendBuddyRequest}
                  />
                </RequireAuth>
              } />
              <Route path="/community/buddy-requests" element={
                <RequireAuth authed={authed}>
                  <BuddyRequestsScreen
                    onNavigate={() => navigate("/community/buddy")}
                    studentId={userId}
                    buddyRequests={requests}
                    onAcceptRequest={(id) => handleUpdateBuddyStatus(id, "Accepted")}
                    onRejectRequest={(id) => handleUpdateBuddyStatus(id, "Rejected")}
                  />
                </RequireAuth>
              } />
              <Route path="/community/my-buddies" element={
                <RequireAuth authed={authed}>
                  <MyBuddiesScreen
                    onNavigate={() => navigate("/community/buddy")}
                    studentId={userId}
                    connectedBuddies={connectedBuddies}
                    onRemoveBuddy={handleRemoveBuddy}

                    // 👇 IF THIS CHUNK IS MISSING, NOTHING WILL HAPPEN 👇
                    onChat={async (buddyId, buddyName) => {
                      console.log("2. App.tsx received request for:", buddyName); // <--- Debug Log

                      const chat = await getOrCreateChat("buddy", userId, buddyId, buddyName);

                      console.log("3. Chat created:", chat); // <--- Debug Log

                      if (chat) {
                        navigate("/private-chat", { state: { chat, chatType: "buddy" } });
                      }
                    }}
                  />
                </RequireAuth>
              } />

              {/* PRIVATE CHAT ROUTES */}
              <Route path="/private-chat-list" element={
                <RequireAuth authed={authed}>
                  <PrivateChatListWrapper userId={userId} />
                </RequireAuth>
              } />
              <Route path="/private-chat" element={
                <RequireAuth authed={authed}>
                  <PrivateChatWrapper userId={userId} />
                </RequireAuth>
              } />

              <Route
                path="/book"
                element={
                  <RequireAuth authed={authed}>
                    <FacilityListScreen
                      onNavigate={(_s, d) => navigate(`/facility/${d}`)}
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

              {/* ... (Keep existing Activity/Event/Settings routes unchanged) ... */}

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
                        else if (s === "activity-events") navigate("/activity-events");
                        else if (s === "event-reminders") navigate("/event-reminders");
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
                      onNavigate={(_s, d) =>
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
                path="/activity-events"
                element={
                  <RequireAuth authed={authed}>
                    <ActivityEventsScreen
                      onNavigate={(screen, data) => {
                        if (screen === "activity-main") {
                          navigate("/activity-main");
                        } else if (screen === "create-event") {
                          navigate(`/create-event`);
                        } else if (screen === "event-detail") {
                          navigate(`/event-detail/${data?.eventId}`);
                        }
                      }}
                      userRole={userRole as "student" | "staff"}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/create-event"
                element={
                  <RequireAuth authed={authed}>
                    <CreateEventScreen
                      onNavigate={() => navigate("/activity-events")}
                      staffName={studentName}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/event-detail/:id"
                element={
                  <RequireAuth authed={authed}>
                    <EventDetailWrapper
                      userId={userId}
                      userRole={userRole as "student" | "staff"}
                    />
                  </RequireAuth>
                }
              />
              <Route
                path="/event-reminders"
                element={
                  <RequireAuth authed={authed}>
                    <EventRemindersScreen
                      onNavigate={(screen, data) => {
                        if (screen === "event-detail" && data?.eventId) {
                          navigate(`/event-detail/${data.eventId}`);
                        } else if (screen === "activity-main") {
                          navigate("/activity-main");
                        } else if (screen === "activity-events") {
                          navigate("/activity-events");
                        }
                      }}
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