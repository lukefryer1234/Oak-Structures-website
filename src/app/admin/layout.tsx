"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  GalleryHorizontal,
  Users,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign,
  Truck,
  CreditCard,
  BarChart3,
  Mail,
  FileText,
  Image as ImageIconLucide,
  ScanSearch,
  Sparkles,
  Ruler,
  Loader2,
  UserPlus,
  MessageSquare,
  Wrench,
  FileDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context"; // Import useAuth
import { useToast } from "@/hooks/use-toast";
import { initializeFirestoreSettings } from "./init-firestore";
import {
  AdminSection,
  UserRole,
  getEffectiveRole,
} from "@/lib/permissions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: NavItem[];
  section?: AdminSection; // Associated permission section
}

const adminNavLinks: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: AdminSection.DASHBOARD,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
    section: AdminSection.ORDERS,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    section: AdminSection.PRODUCTS,
    subItems: [
      {
        href: "/admin/products",
        label: "Overview",
        icon: Package,
        section: AdminSection.PRODUCTS,
      },
      {
        href: "/admin/products/unit-prices",
        label: "Unit Prices",
        icon: Ruler,
        section: AdminSection.PRODUCTS_PRICES,
      },
      {
        href: "/admin/products/configurable-prices",
        label: "Configurable Prices",
        icon: DollarSign,
        section: AdminSection.PRODUCTS_PRICES,
      },
      {
        href: "/admin/products/photos",
        label: "Product Photos",
        icon: ImageIconLucide,
        section: AdminSection.PRODUCTS_PHOTOS,
      },
      {
        href: "/admin/products/special-deals",
        label: "Special Deals",
        icon: Sparkles,
        section: AdminSection.PRODUCTS_SPECIAL_DEALS,
      },
    ],
  },
  {
    href: "/admin/content",
    label: "Content",
    icon: FileText,
    section: AdminSection.CONTENT,
    subItems: [
      {
        href: "/admin/content",
        label: "Overview",
        icon: FileText,
        section: AdminSection.CONTENT,
      },
      {
        href: "/admin/content/gallery",
        label: "Gallery",
        icon: GalleryHorizontal,
        section: AdminSection.CONTENT_GALLERY,
      },
      {
        href: "/admin/content/custom-order-text",
        label: "Custom Order Text",
        icon: FileText,
        section: AdminSection.CONTENT,
      },
      {
        href: "/admin/content/seo",
        label: "SEO Settings",
        icon: ScanSearch,
        section: AdminSection.CONTENT_SEO,
      },
    ],
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    section: AdminSection.SETTINGS,
    subItems: [
      {
        href: "/admin/settings",
        label: "Overview",
        icon: Settings,
        section: AdminSection.SETTINGS,
      },
      {
        href: "/admin/settings/company",
        label: "Company Info",
        icon: Building2,
        section: AdminSection.SETTINGS_COMPANY,
      },
      {
        href: "/admin/settings/financial",
        label: "Financial",
        icon: DollarSign,
        section: AdminSection.SETTINGS_FINANCIAL,
      },
      {
        href: "/admin/settings/delivery",
        label: "Delivery",
        icon: Truck,
        section: AdminSection.SETTINGS_DELIVERY,
      },
      {
        href: "/admin/settings/payments",
        label: "Payments",
        icon: CreditCard,
        section: AdminSection.SETTINGS_PAYMENTS,
      },
      {
        href: "/admin/settings/analytics",
        label: "Analytics",
        icon: BarChart3,
        section: AdminSection.SETTINGS_ANALYTICS,
      },
      {
        href: "/admin/settings/notifications",
        label: "Notifications",
        icon: Mail,
        section: AdminSection.SETTINGS_NOTIFICATIONS,
      },
      {
        href: "/admin/settings/roles",
        label: "User Roles",
        icon: Users,
        section: AdminSection.SETTINGS_ROLES,
      },
    ],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    section: AdminSection.USERS,
  },
  {
    href: "/admin/crm",
    label: "CRM",
    icon: UserPlus,
    section: AdminSection.CRM,
    subItems: [
      {
        href: "/admin/crm",
        label: "Dashboard",
        icon: LayoutDashboard,
        section: AdminSection.CRM,
      },
      {
        href: "/admin/crm/leads",
        label: "Lead Management",
        icon: UserPlus,
        section: AdminSection.CRM_LEADS,
      },
      {
        href: "/admin/crm/contacts",
        label: "Contact History",
        icon: MessageSquare,
        section: AdminSection.CRM,
      },
    ],
  },
  {
    href: "/admin/tools",
    label: "Tools",
    icon: Wrench,
    section: AdminSection.TOOLS,
    subItems: [
      {
        href: "/admin/tools/exports",
        label: "Data Exports",
        icon: FileDown,
        section: AdminSection.TOOLS_EXPORTS,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  // Check if user has admin privileges
  const isUserAdmin = () => {
    if (!currentUser) {
      return false;
    }

    const userRole = getEffectiveRole(currentUser.email, currentUser.role);
    return userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;

    // For development purposes only, enable this line to grant all users admin access
    // return true;
  };

  const isAdmin = isUserAdmin();

  // Debug information for admin access
  useEffect(() => {
    if (currentUser && !isAdmin) {
      console.log("Admin access denied for:", currentUser.email);
    }
  }, [currentUser, isAdmin]);

  // Authenticate users and enforce admin privileges
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Please log in to access the admin panel.",
        });
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Insufficient Permissions",
          description: "You do not have permission to access the admin panel.",
        });
        router.push("/");
      }
    }
  }, [currentUser, authLoading, router, toast, isAdmin]);

  // Initialize Firestore settings when admin section is accessed
  useEffect(() => {
    console.log("Initializing Firestore settings for admin section...");
    initializeFirestoreSettings()
      .then(() => {
        console.log("Firestore settings initialized successfully.");
      })
      .catch((error) => {
        console.error("Error initializing Firestore settings:", error);
        // Don't show toast here to avoid disrupting the user experience
        // The DB initialization page will handle full error reporting
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string, isSubItem = false): boolean => {
    if (isSubItem) {
      return pathname === path;
    }
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: error.message,
      });
    }
  };

  // Show loading indicator only when authentication is in progress
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((link) => {
      const active = isActive(link.href, isSubmenu);
      const hasSubItems = link.subItems && link.subItems.length > 0;
      const isSubMenuOpen = openSubMenus[link.label] ?? false;

      if (isSubmenu) {
        return (
          <SidebarMenuSubItem key={link.href}>
            <Link href={link.href} legacyBehavior passHref>
              <SidebarMenuSubButton isActive={active}>
                <span>{link.label}</span>
              </SidebarMenuSubButton>
            </Link>
          </SidebarMenuSubItem>
        );
      }

      return (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            onClick={hasSubItems ? () => toggleSubMenu(link.label) : undefined}
            asChild={!hasSubItems}
            isActive={active && !hasSubItems}
            className="justify-between"
          >
            {hasSubItems ? (
              <div className="flex items-center gap-2 w-full">
                <link.icon />
                <span>{link.label}</span>
                <span className="ml-auto">
                  {isSubMenuOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </span>
              </div>
            ) : (
              <Link href={link.href} className="flex items-center gap-2">
                <link.icon />
                <span>{link.label}</span>
              </Link>
            )}
          </SidebarMenuButton>
          {hasSubItems && isSubMenuOpen && (
            <SidebarMenuSub>
              {renderNavItems(link.subItems!, true)}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold p-2">Admin Panel</h2>
          </div>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>{renderNavItems(adminNavLinks)}</SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2 border-t border-sidebar-border">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={currentUser?.photoURL ?? undefined}
                alt={currentUser?.displayName ?? "Admin"}
              />
              <AvatarFallback>
                {currentUser?.displayName?.[0]?.toUpperCase() ??
                  currentUser?.email?.[0]?.toUpperCase() ??
                  "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-xs truncate">
              <span className="font-medium text-sidebar-foreground">
                {currentUser?.displayName || currentUser?.email}
              </span>
              {currentUser?.displayName && (
                <span className="text-muted-foreground">
                  {currentUser.email}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
