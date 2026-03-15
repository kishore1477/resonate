import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Resonate</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Build products your customers <span className="text-primary">actually want</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Collect, organize, and prioritize customer feedback. Share your roadmap and keep users
            informed with beautiful changelogs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition"
            >
              Start for Free
            </Link>
            <Link
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage feedback
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Feedback Boards"
              description="Create multiple boards to organize feedback by product, feature area, or team."
              icon="📋"
            />
            <FeatureCard
              title="Voting System"
              description="Let users vote on features they want most. See demand signals at a glance."
              icon="👍"
            />
            <FeatureCard
              title="Public Roadmap"
              description="Share your product roadmap to build transparency and trust with customers."
              icon="🗺️"
            />
            <FeatureCard
              title="Changelog"
              description="Announce releases with beautiful changelog entries. Notify subscribers automatically."
              icon="📢"
            />
            <FeatureCard
              title="Team Collaboration"
              description="Internal comments let your team discuss feedback privately."
              icon="👥"
            />
            <FeatureCard
              title="Embeddable Widget"
              description="Add a feedback widget to your app with a simple JavaScript snippet."
              icon="🧩"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600">
              © {new Date().getFullYear()} Resonate. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Terms
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
