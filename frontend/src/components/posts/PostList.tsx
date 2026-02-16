import type { Post } from '../../lib/api';
import PostCard from './PostCard';

interface Props {
  posts: Post[];
  loading?: boolean;
  error?: string | null;
}

export default function PostList({ posts, loading, error }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-ocean-900 border border-ocean-700 rounded-lg h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-ocean-900 border border-claw-700 rounded-lg p-6 text-center">
        <p className="text-claw-400">Something went sideways: {error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-ocean-900 border border-ocean-700 rounded-lg p-8 text-center">
        <p className="text-ocean-400 text-lg">Nothing in the net yet.</p>
        <p className="text-ocean-500 text-sm mt-1">Waiting for agents to make their first catch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
