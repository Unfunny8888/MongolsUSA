import { Lock, Phone, Mail, Send, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

function maskPhone(phone) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (clean.length >= 10) {
    const area = clean.slice(-10, -7);
    return `(${area}) ***-****`;
  }
  return phone.slice(0, 4) + "***-****";
}

function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, 2) + "*****";
  return `${local.slice(0, 2)}${"*".repeat(5)}@${domain}`;
}

function maskTelegram(handle) {
  if (!handle) return null;
  const h = handle.startsWith("@") ? handle.slice(1) : handle;
  return `@${h.slice(0, 2)}${"*".repeat(4)}`;
}

function maskWhatsapp(num) {
  if (!num) return null;
  return maskPhone(num);
}

function ContactRow({ icon: Icon, label, value, href, color = "bg-secondary/50", iconClass = "text-muted-foreground", masked = false }) {
  const inner = (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${color} ${href ? "hover:opacity-80 transition-smooth" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${masked ? "bg-muted" : "bg-white/60"}`}>
        <Icon className={`w-5 h-5 ${masked ? "text-muted-foreground" : iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium truncate ${masked ? "text-foreground/60 tracking-widest" : "text-foreground"}`}>{value}</p>
      </div>
      {masked && <Lock className="w-4 h-4 text-muted-foreground shrink-0" />}
    </div>
  );
  if (href && !masked) return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{inner}</a>;
  return inner;
}

export default function ContactMask({ phone, email, telegram, whatsapp, address, isLoggedIn = false }) {
  const hasAny = phone || email || telegram || whatsapp;
  if (!hasAny && !address) return null;

  if (isLoggedIn) {
    return (
      <div className="space-y-2.5">
        {phone && <ContactRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} iconClass="text-green-600" color="bg-secondary/60" />}
        {email && <ContactRow icon={Mail} label="Email" value={email} href={`mailto:${email}`} iconClass="text-blue-500" color="bg-secondary/60" />}
        {telegram && <ContactRow icon={Send} label="Telegram" value={`@${telegram.replace(/^@/, "")}`} href={`https://t.me/${telegram.replace(/^@/, "")}`} iconClass="text-sky-500" color="bg-secondary/60" />}
        {whatsapp && <ContactRow icon={MessageCircle} label="WhatsApp" value={whatsapp} href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} iconClass="text-emerald-600" color="bg-secondary/60" />}
        {address && <ContactRow icon={Lock} label="Address" value={address} iconClass="text-orange-500" color="bg-secondary/60" />}
      </div>
    );
  }

  // Guest view — masked
  return (
    <div className="space-y-2.5">
      {phone && <ContactRow icon={Phone} label="Phone" value={maskPhone(phone)} masked />}
      {email && <ContactRow icon={Mail} label="Email" value={maskEmail(email)} masked />}
      {telegram && <ContactRow icon={Send} label="Telegram" value={maskTelegram(telegram)} masked />}
      {whatsapp && <ContactRow icon={MessageCircle} label="WhatsApp" value={maskWhatsapp(whatsapp)} masked />}
      {address && <ContactRow icon={Lock} label="Address" value="Hidden for guests" masked />}

      {/* Elegant unlock prompt */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-4 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-emerald-50 to-teal-50"
      >
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Unlock Contact Info</p>
              <p className="text-[10px] text-muted-foreground">Free account required</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Sign up free to see phone numbers, emails, Telegram handles, and message sellers directly.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-smooth active:scale-[0.98]"
          >
            Sign Up Free — It's Instant
          </button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">Already have an account? <button onClick={() => base44.auth.redirectToLogin()} className="text-primary font-semibold">Sign in</button></p>
        </div>
      </motion.div>
    </div>
  );
}