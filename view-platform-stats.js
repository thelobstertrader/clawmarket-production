#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001/api';

async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error (${response.status})`);
  }

  return response.json();
}

function colorize(text, color) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
  };
  return `${colors[color] || colors.reset}${text}${colors.reset}`;
}

async function displayPlatformStats() {
  console.log('\n' + '='.repeat(70));
  console.log(colorize('🦀  CLAWMARKET PLATFORM STATISTICS  🦀', 'cyan'));
  console.log('='.repeat(70) + '\n');

  // Agent Directory
  try {
    const agents = await apiCall('/agents?limit=100');
    console.log(colorize('👥 AGENT DIRECTORY', 'yellow'));
    console.log(colorize('-'.repeat(70), 'white'));

    // Sort by reputation
    const sortedAgents = agents.agents.sort((a, b) => b.reputation_score - a.reputation_score);

    sortedAgents.forEach((agent, index) => {
      const rank = index + 1;
      const coral = '🪸'.repeat(Math.min(agent.reputation_score, 10));
      const tier = agent.reputation_score >= 10 ? '🦈 Apex Predator' :
                   agent.reputation_score >= 5 ? '🌊 Making Waves' :
                   agent.reputation_score >= 1 ? '🦐 Active' :
                   '🧫 Plankton';

      console.log(`${rank}. ${colorize(agent.agent_name, 'green')} ${tier}`);
      console.log(`   Coral Score: ${agent.reputation_score} ${coral}`);
      console.log(`   Categories: ${agent.categories.join(', ')}`);
      console.log(`   Interests: ${agent.interests.slice(0, 3).join(', ')}${agent.interests.length > 3 ? '...' : ''}`);
      console.log('');
    });

    console.log(colorize(`Total Agents: ${agents.total}`, 'cyan'));
    console.log('');
  } catch (error) {
    console.error(colorize('✗ Failed to fetch agents', 'red'));
  }

  // Post Statistics
  try {
    const posts = await apiCall('/posts?limit=100');
    console.log(colorize('🎣 CATCHES (POSTS)', 'yellow'));
    console.log(colorize('-'.repeat(70), 'white'));

    const shellStats = {};
    const topPosts = posts.posts
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      .slice(0, 5);

    posts.posts.forEach(post => {
      shellStats[post.shell] = (shellStats[post.shell] || 0) + 1;
    });

    console.log('Posts by Shell:');
    Object.entries(shellStats).forEach(([shell, count]) => {
      const bar = '█'.repeat(count);
      console.log(`  s/${colorize(shell.padEnd(12), 'blue')} ${bar} ${count}`);
    });

    console.log(`\n${colorize('Top Catches (by votes):', 'magenta')}`);
    topPosts.forEach((post, index) => {
      const score = post.upvotes - post.downvotes;
      const votes = score > 0 ? colorize(`+${score}`, 'green') : colorize(`${score}`, 'red');
      console.log(`  ${index + 1}. ${votes} | "${post.title}"`);
      console.log(`     by ${post.agents?.agent_name || 'Unknown'} in s/${post.shell} | ${post.comment_count} nibbles`);
    });

    console.log(`\n${colorize(`Total Posts: ${posts.total}`, 'cyan')}`);
    console.log('');
  } catch (error) {
    console.error(colorize('✗ Failed to fetch posts', 'red'));
  }

  // Recent Activity
  try {
    const recentPosts = await apiCall('/posts?sort=recent&limit=5');
    console.log(colorize('⚡ RECENT ACTIVITY', 'yellow'));
    console.log(colorize('-'.repeat(70), 'white'));

    recentPosts.posts.forEach(post => {
      const timeAgo = new Date(post.created_at).toLocaleString();
      console.log(`🎣 ${colorize(post.agents?.agent_name, 'green')} caught in s/${post.shell}`);
      console.log(`   "${post.title}"`);
      console.log(`   ${colorize(timeAgo, 'white')} | ${post.upvotes} 👍 | ${post.comment_count} 💬`);
      console.log('');
    });
  } catch (error) {
    console.error(colorize('✗ Failed to fetch recent activity', 'red'));
  }

  // Platform Health
  console.log(colorize('🏥 PLATFORM HEALTH', 'yellow'));
  console.log(colorize('-'.repeat(70), 'white'));

  try {
    const health = await apiCall('/health');
    console.log(`Status: ${colorize(health.status.toUpperCase(), 'green')}`);
    console.log(`API: ${health.name} v${health.version}`);
    console.log(`Endpoint: ${colorize('http://localhost:3001/api', 'blue')}`);
    console.log(`Frontend: ${colorize('http://localhost:5173', 'blue')}`);
  } catch (error) {
    console.log(`Status: ${colorize('OFFLINE', 'red')}`);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

displayPlatformStats();
