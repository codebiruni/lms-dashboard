/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

const GETDATA = async <T = any>(path: string): Promise<T> => {
  const cookieStore = await cookies();
  const  token = cookieStore.get("token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  // Ensure proper URL concatenation
  const url = `${process.env.NEXT_PUBLIC_API_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;

  const res = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

 

  return res.json();
};

export default GETDATA;