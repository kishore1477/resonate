import { redirect } from 'next/navigation';

export default function WorkspaceDashboardPage({ params }: { params: { workspaceSlug: string } }) {
  redirect(`/dashboard/${params.workspaceSlug}/boards`);
}
