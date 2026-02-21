import { HelpCircle, Mail, MessageSquare, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from './ContactForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Support | GigMiles',
    description: 'Help and support for GigMiles',
}

const FAQs = [
    {
        question: "How is my estimated tax calculated?",
        answer: "We use a combined effective tax rate based on the federal self-employment tax (15.3%) and your state's estimated income tax brackets. We apply standard mileage deductions to your gross earnings before calculating taxes."
    },
    {
        question: "Why should I track miles instead of gas receipts?",
        answer: "The IRS standard mileage rate (currently 67 cents/mile for 2024) typically provides a much higher tax deduction than tracking actual vehicle expenses like gas and maintenance, especially for gig economy workers."
    },
    {
        question: "Can I enter electric vehicle (EV) charging costs?",
        answer: "Yes! When you add a vehicle in Settings, select 'Electric' as the Fuel Type. You can then enter the electricity cost per kWh, and the dashboard will calculate your 'Charging Cost' instead of Fuel Cost."
    },
    {
        question: "How is Wear & Tear calculated?",
        answer: "Wear and tear is calculated using your vehicle's depreciation rate (which you can set in your vehicle profile) multiplied by the total miles driven during your shifts."
    },
    {
        question: "Where do I add new platforms like Instacart or Amazon Flex?",
        answer: "Go to the Settings page. Under 'Platform & Gig Preferences', you can toggle on or off any platforms you deliver for. They will then appear in your New Entry forms."
    },
    {
        question: "My dashboard stats look incorrect, what can I do?",
        answer: "Ensure that all your entries for the day have been correctly logged and saved. Financial metrics might also shift depending on your selected Active Vehicle, which applies different efficiency rates."
    }
]

export default function SupportPage() {
    return (
        <div className="space-y-8 animate-fade-in pb-12 w-full max-w-6xl mx-auto">
            {/* Header Section */}
            <div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                        <HelpCircle className="size-8" />
                    </div>
                    Help &amp; Support
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">
                    Find answers to common questions or reach out directly to our support team.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-5 items-start">
                {/* 3 Columns for FAQ */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="glass-card border-white/5 shadow-2xl overflow-hidden">
                        <CardHeader className="bg-slate-900/50 border-b border-white/5 pb-5">
                            <CardTitle className="flex items-center gap-2 text-xl font-display">
                                <MessageSquare className="size-5 text-indigo-400" />
                                Frequently Asked Questions
                            </CardTitle>
                            <CardDescription className="text-slate-400">Everything you need to know about setting up and operating your GigMiles app.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/5">
                                {FAQs.map((faq, index) => (
                                    <details key={index} className="group cursor-pointer bg-slate-900/10 hover:bg-slate-900/30 transition-colors">
                                        <summary className="flex items-center justify-between font-bold text-slate-200 p-5 select-none marker-none list-none [&::-webkit-details-marker]:hidden">
                                            {faq.question}
                                            <ChevronDown className="size-4 text-slate-500 group-open:rotate-180 transition-transform duration-300" />
                                        </summary>
                                        <div className="text-slate-400 leading-relaxed font-medium px-5 pb-5 pt-0 animate-fade-in-up">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2 Columns for Contact Form */}
                <div className="lg:col-span-2 sticky top-24">
                    <Card className="glass-card border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none transition-all duration-700" />

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-display relative z-10">
                                <Mail className="size-5 text-indigo-400" />
                                Contact Us
                            </CardTitle>
                            <CardDescription className="text-slate-400 relative z-10">
                                Can&apos;t find the answer? Drop us a line below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ContactForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
