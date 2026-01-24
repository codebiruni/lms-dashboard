

'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to previous page
    router.back();
  }, [router]);

  return null; // No need to render anything
}



















