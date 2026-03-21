import * as React from 'react';
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';

interface WeeklySummaryEmailProps {
    gross: number;
    expenses: number;
    netProfit: number;
    miles: number;
    dateRange: string;
}

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gigmiles.app'

export const WeeklySummaryEmail = ({
    gross = 1250.50,
    expenses = 320.10,
    netProfit = 930.40,
    miles = 450,
    dateRange = 'Feb 10 - Feb 16'
}: WeeklySummaryEmailProps) => {
    const previewText = `You earned $${netProfit.toFixed(0)} this week! Check your full performance report.`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Weekly Performance Report
                            </Heading>
                            <Text className="text-black text-[14px] leading-[24px] text-center">
                                {dateRange}
                            </Text>
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <div className="inline-block p-4 rounded-lg bg-green-50 border border-green-200">
                                <Text className="text-green-700 font-bold text-[32px] m-0 leading-[1]">
                                    ${netProfit.toFixed(2)}
                                </Text>
                                <Text className="text-green-600 text-[12px] uppercase tracking-wider font-semibold m-0 mt-2">
                                    Net Profit
                                </Text>
                            </div>
                        </Section>

                        <Section>
                            <div className="w-full flex justify-between mb-4 border-b border-gray-100 pb-2">
                                <Text className="text-gray-500 m-0">Gross Earnings</Text>
                                <Text className="text-black font-semibold m-0">${gross.toFixed(2)}</Text>
                            </div>
                            <div className="w-full flex justify-between mb-4 border-b border-gray-100 pb-2">
                                <Text className="text-gray-500 m-0">Total Expenses</Text>
                                <Text className="text-red-500 font-semibold m-0">-${expenses.toFixed(2)}</Text>
                            </div>
                            <div className="w-full flex justify-between mb-4 border-b border-gray-100 pb-2">
                                <Text className="text-gray-500 m-0">Total Miles</Text>
                                <Text className="text-black font-semibold m-0">{miles} mi</Text>
                            </div>
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`${APP_URL}/dashboard`}
                            >
                                View Full Dashboard
                            </Button>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This email was intended for you. If you were not expecting this, you can ignore this email.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WeeklySummaryEmail;
