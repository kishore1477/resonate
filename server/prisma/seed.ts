import { PrismaClient, MemberRole, PostStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await argon2.hash('password123', {
    type: argon2.argon2id,
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@resonate.app' },
    update: {},
    create: {
      email: 'demo@resonate.app',
      name: 'Demo User',
      passwordHash,
      emailVerified: true,
    },
  });

  console.log(`Created user: ${demoUser.email}`);

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'Building the future of productivity',
      primaryColor: '#6366f1',
      memberships: {
        create: {
          userId: demoUser.id,
          role: MemberRole.OWNER,
          joinedAt: new Date(),
        },
      },
    },
  });

  console.log(`Created workspace: ${workspace.name}`);

  // Create boards
  const featureBoard = await prisma.board.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: 'feature-requests' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Feature Requests',
      slug: 'feature-requests',
      description: 'Share your ideas for new features',
      isPublic: true,
    },
  });

  const bugBoard = await prisma.board.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: 'bug-reports' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Bug Reports',
      slug: 'bug-reports',
      description: 'Report issues and bugs',
      isPublic: true,
    },
  });

  console.log(`Created boards: Feature Requests, Bug Reports`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { boardId_name: { boardId: featureBoard.id, name: 'UI/UX' } },
      update: {},
      create: { boardId: featureBoard.id, name: 'UI/UX', color: '#10b981' },
    }),
    prisma.category.upsert({
      where: { boardId_name: { boardId: featureBoard.id, name: 'Performance' } },
      update: {},
      create: { boardId: featureBoard.id, name: 'Performance', color: '#f59e0b' },
    }),
    prisma.category.upsert({
      where: { boardId_name: { boardId: featureBoard.id, name: 'Integration' } },
      update: {},
      create: { boardId: featureBoard.id, name: 'Integration', color: '#8b5cf6' },
    }),
  ]);

  console.log(`Created categories`);

  // Create sample posts
  const posts = [
    {
      title: 'Add dark mode support',
      content: 'It would be great to have a dark mode option for users who prefer darker interfaces. This would reduce eye strain during night-time usage and save battery on OLED screens.',
      status: PostStatus.PLANNED,
      voteCount: 42,
      categoryId: categories[0].id,
    },
    {
      title: 'Integrate with Slack',
      content: 'Please add Slack integration so we can get notifications in our team channels when there are updates on feature requests we\'re watching.',
      status: PostStatus.IN_PROGRESS,
      voteCount: 38,
      categoryId: categories[2].id,
    },
    {
      title: 'Improve page load performance',
      content: 'The dashboard takes a while to load on slower connections. Would love to see some optimization work done to make it snappier.',
      status: PostStatus.UNDER_REVIEW,
      voteCount: 25,
      categoryId: categories[1].id,
    },
    {
      title: 'Mobile app',
      content: 'A native mobile app would be amazing for checking updates on the go. Both iOS and Android support would be ideal.',
      status: PostStatus.OPEN,
      voteCount: 67,
      categoryId: categories[0].id,
    },
    {
      title: 'Export to CSV',
      content: 'Allow exporting feedback data to CSV format for analysis in spreadsheet applications.',
      status: PostStatus.SHIPPED,
      voteCount: 15,
      categoryId: categories[2].id,
    },
  ];

  for (const postData of posts) {
    const post = await prisma.post.create({
      data: {
        boardId: featureBoard.id,
        authorId: demoUser.id,
        ...postData,
      },
    });

    // Add to roadmap if status is PLANNED or IN_PROGRESS
    if (postData.status === PostStatus.PLANNED) {
      await prisma.roadmapItem.create({
        data: {
          postId: post.id,
          column: 'planned',
          order: 0,
        },
      });
    } else if (postData.status === PostStatus.IN_PROGRESS) {
      await prisma.roadmapItem.create({
        data: {
          postId: post.id,
          column: 'in_progress',
          order: 0,
        },
      });
    } else if (postData.status === PostStatus.SHIPPED) {
      await prisma.roadmapItem.create({
        data: {
          postId: post.id,
          column: 'shipped',
          order: 0,
        },
      });
    }
  }

  console.log(`Created ${posts.length} sample posts`);

  // Create a changelog entry
  await prisma.changelog.upsert({
    where: { workspaceId_slug: { workspaceId: workspace.id, slug: 'initial-launch' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      title: 'Initial Launch',
      slug: 'initial-launch',
      content: `
# We're Live! 🚀

We're excited to announce the launch of our feedback portal. Here's what you can do:

## New Features
- Submit feature requests
- Vote on ideas you want to see built
- Track progress on our public roadmap
- Get notified when features ship

## What's Next
We're actively working on integrations with popular tools like Slack and Discord. Stay tuned!

Thank you for being part of our community.
      `.trim(),
      excerpt: 'Announcing the launch of our feedback portal',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log(`Created changelog entry`);

  console.log('✅ Seeding complete!');
  console.log('\n📧 Demo credentials:');
  console.log('   Email: demo@resonate.app');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
