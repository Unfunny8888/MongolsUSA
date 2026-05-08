import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Check, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CITIES } from "../lib/mockData";
import { base44 } from "@/api/base44Client";
import DeleteAccountDialog from "../components/common/DeleteAccountDialog";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ bio: "", phone: "", telegram: "", preferred_city: "", profession: "", avatar: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCityDrawer, setShowCityDrawer] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      setForm({
        bio: me.bio || "",
        phone: me.phone || "",
        telegram: me.telegram || "",
        preferred_city: me.preferred_city || "",
        profession: me.profession || "",
        avatar: me.avatar || "",
      });
    });
  }, []);

  const update = useCallback((field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("avatar", file_url);
    setUploading(false);
  }

  const save = useCallback(async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }, [form]);

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-base font-bold flex-1">Edit Profile</h1>
        <button
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-smooth ${saved ? "bg-emerald-100 text-emerald-700" : "bg-primary text-white"}`}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? "Saved!" : "Save"}
        </button>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-secondary overflow-hidden">
              {form.avatar ? (
                <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <p className="text-sm font-bold mt-4">{user.full_name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Bio / About Me</Label>
            <Textarea
              value={form.bio}
              onChange={e => update("bio", e.target.value)}
              placeholder="Tell the community about yourself... (Mongolian or English)"
              className="rounded-xl min-h-[90px]"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Profession / Job Title</Label>
            <Input value={form.profession} onChange={e => update("profession", e.target.value)} placeholder="e.g. CDL Driver, Software Engineer" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Phone Number</Label>
            <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="(555) 000-0000" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Telegram Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <Input value={form.telegram} onChange={e => update("telegram", e.target.value)} placeholder="username" className="rounded-xl pl-8" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Your City</Label>
            <button
              onClick={() => setShowCityDrawer(true)}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-left flex items-center justify-between hover:bg-secondary/70 transition-smooth"
            >
              <span className={form.preferred_city ? "text-foreground font-medium" : "text-muted-foreground"}>
                {form.preferred_city || "Select city"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </motion.button>

        {/* Account Deletion Section */}
        <div className="border-t border-border/30 pt-6 mt-6">
          <h3 className="text-sm font-bold text-foreground mb-3">Danger Zone</h3>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDeleteDialog(true)}
            className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-950/50 transition-smooth"
          >
            Delete Account
          </motion.button>
          <p className="text-xs text-muted-foreground mt-2">Permanently delete your account and all associated data. This cannot be undone.</p>
        </div>
      </div>

      {/* City Selection Drawer */}
      {showCityDrawer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCityDrawer(false)}
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
        >
          <motion.div
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-4 max-h-[60vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 pb-3 mb-3">
              <h3 className="text-sm font-bold text-foreground">Select City</h3>
            </div>
            <div className="space-y-1">
              {CITIES.filter(c => c.state).map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    update("preferred_city", c.name);
                    setShowCityDrawer(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-smooth ${
                    form.preferred_city === c.name
                      ? "bg-primary text-white font-semibold"
                      : "bg-secondary/30 text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {c.name}, {c.state}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      <DeleteAccountDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} />
    </div>
  );
}