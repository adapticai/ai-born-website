"use client";

/**
 * Account Content Component
 * Client-side component that fetches and displays user account data
 */

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Package,
  ShoppingBag,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";

import { AuthLoadingState } from "@/components/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccountData {
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  status: {
    hasExcerpt: boolean;
    hasAgentCharterPack: boolean;
    hasPreordered: boolean;
    entitlementCount: number;
    receiptCount: number;
    bonusClaimCount: number;
  };
  entitlements: Array<{
    id: string;
    type: string;
    status: string;
    fulfilledAt: Date | null;
    expiresAt: Date | null;
    code: {
      code: string;
      type: string;
      description: string | null;
    } | null;
    createdAt: Date;
  }>;
  receipts: Array<{
    id: string;
    retailer: string;
    orderNumber: string | null;
    format: string | null;
    purchaseDate: Date | null;
    status: string;
    verifiedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
  }>;
  bonusClaims: Array<{
    id: string;
    status: string;
    deliveryEmail: string;
    deliveredAt: Date | null;
    createdAt: Date;
    receipt: {
      retailer: string;
      format: string | null;
      purchaseDate: Date | null;
    };
  }>;
  organizations: Array<{
    id: string;
    name: string;
    type: string;
    role: string;
    joinedAt: Date | null;
  }>;
  downloads: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    url: string;
  }>;
}

