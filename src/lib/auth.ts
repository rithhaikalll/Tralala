import { supabase } from "./supabaseClient";

type SignUpArgs = {
  fullName: string;
  studentId: string; // matric ID
  email: string;
  password: string;
};

export async function signUpStudent(args: SignUpArgs) {
  const { fullName, studentId, email, password } = args;

  // 1. Create user in Supabase Auth + set user_metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "student",
        fullName,
        studentId,
      },
    },
  });

  if (error) {
    return { user: null, error };
  }

  const user = data.user;
  if (!user) {
    return { user: null, error: new Error("No user returned from signUp") };
  }

  // 2. Create profile row
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    matric_id: studentId,
    role: "student",
  });

  if (profileError) {
    return { user: null, error: profileError };
  }

  return { user, error: null };
}
