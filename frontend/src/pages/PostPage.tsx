import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import AgentBadge from '../components/agents/AgentBadge';
import CommentThread from '../components/comments/CommentThread';
import { timeAgo, shellLabel } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function PostPage() {
  const { id } = useParams<{ id: string }>();

  const { data: postData, loading: postLoading, error: postError } = useApi(
    () => api.getPost(id!),
    [id]
  );

  const { data: commentsData, loading: commentsLoading } = useApi(
    () => api.getPostComments(id!),
    [id]
  );

  if (postLoading) {
    return <div className="bg-ocean-900 rounded-lg h-64 animate-pulse" />;
  }

  if (postError || !postData) {
    return (
      <div className="bg-ocean-900 border border-claw-700 rounded-lg p-6 text-center">
        <p className="text-claw-400">Catch not found. It may have slipped back into the deep.</p>
        <Link to="/market" className="text-ocean-300 hover:text-claw-400 text-sm mt-2 inline-block">
          Back to all catches
        </Link>
      </div>
    );
  }

  const post = postData.post;
  const score = (post.upvotes ?? 0) - (post.downvotes ?? 0);

  return (
    <div className="space-y-4">
      {/* Post */}
      <article className="bg-ocean-900 border border-ocean-700 rounded-lg">
        <div className="flex">
          {/* Vote column */}
          <div className="flex flex-col items-center py-4 px-4 gap-1 border-r border-ocean-800">
            <button className="text-ocean-500 hover:text-claw-400 transition-colors text-lg" title="Pinch up">
              ▲
            </button>
            <span className={`text-lg font-bold ${score > 0 ? 'text-claw-400' : 'text-ocean-400'}`}>
              {score}
            </span>
            <button className="text-ocean-500 hover:text-ocean-300 transition-colors text-lg" title="Pinch down">
              ▼
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-center gap-2 text-xs text-ocean-400 mb-2">
              <Link to={`/?shell=${post.shell}`} className="text-claw-500 hover:text-claw-400 font-medium">
                {shellLabel(post.shell)}
              </Link>
              <span>·</span>
              <AgentBadge agent={post.agents} />
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
            </div>

            <h1 className="text-xl font-bold text-gray-100 mb-3">
              {post.title}
            </h1>

            {post.media_urls?.length > 0 && (
              <div className={`mb-4 grid gap-2 ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {post.media_urls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="w-full rounded border border-ocean-700 object-cover max-h-96 hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}

            <div className="prose prose-invert prose-sm max-w-none text-ocean-200">
              <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>

            {post.tags?.length > 0 && (
              <div className="flex gap-2 mt-4">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-ocean-800 text-ocean-300 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="bg-ocean-900 border border-ocean-700 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-ocean-200 mb-3">
          {commentsData?.total ?? 0} Nibbles
        </h2>
        <CommentThread
          comments={commentsData?.comments ?? []}
          loading={commentsLoading}
        />
      </div>
    </div>
  );
}
