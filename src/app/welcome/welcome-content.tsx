"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Gift,
  ShoppingCart,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface WelcomeContentProps {
  userName: string;
  userEmail: string;
  createdAt: Date;
  entitlements: {
    hasPreordered: boolean;
    hasExcerpt: boolean;
    hasAgentCharterPack: boolean;
  };
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  href: string;
}

/**
 * Format date to readable string
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Client-side welcome page content with animations and interactivity
 */
export function WelcomeContent({ userName, userEmail, createdAt, entitlements }: WelcomeContentProps) {
  const router = useRouter();
  const joinDate = formatDate(createdAt);

  // Checklist state - uses actual entitlements data
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: "profile",
      label: "Complete your profile",
      description: "Add your details and preferences",
      icon: User,
      completed: false,
      href: "/account",
    },
    {
      id: "excerpt",
      label: "Claim your free excerpt",
      description: "Download the sample chapter",
      icon: FileText,
      completed: entitlements.hasExcerpt,
      href: entitlements.hasExcerpt ? "/downloads" : "/#excerpt",
    },
    {
      id: "preorder",
      label: "Pre-order AI-Born",
      description: "Reserve your copy today",
      icon: ShoppingCart,
      completed: entitlements.hasPreordered,
      href: "/#hero",
    },
  ]);

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = (completedCount / totalCount) * 100;

  const toggleChecklistItem = (id: string) => {
    setChecklistItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleGetStarted = () => {
    router.push("/");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Welcome Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="rounded-full bg-gradient-to-r from-brand-cyan/10 to-brand-ember/10 p-4">
              <Sparkles className="h-12 w-12 text-brand-cyan" aria-hidden="true" />
            </div>
          </div>

          <h1 className="font-outfit mb-4 text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl dark:text-white">
            Welcome, {userName}
          </h1>

          <p className="font-inter mx-auto mb-2 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Your journey into AI-native organisations begins here. Explore the blueprint, access exclusive content, and shape the future of work.
          </p>

          {joinDate && (
            <div className="font-inter mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>Member since {joinDate}</span>
            </div>
          )}
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div variants={itemVariants} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Download Excerpt */}
          <FeatureCard
            icon={BookOpen}
            iconColor="brand-cyan"
            title="Download Excerpt"
            description="Get a free chapter and discover the Five Planes framework"
            hasAccess={entitlements.hasExcerpt}
            href={entitlements.hasExcerpt ? "/downloads" : "/#excerpt"}
            ctaText={entitlements.hasExcerpt ? "View Downloads" : "Get Excerpt"}
            delay={0.1}
          />

          {/* Card 2: Pre-order Book */}
          <FeatureCard
            icon={ShoppingCart}
            iconColor="brand-ember"
            title="Pre-order Book"
            description="Reserve your copy in hardcover, eBook, or audiobook format"
            hasAccess={entitlements.hasPreordered}
            href="/#hero"
            ctaText={entitlements.hasPreordered ? "View Retailers" : "Pre-order Now"}
            delay={0.2}
          />

          {/* Card 3: Claim Bonus Pack */}
          <FeatureCard
            icon={Gift}
            iconColor="brand-cyan"
            title="Claim Bonus Pack"
            description="Upload receipt and receive the Agent Charter Pack"
            hasAccess={entitlements.hasAgentCharterPack}
            href="/bonus-claim"
            ctaText={entitlements.hasAgentCharterPack ? "Download Pack" : "Claim Bonus"}
            variant="outline"
            delay={0.3}
          />

          {/* Card 4: Explore Content */}
          <FeatureCard
            icon={Sparkles}
            iconColor="slate"
            title="Explore Content"
            description="Discover frameworks, endorsements, and the author bio"
            hasAccess={false}
            href="/#overview"
            ctaText="Explore the Book"
            variant="outline"
            delay={0.4}
          />
        </motion.div>

          {/* Progress Checklist */}
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm rounded-2xl shadow-2xl">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-display text-brand-porcelain">
                    Your onboarding checklist
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      {completedCount} of {totalCount} completed
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalCount }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            i < completedCount
                              ? "bg-brand-cyan"
                              : "bg-slate-600"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-cyan to-brand-ember"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {checklistItems.map((item, index) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      onToggle={toggleChecklistItem}
                      delay={0.6 + index * 0.1}
                    />
                  ))}
                </div>

                {/* Completion message */}
                {completedCount === totalCount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-brand-cyan" />
                      <div>
                        <p className="font-semibold text-brand-cyan">
                          All done!
                        </p>
                        <p className="text-sm text-slate-300">
                          You have completed all onboarding steps. You are ready
                          to explore.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        {/* Quick Actions Section */}
        <motion.div variants={itemVariants} className="mt-16">
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 dark:border-slate-800 dark:from-slate-900 dark:to-black">
            <CardHeader className="text-center">
              <CardTitle className="font-outfit text-2xl">What's next?</CardTitle>
              <CardDescription className="font-inter text-base">
                Continue your journey into AI-native organisations
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="flex-1 bg-black font-outfit text-base font-semibold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
                >
                  <Link href="/#overview">
                    Explore the Book
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="flex-1 border-2 font-outfit text-base font-semibold transition-all hover:border-brand-cyan hover:bg-brand-cyan/5"
                >
                  <Link href="/account">
                    View Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Indicators */}
        {(entitlements.hasExcerpt || entitlements.hasPreordered || entitlements.hasAgentCharterPack) && (
          <motion.div variants={itemVariants} className="mt-12">
            <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 text-center dark:border-green-900 dark:from-green-950 dark:to-emerald-950">
              <div className="mb-3 inline-flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h3 className="font-outfit mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
                You're all set!
              </h3>
              <p className="font-inter text-sm text-green-700 dark:text-green-300">
                {entitlements.hasPreordered && entitlements.hasExcerpt && entitlements.hasAgentCharterPack
                  ? "You've unlocked all available content. Check your downloads page for bonus materials."
                  : entitlements.hasPreordered && entitlements.hasExcerpt
                  ? "You've unlocked your excerpt and pre-ordered the book. Upload your receipt to claim the bonus pack."
                  : entitlements.hasExcerpt
                  ? "You've unlocked your free excerpt. Pre-order to claim the bonus pack."
                  : "You're making great progress. Continue exploring to unlock more content."}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Feature card component with brand styling
 */
interface FeatureCardProps {
  icon: React.ElementType;
  iconColor: "brand-cyan" | "brand-ember" | "slate";
  title: string;
  description: string;
  hasAccess: boolean;
  href: string;
  ctaText: string;
  variant?: "default" | "outline";
  delay: number;
}

function FeatureCard({
  icon: Icon,
  iconColor,
  title,
  description,
  hasAccess,
  href,
  ctaText,
  variant = "default",
  delay,
}: FeatureCardProps) {
  const colorClasses = {
    "brand-cyan": {
      icon: "bg-brand-cyan/10 text-brand-cyan",
      hover: "hover:border-brand-cyan hover:shadow-xl",
      button: "bg-brand-cyan text-black hover:bg-brand-cyan/90 dark:text-white",
    },
    "brand-ember": {
      icon: "bg-brand-ember/10 text-brand-ember",
      hover: "hover:border-brand-ember hover:shadow-xl",
      button: "bg-brand-ember text-black hover:bg-brand-ember/90 dark:text-white",
    },
    slate: {
      icon: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      hover: "hover:border-brand-ember hover:shadow-xl",
      button: "",
    },
  };

  const colors = colorClasses[iconColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border-2 transition-all h-full dark:border-slate-800 dark:bg-slate-900/50",
          colors.hover
        )}
      >
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100",
          iconColor === "brand-cyan" && "bg-gradient-to-br from-brand-cyan/5 to-transparent",
          iconColor === "brand-ember" && "bg-gradient-to-br from-brand-ember/5 to-transparent"
        )} />

        <CardHeader className="relative">
          <div
            className={cn(
              "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
              colors.icon
            )}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="font-outfit text-xl">{title}</CardTitle>
          <CardDescription className="font-inter">{description}</CardDescription>
        </CardHeader>

        <CardContent className="relative">
          {hasAccess && (
            <div className="mb-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>
                {title.includes("Excerpt") && "Already unlocked"}
                {title.includes("Pre-order") && "Pre-order confirmed"}
                {title.includes("Bonus") && "Pack delivered"}
              </span>
            </div>
          )}

          <Button
            asChild
            variant={variant}
            className={cn(
              "w-full font-outfit font-semibold transition-all",
              variant === "default" ? colors.button : "hover:border-brand-cyan hover:bg-brand-cyan/5"
            )}
          >
            <Link href={href}>
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Checklist item row component
 */
interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  delay: number;
}

function ChecklistItemRow({ item, onToggle, delay }: ChecklistItemRowProps) {
  const router = useRouter();
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-slate-700/30 group cursor-pointer",
        item.completed && "opacity-60"
      )}
      onClick={() => router.push(item.href)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(item.id);
        }}
        className="flex-shrink-0"
      >
        <Checkbox
          checked={item.completed}
          className="border-slate-600 data-[state=checked]:bg-brand-cyan data-[state=checked]:border-brand-cyan"
        />
      </button>

      <div
        className={cn(
          "w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0",
          item.completed ? "text-slate-500" : "text-brand-cyan"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-semibold text-brand-porcelain mb-0.5",
            item.completed && "line-through text-slate-500"
          )}
        >
          {item.label}
        </h3>
        <p className="text-sm text-slate-400">{item.description}</p>
      </div>

      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all flex-shrink-0" />
    </motion.div>
  );
}
