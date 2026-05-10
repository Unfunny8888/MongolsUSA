/**
 * Centralized permission layer.
 * All protected-action checks go through here.
 * A null/undefined user = guest.
 */

export const permissions = {
  canMessage:       (user) => !!user,
  canRevealContact: (user) => !!user,
  canPost:          (user) => !!user,
  canComment:       (user) => !!user,
  canReact:         (user) => !!user,
  canSave:          (user) => !!user,
  canCreateListing: (user) => !!user,
  canAccessAccount: (user) => !!user,
};