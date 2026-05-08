import { Lock, Phone, Mail, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function maskPhone(phone) {
  if (!phone) return null;
  return phone.replace(/(\d{3})\s*(\d{3})-?(\d{4})/, "($1) ***-****");
}

function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}${"*".repeat(5)}@${domain}`;
}

export default function ContactMask({ phone, email, telegram, whatsapp, isLoggedIn = false }) {
  if (isLoggedIn) {
    return (
      <div className="space-y-3">
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{phone}</p>
            </div>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{email}</p>
            </div>
          </a>
        )}
        {telegram && (
          <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <Send className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Telegram</p>
              <p className="text-sm font-medium">@{telegram}</p>
            </div>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {phone && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-green-100/50 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600/50" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium text-muted-foreground">{maskPhone(phone)}</p>
          </div>
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      {email && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600/50" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-muted-foreground">{maskEmail(email)}</p>
          </div>
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Sign up to see contact info</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Create a free account to view phone numbers, emails, and message sellers directly.
        </p>
        <Button size="sm" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white">
          Sign Up Free
        </Button>
      </div>
    </div>
  );
}