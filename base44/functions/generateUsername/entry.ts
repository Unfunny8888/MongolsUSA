import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADJECTIVES = ['nomad', 'swift', 'bold', 'keen', 'smart', 'tech', 'open', 'free', 'real', 'pure', 'wise'];
const SUFFIXES = ['dee', 'khan', 'bey', 'taar', 'sol', 'bay', 'ger', 'aim'];

function generateRandomUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const num = Math.floor(Math.random() * 99);
  return `@${adj}_${suffix}${num > 0 ? num : ''}`.toLowerCase();
}

function generateLocationUsername(city) {
  if (!city) return generateRandomUsername();
  const cityPart = city.split(',')[0].toLowerCase().replace(/\s+/g, '_');
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `@${cityPart}_${suffix}`.toLowerCase();
}

function generateNameBasedUsername(fullName) {
  if (!fullName) return generateRandomUsername();
  const parts = fullName.toLowerCase().split(' ');
  const firstName = parts[0]?.slice(0, 3) || 'user';
  const lastName = parts[1]?.slice(0, 2) || '';
  const combined = (firstName + lastName).replace(/[^a-z0-9]/g, '');
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `@${combined}_${suffix}`.toLowerCase();
}

async function checkUsernameAvailable(base44, username) {
  try {
    const existing = await base44.asServiceRole.entities.User.filter(
      { username: username.replace('@', '') },
      '',
      1
    );
    return existing.length === 0;
  } catch {
    return true;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, username, full_name, city } = body;

    // Generate suggestions
    if (action === 'generate') {
      const suggestions = [];
      const maxAttempts = 10;

      // Generate name-based
      for (let i = 0; i < maxAttempts; i++) {
        const un = generateNameBasedUsername(full_name);
        const available = await checkUsernameAvailable(base44, un);
        if (available && !suggestions.includes(un)) {
          suggestions.push(un);
          break;
        }
      }

      // Generate location-based
      for (let i = 0; i < maxAttempts; i++) {
        const un = generateLocationUsername(city);
        const available = await checkUsernameAvailable(base44, un);
        if (available && !suggestions.includes(un)) {
          suggestions.push(un);
          break;
        }
      }

      // Generate random
      for (let i = 0; i < maxAttempts; i++) {
        const un = generateRandomUsername();
        const available = await checkUsernameAvailable(base44, un);
        if (available && !suggestions.includes(un)) {
          suggestions.push(un);
          break;
        }
      }

      return Response.json({
        suggestions: suggestions.slice(0, 3),
      });
    }

    // Check availability
    if (action === 'check') {
      const cleanUsername = username.replace(/^@/, '').toLowerCase();
      const available = await checkUsernameAvailable(base44, `@${cleanUsername}`);
      return Response.json({ available, username: `@${cleanUsername}` });
    }

    // Set username (one-time)
    if (action === 'set') {
      if (user.username && user.username_edited) {
        return Response.json({ error: 'Username already edited once' }, { status: 400 });
      }

      const cleanUsername = username.replace(/^@/, '').toLowerCase();

      // Validate format
      if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
        return Response.json({ error: 'Invalid username format' }, { status: 400 });
      }

      // Check spam patterns
      const spamPatterns = ['admin', 'root', 'test', 'spam', 'fake', 'bot'];
      if (spamPatterns.some(p => cleanUsername.includes(p))) {
        return Response.json({ error: 'Invalid username' }, { status: 400 });
      }

      // Check availability
      const available = await checkUsernameAvailable(base44, `@${cleanUsername}`);
      if (!available) {
        return Response.json({ error: 'Username taken' }, { status: 400 });
      }

      await base44.auth.updateMe({
        username: cleanUsername,
        username_edited: !!user.username, // Mark as edited if already had one
      });

      return Response.json({ success: true, username: `@${cleanUsername}` });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});