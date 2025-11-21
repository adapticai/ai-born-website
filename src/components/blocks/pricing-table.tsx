"use client";

import { useState } from "react";

import { Check, ChevronsUpDown, X, LogIn, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RetailerMenu } from "@/components/RetailerMenu";
import { getSignInUrl } from "@/lib/auth";
import { getFormattedPrice } from "@/lib/pricing";
import type { BookFormat, GeoRegion } from "@/types";

interface FeatureSection {
  category: string;
  features: {
    name: string;
    hardcover: true | false | null | string;
    ebook: true | false | null | string;
    audiobook: true | false | null | string;
  }[];
}

interface BookPlan {
  name: string;
  format: BookFormat;
  description: string;
}

const bookPlans: BookPlan[] = [
  {
    name: "Hardcover",
    format: "hardcover",
    description: "Premium physical edition",
  },
  {
    name: "eBook",
    format: "ebook",
    description: "Instant digital access",
  },
  {
    name: "Audiobook",
    format: "audiobook",
    description: "Listen anywhere",
  },
];

const comparisonFeatures: FeatureSection[] = [
  {
    category: "Content",
    features: [
      {
        name: "Full book content",
        hardcover: true,
        ebook: true,
        audiobook: true,
      },
      {
        name: "Physical copy",
        hardcover: true,
        ebook: false,
        audiobook: false,
      },
      {
        name: "Searchable text",
        hardcover: null,
        ebook: true,
        audiobook: false,
      },
      {
        name: "Portable",
        hardcover: null,
        ebook: true,
        audiobook: true,
      },
    ],
  },
  {
    category: "Bonuses",
    features: [
      {
        name: "Agent Charter Pack",
        hardcover: true,
        ebook: true,
        audiobook: true,
      },
      {
        name: "COI Diagnostic Tool",
        hardcover: true,
        ebook: true,
        audiobook: true,
      },
      {
        name: "Free excerpt",
        hardcover: true,
        ebook: true,
        audiobook: true,
      },
      {
        name: "Launch updates",
        hardcover: true,
        ebook: true,
        audiobook: true,
      },
    ],
  },
  {
    category: "Experience",
    features: [
      {
        name: "Offline access",
        hardcover: true,
        ebook: true,
        audiobook: true,
      },
      {
        name: "Annotation support",
        hardcover: true,
        ebook: true,
        audiobook: false,
      },
      {
        name: "Multi-device sync",
        hardcover: null,
        ebook: true,
        audiobook: true,
      },
    ],
  },
];

const renderFeatureValue = (value: true | false | null | string) => {
  if (value === true) {
    return <Check className="size-5" />;
  }
  if (value === false) {
    return <X className="size-5" />;
  }
  if (value === null) {
    return null;
  }
  // String value
  return (
    <div className="flex items-center gap-2">
      <Check className="size-4" />
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
};

interface PricingTableProps {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    hasPreordered?: boolean;
  } | null;
  initialGeo?: GeoRegion;
}

export const PricingTable = ({ user, initialGeo = "US" }: PricingTableProps) => {
  const [selectedPlan, setSelectedPlan] = useState(0); // Default to Hardcover
  const [geo] = useState<GeoRegion>(initialGeo);

  return (
    <section className="pb-28 lg:py-32">
      <div className="container">
        <PlanHeaders
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
          user={user}
          geo={geo}
        />
        <FeatureSections selectedPlan={selectedPlan} />
      </div>
    </section>
  );
};

const PlanHeaders = ({
  selectedPlan,
  onPlanChange,
  user,
  geo,
}: {
  selectedPlan: number;
  onPlanChange: (index: number) => void;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    hasPreordered?: boolean;
  } | null;
  geo: GeoRegion;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderCTA = (format: BookFormat) => {
    // User has already pre-ordered
    if (user?.hasPreordered) {
      return (
        <Button
          variant="outline"
          className="w-fit gap-2 cursor-default"
          disabled
        >
          <CheckCircle2 className="size-4" />
          Pre-ordered
        </Button>
      );
    }

    // User is authenticated but hasn't pre-ordered
    if (user) {
      return (
        <RetailerMenu
          triggerText="Pre-order now"
          triggerVariant="primary"
          initialFormat={format}
          originSection="pricing-table"
        />
      );
    }

    // User is not authenticated
    return (
      <Button
        variant="outline"
        className="w-fit gap-2"
        onClick={() => {
          window.location.href = getSignInUrl('/');
        }}
      >
        <LogIn className="size-4" />
        Sign up to pre-order
      </Button>
    );
  };

  return (
    <div className="">
      {/* Mobile View */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="">
          <div className="flex items-center justify-between border-b py-4">
            <CollapsibleTrigger className="flex items-center gap-2">
              <div className="text-left">
                <h3 className="text-2xl font-semibold">
                  {bookPlans[selectedPlan].name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getFormattedPrice(bookPlans[selectedPlan].format, geo)}
                </p>
              </div>
              <ChevronsUpDown
                className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            {renderCTA(bookPlans[selectedPlan].format)}
          </div>
          <CollapsibleContent className="flex flex-col space-y-2 p-2">
            {bookPlans.map(
              (plan, index) =>
                index !== selectedPlan && (
                  <Button
                    size="lg"
                    variant="secondary"
                    key={index}
                    onClick={() => {
                      onPlanChange(index);
                      setIsOpen(false);
                    }}
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {getFormattedPrice(plan.format, geo)}
                      </div>
                    </div>
                  </Button>
                ),
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop View */}
      <div className="grid grid-cols-4 gap-4 max-md:hidden">
        <div className="col-span-1 max-md:hidden" />

        {bookPlans.map((plan, index) => (
          <div key={index} className="">
            <h3 className="mb-2 text-2xl font-semibold">{plan.name}</h3>
            <p className="mb-1 text-sm text-muted-foreground">
              {plan.description}
            </p>
            <p className="mb-3 text-lg font-semibold">
              {getFormattedPrice(plan.format, geo)}
            </p>
            {renderCTA(plan.format)}
          </div>
        ))}
      </div>
    </div>
  );
};

const FeatureSections = ({ selectedPlan }: { selectedPlan: number }) => (
  <>
    {comparisonFeatures.map((section, sectionIndex) => (
      <div key={sectionIndex} className="">
        <div className="border-primary/40 border-b py-4">
          <h3 className="text-lg font-semibold">{section.category}</h3>
        </div>
        {section.features.map((feature, featureIndex) => (
          <div
            key={featureIndex}
            className="text-foreground grid grid-cols-2 font-medium max-md:border-b md:grid-cols-4"
          >
            <span className="inline-flex items-center py-4">
              {feature.name}
            </span>
            {/* Mobile View - Only Selected Plan */}
            <div className="md:hidden">
              <div className="flex items-center gap-1 py-4 md:border-b">
                {renderFeatureValue(
                  [feature.hardcover, feature.ebook, feature.audiobook][
                    selectedPlan
                  ],
                )}
              </div>
            </div>
            {/* Desktop View - All Plans */}
            <div className="hidden md:col-span-3 md:grid md:grid-cols-3 md:gap-4">
              {[feature.hardcover, feature.ebook, feature.audiobook].map(
                (value, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 border-b py-4"
                  >
                    {renderFeatureValue(value)}
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    ))}
  </>
);
