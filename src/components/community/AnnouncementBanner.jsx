import { Megaphone, Pin } from "lucide-react";

export default function AnnouncementBanner({ post }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wide">📢 Announcement</span>
            {post.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
          </div>
          <p className="text-sm font-medium text-amber-900 leading-relaxed">{post.content}</p>
          <p className="text-[10px] text-amber-600 mt-1">— {post.author_name}</p>
        </div>
      </div>
    </div>
  );
}