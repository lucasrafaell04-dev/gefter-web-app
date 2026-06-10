'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, Gem, Layers, Droplets, Grid3x3 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/materials', label: 'Materials', icon: Gem },
  { href: '/admin/edge-styles', label: 'Edge Styles', icon: Layers },
  { href: '/admin/sinks', label: 'Sinks', icon: Droplets },
  { href: '/admin/layouts', label: 'Layouts', icon: Grid3x3 },
];

interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export default function AdminShell({ title, children }: AdminShellProps) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gefter Admin</h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">Welcome, {user.full_name}</p>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="flex flex-wrap gap-2 mb-8">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>

        {children}
      </div>
    </div>
  );
}
