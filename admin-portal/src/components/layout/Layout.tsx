import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
