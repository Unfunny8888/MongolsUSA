/**
 * aiSessionStore — module-level singleton for AI chat session persistence.
 *
 * Lives OUTSIDE React — survives component unmount/remount.
 * Session expires after 30 minutes of inactivity.
 * Hard caps prevent unbounded memory growth.
 */

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min
const MAX_MESSAGES   = 40;              // max stored messages
const MAX_RESULTS    = 6;               // max result cards per message

const _store = {
  messages:     [],
  scrollTop:    0,
  draftInput:   "",
  lastActivity: null,
  // metadata
  meta: {
    city:        null,   // last active city filter
    category:    null,   // last active category
    lastQuery:   null,   // last user query string
    resultType:  null,   // "listing" | "business" | "group"
  },
};

// ─── TTL check ────────────────────────────────────────────────────────────────
function _isExpired() {
  return _store.lastActivity && Date.now() - _store.lastActivity > SESSION_TTL_MS;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAISession() {
  if (_isExpired()) clearAISession();
  return {
    messages:   _store.messages,
    scrollTop:  _store.scrollTop,
    draftInput: _store.draftInput,
    meta:       { ..._store.meta },
  };
}

export function saveAIMessages(messages) {
  // Cap message count — keep most recent MAX_MESSAGES
  const capped = messages.slice(-MAX_MESSAGES);

  // Strip functions; cap result arrays per message
  _store.messages = capped.map(({ onFollowup: _fn, ...rest }) => ({
    ...rest,
    listings:   rest.listings?.slice(0, MAX_RESULTS),
    businesses: rest.businesses?.slice(0, MAX_RESULTS),
    groups:     rest.groups?.slice(0, MAX_RESULTS),
  }));

  _store.lastActivity = Date.now();
}

export function saveAIScroll(scrollTop) {
  _store.scrollTop = scrollTop;
}

export function saveAIDraft(draft) {
  _store.draftInput = draft || "";
}

export function saveAIMeta(meta) {
  Object.assign(_store.meta, meta);
  _store.lastActivity = Date.now();
}

export function clearAISession() {
  _store.messages     = [];
  _store.scrollTop    = 0;
  _store.draftInput   = "";
  _store.lastActivity = null;
  _store.meta         = { city: null, category: null, lastQuery: null, resultType: null };
}