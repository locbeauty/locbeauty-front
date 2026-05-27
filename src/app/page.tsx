"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFirstAccessibleRoute, UserAccess } from "@/utils/get-first-accessible-route";

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function redirect() {
      try {
        const payload = JSON.parse(atob(token!.split(".")[1]));
        const employeeId = payload.sub;

        const permissionsRes = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/access/${employeeId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (permissionsRes.ok) {
          const response = await permissionsRes.json();
          const permissions: UserAccess[] = Array.isArray(response)
            ? response
            : response.data || [];
          router.replace(getFirstAccessibleRoute(permissions));
        } else {
          router.replace("/dashboard");
        }
      } catch {
        router.replace("/dashboard");
      }
    }

    redirect();
  }, [router]);

  return null;
}
