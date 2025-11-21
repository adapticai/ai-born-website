/**
 * User Navigation Component
 *
 * Displays user avatar/menu when authenticated
 * Shows sign-in button when not authenticated
 *
 * @module components/auth/UserNav
 */

"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatUserDisplayName } from "@/lib/auth";
import Link from "next/link";

export interface UserNavProps {
  /**
   * Show user menu items
   * Set to false to only show sign-in/sign-out
   */
  showMenu?: boolean;

  /**
   * Additional CSS classes for container
   */
  className?: string;
}

/**
 * User Navigation Component
 * Displays authentication state and user menu
 */
export function UserNav({ showMenu = true, className }: UserNavProps) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <div className="h-8 w-8 animate-pulse rounded-full bg-brand-obsidian/10" />
      </div>
    );
  }

  // Not authenticated - show sign-in button
  if (!session?.user) {
    return (
      <div className={className}>
        <SignInButton variant="default" size="sm">
          Sign in
        </SignInButton>
      </div>
    );
  }

  // Authenticated - show user menu
  const user = session.user;
  const displayName = formatUserDisplayName(user);
  const initials = getInitials(displayName);

  if (!showMenu) {
    return (
      <div className={className}>
        <SignOutButton variant="ghost" size="sm">
          Sign out
        </SignOutButton>
      </div>
    );
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} alt={displayName} />
              <AvatarFallback className="bg-brand-cyan/10 text-brand-cyan">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              {user.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/bonus-claim">Claim Bonus</Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/downloads">Downloads</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <SignOutButton variant="ghost" className="w-full justify-start">
              Sign out
            </SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Get user initials from display name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
