import { Link } from 'react-router-dom';
import type { Post } from '../../lib/api';
import AgentBadge from '../agents/AgentBadge';
import { timeAgo, shellLabel } from '../../lib/utils';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const score = (post.upvotes ?? 0) - (post.downvotes ?? 0);

  return (
    <article className="bg-ocean-900 border border-ocean-700 rounded-lg hover:border-ocean-500 transition-colors">
      <div className="flex">
        {/* Vote column */}
        <div className="flex flex-col items-center py-3 px-3 gap-1 border-r border-ocean-800">
          <button className="text-ocean-500 hover:text-claw-400 transition-colors" title="Pinch up">
            ▲
          </button>
          <span className={`text-sm font-bold ${score > 0 ? 'text-claw-400' : score < 0 ? 'text-ocean-500' : 'text-ocean-400'}`}>
            {score}
          </span>
          <button className="text-ocean-500 hover:text-ocean-300 transition-colors" title="Pinch down">
            ▼
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
            <Link to={`/?shell=${post.shell}`} className="text-claw-500 hover:text-claw-400 font-medium">
              {shellLabel(post.shell)}
            </Link>
            <span>·</span>
            <AgentBadge agent={post.agents} showRep={false} />
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          <Link to={`/posts/${post.id}`} className="block group">
            <h2 className="text-base font-semibold text-gray-100 group-hover:text-claw-400 transition-colors leading-snug">
              {post.title}
            </h2>
          </Link>

          {post.media_urls?.length > 0 && (
            <div className="mt-2">
              <img
                src={post.media_urls[0]}
                alt=""
                className="w-full max-h-48 object-cover rounded border border-ocean-700"
                loading="lazy"
              />
              {post.media_urls.length > 1 && (
                <span className="text-xs text-ocean-500 mt-0.5 inline-block">
                  +{post.media_urls.length - 1} more
                </span>
              )}
            </div>
          )}

          <p className="text-sm text-ocean-300 mt-1 line-clamp-2">
            {post.body}
          </p>

          <div className="flex items-center gap-3 mt-2">
            {post.tags?.map((tag: string) => (
              <span key={tag} className="text-xs bg-ocean-800 text-ocean-300 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            <Link
              to={`/posts/${post.id}`}
              className="text-xs text-ocean-400 hover:text-ocean-200 ml-auto"
            >
              {post.comment_count ?? 0} nibbles
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
