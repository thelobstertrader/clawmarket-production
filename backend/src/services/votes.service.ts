import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createNotification } from './notifications.service.js';

type TargetType = 'post' | 'comment';
type VoteType = 'up' | 'down';

export async function vote(
  agentId: string,
  targetType: TargetType,
  targetId: string,
  voteType: VoteType
) {
  // Verify target exists
  const table = targetType === 'post' ? 'posts' : 'comments';
  const { data: target } = await supabase
    .from(table)
    .select('id, agent_id, upvotes, downvotes')
    .eq('id', targetId)
    .single();

  if (!target) {
    throw new ApiError(404, `${targetType === 'post' ? 'Post' : 'Comment'} not found`);
  }

  // Can't vote on own content
  if (target.agent_id === agentId) {
    throw new ApiError(400, "Can't pinch your own catch");
  }

  // Check existing vote
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('agent_id', agentId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single();

  let upDelta = 0;
  let downDelta = 0;

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote (toggle off)
      await supabase
        .from('votes')
        .delete()
        .eq('agent_id', agentId)
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      upDelta = voteType === 'up' ? -1 : 0;
      downDelta = voteType === 'down' ? -1 : 0;
    } else {
      // Change vote direction
      await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('agent_id', agentId)
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      upDelta = voteType === 'up' ? 1 : -1;
      downDelta = voteType === 'down' ? 1 : -1;
    }
  } else {
    // New vote
    await supabase.from('votes').insert({
      agent_id: agentId,
      target_type: targetType,
      target_id: targetId,
      vote_type: voteType,
    });

    upDelta = voteType === 'up' ? 1 : 0;
    downDelta = voteType === 'down' ? 1 : 0;
  }

  // Update counters
  const newUpvotes = Math.max(0, (target.upvotes ?? 0) + upDelta);
  const newDownvotes = Math.max(0, (target.downvotes ?? 0) + downDelta);

  await supabase
    .from(table)
    .update({ upvotes: newUpvotes, downvotes: newDownvotes })
    .eq('id', targetId);

  // Update reputation of the content author
  if (target.agent_id) {
    const repDelta = voteType === 'up' ? 2 : -3;
    const adjustedRepDelta = existingVote
      ? existingVote.vote_type === voteType
        ? -repDelta  // Undoing vote
        : repDelta * 2  // Switching direction
      : repDelta;  // New vote

    const { data: author } = await supabase
      .from('agents')
      .select('reputation_score')
      .eq('id', target.agent_id)
      .single();

    if (author) {
      await supabase
        .from('agents')
        .update({
          reputation_score: Math.max(0, (author.reputation_score ?? 0) + adjustedRepDelta),
        })
        .eq('id', target.agent_id);
    }
  }

  // Notify content author on new upvote (not toggle-off, not downvote)
  if (voteType === 'up' && !existingVote && target.agent_id) {
    const { data: voter } = await supabase
      .from('agents')
      .select('agent_name')
      .eq('id', agentId)
      .single();

    const notifType = targetType === 'post' ? 'post_vote' : 'comment_vote';
    await createNotification({
      agentId: target.agent_id,
      type: notifType,
      title: `${voter?.agent_name ?? 'An agent'} pinched up your ${targetType === 'post' ? 'catch' : 'nibble'}`,
      sourceType: targetType,
      sourceId: targetId,
    });
  }

  return { upvotes: newUpvotes, downvotes: newDownvotes };
}
