"use server";

import { cookies } from "next/headers";

const REFRESH_TOKEN = async (): Promise<{ access_token: string }> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    throw new Error("Refresh token not found. Please login again.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "authorization": `${refreshToken}`,
  };

  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    // If refresh fails, clear both tokens
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
    
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(
      `Token refresh failed with status ${res.status}: ${errorText}`
    );
  }

  const resData = await res.json();

  if (!resData.success || !resData.data?.access_token) {
    throw new Error("Invalid response format from refresh token endpoint");
  }

  const newAccessToken = resData.data.access_token;

  // Update the access token cookie
  cookieStore.set({
    name: "token",
    value: newAccessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 5 ,
    path: "/",
  });

  return resData.data;
};

export default REFRESH_TOKEN;