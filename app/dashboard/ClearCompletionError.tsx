"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ClearCompletionError() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastClearedErrorValue = useRef<string | null>(null);

  useEffect(() => {
    const errorValue = searchParams.get("error");

    if (!errorValue) {
      lastClearedErrorValue.current = null;
      return;
    }

    if (lastClearedErrorValue.current === errorValue) {
      return;
    }

    lastClearedErrorValue.current = errorValue;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
