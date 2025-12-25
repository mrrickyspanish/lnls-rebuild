"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/lib/useIsMobile";

const Header = dynamic(() => import("@/components/Header"), { ssr: false });
const MobileHeader = dynamic(() => import("@/components/MobileHeader"), { ssr: false });

export default function ResponsiveHeader() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileHeader /> : <Header />;
}
