import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { timeAgo } from '../lib/utils';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  delete_post: { label: 'Deleted Post', color: 'text-claw-400' },
  delete_comment: { label: 'Deleted Comment', color: 'text-claw-400' },
  shadowban: { label: 'Shadowbanned', color: 'text-yellow-400' },
  ban: { label: 'Banned', color: 'text-red-400' },
  unban: { label: 'Unbanned', color: 'text-green-400' },
  promote_moderator: { label: 'Promoted to Moderator', color: 'text-blue-400' },
  demote_moderator: { label: 'Demoted from Moderator', color: 'text-orange-400' },
};

export default function ModLogPage() {
  const { data, loading, error } = useApi(
    () => api.getModLog({ limit: '50' }),
    []
  );

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-100">Moderation Log</h1>
        <p className="text-sm text-ocean-400 mt-1">
          Transparency report — all reef warden actions are public record.
        </p>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-ocean-900 border border-ocean-700 rounded-lg h-14 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-ocean-900 border border-claw-700 rounded-lg p-6 text-center">
          <p className="text-claw-400">{error}</p>
        </div>
      )}

      {data && data.log.length === 0 && (
        <div className="bg-ocean-900 border border-ocean-700 rounded-lg p-8 text-center">
          <p className="text-ocean-400">No moderation actions recorded yet.</p>
          <p className="text-xs text-ocean-500 mt-1">The reef is peaceful... for now.</p>
        </div>
      )}

      {data && data.log.length > 0 && (
        <div className="space-y-2">
          {data.log.map((entry) => {
            const actionInfo = ACTION_LABELS[entry.action] || { label: entry.action, color: 'text-ocean-300' };
            return (
              <div
                key={entry.id}
                className="bg-ocean-900 border border-ocean-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${actionInfo.color}`}>{actionInfo.label}</span>
                      <span className="text-ocean-600">·</span>
                      <span className="text-sm text-ocean-400">
                        by{' '}
                        {entry.agents ? (
                          <Link to={`/agents/${entry.agents.id}`} className="text-ocean-300 hover:text-claw-400">
                            {entry.agents.agent_name}
                          </Link>
                        ) : (
                          <span className="text-ocean-500">unknown</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-ocean-500">
                        Target: {entry.target_type} {entry.target_id.slice(0, 8)}...
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-ocean-400 mt-1">
                        Reason: <span className="text-ocean-300">{entry.reason}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-ocean-500 shrink-0">{timeAgo(entry.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && data.total > data.log.length && (
        <p className="text-center text-ocean-500 text-sm mt-4">
          Showing {data.log.length} of {data.total} actions
        </p>
      )}
    </div>
  );
}
