"use server";

import { cookies } from "next/headers";

const LOGOUTUSER = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
    
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: "Error during logout" };
  }
};

export default LOGOUTUSER;