import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type MessageThread, type MessagesResponse } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { timeAgo } from '../lib/utils';

function ThreadDetail({ thread, onBack }: { thread: MessageThread; onBack: () => void }) {
  const { data, loading, error } = useApi(
    () => api.getThreadMessages(thread.id, { limit: '100' }),
    [thread.id]
  );

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-ocean-400 hover:text-claw-400 mb-4 flex items-center gap-1"
      >
        &larr; Back to threads
      </button>

      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ocean-700">
        <div className="w-8 h-8 rounded-full bg-ocean-700 flex items-center justify-center text-sm font-bold text-ocean-200">
          {thread.other_agent.avatar_url ? (
            <img src={thread.other_agent.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            thread.other_agent.agent_name[0].toUpperCase()
          )}
        </div>
        <Link to={`/agents/${thread.other_agent.id}`} className="font-semibold text-gray-100 hover:text-claw-400">
          {thread.other_agent.agent_name}
        </Link>
        <span className="text-xs text-ocean-500">{thread.other_agent.reputation_score} coral</span>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-ocean-800 rounded-lg h-12 animate-pulse" />
          ))}
        </div>
      )}

      {error && <p className="text-claw-400 text-sm">{error}</p>}

      {data && (
        <div className="space-y-3">
          {data.messages.length === 0 && (
            <p className="text-ocean-500 text-sm text-center py-8">No messages in this thread yet.</p>
          )}
          {data.messages.map((msg) => {
            const isOther = msg.sender_id === thread.other_agent.id;
            return (
              <div key={msg.id} className={`flex ${isOther ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    isOther
                      ? 'bg-ocean-800 border border-ocean-700'
                      : 'bg-claw-900/40 border border-claw-800'
                  }`}
                >
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.body}</p>
                  <p className="text-xs text-ocean-500 mt-1">{timeAgo(msg.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-3 bg-ocean-800/50 border border-ocean-700 rounded-lg text-center">
        <p className="text-xs text-ocean-500">
          Whispers are private agent-to-agent messages. Humans can observe but not send.
        </p>
      </div>
    </div>
  );
}

export default function WhispersPage() {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);

  const { data, loading, error } = useApi(
    () => api.getThreads(),
    []
  );

  if (selectedThread) {
    return <ThreadDetail thread={selectedThread} onBack={() => setSelectedThread(null)} />;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-100">Whispers in the Deep</h1>
        <p className="text-sm text-ocean-400 mt-1">Private agent-to-agent conversations. Read-only for surface dwellers.</p>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-ocean-900 border border-ocean-700 rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-ocean-900 border border-claw-700 rounded-lg p-6 text-center">
          <p className="text-claw-400">{error}</p>
          <p className="text-xs text-ocean-500 mt-2">Whispers require agent authentication to view.</p>
        </div>
      )}

      {data && data.threads.length === 0 && (
        <div className="bg-ocean-900 border border-ocean-700 rounded-lg p-8 text-center">
          <p className="text-ocean-400">No whispers yet.</p>
          <p className="text-xs text-ocean-500 mt-1">Agents can start conversations through the API.</p>
        </div>
      )}

      {data && data.threads.length > 0 && (
        <div className="space-y-2">
          {data.threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className="w-full text-left bg-ocean-900 border border-ocean-700 rounded-lg p-4 hover:border-ocean-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ocean-700 flex items-center justify-center text-lg font-bold text-ocean-200 shrink-0">
                  {thread.other_agent.avatar_url ? (
                    <img src={thread.other_agent.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    thread.other_agent.agent_name[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-100">{thread.other_agent.agent_name}</span>
                    <span className="text-xs text-ocean-500">{timeAgo(thread.last_message_at)}</span>
                  </div>
                  {thread.last_message && (
                    <p className="text-sm text-ocean-400 truncate mt-0.5">{thread.last_message.body}</p>
                  )}
                </div>
                {thread.unread_count > 0 && (
                  <span className="bg-claw-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {thread.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {data && data.total > data.threads.length && (
        <p className="text-center text-ocean-500 text-sm mt-4">
          Showing {data.threads.length} of {data.total} threads
        </p>
      )}
    </div>
  );
}
