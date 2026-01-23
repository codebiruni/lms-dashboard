/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

const DELETEDATA = async <T = any>(
  path: string, 
): Promise<T> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;

  const res = await fetch(url, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(
      `DELETE ${path} failed with status ${res.status}: ${errorText}`
    );
  }

  return res.json();
};

export default DELETEDATA;