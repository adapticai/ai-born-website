"use client";

/**
 * Settings Content Component
 * Client component that renders the tabbed settings interface
 * Each tab loads a separate settings component
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";
import { User } from "next-auth";
import { useState } from "react";

interface SettingsContentProps {
  user: User;
}

export function SettingsContent({ user }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* Tab Navigation */}
        <TabsList className="mb-8 grid w-full grid-cols-2 gap-4 bg-transparent p-0 lg:flex lg:w-auto lg:justify-start">
          <TabsTrigger
            value="profile"
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 data-[state=active]:border-brand-cyan data-[state=active]:bg-brand-cyan/5 data-[state=active]:text-brand-cyan dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:data-[state=active]:border-brand-cyan dark:data-[state=active]:bg-brand-cyan/10 dark:data-[state=active]:text-brand-cyan"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 data-[state=active]:border-brand-cyan data-[state=active]:bg-brand-cyan/5 data-[state=active]:text-brand-cyan dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:data-[state=active]:border-brand-cyan dark:data-[state=active]:bg-brand-cyan/10 dark:data-[state=active]:text-brand-cyan"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 data-[state=active]:border-brand-cyan data-[state=active]:bg-brand-cyan/5 data-[state=active]:text-brand-cyan dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:data-[state=active]:border-brand-cyan dark:data-[state=active]:bg-brand-cyan/10 dark:data-[state=active]:text-brand-cyan"
          >
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 data-[state=active]:border-brand-cyan data-[state=active]:bg-brand-cyan/5 data-[state=active]:text-brand-cyan dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:data-[state=active]:border-brand-cyan dark:data-[state=active]:bg-brand-cyan/10 dark:data-[state=active]:text-brand-cyan"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Tab Content Sections */}
        <TabsContent value="profile" className="mt-6">
          <ProfileSettings user={user} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecuritySettings user={user} />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <PreferencesSettings user={user} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
