
"use client"; // Needed for state management (sidebar) and auth check simulation

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
    Image as ImageIcon,
    ScanSearch,
    Box,
    Sparkles,
    Ruler
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
import { usePathname } from 'next/navigation'; // To highlight active link

// --- Placeholder Authentication ---
// In a real app, replace this with actual authentication context/logic
const useAdminAuth = () => {
    // Simulate checking if the user is an admin
    // For now, assume the user is authenticated and is an admin
    const isAuthenticated = true; // Replace with real check
    const isAdmin = true; // Replace with role check
    const user = {
        name: "Admin User",
        email: "admin@timberline.com", // Replace with actual user data
        // imageUrl: "https://picsum.photos/seed/admin-avatar/40/40", // Optional avatar
    };

    if (!isAuthenticated || !isAdmin) {
        // In a real app, you would redirect to a login page or show an unauthorized message
        // For this placeholder, we'll allow access but you'd implement redirection here
        // Example:
        // import { redirect } from 'next/navigation';
        // if (typeof window !== 'undefined') redirect('/login?unauthorized=true');
        console.warn("Placeholder Auth: User is not an authorized admin.");
         // return { isAuthenticated: false, user: null };
    }

    return { isAuthenticated: true, user };
};
// --- End Placeholder Authentication ---


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
            { href: "/admin/products/photos", label: "Photos", icon: ImageIcon },
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
    { href: "/admin/users", label: "Users", icon: Users }, // Basic user management
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAdminAuth();
    const pathname = usePathname();
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    const toggleSubMenu = (label: string) => {
        setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    // Determine if a path or its subpath is active
    const isActive = (path: string, isSubItem = false): boolean => {
        if (isSubItem) {
            return pathname === path;
        }
         // For main menu items, check if the current path starts with the item's href
        // Special case for dashboard ('/admin') to avoid matching all '/admin/*' paths
        if (path === '/admin') {
             return pathname === '/admin';
        }
        return pathname.startsWith(path);
    };


    if (!isAuthenticated) {
        // Render a simple message or redirect component if not authenticated
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Access Denied. Please log in as an admin.</p>
                {/* Or <Redirect to="/login" /> */}
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
                              {/* <link.icon /> */}
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
                        isActive={active && !hasSubItems} // Only highlight main item if no sub-items or exact match
                        className="justify-between" // Ensure button stretches
                    >
                        {hasSubItems ? (
                            // Use a div or button if it's just a trigger
                            <div className="flex items-center gap-2 w-full">
                                <link.icon />
                                <span>{link.label}</span>
                                 <span className="ml-auto"> {/* Push chevron to the right */}
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
                    {/* Admin Header Content - e.g., Logo/Title */}
                    <h2 className="text-xl font-semibold p-2">Admin Panel</h2>
                     <SidebarTrigger/> {/* Optional: Button to toggle collapse */}
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {renderNavItems(adminNavLinks)}
                    </SidebarMenu>
                </SidebarContent>
                 <SidebarFooter>
                     <div className="flex items-center gap-2 p-2 border-t border-sidebar-border">
                         <Avatar className="h-8 w-8">
                             <AvatarImage src={user?.imageUrl ?? undefined} alt={user?.name ?? 'Admin'} />
                             <AvatarFallback>{user?.name?.[0] ?? 'A'}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col text-xs truncate">
                             <span className="font-medium text-sidebar-foreground">{user?.name}</span>
                             <span className="text-muted-foreground">{user?.email}</span>
                         </div>
                         {/* Add Logout Button or Link here */}
                         {/* <Button variant="ghost" size="sm" className="ml-auto">Logout</Button> */}
                     </div>
                 </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                {/* Main content area for admin pages */}
                 <div className="p-4 md:p-8"> {/* Add padding to content area */}
                    {children}
                 </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
