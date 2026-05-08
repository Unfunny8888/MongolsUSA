import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shield, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_GROUPS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [joined, setJoined] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [user, setUser] = useState(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!groupId.startsWith("grp-")) {
        const data = await base44.entities.Group.get(groupId);
        setGroup(data);
        return;
      }
      setGroup(MOCK_GROUPS.find((g) => g.id === groupId));
      // Load posts
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      if (!groupId.startsWith("grp-")) {
        const groupPosts = await base44.entities.Post.filter({ group_id: groupId }, "-created_date", 20);
        setPosts(groupPosts);
      }
    }
    load();
  }, [groupId]);

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="relative">
        <img
          src={group.cover_image}
          alt={group.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl glass flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-xl border border-border/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{group.avatar}</span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold">{group.name}</h1>
                {group.is_verified && <Shield className="w-4 h-4 text-blue-500 fill-blue-500" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{group.member_count?.toLocaleString()} members</span>
                {group.city && <span>• {group.city}</span>}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{group.description}</p>

          <div className="flex gap-2 mb-4">
            <Badge variant="secondary">{group.category}</Badge>
            <Badge variant="secondary">{group.privacy}</Badge>
          </div>

          <Button
            onClick={() => setJoined(!joined)}
            className={`w-full rounded-xl ${joined ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-white hover:bg-primary/90"}`}
          >
            {joined ? "Joined ✓" : "Join Community"}
          </Button>

          {/* Posts */}
          <div className="mt-6 pt-5 border-t border-border space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              Community Posts
            </h3>

            {user && joined && (
              <div className="flex gap-2">
                <input
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                  placeholder="Share something with the community..."
                  className="flex-1 bg-secondary/70 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={async () => {
                    if (!postText.trim() || posting) return;
                    setPosting(true);
                    const p = await base44.entities.Post.create({
                      group_id: group.id,
                      author_name: user.full_name,
                      author_email: user.email,
                      content: postText.trim(),
                    });
                    setPosts(prev => [p, ...prev]);
                    setPostText("");
                    setPosting(false);
                  }}
                  disabled={!postText.trim() || posting}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {posts.length === 0 ? (
              ["Anyone know a good Mongolian restaurant? Looking for authentic buuz. 🥟", "Sharing my experience getting a driver's license here! Happy to help 🚗", "Community BBQ this weekend! Everyone welcome. Бүгдийг урьж байна! 🎉"].map((txt, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">{["👨", "👩", "🧑"][i]}</div>
                    <div>
                      <p className="text-xs font-semibold">Community Member</p>
                      <p className="text-[10px] text-muted-foreground">{i + 1}h ago</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{txt}</p>
                </div>
              ))
            ) : posts.map((post, i) => (
              <div key={post.id} className="p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">👤</div>
                  <div>
                    <p className="text-xs font-semibold">{post.author_name || "Member"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(post.created_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{post.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}