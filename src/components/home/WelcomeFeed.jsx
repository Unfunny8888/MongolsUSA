import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, TrendingUp, Users, Briefcase, Store } from "lucide-react";
import ListingCard from "../cards/ListingCard";
import GroupCard from "../cards/GroupCard";
import BusinessCard from "../cards/BusinessCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function WelcomeFeed({ userCity, userInterests }) {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [localGroups, setLocalGroups] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [localBusinesses, setLocalBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const base44 = (await import("@/api/base44Client")).base44;

        // Fetch nearby users (optional mock for demonstration)
        try {
          const users = await base44.entities.User.filter(
            { city: userCity },
            "-created_date",
            5
          );
          setNearbyUsers(users || []);
        } catch {}

        // Fetch trending listings
        const listings = await base44.entities.Listing.filter(
          {
            status: "active",
            location_city: userCity,
          },
          "-views",
          8
        );
        setTrendingListings(listings || []);

        // Fetch local groups
        const groups = await base44.entities.Group.filter(
          { city: userCity },
          "-member_count",
          5
        );
        setLocalGroups(groups || []);

        // Fetch recommended jobs
        const jobs = await base44.entities.Listing.filter(
          {
            status: "active",
            location_city: userCity,
            category: "jobs",
          },
          "-created_date",
          5
        );
        setRecommendedJobs(jobs || []);

        // Fetch local businesses
        const businesses = await base44.entities.Business.filter(
          { city: userCity },
          "-rating",
          5
        );
        setLocalBusinesses(businesses || []);

        setLoading(false);
      } catch (err) {
        console.error("Failed to load feed:", err);
        setLoading(false);
      }
    };

    loadFeed();
  }, [userCity, userInterests]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-600/10 border border-primary/20 p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-black text-foreground">
            Welcome to NomadLink
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Discover jobs, housing, events, and connect with Mongolians in{" "}
          <span className="font-semibold text-foreground">{userCity}</span>
        </p>
      </motion.div>

      {/* Nearby Mongolians */}
      {nearbyUsers.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Nearby Mongolians</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {nearbyUsers.slice(0, 6).map((user) => (
              <motion.div
                key={user.id}
                variants={itemVariants}
                className="p-3 rounded-2xl bg-card border border-border/50 text-center hover:border-primary/50 transition-smooth"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-emerald-600 mx-auto mb-2 flex items-center justify-center text-lg overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <p className="text-xs font-semibold text-foreground truncate">{user.full_name}</p>
                <p className="text-[10px] text-muted-foreground">{user.username || "No username"}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Trending Listings */}
      {trendingListings.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
          </div>
          <div className="space-y-3">
            {trendingListings.slice(0, 4).map((listing, idx) => (
              <motion.div key={listing.id} variants={itemVariants}>
                <ListingCard listing={listing} index={idx} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Job Opportunities</h2>
          </div>
          <div className="space-y-3">
            {recommendedJobs.slice(0, 3).map((job, idx) => (
              <motion.div key={job.id} variants={itemVariants}>
                <ListingCard listing={job} index={idx} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Local Groups */}
      {localGroups.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Join Local Groups</h2>
          </div>
          <div className="space-y-3">
            {localGroups.slice(0, 3).map((group) => (
              <motion.div key={group.id} variants={itemVariants}>
                <GroupCard group={group} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Local Businesses */}
      {localBusinesses.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Local Businesses</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {localBusinesses.slice(0, 4).map((business) => (
              <motion.div key={business.id} variants={itemVariants}>
                <BusinessCard business={business} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div
          variants={itemVariants}
          className="flex justify-center py-8"
        >
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.div>
  );
}