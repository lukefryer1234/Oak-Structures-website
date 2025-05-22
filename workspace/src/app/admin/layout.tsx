
"use client"; 

import React, { useState } from 'react';
import Link from 'next/link';
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
    ImageIcon as ImageIconLucide, 
    ScanSearch,
    Sparkles,
    Ruler,
    Loader2,
    UserPlus,
    MessageSquare,
    Tags, // Icon for Main Product Prices
} from 'lucide-react';
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
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    subItems?: NavItem[];
}

const adminNavLinks: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    {
        href: "/admin/products", label: "Products", icon: Package, subItems: [
            { href: "/admin/products/main-product-prices", label: "Main Product Prices", icon: Tags },
            { href: "/admin/products/configurable-prices", label: "Config Prices (Components)", icon: DollarSign },
            { href: "/admin/products/unit-prices", label: "Unit Prices", icon: Ruler },
            { href: "/admin/products/special-deals", label: "Special Deals", icon: Sparkles },
            { href: "/admin/products/photos", label: "Photos", icon: ImageIconLucide }, 
        ]
    },
     {
        href: "/admin/content", label: "Content", icon: FileText, subItems: [
             { href: "/admin/content/gallery", label: "Gallery", icon: GalleryHorizontal },
             { href: "/admin/content/custom-order-text", label: "Custom Order Text", icon: FileText },
             { href: "/admin/content/seo", label: "SEO", icon: ScanSearch },
        ]
    },
    {
        href: "/admin/settings", label: "Settings", icon: Settings, subItems: [
            { href: "/admin/settings/company", label: "Company Info", icon: Building2 },
            { href: "/admin/settings/financial", label: "Financial", icon: DollarSign },
            { href: "/admin/settings/delivery", label: "Delivery", icon: Truck },
            { href: "/admin/settings/payments", label: "Payments", icon: CreditCard },
            { href: "/admin/settings/analytics", label: "Analytics", icon: BarChart3 },
            { href: "/admin/settings/notifications", label: "Notifications", icon: Mail },
        ]
    },
    { href: "/admin/users", label: "Users", icon: Users },
    {
        href: "/admin/crm", label: "CRM", icon: UserPlus, subItems: [
            { href: "/admin/crm", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/crm/leads", label: "Lead Management", icon: UserPlus },
            { href: "/admin/crm/contacts", label: "Contact History", icon: MessageSquare },
        ]
    }, 
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, loading: authLoading, signOut } = useAuth();
    const pathname = usePathname();
    const { toast } = useToast();
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    // TEMPORARILY MODIFIED FOR DEVELOPMENT: Always return true to bypass admin check
    const isUserAdmin = () => { // eslint-disable-line @typescript-eslint/no-unused-vars
        return true; 
        // Original logic (keep for reference):
        // if (!authLoading && !currentUser) return false;
        // if (!currentUser?.email) return false;
        // const adminEmails = ["luke@mcconversions.uk", "admin@timberline.com"];
        // return adminEmails.includes(currentUser.email);
    };
    
    // const isAdmin = isUserAdmin(); // This will now always be true based on the above temporary change


    const toggleSubMenu = (label: string) => {
        setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (path: string, isSubItem = false): boolean => {
        if (isSubItem) {
            return pathname === path;
        }
        if (path === '/admin' && !pathname.startsWith('/admin/')) { // Exact match for /admin dashboard
             return pathname === '/admin';
        }
        // For parent items, check if the current path starts with the link's path,
        // but only if the link's path is not just "/admin" (to avoid matching all sub-routes)
        // and it's not an exact match for the dashboard page itself (which is handled above).
        return path !== '/admin' && pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
          await signOut();
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast({ variant: "destructive", title: "Logout Error", description: error.message });
          } else {
            toast({ variant: "destructive", title: "Logout Error", description: "An unknown error occurred during logout." });
          }
        }
    };

    if (authLoading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                    Loading authentication state...
                </p>
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
                                   {isSubMenuOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
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
                    <h2 className="text-xl font-semibold p-2">Admin Panel</h2>
                     <SidebarTrigger/> 
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {renderNavItems(adminNavLinks)}
                    </SidebarMenu>
                </SidebarContent>
                 <SidebarFooter>
                     <div className="flex items-center gap-2 p-2 border-t border-sidebar-border">
                         <Avatar className="h-8 w-8">
                             <AvatarImage src={currentUser?.photoURL ?? undefined} alt={currentUser?.displayName ?? 'Admin'} />
                             <AvatarFallback>{currentUser?.displayName?.[0]?.toUpperCase() ?? currentUser?.email?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col text-xs truncate">
                             <span className="font-medium text-sidebar-foreground">{currentUser?.displayName || currentUser?.email || "Guest Admin"}</span>
                             {currentUser?.displayName && currentUser.email && <span className="text-muted-foreground">{currentUser.email}</span> }
                         </div>
                         <Button variant="ghost" size="sm" className="ml-auto" onClick={handleLogout}>Logout</Button>
                     </div>
                 </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                 <div className="p-4 md:p-8">
                    {children}
                 </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
