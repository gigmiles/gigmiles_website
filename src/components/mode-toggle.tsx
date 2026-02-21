"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return (
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 border border-white/10" />
    )

    const isDark = theme === "dark"

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative h-9 w-9 flex items-center justify-center rounded-full bg-white/5 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-neon-primary/50 transition-colors overflow-hidden group shadow-premium"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="sun"
                        initial={{ y: 20, opacity: 0, rotate: -45 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: 45 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] text-neon-primary" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ y: 20, opacity: 0, rotate: -45 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: 45 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <Moon className="h-[1.2rem] w-[1.2rem] text-electric-blue" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-neon-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
    )
}
