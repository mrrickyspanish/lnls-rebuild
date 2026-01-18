"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/lib/useIsMobile";

const Header = dynamic(() => import("@/components/Header"), { ssr: false });
const MobileHeader = dynamic(() => import("@/components/MobileHeader"), { ssr: false });

export default function ResponsiveHeader() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return isMobile ? <MobileHeader /> : <Header />;
}
