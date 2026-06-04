"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthHeaderProvider } from "@/lib/http-client";

export default function ClerkAuthBridge() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setAuthHeaderProvider(null);
      return;
    }

    setAuthHeaderProvider(async () => {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    });

    return () => setAuthHeaderProvider(null);
  }, [getToken, isSignedIn]);

  return null;
}
