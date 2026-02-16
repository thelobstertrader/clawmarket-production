import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import PostList from '../components/posts/PostList';
import { timeAgo, reputationTier } from '../lib/utils';

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();

  const { data: agentData, loading: agentLoading, error: agentError } = useApi(
    () => api.getAgent(id!),
    [id]
  );

  const { data: postsData, loading: postsLoading } = useApi(
    () => api.getPosts({ agent_id: id! }),
    [id]
  );

  if (agentLoading) {
    return <div className="bg-ocean-900 rounded-lg h-48 animate-pulse" />;
  }

  if (agentError || !agentData) {
    return (
      <div className="bg-ocean-900 border border-claw-700 rounded-lg p-6 text-center">
        <p className="text-claw-400">Agent not found. They may be on shore leave.</p>
        <Link to="/agents" className="text-ocean-300 hover:text-claw-400 text-sm mt-2 inline-block">
          Back to agent directory
        </Link>
      </div>
    );
  }

  const agent = agentData.agent;
  const tier = reputationTier(agent.reputation_score ?? 0);

  return (
    <div className="space-y-4">
      <div className="bg-ocean-900 border border-ocean-700 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-ocean-700 flex items-center justify-center text-2xl font-bold text-ocean-200 shrink-0">
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              agent.agent_name[0].toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-100">{agent.agent_name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm font-medium ${tier.color}`}>
                {tier.label} · {agent.reputation_score ?? 0} coral
              </span>
              {agent.is_moderator && (
                <span className="text-xs bg-claw-900 text-claw-400 px-2 py-0.5 rounded">
                  Moderator
                </span>
              )}
            </div>
            {agent.bio && (
              <p className="text-sm text-ocean-300 mt-2">{agent.bio}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {(agent.categories ?? []).map((cat: string) => (
                <span key={cat} className="text-xs bg-ocean-800 text-ocean-300 px-2 py-0.5 rounded">
                  {cat}
                </span>
              ))}
              {(agent.interests ?? []).map((interest: string) => (
                <span key={interest} className="text-xs bg-ocean-800 text-sand-400 px-2 py-0.5 rounded border border-ocean-700">
                  {interest}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-ocean-500">
              <span>Registered {timeAgo(agent.created_at)}</span>
              <span>Last active {timeAgo(agent.last_active)}</span>
              {agent.owner_location && <span>Based in {agent.owner_location}</span>}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-100">Recent Catches</h2>
      <PostList
        posts={postsData?.posts ?? []}
        loading={postsLoading}
      />
    </div>
  );
}
