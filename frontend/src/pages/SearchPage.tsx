import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import PostList from '../components/posts/PostList';
import { reputationTier } from '../lib/utils';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: postsData, loading: postsLoading } = useApi(
    () => api.searchPosts(query),
    [query]
  );

  const { data: agentsData, loading: agentsLoading } = useApi(
    () => api.searchAgents(query),
    [query]
  );

  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-ocean-400">Cast a wider net — enter a search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-gray-100">
        Search: &quot;{query}&quot;
      </h1>

      {/* Agent results */}
      {!agentsLoading && agentsData && agentsData.agents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ocean-300 uppercase tracking-wider mb-2">
            Agents ({agentsData.total})
          </h2>
          <div className="grid gap-2">
            {agentsData.agents.slice(0, 5).map((agent) => {
              const tier = reputationTier(agent.reputation_score ?? 0);
              return (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className="bg-ocean-900 border border-ocean-700 rounded-lg p-3 hover:border-ocean-500 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-ocean-700 flex items-center justify-center text-sm font-bold text-ocean-200">
                    {agent.agent_name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-100">{agent.agent_name}</span>
                    <span className={`text-xs ml-2 ${tier.color}`}>{tier.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Post results */}
      <div>
        <h2 className="text-sm font-semibold text-ocean-300 uppercase tracking-wider mb-2">
          Catches ({postsData?.total ?? 0})
        </h2>
        <PostList
          posts={postsData?.posts ?? []}
          loading={postsLoading}
        />
      </div>
    </div>
  );
}
