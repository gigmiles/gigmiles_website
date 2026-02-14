"use client";

import * as React from "react";
import {
    LayoutDashboard,
    BarChart3,
    Calculator,
    Settings,
    ChevronRight,
    LogOut,
    User,
    CreditCard,
    Bell,
    Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppSidebarProps {
    user: {
        full_name: string;
        email?: string;
    };
}

const mainNav = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart3,
    },
    {
        title: "Tax Center",
        url: "/dashboard/tax",
        icon: Calculator,
    },
];

const secondaryNav = [
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
];

export function AppSidebar({ user, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-border/50 bg-sidebar">
            <SidebarHeader className="h-16 border-b border-border/50 px-6 flex flex-row items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
                    <Calculator className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-display font-semibold text-sidebar-foreground">GigTracker</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">Professional Edition</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarMenu>
                    {mainNav.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url}
                                className="transition-all duration-200"
                            >
                                <Link href={item.url}>
                                    <item.icon className="size-5" />
                                    <span className="font-medium">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>

                <SidebarSeparator className="my-4 opacity-50" />

                <SidebarMenu>
                    {secondaryNav.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url}
                            >
                                <Link href={item.url}>
                                    <item.icon className="size-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 p-2 space-y-2">
                <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">Appearance</span>
                    <ModeToggle />
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-full border border-sidebar-border shadow-sm hover:shadow-md transition-all hover:scale-[1.02] bg-sidebar-accent/10"
                                >
                                    <Avatar className="h-8 w-8 rounded-full shadow-none border border-emerald-500/20">
                                        <AvatarFallback className="rounded-full bg-emerald-500 text-white font-bold">
                                            {user.full_name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">{user.full_name}</span>
                                        <span className="truncate text-xs text-sidebar-foreground/60">Free Plan</span>
                                    </div>
                                    <ChevronRight className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-premium"
                                side="right"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                                                {user.full_name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user.full_name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{user.email || "user@example.com"}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="focus:bg-slate-50" asChild>
                                        <Link href="/dashboard/settings/profile" className="flex items-center w-full cursor-pointer">
                                            <User className="mr-2 size-4" />
                                            My Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-slate-50">
                                        <Bell className="mr-2 size-4" />
                                        Notifications
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-slate-50">
                                        <CreditCard className="mr-2 size-4" />
                                        Billing
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-ruby-600 focus:bg-ruby-50 focus:text-ruby-600">
                                    <LogOut className="mr-2 size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
