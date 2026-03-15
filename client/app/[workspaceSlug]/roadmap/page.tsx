import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getWorkspace(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/public/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

async function getRoadmap(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/public/${slug}/roadmap`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data;
  } catch {
    return [];
  }
}

export default async function PublicRoadmapPage({ params }: { params: { workspaceSlug: string } }) {
  const workspace = await getWorkspace(params.workspaceSlug);
  const columns = await getRoadmap(params.workspaceSlug);

  if (!workspace) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${params.workspaceSlug}`} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: workspace.primaryColor || '#6366f1' }}
              >
                {workspace.name.charAt(0)}
              </div>
              <h1 className="text-xl font-bold">{workspace.name}</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href={`/${params.workspaceSlug}`} className="text-gray-600 hover:text-gray-900">
                Feedback
              </Link>
              <Link href={`/${params.workspaceSlug}/roadmap`} className="text-primary font-medium">
                Roadmap
              </Link>
              <Link
                href={`/${params.workspaceSlug}/changelog`}
                className="text-gray-600 hover:text-gray-900"
              >
                Changelog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Roadmap</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column: any) => (
            <div key={column.id} className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {column.title}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {column.items.length}
                </span>
              </h3>

              <div className="space-y-3">
                {column.items.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No items</p>
                ) : (
                  column.items.map((item: any) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">▲ {item.voteCount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
