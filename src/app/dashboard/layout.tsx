import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'StellarBridge — Dashboard' };

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
