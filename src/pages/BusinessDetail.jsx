import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Phone, Clock, Globe, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_BUSINESSES } from "../lib/mockData";
import ReviewSection from "../components/common/ReviewSection";
import { base44 } from "@/api/base44Client";

export default function BusinessDetail() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    async function load() {
      if (!businessId.startsWith("biz-")) {
        const data = await base44.entities.Business.get(businessId);
        setBusiness(data);
        return;
      }
      setBusiness(MOCK_BUSINESSES.find((b) => b.id === businessId));
    }
    load();
  }, [businessId]);

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="relative">
        <img src={business.banner} alt={business.name} className="w-full h-52 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl glass flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {business.is_premium && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <Crown className="w-3 h-3" /> Premium
            </Badge>
          </div>
        )}
      </div>

      <div className="px-4 -mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 shadow-xl border border-border/50"
        >
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <img
              src={business.logo}
              alt={business.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-card shadow-lg"
            />
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold">{business.name}</h1>
                {business.is_verified && <Shield className="w-4 h-4 text-primary fill-primary/20" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {business.rating}
                </span>
                <span>({business.review_count} reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{business.description}</p>

          <div className="space-y-2.5 mb-5">
            {business.city && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">{business.city}, {business.state}</span>
              </div>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm">{business.phone}</span>
              </a>
            )}
            {business.hours && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm">{business.hours}</span>
              </div>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-smooth">
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="text-sm">{business.website}</span>
              </a>
            )}
          </div>

          {business.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {business.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">#{tag}</Badge>
              ))}
            </div>
          )}

          <Button className="w-full rounded-xl bg-primary text-white hover:bg-primary/90">
            Contact Business
          </Button>

          {business.id && !business.id.startsWith("biz-") && (
            <ReviewSection businessId={business.id} />
          )}
          {business.id?.startsWith("biz-") && (
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">Reviews available for registered businesses</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}