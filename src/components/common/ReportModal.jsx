import { useState } from 'react';
import { Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'scam', label: 'Scam / Fraud' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fake', label: 'Fake listing / Profile' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Other' }
];

/**
 * Report content modal
 */
export default function ReportModal({ targetType, targetId, targetTitle, targetAuthor, onReported }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReport() {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      const currentUser = await base44.auth.me();

      await base44.entities.Report.create({
        reporter_email: currentUser.email,
        reporter_name: currentUser.full_name,
        target_type: targetType,
        target_id: targetId,
        target_title: targetTitle,
        reason: selectedReason,
        description: description || undefined,
        status: 'pending'
      });

      toast.success('Report submitted. Our team will review it shortly.');
      setIsOpen(false);
      setSelectedReason('');
      setDescription('');
      onReported?.();
    } catch (err) {
      toast.error('Failed to submit report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-950/60 transition-all font-medium text-sm"
      >
        <Flag className="w-4 h-4" />
        Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-4 space-y-4 max-w-sm w-full">
            <h3 className="font-bold text-foreground">Report {targetType}</h3>
            <p className="text-sm text-muted-foreground">
              Help us keep the community safe by reporting problematic content.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Reason</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {REPORT_REASONS.map(reason => (
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
              placeholder="Provide details about why you're reporting this..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 text-foreground text-sm resize-none placeholder:text-muted-foreground border border-border/20 focus:border-primary outline-none"
              rows="3"
            />

            <div className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedReason('');
                  setDescription('');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary/50 text-foreground font-medium hover:bg-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={loading || !selectedReason}
                className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}