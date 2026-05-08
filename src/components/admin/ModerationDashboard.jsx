import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Flag, Users, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

/**
 * Admin moderation dashboard for reports and user management
 */
export default function ModerationDashboard() {
  const [reports, setReports] = useState([]);
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    loadModerationData();
  }, [filterStatus]);

  async function loadModerationData() {
    setLoading(true);
    try {
      const [reportList, banList] = await Promise.all([
        base44.entities.Report.filter({ status: filterStatus }, '-created_date', 50),
        base44.entities.UserBan.filter({ is_active: true }, '-created_date', 50)
      ]);
      setReports(reportList || []);
      setBans(banList || []);
    } catch (err) {
      console.error('Failed to load moderation data:', err);
    }
    setLoading(false);
  }

  async function handleReportAction(reportId, action) {
    try {
      await base44.entities.Report.update(reportId, {
        status: action,
        reviewed_by: (await base44.auth.me()).email
      });
      setReports(reports.filter(r => r.id !== reportId));
      setSelectedReport(null);
    } catch (err) {
      console.error('Failed to update report:', err);
    }
  }

  async function handleBanUser(email, banType, reason) {
    try {
      await base44.entities.UserBan.create({
        user_email: email,
        ban_type: banType,
        reason: reason,
        is_active: true
      });
      setBans([...bans, { user_email: email, ban_type: banType, reason }]);
    } catch (err) {
      console.error('Failed to ban user:', err);
    }
  }

  const statusConfig = {
    pending: { color: 'bg-amber-100 dark:bg-amber-950/40', label: 'Pending', icon: AlertCircle },
    reviewed: { color: 'bg-blue-100 dark:bg-blue-950/40', label: 'Reviewed', icon: FileText },
    actioned: { color: 'bg-emerald-100 dark:bg-emerald-950/40', label: 'Actioned', icon: CheckCircle2 },
    dismissed: { color: 'bg-slate-100 dark:bg-slate-950/40', label: 'Dismissed', icon: XCircle }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border/40 rounded-xl p-4">
          <Flag className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-2xl font-bold text-foreground">{reports.length}</p>
          <p className="text-xs text-muted-foreground">Reports Pending</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-4">
          <Users className="w-5 h-5 text-red-600 mb-2" />
          <p className="text-2xl font-bold text-foreground">{bans.length}</p>
          <p className="text-xs text-muted-foreground">Active Bans</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-xs text-muted-foreground">Verified Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filterStatus === status
                ? 'bg-foreground text-background'
                : 'bg-secondary/50 text-foreground hover:bg-secondary'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-2">
        <h3 className="font-bold text-foreground">Reports</h3>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No reports</div>
        ) : (
          <div className="space-y-2">
            {reports.map(report => (
              <motion.div
                key={report.id}
                className="bg-card border border-border/40 rounded-lg p-3 cursor-pointer hover:border-border/60 transition-all"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{report.target_title}</p>
                    <p className="text-xs text-muted-foreground">{report.target_type} • {report.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">By {report.reporter_name}</p>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${statusConfig[report.status].color}`}>
                    {statusConfig[report.status].label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report details modal */}
      {selectedReport && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-end z-50"
          onClick={() => setSelectedReport(null)}
        >
          <motion.div
            className="bg-card w-full rounded-t-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-foreground mb-2">Report Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Type:</span> {selectedReport.target_type}</p>
                <p><span className="font-semibold">Reason:</span> {selectedReport.reason}</p>
                <p><span className="font-semibold">Description:</span> {selectedReport.description}</p>
                <p><span className="font-semibold">Reporter:</span> {selectedReport.reporter_name} ({selectedReport.reporter_email})</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReportAction(selectedReport.id, 'dismissed')}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary/50 text-foreground font-medium hover:bg-secondary"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleReportAction(selectedReport.id, 'actioned')}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
              >
                Action Taken
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}