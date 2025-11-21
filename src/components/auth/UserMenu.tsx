/**
 * UserMenu Component
 *
 * Displays user avatar with dropdown menu for account navigation
 * Includes: My Account, My Downloads, Bonus Pack (if entitled), Sign Out
 *
 * @module components/auth/UserMenu
 */

"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { User, Download, Gift, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAvatarUrl } from "@/lib/auth";
import type { UserWithEntitlements } from "@/types/auth";

/**
 * UserMenu Props
 */
export interface UserMenuProps {
  /** User object with entitlements */
  user: UserWithEntitlements;
  /** Optional className for styling */
  className?: string;
}

/**
 * Generate user initials from name or email
 */
function getUserInitials(user: UserWithEntitlements): string {
  if (user.name) {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return user.email.slice(0, 2).toUpperCase();
}

/**
 * UserMenu Component
 *
 * @example
 * ```tsx
 * <UserMenu user={session.user} />
 * ```
 */
export function UserMenu({ user, className }: UserMenuProps) {
  const initials = getUserInitials(user);
  const avatarUrl = getUserAvatarUrl(user);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`rounded-full outline-none ring-2 ring-transparent transition-all duration-200 hover:ring-brand-cyan focus-visible:ring-brand-cyan ${className || ""}`}
      >
        <Avatar className="h-10 w-10 border-2 border-brand-obsidian/10 transition-all duration-200 hover:border-brand-cyan">
          <AvatarImage src={avatarUrl} alt={user.name || user.email} />
          <AvatarFallback className="bg-gradient-to-br from-brand-cyan/20 to-brand-ember/20 text-sm font-semibold text-brand-porcelain">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-brand-obsidian/20 bg-brand-obsidian/95 text-brand-porcelain shadow-xl backdrop-blur-sm"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-brand-porcelain">
              {user.name || "Account"}
            </p>
            <p className="text-xs leading-none text-brand-porcelain/60">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-brand-porcelain/10" />

        <DropdownMenuItem
          className="cursor-pointer focus:bg-brand-cyan/10 focus:text-brand-cyan"
          onClick={() => window.location.href = "/account"}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>My account</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer focus:bg-brand-cyan/10 focus:text-brand-cyan"
          onClick={() => window.location.href = "/downloads"}
        >
          <Download className="mr-2 h-4 w-4" />
          <span>My downloads</span>
        </DropdownMenuItem>

        {user.hasAgentCharterPack && (
          <DropdownMenuItem
            className="cursor-pointer focus:bg-brand-ember/10 focus:text-brand-ember"
            onClick={() => window.location.href = "/bonus-pack"}
          >
            <Gift className="mr-2 h-4 w-4" />
            <span>Bonus pack</span>
            <span className="ml-auto text-xs text-brand-ember">Unlocked</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-brand-porcelain/10" />

        <DropdownMenuItem
          className="cursor-pointer focus:bg-red-500/10 focus:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
