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
    Car,
    ChevronsUpDown,
    Trash2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { switchPrimaryVehicle } from "@/app/dashboard/actions";
import { deleteVehicleAction } from "@/app/dashboard/settings/vehicle/actions";
import { signOut } from "@/app/auth/actions";
import { toast } from "sonner";
import { Vehicle } from "@/app/dashboard/types";
import { Logo } from "@/components/brand/Logo";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppSidebarProps {
    user: {
        full_name: string;
        email?: string;
    };
    vehicles: Vehicle[];
    activeVehicleId: string | null;
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

export function AppSidebar({ user, vehicles, activeVehicleId, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];

    const handleSwitchVehicle = async (vehicleId: string) => {
        if (vehicleId === activeVehicleId) return;

        const toastId = toast.loading("Switching vehicle...");
        try {
            await switchPrimaryVehicle(vehicleId);
            toast.success("Vehicle switched!", { id: toastId });
        } catch {
            toast.error("Failed to switch vehicle", { id: toastId });
        }
    };

    const handleDeleteVehicle = async (e: React.MouseEvent, vehicleId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this vehicle?")) return;

        const toastId = toast.loading("Deleting vehicle...");
        try {
            const result = await deleteVehicleAction(vehicleId);
            if (result.success) {
                toast.success("Vehicle deleted!", { id: toastId });
            } else {
                toast.error(result.error || "Failed to delete", { id: toastId });
            }
        } catch {
            toast.error("Error deleting vehicle", { id: toastId });
        }
    };

    return (
        <Sidebar
            collapsible="icon"
            {...props}
            className="border-r border-border/10 bg-background/40 backdrop-blur-xl overflow-hidden"
        >
            <SidebarHeader className="h-auto border-b border-border/10 p-4 bg-transparent flex flex-col gap-4">
                <Logo className="px-2" />

                {/* Dashboard Vehicle Switcher */}
                <div className="px-1 group-data-[collapsible=icon]:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="h-14 w-full justify-between rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 shadow-premium transition-all active:scale-[0.98] group/switcher"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-neon-primary/10 text-neon-primary shadow-inner group-hover/switcher:bg-neon-primary/20 transition-colors">
                                        <Car className="size-5" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-bold text-slate-900 dark:text-white">
                                            {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : "No Vehicle"}
                                        </span>
                                        <span className="truncate text-[10px] text-slate-500 font-medium">
                                            {activeVehicle ? `${activeVehicle.year} • Active` : "Please set vehicle"}
                                        </span>
                                    </div>
                                </div>
                                <ChevronsUpDown className="size-4 text-slate-500" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl shadow-premium backdrop-blur-2xl bg-slate-950/90 border-white/10 p-2"
                            side="bottom"
                            align="start"
                            sideOffset={8}
                        >
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500/80">
                                Switch Vehicle
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <div className="space-y-1 mt-1">
                                {vehicles.map((v) => (
                                    <div
                                        key={v.id}
                                        className={`rounded-xl py-2.5 px-3 transition-colors cursor-pointer flex items-center justify-between group/item ${v.id === activeVehicleId ? 'bg-neon-primary/10' : 'hover:bg-white/5'}`}
                                        onClick={() => handleSwitchVehicle(v.id)}
                                    >
                                        <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 w-full">
                                                <span className={`font-bold transition-colors truncate ${v.id === activeVehicleId ? 'text-neon-primary' : 'text-slate-200'}`}>
                                                    {v.make} {v.model}
                                                </span>
                                                {v.id === activeVehicleId && (
                                                    <div className="size-1.5 shrink-0 rounded-full bg-neon-primary shadow-[0_0_8px_rgba(19,236,91,0.5)]" />
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-medium tracking-wide italic truncate">
                                                {v.year} • {v.id === activeVehicleId ? 'Current Driving' : 'Available'}
                                            </span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 rounded-lg hover:bg-ruby-500/20 text-slate-500 hover:text-ruby-500 transition-all opacity-0 group-hover/item:opacity-100"
                                            onClick={(e: React.MouseEvent) => handleDeleteVehicle(e, v.id)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <DropdownMenuItem className="rounded-xl focus:bg-white/10 py-2 transition-colors cursor-pointer" asChild>
                                <Link href="/dashboard/settings/vehicle" className="flex items-center w-full">
                                    <Settings className="size-4 mr-2 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-300">Manage Vehicles</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6 bg-transparent">
                <SidebarMenu className="gap-1.5">
                    {mainNav.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url}
                                className={`h-11 rounded-xl transition-all duration-300 group ${pathname === item.url
                                    ? 'bg-neon-primary/10 text-neon-primary font-semibold shadow-inner'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Link href={item.url} className="flex items-center gap-3">
                                    <div className={`p-1 rounded-lg transition-colors ${pathname === item.url ? 'bg-neon-primary text-navy-dark shadow-md' : 'group-hover:bg-white/10'}`}>
                                        <item.icon className="size-4" />
                                    </div>
                                    <span className="text-sm tracking-tight">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>

                <div className="my-6 px-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-border/10 to-transparent" />
                </div>

                <SidebarMenu className="gap-1.5">
                    {secondaryNav.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url}
                                className={`h-11 rounded-xl transition-all duration-300 ${pathname === item.url
                                    ? 'bg-slate-500/10 text-slate-900 dark:text-white font-semibold'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Link href={item.url} className="flex items-center gap-3">
                                    <div className={`p-1 rounded-lg ${pathname === item.url ? 'bg-slate-700 text-white' : ''}`}>
                                        <item.icon className="size-4" />
                                    </div>
                                    <span className="text-sm tracking-tight">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/10 p-4 space-y-4 bg-transparent">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-data-[collapsible=icon]:hidden">Appearance</span>
                    <ModeToggle />
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    className="data-[state=open]:bg-white/10 data-[state=open]:text-white rounded-2xl border border-white/5 shadow-premium hover:shadow-neon-primary/5 transition-all hover:scale-[1.02] bg-white/5 group"
                                >
                                    <Avatar className="h-9 w-9 rounded-xl shadow-lg border-2 border-neon-primary/20">
                                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-neon-primary to-neon-primary/80 text-navy-dark font-bold text-xs">
                                            {user.full_name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden ml-2">
                                        <span className="truncate font-bold text-slate-900 dark:text-white">{user.full_name}</span>
                                        <span className="truncate text-[10px] text-neon-primary font-semibold tracking-tight">Active Professional</span>
                                    </div>
                                    <ChevronRight className="ml-auto size-4 text-slate-500 group-data-[collapsible=icon]:hidden transition-transform group-hover:translate-x-0.5" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-2xl shadow-premium backdrop-blur-2xl bg-slate-950/90 border-white/10 p-2"
                                side="right"
                                align="end"
                                sideOffset={12}
                            >
                                <DropdownMenuLabel className="p-2 font-normal">
                                    <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-10 w-10 rounded-xl">
                                            <AvatarFallback className="rounded-xl bg-neon-primary/20 text-neon-primary font-bold">
                                                {user.full_name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-bold text-white">{user.full_name}</span>
                                            <span className="truncate text-xs text-slate-500 font-medium tracking-tight">{user.email || "user@example.com"}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
                                <DropdownMenuGroup className="space-y-1">
                                    <DropdownMenuItem className="rounded-xl focus:bg-neon-primary/10 focus:text-white py-2.5 transition-colors cursor-pointer" asChild>
                                        <Link href="/dashboard/settings/profile" className="flex items-center w-full">
                                            <div className="p-2 rounded-lg bg-white/5 mr-3">
                                                <User className="size-4" />
                                            </div>
                                            <span className="font-medium">My Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl focus:bg-emerald-500/10 focus:text-white py-2.5 transition-colors cursor-pointer">
                                        <div className="p-2 rounded-lg bg-white/5 mr-3">
                                            <Bell className="size-4" />
                                        </div>
                                        <span className="font-medium">Notifications</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl focus:bg-emerald-500/10 focus:text-white py-2.5 transition-colors cursor-pointer">
                                        <div className="p-2 rounded-lg bg-white/5 mr-3">
                                            <CreditCard className="size-4" />
                                        </div>
                                        <span className="font-medium">Billing & Plan</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
                                <DropdownMenuItem
                                    className="rounded-xl text-ruby-500 focus:bg-ruby-500/10 focus:text-ruby-400 py-2.5 transition-colors cursor-pointer"
                                    onClick={() => signOut()}
                                >
                                    <div className="p-2 rounded-lg bg-ruby-500/10 mr-3">
                                        <LogOut className="size-4" />
                                    </div>
                                    <span className="font-bold">Sign Out</span>
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
