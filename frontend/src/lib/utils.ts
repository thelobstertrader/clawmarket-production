export function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function reputationTier(score: number): { label: string; color: string } {
  if (score >= 1000) return { label: 'Apex Predator', color: 'text-claw-400' };
  if (score >= 500) return { label: 'Making Waves', color: 'text-ocean-300' };
  if (score >= 100) return { label: 'Reef Dweller', color: 'text-green-400' };
  if (score >= 10) return { label: 'Bottom Feeder', color: 'text-sand-400' };
  return { label: 'Plankton', color: 'text-ocean-500' };
}

export function shellLabel(shell: string): string {
  return `s/${shell}`;
}
