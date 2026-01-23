/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { cookies } from "next/headers";

const LOGINUSER = async (path: string, data: any) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed with status ${res.status}`);
  }

  const resData = await res.json();
  const token = resData.data.accessToken;
  const refreshToken = resData.data.refreshToken;

  (await cookies()).set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 90, 
    path: "/",
  });
  (await cookies()).set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, 
    path: "/",
  });

  return resData;
};

export default LOGINUSER;
