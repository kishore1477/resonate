'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Map,
  Megaphone,
  Settings,
  Users,
  ChevronDown,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useWorkspaces } from '@/lib/hooks/useWorkspace';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;

  // If no workspace selected, show workspace selector
  if (!workspaceSlug) {
    return (
      <div className="min-h-screen flex">
        <Sidebar workspaceSlug={undefined} pathname={pathname} />
        <main className="flex-1 bg-gray-50">
          <div className="p-8">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar workspaceSlug={workspaceSlug} pathname={pathname} />
      <main className="flex-1 bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

interface SidebarProps {
  workspaceSlug: string | undefined;
  pathname: string;
}

function Sidebar({ workspaceSlug, pathname }: SidebarProps) {
  const baseUrl = workspaceSlug ? `/dashboard/${workspaceSlug}` : '/dashboard';
  const { data: workspaces } = useWorkspaces();
  const currentWorkspace = workspaces?.find((workspace) => workspace.slug === workspaceSlug);

  const navigation = [
    { name: 'Overview', href: baseUrl, icon: LayoutDashboard, exact: true },
    { name: 'Boards', href: `${baseUrl}/boards`, icon: MessageSquare },
    { name: 'Roadmap', href: `${baseUrl}/roadmap`, icon: Map },
    { name: 'Changelog', href: `${baseUrl}/changelog`, icon: Megaphone },
    { name: 'Members', href: `${baseUrl}/settings/members`, icon: Users },
    { name: 'Settings', href: `${baseUrl}/settings`, icon: Settings, exact: true },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          <span>Resonate</span>
        </Link>
      </div>

      {/* Workspace Selector */}
      <div className="p-3 border-b border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-white hover:bg-gray-800 hover:text-white"
            >
              <span className="truncate">
                {currentWorkspace?.name || workspaceSlug || 'Select Workspace'}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {workspaces && workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <DropdownMenuItem key={workspace.id} asChild>
                  <Link href={`/dashboard/${workspace.slug}`}>{workspace.name}</Link>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No workspaces</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Workspace
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Demo User</p>
            <p className="text-xs text-gray-400 truncate">demo@resonate.app</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