export function AccountContent() {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch account data");
      }

      const data = await response.json();
      setAccountData(data);
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthLoadingState
        variant="page"
        message="Loading your account..."
        showSpinner
      />
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
            <AlertCircle className="h-5 w-5" />
            Error Loading Account
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAccountData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!accountData) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Pre-order Status"
          value={accountData.status.hasPreordered}
          icon={<ShoppingBag className="h-5 w-5" />}
          trueText="Verified"
          falseText="No pre-order"
        />
        <StatusCard
          title="Excerpt Access"
          value={accountData.status.hasExcerpt}
          icon={<FileText className="h-5 w-5" />}
          trueText="Available"
          falseText="Not claimed"
        />
        <StatusCard
          title="Bonus Pack"
          value={accountData.status.hasAgentCharterPack}
          icon={<Package className="h-5 w-5" />}
          trueText="Unlocked"
          falseText="Not available"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="downloads" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="entitlements">Benefits</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
        </TabsList>

        {/* Downloads Tab */}
        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Downloads</CardTitle>
              <CardDescription>
                Content you have access to based on your entitlements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountData.downloads.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
                  <p className="mb-2 text-gray-600 dark:text-gray-400">
                    No downloads available yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Pre-order the book or redeem a VIP code to unlock content
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Button asChild variant="outline">
                      <a href="/#preorder">Pre-order Now</a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="/redeem">Redeem Code</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {accountData.downloads.map((download) => (
                    <DownloadCard key={download.id} download={download} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {/* Receipts */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                Your pre-order receipts and verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountData.receipts.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
                  <p className="mb-2 text-gray-600 dark:text-gray-400">
                    No orders yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Upload proof of purchase to claim your bonus pack
                  </p>
                  <Button asChild variant="outline" className="mt-6">
                    <a href="/redeem">Upload Receipt</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {accountData.receipts.map((receipt) => (
                    <ReceiptCard key={receipt.id} receipt={receipt} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bonus Claims */}
          {accountData.bonusClaims.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bonus Claims</CardTitle>
                <CardDescription>
                  Your Agent Charter Pack delivery status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accountData.bonusClaims.map((claim) => (
                    <BonusClaimCard key={claim.id} claim={claim} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Entitlements Tab */}
        <TabsContent value="entitlements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Benefits</CardTitle>
              <CardDescription>
                Active entitlements and access rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountData.entitlements.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
                  <p className="mb-2 text-gray-600 dark:text-gray-400">
                    No active benefits
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Redeem a VIP code to unlock exclusive content
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accountData.entitlements.map((entitlement) => (
                    <EntitlementCard
                      key={entitlement.id}
                      entitlement={entitlement}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Organizations you are a member of
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountData.organizations.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
                  <p className="mb-2 text-gray-600 dark:text-gray-400">
                    Not part of any organizations
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Organizations enable bulk orders and team access
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accountData.organizations.map((org) => (
                    <OrganizationCard key={org.id} organization={org} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your account details and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {accountData.user.email}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Verified
              </label>
              <p className="flex items-center gap-2">
                {accountData.user.emailVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-900 dark:text-gray-100">
                      Verified
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Not verified
                    </span>
                  </>
                )}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {accountData.user.name || "Not set"}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Member Since
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {new Date(accountData.user.createdAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components

interface StatusCardProps {
  title: string;
  value: boolean;
  icon: React.ReactNode;
  trueText: string;
  falseText: string;
}

function StatusCard({
  title,
  value,
  icon,
  trueText,
  falseText,
}: StatusCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value ? trueText : falseText}
            </p>
          </div>
          <div
            className={`rounded-full p-3 ${
              value
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DownloadCardProps {
  download: AccountData["downloads"][0];
}

function DownloadCard({ download }: DownloadCardProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(download.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${download.id}.${download.type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
          <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {download.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {download.description}
          </p>
        </div>
      </div>
      <Button onClick={handleDownload} size="sm">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  );
}

interface ReceiptCardProps {
  receipt: AccountData["receipts"][0];
}

function ReceiptCard({ receipt }: ReceiptCardProps) {
  const statusConfig = {
    VERIFIED: {
      badge: "default",
      icon: CheckCircle2,
      color: "text-green-600",
    },
    PENDING: { badge: "secondary", icon: Clock, color: "text-yellow-600" },
    REJECTED: { badge: "destructive", icon: XCircle, color: "text-red-600" },
    DUPLICATE: {
      badge: "outline",
      icon: AlertCircle,
      color: "text-orange-600",
    },
  } as const;

  const config =
    statusConfig[receipt.status as keyof typeof statusConfig] ||
    statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {receipt.retailer}
            </h3>
            <Badge variant={config.badge as any}>{receipt.status}</Badge>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {receipt.orderNumber && (
              <p>Order: {receipt.orderNumber}</p>
            )}
            {receipt.format && <p>Format: {receipt.format}</p>}
            {receipt.purchaseDate && (
              <p>
                Purchased:{" "}
                {new Date(receipt.purchaseDate).toLocaleDateString("en-GB")}
              </p>
            )}
            <p>
              Submitted:{" "}
              {new Date(receipt.createdAt).toLocaleDateString("en-GB")}
            </p>
            {receipt.verifiedAt && (
              <p>
                Verified:{" "}
                {new Date(receipt.verifiedAt).toLocaleDateString("en-GB")}
              </p>
            )}
            {receipt.rejectionReason && (
              <p className="text-red-600 dark:text-red-400">
                Reason: {receipt.rejectionReason}
              </p>
            )}
          </div>
        </div>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>
    </div>
  );
}

interface BonusClaimCardProps {
  claim: AccountData["bonusClaims"][0];
}

function BonusClaimCard({ claim }: BonusClaimCardProps) {
  const statusConfig = {
    DELIVERED: { badge: "default", icon: CheckCircle2 },
    APPROVED: { badge: "default", icon: CheckCircle2 },
    PROCESSING: { badge: "secondary", icon: Clock },
    PENDING: { badge: "secondary", icon: Clock },
    REJECTED: { badge: "destructive", icon: XCircle },
  } as const;

  const config =
    statusConfig[claim.status as keyof typeof statusConfig] ||
    statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Agent Charter Pack
            </h3>
            <Badge variant={config.badge as any}>{claim.status}</Badge>
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>Delivery email: {claim.deliveryEmail}</p>
            <p>
              Order from {claim.receipt.retailer}
              {claim.receipt.format && ` (${claim.receipt.format})`}
            </p>
            <p>
              Claimed: {new Date(claim.createdAt).toLocaleDateString("en-GB")}
            </p>
            {claim.deliveredAt && (
              <p>
                Delivered:{" "}
                {new Date(claim.deliveredAt).toLocaleDateString("en-GB")}
              </p>
            )}
          </div>
        </div>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

interface EntitlementCardProps {
  entitlement: AccountData["entitlements"][0];
}

function EntitlementCard({ entitlement }: EntitlementCardProps) {
  const typeLabels: Record<string, string> = {
    EARLY_EXCERPT: "Early Excerpt Access",
    BONUS_PACK: "Agent Charter Pack",
    ENHANCED_BONUS: "Enhanced Bonus Pack",
    LAUNCH_EVENT: "Launch Event Access",
    PRIORITY_SUPPORT: "Priority Support",
    BULK_DISCOUNT: "Bulk Discount",
  };

  const statusConfig = {
    ACTIVE: { badge: "default", color: "bg-green-100 dark:bg-green-900/30" },
    FULFILLED: {
      badge: "secondary",
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    PENDING: {
      badge: "outline",
      color: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    EXPIRED: {
      badge: "destructive",
      color: "bg-gray-100 dark:bg-gray-800",
    },
    REVOKED: {
      badge: "destructive",
      color: "bg-red-100 dark:bg-red-900/30",
    },
  } as const;

  const config =
    statusConfig[entitlement.status as keyof typeof statusConfig] ||
    statusConfig.PENDING;

  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {typeLabels[entitlement.type] || entitlement.type}
          </h3>
          <Badge variant={config.badge as any}>{entitlement.status}</Badge>
        </div>
        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {entitlement.code && (
            <>
              <p>Code: {entitlement.code.code}</p>
              {entitlement.code.description && (
                <p>{entitlement.code.description}</p>
              )}
            </>
          )}
          <p>
            Granted:{" "}
            {new Date(entitlement.createdAt).toLocaleDateString("en-GB")}
          </p>
          {entitlement.fulfilledAt && (
            <p>
              Fulfilled:{" "}
              {new Date(entitlement.fulfilledAt).toLocaleDateString("en-GB")}
            </p>
          )}
          {entitlement.expiresAt && (
            <p>
              Expires:{" "}
              {new Date(entitlement.expiresAt).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface OrganizationCardProps {
  organization: AccountData["organizations"][0];
}

function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {organization.name}
          </h3>
          <Badge variant="outline">{organization.role}</Badge>
        </div>
        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>Type: {organization.type}</p>
          {organization.joinedAt && (
            <p>
              Joined:{" "}
              {new Date(organization.joinedAt).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <a href={`/org/${organization.id}`}>View</a>
      </Button>
    </div>
  );
}
