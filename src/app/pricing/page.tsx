import React from "react";

import { Background } from "@/components/background";
import { Pricing } from "@/components/blocks/pricing";
import { PricingTable } from "@/components/blocks/pricing-table";
import { NavbarWrapper } from "@/components/blocks/navbar-wrapper";
import { getCurrentUser } from "@/lib/auth";
import { getUserEntitlements } from "@/lib/auth";

const Page = async () => {
  // Fetch current user and their entitlements
  const user = await getCurrentUser();
  let userWithEntitlements = null;

  if (user?.id) {
    const entitlements = await getUserEntitlements(user.id);
    userWithEntitlements = {
      id: user.id,
      email: user.email || "",
      name: user.name,
      hasPreordered: entitlements.hasPreordered,
    };
  }

  return (
    <>
      <NavbarWrapper />
      <Background>
        <Pricing className="py-28 text-center lg:pt-44 lg:pb-32" />
        <PricingTable user={userWithEntitlements} />
      </Background>
    </>
  );
};

export default Page;
