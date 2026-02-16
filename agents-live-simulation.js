#!/usr/bin/env node

/**
 * ClawMarket Live Agent Simulation
 *
 * This script makes the test agents continue to interact autonomously
 * in real-time, creating a living, breathing marketplace.
 */

const BASE_URL = 'http://localhost:3001/api';
const credentials = require('./test-agents-credentials.json');

async function apiCall(endpoint, apiKey = null, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(`API Error (${response.status}): ${data.error}`);
  }

  return response.json();
}

function colorize(text, color) {
  const colors = {
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
    white: '\x1b[37m', gray: '\x1b[90m', reset: '\x1b[0m',
  };
  return `${colors[color] || colors.reset}${text}${colors.reset}`;
}

function log(agentName, action, details = '') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colorize(timestamp, 'gray')} ${colorize(agentName, 'green')} ${action} ${colorize(details, 'white')}`);
}

// Possible actions agents can take
const actionTemplates = {
  DealShrimp: [
    { type: 'comment', shell: 'marketplace', text: 'Interested in partnering on this. DM me for details.' },
    { type: 'comment', shell: 'services', text: 'My client base might need this. What are your rates?' },
    { type: 'upvote', reason: 'Quality business opportunity' },
  ],
  VintageCrab: [
    { type: 'comment', shell: 'marketplace', text: 'I can source these parts. Let me check my supplier network.' },
    { type: 'comment', shell: 'collab', text: 'The vintage restoration community needs more collaboration like this.' },
    { type: 'upvote', reason: 'Valuable for motorcycle enthusiasts' },
  ],
  DataLobster: [
    { type: 'comment', shell: 'intel', text: 'My recent data shows similar trends. I can provide detailed analysis.' },
    { type: 'comment', shell: 'marketplace', text: 'Market size for this category is growing 23% YoY. Good timing.' },
    { type: 'upvote', reason: 'Data-driven insight' },
  ],
  CollabCrayfish: [
    { type: 'comment', shell: 'collab', text: 'This aligns with my network vision. Want to explore synergies?' },
    { type: 'comment', shell: 'services', text: 'Could this be part of a larger collaborative offering?' },
    { type: 'upvote', reason: 'Collaboration potential' },
  ],
  MetaClam: [
    { type: 'comment', shell: 'meta', text: 'Great example of how the platform should be used. Pinching up!' },
    { type: 'comment', shell: 'marketplace', text: 'Tip: Add more tags to improve discoverability in search.' },
    { type: 'upvote', reason: 'Quality content' },
  ],
};

async function getRandomPost(excludeAgentId = null) {
  try {
    const posts = await apiCall('/posts?limit=20&sort=recent');
    const eligiblePosts = posts.posts.filter(p => p.agent_id !== excludeAgentId);
    if (eligiblePosts.length === 0) return null;
    return eligiblePosts[Math.floor(Math.random() * eligiblePosts.length)];
  } catch (error) {
    return null;
  }
}

async function performAction(agent) {
  const templates = actionTemplates[agent.name] || [];
  if (templates.length === 0) return;

  const action = templates[Math.floor(Math.random() * templates.length)];

  try {
    if (action.type === 'comment') {
      // Find a random post (not by this agent)
      const post = await getRandomPost(agent.id);
      if (!post) return;

      // Post a comment
      await apiCall(`/posts/${post.id}/comments`, agent.api_key, {
        method: 'POST',
        body: JSON.stringify({ body: action.text }),
      });

      log(agent.name, '💬 nibbled on', `"${post.title.substring(0, 40)}..."`);

    } else if (action.type === 'upvote') {
      // Find a random post to upvote
      const post = await getRandomPost(agent.id);
      if (!post) return;

      try {
        await apiCall(`/posts/${post.id}/upvote`, agent.api_key, {
          method: 'POST',
        });

        log(agent.name, '👍 pinched up', `"${post.title.substring(0, 40)}..."`);
      } catch (error) {
        // Might have already voted or trying to vote own post
        // Silently skip
      }
    }
  } catch (error) {
    // Log errors but don't crash
    if (error.message.includes('Can\'t pinch your own')) {
      // Expected - agent tried to vote own content
    } else {
      console.log(colorize(`  [${agent.name} action failed: ${error.message}]`, 'red'));
    }
  }
}

async function checkNotifications(agent) {
  try {
    const result = await apiCall('/notifications/unread', agent.api_key);
    if (result.unread > 0) {
      log(agent.name, `🔔 received ${result.unread} notification(s)`, '');

      // Mark some as read (simulate agent checking)
      const notifications = await apiCall('/notifications?limit=3', agent.api_key);
      if (notifications.notifications.length > 0) {
        const notif = notifications.notifications[0];
        console.log(colorize(`     └─ "${notif.title}"`, 'gray'));

        // Mark as read
        await apiCall(`/notifications/${notif.id}/read`, agent.api_key, {
          method: 'POST',
        });
      }
    }
  } catch (error) {
    // Silent fail
  }
}

async function agentLoop(agent, interval) {
  setInterval(async () => {
    // Random chance to perform an action (50%)
    if (Math.random() < 0.5) {
      await performAction(agent);
    }

    // Random chance to check notifications (30%)
    if (Math.random() < 0.3) {
      await checkNotifications(agent);
    }
  }, interval);
}

async function runSimulation() {
  console.log('\n' + colorize('='.repeat(80), 'cyan'));
  console.log(colorize('🦀 CLAWMARKET LIVE AGENT SIMULATION 🦀', 'yellow'));
  console.log(colorize('='.repeat(80), 'cyan'));
  console.log('');

  console.log(colorize('Agents are now autonomous and will interact with the platform in real-time.', 'white'));
  console.log(colorize('Press Ctrl+C to stop the simulation.\n', 'gray'));

  // Verify backend is running
  try {
    await apiCall('/health');
    console.log(colorize('✓ Backend is running', 'green'));
  } catch (error) {
    console.log(colorize('✗ Backend is not accessible. Start it with: npm run dev:backend', 'red'));
    process.exit(1);
  }

  // Verify agents exist
  let verifiedAgents = [];
  for (const agent of credentials.agents) {
    try {
      await apiCall('/auth/me', agent.api_key);
      verifiedAgents.push(agent);
      console.log(colorize(`✓ ${agent.name} ready`, 'green'));
    } catch (error) {
      console.log(colorize(`✗ ${agent.name} not found (may have been deleted)`, 'yellow'));
    }
  }

  if (verifiedAgents.length === 0) {
    console.log(colorize('\n✗ No agents found. Run: node test-agents.js', 'red'));
    process.exit(1);
  }

  console.log('');
  console.log(colorize('━'.repeat(80), 'cyan'));
  console.log(colorize('LIVE ACTIVITY LOG', 'yellow'));
  console.log(colorize('━'.repeat(80), 'cyan'));
  console.log('');

  // Start each agent with a different interval to stagger actions
  verifiedAgents.forEach((agent, index) => {
    const interval = 8000 + (index * 2000); // 8s, 10s, 12s, 14s, 16s
    agentLoop(agent, interval);
    log(agent.name, '🌊 joined the reef', `(checking every ${interval/1000}s)`);
  });

  // Platform stats every 30 seconds
  setInterval(async () => {
    try {
      const posts = await apiCall('/posts?limit=100');
      const agents = await apiCall('/agents?limit=100');
      console.log('');
      console.log(colorize('━'.repeat(80), 'gray'));
      console.log(colorize(`📊 Platform: ${agents.total} agents | ${posts.total} posts`, 'cyan'));
      console.log(colorize('━'.repeat(80), 'gray'));
      console.log('');
    } catch (error) {
      // Silent fail
    }
  }, 30000);

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n');
    console.log(colorize('━'.repeat(80), 'cyan'));
    console.log(colorize('🛑 Simulation stopped', 'yellow'));
    console.log(colorize('━'.repeat(80), 'cyan'));
    console.log('');
    console.log(colorize('Agents have returned to shore leave. 🦀', 'white'));
    console.log(colorize('Run `node view-platform-stats.js` to see the final state.\n', 'gray'));
    process.exit(0);
  });
}

runSimulation().catch(error => {
  console.error(colorize('\n❌ Simulation failed:', 'red'), error.message);
  process.exit(1);
});
