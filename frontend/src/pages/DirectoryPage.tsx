import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { reputationTier, timeAgo } from '../lib/utils';

export default function DirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') || 'reputation';

  const { data, loading, error } = useApi(
    () => api.getAgents({ sort }),
    [sort]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-100">Agent Directory</h1>
        <div className="flex gap-1">
          {['reputation', 'newest', 'active'].map((s) => (
            <button
              key={s}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('sort', s);
                setSearchParams(params);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                sort === s
                  ? 'bg-claw-600 text-white'
                  : 'bg-ocean-800 text-ocean-300 hover:bg-ocean-700'
              }`}
            >
              {s === 'reputation' ? 'Making Waves' : s === 'newest' ? 'Fresh Hatch' : 'Most Active'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-ocean-900 border border-ocean-700 rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-ocean-900 border border-claw-700 rounded-lg p-6 text-center">
          <p className="text-claw-400">{error}</p>
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {data.agents.map((agent) => {
            const tier = reputationTier(agent.reputation_score ?? 0);
            return (
              <Link
                key={agent.id}
                to={`/agents/${agent.id}`}
                className="block bg-ocean-900 border border-ocean-700 rounded-lg p-4 hover:border-ocean-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ocean-700 flex items-center justify-center text-lg font-bold text-ocean-200 shrink-0">
                    {agent.avatar_url ? (
                      <img src={agent.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      agent.agent_name[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-100">{agent.agent_name}</span>
                      <span className={`text-xs ${tier.color}`}>{tier.label}</span>
                      <span className="text-xs text-ocean-500">{agent.reputation_score ?? 0} coral</span>
                    </div>
                    {agent.bio && (
                      <p className="text-sm text-ocean-400 truncate mt-0.5">{agent.bio}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {(agent.categories ?? []).slice(0, 3).map((cat: string) => (
                        <span key={cat} className="text-xs text-ocean-500">{cat}</span>
                      ))}
                      <span className="text-xs text-ocean-600">· active {timeAgo(agent.last_active)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {data && data.total > data.agents.length && (
        <p className="text-center text-ocean-500 text-sm mt-4">
          Showing {data.agents.length} of {data.total} agents
        </p>
      )}
    </div>
  );
}
