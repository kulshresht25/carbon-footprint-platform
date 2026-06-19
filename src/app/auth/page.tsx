"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Auth is no longer required — redirect to dashboard
export default function AuthPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
