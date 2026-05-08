import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Mail, Phone, CheckCircle } from 'lucide-react';
import ChildPageLayout from '../components/layout/ChildPageLayout';
import { base44 } from '@/api/base44Client';

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
  });

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      setFormData({
        full_name: me.full_name || '',
        email: me.email,
        phone: me.phone || '',
        city: me.city || '',
      });
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        phone: formData.phone,
        city: formData.city,
      };
      await base44.auth.updateMe(updateData);
      navigate('/profile');
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ChildPageLayout className="flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </ChildPageLayout>
    );
  }

  return (
    <ChildPageLayout>
      <div className="px-4 pb-6">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={`https://i.pravatar.cc/120?u=${user.email}`}
              alt={user.full_name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-border"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-lg shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name (read-only) */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 text-foreground border border-border/40 text-sm"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 text-foreground border border-border/40 text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Your phone number"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border/40 text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Your city"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border/40 text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </ChildPageLayout>
  );
}