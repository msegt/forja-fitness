"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ClearCompletionError() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const clearedSearch = useRef<string | null>(null);

  useEffect(() => {
    const search = searchParams.toString();
    const currentUrl = `${pathname}?${search}`;

    if (!searchParams.has("error")) {
      clearedSearch.current = null;
      return;
    }

    if (clearedSearch.current === currentUrl) {
      return;
    }

    clearedSearch.current = currentUrl;
    const params = new URLSearchParams(search);
    params.delete("error");
    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
