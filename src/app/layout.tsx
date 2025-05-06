import type { Metadata } from "next";
import { Geist, Geist_Mono as geistMonoFont } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: [ "latin" ],
});

const geistMono = geistMonoFont({
    variable: "--font-geist-mono",
    subsets: [ "latin" ],
});

export const metadata: Metadata = {
    title: "Locbeauty",
    description: "Locbeauty company",
};

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="dark" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </head>
            <body
                className={ `${geistSans.variable} ${geistMono.variable} antialiased` }
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    { children }
                </ThemeProvider>
            </body>
        </html>
    );
}
