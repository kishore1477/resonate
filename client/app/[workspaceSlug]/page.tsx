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

async function getBoards(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/public/${slug}/boards`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data;
  } catch {
    return [];
  }
}

export default async function PublicWorkspacePage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const workspace = await getWorkspace(params.workspaceSlug);
  const boards = await getBoards(params.workspaceSlug);

  if (!workspace) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {workspace.logo ? (
                <img src={workspace.logo} alt={workspace.name} className="w-8 h-8 rounded" />
              ) : (
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: workspace.primaryColor || '#6366f1' }}
                >
                  {workspace.name.charAt(0)}
                </div>
              )}
              <h1 className="text-xl font-bold">{workspace.name}</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href={`/${params.workspaceSlug}`} className="text-gray-600 hover:text-gray-900">
                Feedback
              </Link>
              <Link
                href={`/${params.workspaceSlug}/roadmap`}
                className="text-gray-600 hover:text-gray-900"
              >
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
        {workspace.description && (
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            {workspace.description}
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board: any) => (
            <Link
              key={board.id}
              href={`/${params.workspaceSlug}/${board.slug}`}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold">{board.name}</h2>
              {board.description && (
                <p className="text-gray-500 mt-1 text-sm">{board.description}</p>
              )}
              <p className="text-gray-400 text-sm mt-3">{board._count?.posts || 0} posts</p>
            </Link>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No public boards available.</p>
          </div>
        )}
      </main>
    </div>
  );
}
