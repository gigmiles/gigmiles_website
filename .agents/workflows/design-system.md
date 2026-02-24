---
description: GigMiles Premium Design Language — apply these tokens and patterns to ALL UI changes automatically
---

# GigMiles Premium Design System

> **Always apply these design tokens and patterns when creating or modifying any UI component.** Do not use the old design language (light backgrounds, `electric-blue`, `bg-slate-50`, `bg-white`, `border-slate-200`, etc.)

## Background Palette (3-Layer Depth)

| Layer | Token | Usage |
|-------|-------|-------|
| **Deep** | `bg-[#080c14]` | Footer, alternating sections, heavy emphasis cards |
| **Base** | `bg-[#0a0e17]` | Main page backgrounds, sidebar, primary surfaces |
| **Card** | `bg-[#0d1220]` | Cards, dropdowns, modals, elevated containers |
| **Subtle fill** | `bg-white/[0.02]` or `bg-white/[0.03]` | Inner cards, input fields, subtle containers |

## Borders

- **Standard**: `border-white/[0.06]` — use on ALL card/container borders
- **Hover**: `hover:border-white/[0.1]` or `hover:border-white/[0.12]`
- **Active/Accent**: `border-neon-primary/20` — for highlighted/selected items
- **Dividers**: `bg-gradient-to-r from-transparent via-white/[0.06] to-transparent` (animated gradient line)
- **NEVER** use: `border-slate-200`, `border-slate-800`, `border-slate-100`

## Colors

| Role | Token | Notes |
|------|-------|-------|
| **Primary accent** | `text-neon-primary` / `bg-neon-primary` | Green neon — buttons, badges, active states |
| **Primary CTA text** | `text-[#0a0e17]` | Dark text on neon-primary buttons |
| **Glow shadow** | `shadow-[0_0_20px_rgba(57,255,20,0.2)]` | CTA buttons, active indicators |
| **Headline text** | `text-white` | All headings are white, never `text-navy-dark` in dark mode |
| **Body text** | `text-slate-400` | Paragraphs, descriptions |
| **Muted text** | `text-slate-500` or `text-slate-600` | Labels, captions, secondary info |
| **Micro labels** | `text-slate-600` or `text-slate-700` | Footers, timestamps |
| **AVOID** | `text-electric-blue`, `text-navy-dark` | Old design language |

## Typography Tokens

- **Micro labels**: `text-[10px] font-black uppercase tracking-[0.2em]`
- **Section label**: `text-[10px] font-black uppercase tracking-[0.3em] text-neon-primary/60`
- **Nav links**: `text-sm font-medium text-slate-400 hover:text-white`
- **Card headers**: `text-2xl font-bold text-white`
- **Hero headings**: `text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]`

## Shadows

| Type | Token |
|------|-------|
| **Card** | `shadow-[0_4px_24px_rgba(0,0,0,0.3)]` |
| **Heavy card** | `shadow-[0_8px_40px_rgba(0,0,0,0.5)]` |
| **CTA glow** | `shadow-[0_0_30px_rgba(57,255,20,0.2)]` |
| **Hover glow** | `hover:shadow-[0_0_50px_rgba(57,255,20,0.3)]` |
| **Glass nav** | `shadow-[0_4px_24px_rgba(0,0,0,0.4)]` |

## Buttons

- **Primary CTA**: `bg-neon-primary text-[#0a0e17] font-extrabold rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.2)]`
- **Secondary**: `bg-white/[0.03] border-white/[0.08] text-white font-bold hover:bg-white/[0.06]`
- **Ghost**: `text-slate-300 hover:text-white hover:bg-white/[0.06]`
- **All buttons**: Use `rounded-xl` or `rounded-2xl`, never `rounded-lg`

## Input Fields

```
bg-white/[0.03] border border-white/[0.06] rounded-xl text-white
focus:ring-1 focus:ring-neon-primary/50 focus:border-neon-primary/30
placeholder:text-slate-600
```

## Cards & Containers

- **Base**: `bg-[#0d1220] rounded-[2rem] border border-white/[0.06]`
- **Hover lift**: `hover:-translate-y-1` or `whileHover={{ y: -4 }}`
- **Inner glow blob**: `absolute bg-neon-primary/[0.04] blur-3xl rounded-full` (for premium feel)

## Active/Selected States

- **Neon indicator bar**: `w-[3px] bg-neon-primary rounded-full shadow-[0_0_8px_rgba(57,255,20,0.4)]`
- **Pulse dot**: `animate-pulse bg-neon-primary shadow-[0_0_6px_rgba(57,255,20,0.5)]`
- **Active bg**: `bg-neon-primary/[0.05] border-neon-primary/10`

## Icons

- **Container style**: `p-2 rounded-xl bg-neon-primary/10 text-neon-primary`
- **Hover transform**: `group-hover:scale-110 group-hover:bg-neon-primary group-hover:text-[#0a0e17]`
- **Size**: `size-5` default, `size-8` for featured

## Spacing Rules

- **Section padding**: `py-14` — compact, never `py-24`
- **Section header margins**: `mb-10` — not `mb-16`
- **Card gaps**: `gap-4` or `gap-6` — not `gap-8`
- **Internal card padding**: `p-6` to `p-8` — not `p-10` or `p-12`

## Animation Patterns

- **Ambient glow**: Background blobs with `blur-[100px]` and `animate-pulse` or slow CSS animations
- **Stagger children**: `staggerChildren: 0.1, delayChildren: 0.3`
- **Scroll reveal**: `whileInView={{ opacity: 1, y: 0 }}` with `viewport={{ once: true }}`
- **Hover micro-interactions**: `whileHover={{ scale: 1.02 }}` / `whileTap={{ scale: 0.98 }}`
- **Grid pattern overlay**: Subtle grid lines at `opacity-[0.015]` for texture

## Glass Effect (Nav, Modals)

```
bg-[#0a0e17]/80 backdrop-blur-2xl rounded-2xl border border-white/[0.06]
shadow-[0_4px_24px_rgba(0,0,0,0.4)]
```

## Dropdown Menus

- **Background**: `bg-[#0a0e17]/98 backdrop-blur-2xl`
- **Items**: `rounded-xl focus:bg-white/[0.05]`
- **Dividers**: Gradient lines, not `DropdownMenuSeparator`

## Do NOT Use (Deprecated)

- `bg-white`, `bg-slate-50`, `bg-slate-100`, `bg-slate-900`, `bg-slate-950`
- `electric-blue` (replaced by `neon-primary` or `blue-400`/`blue-500`)
- `border-slate-200`, `border-slate-800`, `border-slate-100`
- `text-navy-dark` in dark contexts
- `shadow-premium`, `shadow-sm`, `shadow-xl`, `shadow-2xl` (use custom shadows)
- `py-24`, `py-20`, `mb-16` (too spacious)
- `rounded-lg` on buttons (use `rounded-xl` or `rounded-2xl`)
