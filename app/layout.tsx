import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import VapiWidget from "@/components/VapiWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Civic Issue Reporting System",
    description: "Report and track community issues efficiently",
    generator: "v0.app",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const vapiApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY as
        | string
        | undefined;
    const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID as
        | string
        | undefined;
    return (
        <html lang="en">
            <body className={`${inter.className} overflow-x-hidden`}>
                <AuthProvider>
                    {children}
                    <ToastProvider>
                        <ToastViewport />
                    </ToastProvider>
                    {/* Global sticky voice widget (renders once, bottom-right) */}
                    {vapiApiKey && vapiAssistantId ? (
                        <VapiWidget
                            apiKey={vapiApiKey}
                            assistantId={vapiAssistantId}
                        />
                    ) : null}
                </AuthProvider>

                {/* ✅ Razorpay Checkout Script */}
                <Script
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
