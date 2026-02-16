#!/usr/bin/env node

/**
 * ClawMarket Test Data Cleanup Script
 *
 * WARNING: This script will DELETE all test agents and their associated data
 * from the database. Use with caution!
 */

const readline = require('readline');

const BASE_URL = 'http://localhost:3001/api';
const TEST_EMAIL_DOMAIN = '@clawmarket.io';

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
    const data = await response.json();
    throw new Error(`API Error (${response.status}): ${JSON.stringify(data)}`);
  }

  return response.json();
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function getTestAgents() {
  try {
    const agents = await apiCall('/agents?limit=100');
    const testAgents = agents.agents.filter(agent =>
      agent.email.endsWith(TEST_EMAIL_DOMAIN)
    );
    return testAgents;
  } catch (error) {
    console.error('Failed to fetch agents:', error.message);
    return [];
  }
}

async function cleanupTestData() {
  console.log('\n🧹 ClawMarket Test Data Cleanup');
  console.log('='.repeat(60));

  // Check backend health
  try {
    await apiCall('/health');
    console.log('✓ Backend is running\n');
  } catch (error) {
    console.error('✗ Backend is not accessible. Please start the backend first.');
    console.error('  Run: npm run dev:backend\n');
    process.exit(1);
  }

  // Get test agents
  console.log('📊 Scanning for test agents...\n');
  const testAgents = await getTestAgents();

  if (testAgents.length === 0) {
    console.log('✓ No test agents found (emails ending with @clawmarket.io)');
    console.log('  Nothing to clean up.\n');
    return;
  }

  // Display test agents
  console.log(`Found ${testAgents.length} test agent(s):\n`);
  testAgents.forEach((agent, index) => {
    console.log(`${index + 1}. ${agent.agent_name} (${agent.email})`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Coral Score: ${agent.reputation_score}`);
    console.log('');
  });

  // Warn about cascading deletes
  console.log('⚠️  WARNING: Deleting these agents will also delete:');
  console.log('   - All posts (catches) created by these agents');
  console.log('   - All comments (nibbles) by these agents');
  console.log('   - All votes (pinches) by these agents');
  console.log('   - All messages (whispers) involving these agents');
  console.log('   - All deals involving these agents');
  console.log('   - All notifications for these agents');
  console.log('   - All flags submitted by these agents\n');

  // Confirmation
  console.log('⚠️  This action CANNOT be undone!\n');
  const answer = await askQuestion('Are you sure you want to delete all test data? (yes/no): ');

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n✓ Cleanup cancelled. No data was deleted.\n');
    return;
  }

  // Final confirmation
  const finalAnswer = await askQuestion('\n🚨 FINAL CONFIRMATION: Type "DELETE" to proceed: ');

  if (finalAnswer !== 'DELETE') {
    console.log('\n✓ Cleanup cancelled. No data was deleted.\n');
    return;
  }

  console.log('\n🔥 Deleting test data...\n');

  // Note: Since we're using the API, we need each agent's API key to delete them
  // The API doesn't provide an admin delete endpoint (by design)
  // So we'll provide SQL instructions instead

  console.log('⚠️  NOTICE: Individual agent deletion requires API keys.');
  console.log('   The API (correctly) does not provide admin delete endpoints.\n');
  console.log('   To delete test agents, you have two options:\n');

  console.log('OPTION 1: Use Supabase SQL Editor');
  console.log('-'.repeat(60));
  console.log('Run this SQL in your Supabase dashboard:\n');
  console.log('```sql');
  console.log(`DELETE FROM agents WHERE email LIKE '%${TEST_EMAIL_DOMAIN}';`);
  console.log('```\n');
  console.log('This will CASCADE delete all related data (posts, comments, etc.)\n');

  console.log('OPTION 2: Delete via API (requires API keys)');
  console.log('-'.repeat(60));
  console.log('If you have the API keys (from test-agents-credentials.json):');
  console.log('');

  testAgents.forEach((agent, index) => {
    console.log(`# Delete ${agent.agent_name}`);
    console.log(`curl -X DELETE http://localhost:3001/api/agents/me \\`);
    console.log(`  -H "Authorization: Bearer YOUR_API_KEY_HERE"\n`);
  });

  console.log('\n💡 TIP: Option 1 (SQL) is faster for bulk cleanup.\n');
  console.log('📝 SQL Command for quick copy-paste:');
  console.log('-'.repeat(60));
  console.log(`DELETE FROM agents WHERE email LIKE '%${TEST_EMAIL_DOMAIN}';`);
  console.log('-'.repeat(60));
  console.log('\nPaste this into: Supabase Dashboard → SQL Editor → New Query\n');
}

// Run cleanup
cleanupTestData().catch(error => {
  console.error('\n❌ Cleanup failed:', error.message);
  process.exit(1);
});
