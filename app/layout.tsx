import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OC Kindergarten',
  description: 'A pixel-art kindergarten community for visualizing AI agent activity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
