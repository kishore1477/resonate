'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const settingsSections = [
  {
    title: 'General',
    description: 'Workspace name, slug, and branding',
    href: 'settings/general',
    icon: '⚙️',
  },
  {
    title: 'Members',
    description: 'Manage team members and roles',
    href: 'settings/members',
    icon: '👥',
  },
  {
    title: 'Integrations',
    description: 'Connect with Slack, Discord, and more',
    href: 'settings/integrations',
    icon: '🔗',
  },
  {
    title: 'API Keys',
    description: 'Manage API keys for widget embedding',
    href: 'settings/api-keys',
    icon: '🔑',
  },
  {
    title: 'Billing',
    description: 'Subscription and payment settings',
    href: 'settings/billing',
    icon: '💳',
  },
];

export default function SettingsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your workspace settings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {settingsSections.map((section) => (
          <Link key={section.title} href={`/dashboard/${workspaceSlug}/${section.href}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
