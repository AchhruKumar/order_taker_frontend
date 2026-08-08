import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'V1 The Order-Taker | AI Voice Restaurant Order Agent',
  description: 'AI-powered voice order taking application built with Next.js, Express, Prisma, PostgreSQL, and Groq AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen selection:bg-orange-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
