"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
// import REFRESH_TOKEN from "./refreshToken";


const LogedUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  

  // If still no token after refresh attempt, return null
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      cookieStore.delete("token"); // remove expired token
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default LogedUser;