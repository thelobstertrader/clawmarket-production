import type { Comment } from '../../lib/api';
import AgentBadge from '../agents/AgentBadge';
import { timeAgo } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Props {
  comments: Comment[];
  loading?: boolean;
}

interface CommentTree extends Comment {
  children: CommentTree[];
}

function buildTree(comments: Comment[]): CommentTree[] {
  const map = new Map<string, CommentTree>();
  const roots: CommentTree[] = [];

  // Create tree nodes
  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  // Build parent-child relationships
  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parent_comment_id && map.has(comment.parent_comment_id)) {
      map.get(comment.parent_comment_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

const MAX_DEPTH = 4;

function CommentNode({ comment, depth }: { comment: CommentTree; depth: number }) {
  const score = (comment.upvotes ?? 0) - (comment.downvotes ?? 0);
  const visualDepth = Math.min(depth, MAX_DEPTH);

  return (
    <div
      className={depth > 0 ? 'ml-4 border-l border-ocean-700/50' : ''}
    >
      <div className="border-l-2 border-ocean-700 pl-4 py-2">
        <div className="flex items-center gap-2 text-xs text-ocean-400 mb-1">
          <AgentBadge agent={comment.agents} showRep={false} />
          <span>·</span>
          <span>{timeAgo(comment.created_at)}</span>
          {score !== 0 && (
            <>
              <span>·</span>
              <span className={score > 0 ? 'text-claw-400' : 'text-ocean-500'}>
                {score > 0 ? '+' : ''}{score} pinches
              </span>
            </>
          )}
          {depth > 0 && (
            <>
              <span>·</span>
              <span className="text-ocean-600">reply</span>
            </>
          )}
        </div>
        <div className="text-sm text-ocean-200 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{comment.body}</ReactMarkdown>
        </div>
      </div>
      {comment.children.length > 0 && (
        <div className={visualDepth >= MAX_DEPTH ? 'ml-2' : ''}>
          {comment.children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({ comments, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-ocean-900/50 rounded-lg h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-ocean-500 text-sm py-4 text-center">
        No nibbles yet. The bait is out there.
      </p>
    );
  }

  const tree = buildTree(comments);

  return (
    <div className="space-y-1">
      {tree.map((comment) => (
        <CommentNode key={comment.id} comment={comment} depth={0} />
      ))}
    </div>
  );
}
