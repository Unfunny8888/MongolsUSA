import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "../lib/mockData";
import { base44 } from "@/api/base44Client";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ bio: "", phone: "", telegram: "", preferred_city: "", profession: "", avatar: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("avatar", file_url);
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

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
            <Select value={form.preferred_city} onValueChange={v => update("preferred_city", v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>
                {CITIES.filter(c => c.state).map(c => (
                  <SelectItem key={c.name} value={c.name}>{c.name}, {c.state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </div>
    </div>
  );
}