
"use client"; 

import React, { useState, useEffect } from 'react';
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
    // Box, // No longer used
    Sparkles,
    Ruler,
    Loader2,
    UserPlus,
    MessageSquare
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
import { usePathname, useRouter } from 'next/navigation';
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
            { href: "/admin/products/configurable-prices", label: "Config Prices", icon: DollarSign },
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
    // const router = useRouter(); // Temporarily unused
    const pathname = usePathname();
    const { toast } = useToast();
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    // Check if user has admin privileges
    const isUserAdmin = () => {
        if (!currentUser) return false;
        
        // Option 1: Check by email (simple approach)
        const adminEmails = ["luke@mcconversions.uk", "admin@timberline.com"];
        if (adminEmails.includes(currentUser.email || "")) return true;
        
        // Option 2: Check by custom claims/roles if available
        // This would be more robust in a production environment
        // @ts-ignore - Accessing custom properties on Firebase user
        return currentUser.customClaims?.admin === true || currentUser.role === 'admin';
    };
    
    const isAdmin = isUserAdmin();

    // Authentication check effect
    useEffect(() => {
        if (!authLoading) {
            if (!currentUser) {
                toast({ variant: "destructive", title: "Access Denied", description: "Please log in to access the admin panel." });
                router.push('/login?redirect=/admin');
            } else if (!isAdmin) {
                toast({ variant: "destructive", title: "Unauthorized", description: "You do not have permission to access the admin panel." });
                router.push('/'); 
            }
        }
    }, [currentUser, authLoading, router, isAdmin, toast]);


    const toggleSubMenu = (label: string) => {
        setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (path: string, isSubItem = false): boolean => {
        if (isSubItem) {
            return pathname === path;
        }
        if (path === '/admin') {
             return pathname === '/admin';
        }
        return pathname.startsWith(path);
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

    // Show loading state or prevent access if not authenticated/authorized
    if (authLoading || !currentUser || !isAdmin) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                    Loading authentication state...
                </p>
            </div>
        );
    }

    // The rest of the layout will now render even if currentUser is null
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
