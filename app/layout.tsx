import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Open Source Analytics Kit (GTM & GA4)",
	description:
		"Self-hosted analytics platform with full GTM and GA4 functional parity",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-[#f8f9fa] antialiased text-[#202124]">
				{children}
			</body>
		</html>
	);
}
