/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

const POSTDATA = async <T = any>(
  path: string,
  data: any
): Promise<T> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const isFormData = data instanceof FormData;

  const headers: HeadersInit = {};

  // ❗ Only set JSON header if NOT FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
    cache: "no-store",
  });

  return res.json();
};

export default POSTDATA;
