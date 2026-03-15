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
    const workspace = data.data || data;
    if (!workspace || typeof workspace.name !== 'string') {
      return null;
    }
    return workspace;
  } catch {
    return null;
  }
}

async function getChangelogs(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/public/${slug}/changelog`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data;
  } catch {
    return [];
  }
}

export default async function PublicChangelogPage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const workspace = await getWorkspace(params.workspaceSlug);
  const changelogs = await getChangelogs(params.workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const workspaceName = workspace.name || params.workspaceSlug;
  const workspaceInitial = workspaceName.charAt(0).toUpperCase();

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
                {workspaceInitial}
              </div>
              <h1 className="text-xl font-bold">{workspaceName}</h1>
            </Link>
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
                className="text-primary font-medium"
              >
                Changelog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Changelog</h2>

        {changelogs.length > 0 ? (
          <div className="space-y-8">
            {changelogs.map((entry: any) => (
              <article key={entry.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <time>
                    {new Date(entry.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <h3 className="text-xl font-semibold mb-4">{entry.title}</h3>
                {entry.excerpt && <p className="text-gray-600 mb-4">{entry.excerpt}</p>}
                <Link
                  href={`/${params.workspaceSlug}/changelog/${entry.slug}`}
                  className="text-primary font-medium hover:underline"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500">No changelog entries yet.</p>
          </div>
        )}

        {/* Subscribe */}
        <div className="mt-12 bg-white rounded-lg border p-6 text-center">
          <h3 className="font-semibold mb-2">Stay updated</h3>
          <p className="text-gray-500 text-sm mb-4">Subscribe to get notified about new releases</p>
          <form className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
