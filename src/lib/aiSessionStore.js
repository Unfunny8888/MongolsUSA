/**
 * aiSessionStore — module-level singleton for AI chat session persistence.
 *
 * Lives OUTSIDE React so it survives component unmount/remount.
 * Session expires after 30 minutes of inactivity.
 */

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const _store = {
  messages: [],       // serialisable messages (no functions)
  scrollTop: 0,
  lastActivity: null,
};

export function getAISession() {
  // Expired session → return empty state
  if (_store.lastActivity && Date.now() - _store.lastActivity > SESSION_TTL_MS) {
    clearAISession();
  }
  return {
    messages: _store.messages,
    scrollTop: _store.scrollTop,
  };
}

export function saveAIMessages(messages) {
  // Strip non-serialisable fields (onFollowup fn) before storing
  _store.messages = messages.map(({ onFollowup: _fn, ...rest }) => rest);
  _store.lastActivity = Date.now();
}

export function saveAIScroll(scrollTop) {
  _store.scrollTop = scrollTop;
}

export function clearAISession() {
  _store.messages = [];
  _store.scrollTop = 0;
  _store.lastActivity = null;
}