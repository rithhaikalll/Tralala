// src/lib/complaints.ts
import { supabase } from "./supabaseClient";

export type ComplaintStatus = "Submitted" | "In Progress" | "Resolved" | "Rejected";
export type ComplaintPriority = "Low" | "Medium" | "High" | "Urgent";

export type StudentComplaint = {
  id: string;
  facilityName: string;
  title: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  submittedDate: string; // display string
  photoEvidence?: string;
  staffRemarks?: string;
};

export type StaffComplaint = StudentComplaint & {
  studentName: string;
  studentId: string;
  priority?: ComplaintPriority;
  assignedTo?: string;
};

function toStudentComplaint(row: any): StudentComplaint {
  return {
    id: row.id,
    facilityName: row.facility_name,
    title: row.title,
    category: row.category,
    description: row.description,
    status: row.status,
    submittedDate: new Date(row.created_at).toLocaleDateString(),
    photoEvidence: row.photo_url || undefined,
    staffRemarks: row.staff_remarks || undefined,
  };
}

function toStaffComplaint(row: any): StaffComplaint {
  return {
    ...toStudentComplaint(row),
    studentName: row.student_name || "—",
    studentId: row.student_matric_id || "—",
    priority: row.priority || "Medium",
    assignedTo: row.assigned_to || undefined,
  };
}

export async function listStudentComplaints(): Promise<StudentComplaint[]> {
  const { data, error } = await supabase
    .from("facility_complaints")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toStudentComplaint);
}

export async function listStaffComplaints(): Promise<StaffComplaint[]> {
  const { data, error } = await supabase
    .from("facility_complaints")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toStaffComplaint);
}

export async function getComplaintById(id: string): Promise<any> {
  const { data, error } = await supabase
    .from("facility_complaints")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// NOTE: photoEvidence dari Figma Make sekarang base64.
// Untuk cepat jalan, kita simpan terus dalam photo_url (works tapi tak ideal).
// Lepas ni kau boleh upgrade ke Storage upload.
export async function createComplaint(input: {
  facilityName: string;
  category: string;
  title: string;
  description: string;
  photoEvidence?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // fetch student profile to fill student_name + matric
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, matric_id")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("facility_complaints").insert({
    student_user_id: user.id,
    student_name: profile?.full_name || null,
    student_matric_id: profile?.matric_id || null,

    facility_name: input.facilityName,
    category: input.category,
    title: input.title,
    description: input.description,

    photo_url: input.photoEvidence || null,
  });

  if (error) throw error;
}

export async function updateComplaintAsStaff(id: string, patch: {
  status: ComplaintStatus;
  staffRemarks?: string;
  priority?: ComplaintPriority;
  assignedTo?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload: any = {
    status: patch.status,
    staff_remarks: patch.staffRemarks || null,
    priority: patch.priority || "Medium",
    assigned_to: patch.assignedTo || null,
    staff_user_id: user.id,
  };

  // set resolved/rejected timestamp
  if (patch.status === "Resolved") payload.resolved_at = new Date().toISOString();
  if (patch.status === "Rejected") payload.rejected_at = new Date().toISOString();

  const { error } = await supabase
    .from("facility_complaints")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function getStaffComplaintBadgeCount(): Promise<number> {
  const { data, error } = await supabase
    .from("v_staff_complaint_badge")
    .select("pending_count")
    .maybeSingle();
    
  if (error) {
    console.error("Badge fetch error:", error);
    return 0;
  }
  return data?.pending_count || 0;
}
