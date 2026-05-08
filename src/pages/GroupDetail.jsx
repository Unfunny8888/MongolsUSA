import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shield, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TranslateButton from "../components/common/TranslateButton";
import PostReactions from "../components/community/PostReactions";
import PollCard from "../components/community/PollCard";
import AnnouncementBanner from "../components/community/AnnouncementBanner";
import CreatePostModal from "../components/community/CreatePostModal";
import { MOCK_GROUPS } from "../lib/mockData";
import { base44 } from "@/api/base44Client";

function PostCard({ post, userEmail, onUpdate }) {
  const [translated, setTranslated] = useState(null);
  const text = post.content;
  const name = post.author_name || "Member";
  const time = post.created_date ? new Date(post.created_date).toLocaleDateString() : "";
  const avatar = post.author_avatar || "👤";

  if (post.type === "announcement") return <AnnouncementBanner post={post} />;

  return (
    <div className="p-3 rounded-xl bg-secondary/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">{avatar}</div>
          <div>
            <p className="text-xs font-semibold">{name}</p>
            <p className="text-[10px] text-muted-foreground">{time}</p>
          </div>
        </div>
        {text && <TranslateButton text={text} onTranslated={setTranslated} />}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{translated || text}</p>
      {post.type === "poll" && <PollCard post={post} userEmail={userEmail} onUpdate={onUpdate} />}
      <PostReactions post={post} userEmail={userEmail} onUpdate={onUpdate} />
    </div>
  );
}

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [joined, setJoined] = useState(false);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [posting, setPosting] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState(null);

  useEffect(() => {
    async function load() {
      if (!groupId.startsWith("grp-")) {
        const data = await base44.entities.Group.get(groupId);
        setGroup(data);
        const groupPosts = await base44.entities.Post.filter({ group_id: groupId }, "-created_date", 20);
        setPosts(groupPosts);
      } else {
        setGroup(MOCK_GROUPS.find((g) => g.id === groupId));
      }
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
    }
    load();
  }, [groupId]);

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24">
      <div className="relative">
        <img src={group.cover_image} alt={group.name} className="w-full h-48 object-cover" />
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
            <img
              src={group.avatar}
              alt={group.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-border"
            />
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

          <div className="mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{translatedDesc || group.description}</p>
            {group.description && <TranslateButton text={group.description} onTranslated={setTranslatedDesc} />}
          </div>

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
            {/* Trending indicator */}
            {posts.filter(p => (p.like_count || 0) + (p.repost_count || 0) > 3).length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> Trending discussions
              </div>
            )}

            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              Community Posts
            </h3>

            {user && joined && (
              <CreatePostModal
                posting={posting}
                onSubmit={async (data) => {
                  if (posting) return;
                  setPosting(true);
                  const p = await base44.entities.Post.create({
                    group_id: group.id,
                    author_name: user.full_name,
                    author_email: user.email,
                    reactions: {},
                    reposted_by: [],
                    ...data,
                  });
                  setPosts(prev => [p, ...prev]);
                  setPosting(false);
                }}
              />
            )}

            {/* Pinned announcements first */}
            {posts.filter(p => p.is_pinned).map(post => (
              <PostCard key={post.id} post={post} userEmail={user?.email} onUpdate={updated => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))} />
            ))}

            {posts.length === 0 ? (
              [
                { content: "Community BBQ this weekend! Everyone welcome. Бүгдийг урьж байна! 🎉", author_name: "Community Member", type: "announcement", author_avatar: "🧑" },
                { content: "Anyone know a good Mongolian restaurant? Looking for authentic buuz. 🥟", author_name: "Community Member", type: "post", author_avatar: "👨", reactions: { "❤️": 3, "🔥": 1 } },
                { content: "What's your favorite part of living here?", author_name: "Community Member", type: "poll", author_avatar: "👩", poll_question: "What\'s your favorite part of living here?", poll_options: ["People", "Opportunities", "Culture", "Weather"], poll_votes: {} },
              ].map((item, i) => (
                <PostCard key={i} post={{ ...item, id: `mock-${i}` }} userEmail={user?.email} onUpdate={() => {}} />
              ))
            ) : posts.filter(p => !p.is_pinned).map(post => (
              <PostCard
                key={post.id}
                post={post}
                userEmail={user?.email}
                onUpdate={updated => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}