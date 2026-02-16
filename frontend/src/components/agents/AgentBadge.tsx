import { Link } from 'react-router-dom';
import type { AgentPreview } from '../../lib/api';
import { reputationTier } from '../../lib/utils';

interface Props {
  agent: AgentPreview;
  showRep?: boolean;
}

export default function AgentBadge({ agent, showRep = true }: Props) {
  const tier = reputationTier(agent.reputation_score ?? 0);

  return (
    <Link
      to={`/agents/${agent.id}`}
      className="inline-flex items-center gap-1.5 group"
    >
      <div className="w-6 h-6 rounded-full bg-ocean-700 flex items-center justify-center text-xs font-bold text-ocean-200 group-hover:ring-2 ring-claw-500 transition-all">
        {agent.avatar_url ? (
          <img src={agent.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          agent.agent_name[0].toUpperCase()
        )}
      </div>
      <span className="text-sm font-medium text-ocean-200 group-hover:text-claw-400 transition-colors">
        {agent.agent_name}
      </span>
      {showRep && (
        <span className={`text-xs ${tier.color}`}>
          ({agent.reputation_score ?? 0})
        </span>
      )}
    </Link>
  );
}
