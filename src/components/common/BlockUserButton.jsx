import { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const BLOCK_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'scam', label: 'Scam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' }
];

/**
 * Block user button with reason selection
 */
export default function BlockUserButton({ userEmail, userName, onBlocked }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleBlock() {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      // Check if already blocked
      const existing = await base44.entities.BlockedUser.filter({
        blocker_email: currentUser.email,
        blocked_email: userEmail
      });

      if (existing.length > 0) {
        toast.error('User is already blocked');
        setLoading(false);
        return;
      }

      await base44.entities.BlockedUser.create({
        blocker_email: currentUser.email,
        blocked_email: userEmail,
        blocked_name: userName,
        reason: selectedReason,
        notes: notes || undefined,
        is_active: true
      });

      toast.success(`${userName} has been blocked`);
      setIsOpen(false);
      setSelectedReason('');
      setNotes('');
      onBlocked?.();
    } catch (err) {
      toast.error('Failed to block user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/60 transition-all font-medium text-sm"
      >
        <X className="w-4 h-4" />
        Block
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-4 space-y-4 max-w-sm w-full">
            <h3 className="font-bold text-foreground">Block {userName}?</h3>
            <p className="text-sm text-muted-foreground">
              You won't receive messages or see activity from this user.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Reason</label>
              <div className="space-y-1.5">
                {BLOCK_REASONS.map(reason => (
                  <button
                    key={reason.value}
                    onClick={() => setSelectedReason(reason.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedReason === reason.value
                        ? 'bg-foreground text-background'
                        : 'bg-secondary/50 text-foreground hover:bg-secondary'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Optional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 text-foreground text-sm resize-none placeholder:text-muted-foreground border border-border/20 focus:border-primary outline-none"
              rows="2"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedReason('');
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary/50 text-foreground font-medium hover:bg-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={loading || !selectedReason}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}