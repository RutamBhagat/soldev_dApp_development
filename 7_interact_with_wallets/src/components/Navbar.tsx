"use client";

import Link from "next/link";
import { NavbarTabs } from "./NavbarTabs";
import React from "react";

export default function NavBar() {
  return (
    <div className="h-full flex-col flex bg-gray-900">
      <div className="container flex justify-between items-center py-4 h-16">
        <Link href={"/"} className="text-lg font-semibold text-white flex-shrink-0">
          Solana Wallet Interactions
        </Link>
        <div className="ml-auto flex items-center space-x-2">
          <NavbarTabs />
        </div>
      </div>
    </div>
  );
}
