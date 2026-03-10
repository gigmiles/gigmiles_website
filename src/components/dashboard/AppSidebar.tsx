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
    HelpCircle,
    ShieldAlert,
    Target,
    TrendingUp,
    Sparkles,
    Brain,
    MapPin,
    Zap,
    Wallet,
    CloudRain,
    Trophy,
    Compass
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { switchPrimaryVehicle } from "@/app/dashboard/actions";
import { deleteVehicleAction } from "@/app/dashboard/settings/vehicle/actions";
import { signOut } from "@/app/auth/actions";
import { toast } from "sonner";
import { Vehicle } from "@/app/dashboard/types";
import { VibeLogo } from "@/components/brand/VibeLogo";
import { MagneticCTA } from "@/components/ui/MagneticCTA";
import { cn } from "@/lib/utils";

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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
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
        accent: "neon-primary",
    },
    {
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart3,
        accent: "blue-500",
    },
    {
        title: "Tax Center",
        url: "/dashboard/tax",
        icon: Calculator,
        accent: "amber-500",
    },
];

const secondaryNav = [
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
    {
        title: "Support",
        url: "/dashboard/support",
        icon: HelpCircle,
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
            className="border-r border-white/[0.04] bg-[#0B1120]/95 backdrop-blur-2xl overflow-hidden"
        >
            {/* Ambient living gradient & Noise — subtle, slow-moving */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
                <div className="absolute -top-32 -left-16 w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-[80px] animate-pulse" />
                <div className="absolute bottom-20 -right-10 w-32 h-32 bg-blue-500/[0.03] rounded-full blur-[60px] animate-pulse [animation-delay:2s]" />
            </div>

            <SidebarHeader className="h-auto border-b border-white/[0.04] p-4 bg-transparent flex flex-col gap-4 relative z-10">
                    <VibeLogo className="px-2" iconOnly />

                {/* Vehicle Switcher */}
                <div className="px-1 group-data-[collapsible=icon]:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="h-14 w-full justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-all active:scale-[0.98] group/switcher"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.1)] group-hover/switcher:shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-all">
                                        <Car className="size-5" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-bold text-white text-[13px]">
                                            {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : "No Vehicle"}
                                        </span>
                                        <span className="truncate text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                                            {activeVehicle ? (
                                                <>
                                                    {activeVehicle.year}
                                                    <span className="text-slate-700">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                                        <span className="text-emerald-500/80">Active</span>
                                                    </span>
                                                </>
                                            ) : "Please set vehicle"}
                                        </span>
                                    </div>
                                </div>
                                <ChevronsUpDown className="size-4 text-slate-600" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl bg-[#0B1120]/98 border border-white/[0.06] p-3"
                            side="bottom"
                            align="start"
                            sideOffset={8}
                        >
                            <DropdownMenuLabel className="px-2 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                Your Vehicles
                            </DropdownMenuLabel>
                            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-2" />
                            <div className="space-y-1.5">
                                {vehicles.map((v) => {
                                    const isCurrentVehicle = v.id === activeVehicleId;
                                    return (
                                        <div
                                            key={v.id}
                                            className={cn(
                                                "rounded-xl py-3 px-3 transition-all cursor-pointer flex items-center gap-3 group/item relative overflow-hidden",
                                                isCurrentVehicle
                                                    ? "bg-emerald-500/[0.06] border border-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                                                    : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]"
                                            )}
                                            onClick={() => handleSwitchVehicle(v.id)}
                                        >
                                            {/* Vehicle icon */}
                                            <div className={cn(
                                                "flex aspect-square size-8 items-center justify-center rounded-lg shrink-0 transition-all",
                                                isCurrentVehicle
                                                    ? "bg-emerald-500/15 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                                                    : "bg-white/[0.04] text-slate-500 group-hover/item:text-slate-300"
                                            )}>
                                                <Car className="size-4" />
                                            </div>

                                            {/* Vehicle info */}
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "font-bold text-[13px] truncate transition-colors",
                                                        isCurrentVehicle ? "text-white" : "text-slate-300 group-hover/item:text-white"
                                                    )}>
                                                        {v.make} {v.model}
                                                    </span>
                                                    {isCurrentVehicle && (
                                                        <div className="size-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-600 font-medium tracking-wide truncate flex items-center gap-1.5">
                                                    {v.year}
                                                    <span className="text-slate-700">•</span>
                                                    <span className={isCurrentVehicle ? "text-emerald-500/70" : "text-slate-600"}>
                                                        {isCurrentVehicle ? 'Currently Active' : 'Available'}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Delete button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 rounded-lg hover:bg-ruby-500/20 text-slate-700 hover:text-ruby-500 transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
                                                onClick={(e: React.MouseEvent) => handleDeleteVehicle(e, v.id)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-2.5" />
                            <DropdownMenuItem className="rounded-xl focus:bg-white/[0.05] py-2.5 px-3 transition-colors cursor-pointer" asChild>
                                <Link href="/dashboard/settings/vehicle" className="flex items-center w-full">
                                    <div className="p-1.5 rounded-lg bg-white/[0.04] mr-3">
                                        <Settings className="size-3.5 text-slate-500" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-400">Manage Vehicles</span>
                                    <ChevronRight className="size-3.5 text-slate-700 ml-auto" />
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6 bg-transparent relative z-10">
                {/* Main Navigation — Primary actions */}
                <SidebarMenu className="gap-1">
                    {mainNav.map((item) => {
                        const isActive = pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive}
                                    className={cn(
                                        "h-11 rounded-xl transition-all duration-200 group/nav relative overflow-hidden",
                                        isActive
                                            ? "bg-emerald-500/[0.08] text-white font-semibold"
                                            : "text-slate-500 hover:text-white hover:bg-white/[0.04]"
                                    )}
                                >
                                    <Link href={item.url} className="flex items-center gap-3">
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}
                                        <div className={cn(
                                            "p-1.5 rounded-lg transition-all",
                                            isActive
                                                ? "bg-emerald-500 text-[#0a0e17] shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                                : "text-slate-500 group-hover/nav:text-slate-300"
                                        )}>
                                            <item.icon className="size-4" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.1em]">{item.title}</span>
                                        {/* Live dot for active */}
                                        {isActive && (
                                            <div className="ml-auto size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>

                {/* Divider — living gradient */}
                <div className="my-5 mx-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                {/* Secondary Navigation — Utility actions */}
                <SidebarMenu className="gap-1">
                    {secondaryNav.map((item) => {
                        const isActive = pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive}
                                    className={cn(
                                        "h-10 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-white/[0.06] text-white font-semibold"
                                            : "text-slate-600 hover:text-slate-300 hover:bg-white/[0.03]"
                                    )}
                                >
                                    <Link href={item.url} className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-1 rounded-lg transition-colors",
                                            isActive ? "text-slate-300" : "text-slate-600"
                                        )}>
                                            <item.icon className="size-4" />
                                        </div>
                                        <span className="text-[13px] tracking-tight">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}

                    {/* Admin Section */}
                    {(user.email === 'kayihanozgenc1@gmail.com' || user.email?.includes('admin')) && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip="Admin Messages"
                                isActive={pathname === "/dashboard/admin/messages"}
                                className={cn(
                                    "h-10 rounded-xl transition-all duration-200 border border-indigo-500/10",
                                    pathname === "/dashboard/admin/messages"
                                        ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                                        : "text-indigo-400/50 hover:text-indigo-400 hover:bg-indigo-500/5"
                                )}
                            >
                                <Link href="/dashboard/admin/messages" className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-1 rounded-lg",
                                        pathname === "/dashboard/admin/messages" ? "bg-indigo-500 text-white" : "bg-indigo-500/10"
                                    )}>
                                        <ShieldAlert className="size-4" />
                                    </div>
                                    <span className="text-[13px] tracking-tight font-bold">Admin Panel</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {/* Divider */}
                    <div className="my-5 mx-3">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                    </div>

                    {/* Customize Dashboard */}
                    <SidebarMenuItem>
                        <SidebarCustomizer />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-white/[0.04] p-4 space-y-3 bg-transparent relative z-10">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-data-[collapsible=icon]:hidden">Appearance</span>
                    <ModeToggle />
                </div>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    className="data-[state=open]:bg-white/[0.06] data-[state=open]:text-white rounded-2xl border border-white/[0.06] hover:border-white/10 transition-all hover:bg-white/[0.04] bg-white/[0.02] group h-auto py-2.5"
                                >
                                    <Avatar className="h-9 w-9 rounded-xl shadow-lg border-2 border-emerald-500/20">
                                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-[#0a0e17] font-bold text-xs">
                                            {user.full_name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden ml-2">
                                        <span className="truncate font-bold text-white text-[13px]">{user.full_name}</span>
                                        <span className="truncate text-[10px] font-semibold tracking-tight flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                                            <span className="text-emerald-500/80">Active Professional</span>
                                        </span>
                                    </div>
                                    <ChevronRight className="ml-auto size-4 text-slate-600 group-data-[collapsible=icon]:hidden transition-transform group-hover:translate-x-0.5" />
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
                                            <AvatarFallback className="rounded-xl bg-emerald-500/20 text-emerald-500 font-bold">
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
                                    <DropdownMenuItem className="rounded-xl focus:bg-emerald-500/10 focus:text-white py-2.5 transition-colors cursor-pointer" asChild>
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

function SidebarCustomizer() {
    const [visibleWidgets, setVisibleWidgets] = React.useState({
        goals: true,
        efficiency: true,
        vehicle: true,
        weekly: true,
        recent: true,
        tax: true,
    });

    React.useEffect(() => {
        const saved = localStorage.getItem('gigmiles_dashboard_widgets');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setVisibleWidgets(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse dashboard settings');
            }
        }
    }, []);

    const toggleWidget = (id: keyof typeof visibleWidgets) => {
        const newState = { ...visibleWidgets, [id]: !visibleWidgets[id] };
        setVisibleWidgets(newState);
        localStorage.setItem('gigmiles_dashboard_widgets', JSON.stringify(newState));

        // Dispatch custom event to notify DashboardGrid
        window.dispatchEvent(new CustomEvent('gigmiles_widget_update', { detail: newState }));

        toast.success(`${id.charAt(0).toUpperCase() + id.slice(1)} widget ${newState[id] ? 'enabled' : 'disabled'}`, {
            duration: 2000,
            position: 'bottom-center'
        });
    };

    const widgets = [
        { id: 'goals', label: 'Earnings Goals', icon: Target },
        { id: 'efficiency', label: 'Platform Efficiency', icon: BarChart3 },
        { id: 'vehicle', label: 'Asset Value', icon: Car },
        { id: 'weekly', label: 'Weekly Performance', icon: TrendingUp },
        { id: 'recent', label: 'Recent Activity', icon: LayoutDashboard },
        { id: 'tax', label: 'Tax Shield', icon: Wallet },
    ];

    const futureWidgets = [
        { id: 'mileage', label: 'AI Mileage tracking', icon: MapPin },
        { id: 'tax-ai', label: 'Tax Prediction AI', icon: Brain },
        { id: 'expense-ai', label: 'Smart Categorization', icon: Zap },
    ];

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div>
                    <MagneticCTA>
                        <SidebarMenuButton
                            tooltip="Customize Dashboard"
                            className="h-10 rounded-xl transition-all duration-200 text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/[0.04] group/cust"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1 rounded-lg group-hover/cust:bg-emerald-500/10 transition-colors">
                                    <Sparkles className="size-4" />
                                </div>
                                <span className="text-[13px] tracking-tight group-data-[collapsible=icon]:hidden">Customize</span>
                            </div>
                        </SidebarMenuButton>
                    </MagneticCTA>
                </div>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950/98 border-white/5 backdrop-blur-2xl w-[320px] sm:w-[400px] p-0 flex flex-col">
                <SheetHeader className="p-8 pb-4 border-b border-white/5">
                    <SheetTitle className="text-2xl font-display font-bold text-white text-left">Customize Layout</SheetTitle>
                    <SheetDescription className="text-slate-400 text-left">
                        Toggle dashboard widgets to personalize your workspace.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 scrollbar-none">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Widgets</h3>

                        {widgets.map((widget) => {
                            const isComingSoon = (widget as any).isComingSoon;
                            const isActive = visibleWidgets[widget.id as keyof typeof visibleWidgets] && !isComingSoon;

                            return (
                                <div
                                    key={widget.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group/widget",
                                        isComingSoon ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                                    )}
                                    onClick={() => !isComingSoon && toggleWidget(widget.id as any)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            visibleWidgets[widget.id as keyof typeof visibleWidgets] ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-900 text-slate-500"
                                        )}>
                                            <widget.icon className="size-4" />
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-sm font-bold transition-colors",
                                                isActive ? "text-slate-200" : "text-slate-500"
                                            )}>
                                                {widget.label}
                                            </p>
                                            {isComingSoon && (
                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                    <Sparkles className="size-3" /> Coming Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-10 h-5 rounded-full transition-all relative",
                                        isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-slate-800"
                                    )}>
                                        <div className={cn(
                                            "absolute top-1 size-3 rounded-full bg-white transition-all duration-300",
                                            isActive ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-white/5 mt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Coming Soon</h3>
                                <Sparkles className="size-3 text-emerald-500 animate-pulse" />
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
                        </div>

                        {futureWidgets.map((widget) => (
                            <div
                                key={widget.id}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 opacity-70 grayscale-[0.3] group/future relative overflow-hidden transition-all hover:opacity-100 hover:grayscale-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-900 text-slate-400 group-hover/future:text-emerald-500 transition-colors">
                                        <widget.icon className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 group-hover/future:text-slate-200 transition-colors">
                                            {widget.label}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">Pro</span>
                                </div>

                                {/* Status Dot */}
                                <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-emerald-500/5 blur-2xl rounded-full" />
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mt-auto mb-4">
                        <p className="text-xs text-emerald-500/90 font-medium leading-relaxed">
                            💡 <b>Tip:</b> Toggle widgets on or off to customize your dashboard. The layout adapts automatically for the best look!
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
