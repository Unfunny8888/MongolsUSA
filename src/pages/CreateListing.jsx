import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, X, Plus, Briefcase, Home, Car, Wrench, ShoppingBag, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import AIListingHelper from "../components/common/AIListingHelper";
import { motion, AnimatePresence } from "framer-motion";

const CATS = [
  { id: "jobs",      icon: Briefcase, label: "Ажил",       sub: "Хүн авах, ажил санал болгох" },
  { id: "housing",   icon: Home,      label: "Орон сууц",  sub: "Орон сууц, түрээс, худалдаа" },
  { id: "cars",      icon: Car,       label: "Машин",      sub: "Машин зарах, худалдан авах" },
  { id: "services",  icon: Wrench,    label: "Үйлчилгээ",  sub: "Үйлчилгээ санал болгох" },
  { id: "electronics", icon: ShoppingBag, label: "Худалдаа", sub: "Эд зүйл худалдах" },
  { id: "community", icon: Users,     label: "Нийгэмлэг", sub: "Нийгэмлэгийн пост" },
  { id: "events",    icon: Calendar,  label: "Үйл явдал",  sub: "Үйл явдал зохион байгуулах" },
];

function CategoryPicker({ onSelect }) {
  return (
    <div className="min-h-dvh">
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3">
        <h1 className="text-base font-bold">Шинэ зар</h1>
      </div>
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {CATS.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(cat.id)}
              className="p-4 rounded-2xl bg-card border border-border/50 text-left hover:border-primary/50 hover:shadow-md transition-smooth active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground">{cat.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{cat.sub}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ChipSelect({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? "" : opt.value)}
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-smooth ${
            value === opt.value
              ? "bg-primary text-white border-primary"
              : "bg-card text-foreground border-border/60"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-sm font-bold text-foreground mb-2">{children}</p>;
}

function FormField({ children }) {
  return <div className="mb-5">{children}</div>;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [aiTags, setAiTags] = useState([]);
  const [aiHashtags, setAiHashtags] = useState([]);
  const [aiSeoKeywords, setAiSeoKeywords] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", price_type: "fixed",
    location_city: "", location_state: "", contact_phone: "", contact_email: "",
    car_make: "", car_model: "", car_year: "", car_mileage: "",
    car_transmission: "", car_fuel: "", car_condition: "",
    job_company: "", job_salary_min: "", job_salary_max: "", job_type: "",
    job_schedule: "", job_benefits: "",
    housing_bedrooms: "", housing_bathrooms: "", housing_type: "",
    housing_lease: "", housing_utilities: "", housing_furnished: false,
    event_date: "", event_venue: "", event_ticket_price: "", event_organizer: "",
  });

  useEffect(() => {
    base44.auth.isAuthenticated().then((a) => { setIsLoggedIn(a); setLoading(false); });
  }, []);

  const update = useCallback((field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  const handleAIApply = useCallback((s) => {
    if (s.title) update("title", s.title);
    if (s.description) update("description", s.description);
    if (s.suggested_price > 0 && !form.price) update("price", String(s.suggested_price));
    if (s.detected_details?.make) update("car_make", s.detected_details.make);
    if (s.detected_details?.model) update("car_model", s.detected_details.model);
    if (s.detected_details?.year) update("car_year", String(s.detected_details.year));
    if (s.detected_details?.condition) update("car_condition", s.detected_details.condition);
    if (s.tags?.length) setAiTags(s.tags);
    if (s.hashtags?.length) setAiHashtags(s.hashtags);
    if (s.seo_keywords?.length) setAiSeoKeywords(s.seo_keywords);
  }, [form.price]);

  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImages((prev) => [...prev, file_url]);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.title || !category) return;
    setSubmitting(true);
    const data = { ...form, category };
    // Price: only set if actually entered
    if (form.price && form.price !== "") {
      data.price = Number(form.price);
    } else {
      delete data.price;
    }
    // Remove empty strings
    Object.keys(data).forEach((k) => { if (data[k] === "") delete data[k]; });
    if (images.length > 0) data.images = images;
    await base44.entities.Listing.create(data);
    navigate("/");
  }, [form, category, images, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <Plus className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-xl font-bold mb-2">Нэвтэрнэ үү</h1>
      <p className="text-sm text-muted-foreground mb-6">Зар оруулахын тулд нэвтрэх шаардлагатай.</p>
      <Button onClick={() => base44.auth.redirectToLogin()} className="rounded-xl px-8">Нэвтрэх</Button>
    </div>
  );

  // Step 1: category picker
  if (!category) return <CategoryPicker onSelect={setCategory} />;

  const cat = CATS.find((c) => c.id === category);
  const Icon = cat?.icon || Plus;

  return (
    <div className="min-h-dvh pb-32">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setCategory("")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Icon className="w-4 h-4 text-primary" />
        <h1 className="text-base font-bold">{cat?.label}</h1>
      </div>

      <div className="px-4 py-5 space-y-1">

        {/* AI Assistant */}
        <FormField>
          <AIListingHelper category={category} images={images} onApply={handleAIApply} />
        </FormField>

        {/* Photo Upload */}
        <FormField>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Зураг</SectionLabel>
            <span className="text-xs text-muted-foreground">{images.length}/10</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-smooth shrink-0 bg-secondary/30">
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground">Нэмэх</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
            {images.map((url, i) => (
              <div key={i} className="relative shrink-0">
                <img src={url} alt="" className="w-24 h-24 rounded-xl object-cover" />
                <button
                  onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </FormField>

        {/* Main Info */}
        <FormField>
          <SectionLabel>Үндсэн мэдээлэл</SectionLabel>
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={
              category === "jobs" ? "Жишээ: Жолооч хайж байна — $25/цаг" :
              category === "cars" ? "Жишээ: 2019 Toyota Prius зарна" :
              category === "housing" ? "Жишээ: 2 өрөө байр түрээслэнэ" :
              "Зарынхаа гарчиг..."
            }
            className="rounded-xl bg-card border-border/60"
          />
        </FormField>

        {/* JOBS specific */}
        {category === "jobs" && (
          <>
            <FormField>
              <SectionLabel>Компани</SectionLabel>
              <Input value={form.job_company} onChange={(e) => update("job_company", e.target.value)}
                placeholder="Компанийн нэр" className="rounded-xl bg-card border-border/60" />
            </FormField>
            <FormField>
              <SectionLabel>Ажлын төрөл</SectionLabel>
              <ChipSelect
                value={form.job_type}
                onChange={(v) => update("job_type", v)}
                options={[
                  { value: "full-time", label: "Бүтэн цаг" },
                  { value: "part-time", label: "Хагас цаг" },
                  { value: "contract", label: "Гэрээт" },
                  { value: "temp", label: "Улирлын" },
                  { value: "cash", label: "Дадлага" },
                ]}
              />
            </FormField>
            <FormField>
              <SectionLabel>Туршлагын түвшин</SectionLabel>
              <ChipSelect
                value={form.job_schedule}
                onChange={(v) => update("job_schedule", v)}
                options={[
                  { value: "entry", label: "Шинэхэн" },
                  { value: "mid", label: "Дунд" },
                  { value: "senior", label: "Ахлах" },
                  { value: "any", label: "Аль ч" },
                ]}
              />
            </FormField>
            <FormField>
              <SectionLabel>Нэмэлт</SectionLabel>
              <div className="space-y-0 rounded-2xl border border-border/60 overflow-hidden bg-card">
                {[
                  { field: "housing_furnished", label: "🏡 Байр багтсан" },
                  { field: "housing_utilities", label: "📋 Visa дэмжлэг" },
                  { field: "car_condition", label: "🖥 Зайнаас (Remote)" },
                  { field: "event_venue", label: "⚕ Эрүүл мэндийн даатгал" },
                ].map(({ field, label }, i, arr) => (
                  <div key={field} className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border/40" : ""}`}>
                    <span className="text-sm text-foreground">{label}</span>
                    <Switch />
                  </div>
                ))}
              </div>
            </FormField>
            <FormField>
              <SectionLabel>Цалин</SectionLabel>
              <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-3 py-2.5">
                <span className="text-muted-foreground font-bold">$</span>
                <Input type="number" value={form.job_salary_min} onChange={(e) => update("job_salary_min", e.target.value)}
                  placeholder="0" className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" />
                <span className="text-muted-foreground">–</span>
                <Input type="number" value={form.job_salary_max} onChange={(e) => update("job_salary_max", e.target.value)}
                  placeholder="0" className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" />
              </div>
            </FormField>
          </>
        )}

        {/* CARS specific */}
        {category === "cars" && (
          <>
            <FormField>
              <SectionLabel>Машины мэдээлэл</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Марк (Toyota)" value={form.car_make} onChange={(e) => update("car_make", e.target.value)} className="rounded-xl bg-card border-border/60" />
                <Input placeholder="Загвар (Prius)" value={form.car_model} onChange={(e) => update("car_model", e.target.value)} className="rounded-xl bg-card border-border/60" />
                <Input type="number" placeholder="Он" value={form.car_year} onChange={(e) => update("car_year", e.target.value)} className="rounded-xl bg-card border-border/60" />
                <Input type="number" placeholder="Гүйлт" value={form.car_mileage} onChange={(e) => update("car_mileage", e.target.value)} className="rounded-xl bg-card border-border/60" />
              </div>
            </FormField>
            <FormField>
              <SectionLabel>Хурдны хайрцаг</SectionLabel>
              <ChipSelect value={form.car_transmission} onChange={(v) => update("car_transmission", v)}
                options={[{ value: "automatic", label: "Автомат" }, { value: "manual", label: "Механик" }]} />
            </FormField>
            <FormField>
              <SectionLabel>Төлөв</SectionLabel>
              <ChipSelect value={form.car_condition} onChange={(v) => update("car_condition", v)}
                options={[
                  { value: "excellent", label: "Маш сайн" },
                  { value: "good", label: "Сайн" },
                  { value: "fair", label: "Дунд" },
                  { value: "poor", label: "Муу" },
                ]} />
            </FormField>
            <FormField>
              <SectionLabel>Үнэ ($)</SectionLabel>
              <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-3 py-2.5">
                <span className="text-muted-foreground font-bold">$</span>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)}
                  placeholder="Үнэ оруулна уу" className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" />
              </div>
            </FormField>
          </>
        )}

        {/* HOUSING specific */}
        {category === "housing" && (
          <>
            <FormField>
              <SectionLabel>Өрөөний тоо</SectionLabel>
              <ChipSelect value={form.housing_bedrooms?.toString()} onChange={(v) => update("housing_bedrooms", Number(v))}
                options={["1","2","3","4","5+"].map((n) => ({ value: n, label: `${n} өрөө` }))} />
            </FormField>
            <FormField>
              <SectionLabel>Орон сууцны төрөл</SectionLabel>
              <ChipSelect value={form.housing_type} onChange={(v) => update("housing_type", v)}
                options={[
                  { value: "apartment", label: "Апартмент" },
                  { value: "house", label: "Байшин" },
                  { value: "room", label: "Өрөө" },
                  { value: "studio", label: "Студи" },
                  { value: "condo", label: "Кондо" },
                ]} />
            </FormField>
            <FormField>
              <SectionLabel>Нэмэлт</SectionLabel>
              <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
                  <span className="text-sm">🛋 Тавилгатай</span>
                  <Switch checked={form.housing_furnished} onCheckedChange={(v) => update("housing_furnished", v)} />
                </div>
              </div>
            </FormField>
            <FormField>
              <SectionLabel>Түрээсийн үнэ (сараар $)</SectionLabel>
              <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-3 py-2.5">
                <span className="text-muted-foreground font-bold">$</span>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)}
                  placeholder="Сарын үнэ" className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" />
              </div>
            </FormField>
          </>
        )}

        {/* EVENTS specific */}
        {category === "events" && (
          <>
            <FormField>
              <SectionLabel>Огноо</SectionLabel>
              <Input type="datetime-local" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} className="rounded-xl bg-card border-border/60" />
            </FormField>
            <FormField>
              <SectionLabel>Газар</SectionLabel>
              <Input value={form.event_venue} onChange={(e) => update("event_venue", e.target.value)} placeholder="Хаана болох вэ?" className="rounded-xl bg-card border-border/60" />
            </FormField>
            <FormField>
              <SectionLabel>Тасалбарын үнэ ($)</SectionLabel>
              <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-3 py-2.5">
                <span className="text-muted-foreground font-bold">$</span>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)}
                  placeholder="Үнэгүй бол хоосон орхино" className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" />
              </div>
            </FormField>
          </>
        )}

        {/* Generic price for services/electronics/community */}
        {["services", "electronics", "community"].includes(category) && (
          <FormField>
            <SectionLabel>Үнэ ($)</SectionLabel>
            <div className="flex items-center gap-2 bg-card border border-border/60 rounded-xl px-3 py-2.5">
              <span className="text-muted-foreground font-bold">$</span>
              <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)}
                placeholder="Хоосон орхивол нуугдана" className="border-0 p-0 h-auto focus-visible:ring-0 bg-transparent" />
            </div>
          </FormField>
        )}

        {/* Location */}
        <FormField>
          <SectionLabel>Байршил</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Input value={form.location_city} onChange={(e) => update("location_city", e.target.value)} placeholder="Хот" className="rounded-xl bg-card border-border/60" />
            <Input value={form.location_state} onChange={(e) => update("location_state", e.target.value)} placeholder="IL" className="rounded-xl bg-card border-border/60" />
          </div>
        </FormField>

        {/* AI-generated tags / hashtags / SEO */}
        {(aiTags.length > 0 || aiHashtags.length > 0 || aiSeoKeywords.length > 0) && (
          <FormField>
            <SectionLabel>AI-generated Tags</SectionLabel>
            <div className="space-y-2">
              {aiTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiTags.map(t => <span key={t} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs font-medium">{t}</span>)}
                </div>
              )}
              {aiHashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiHashtags.map(h => <span key={h} className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">#{h}</span>)}
                </div>
              )}
              {aiSeoKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiSeoKeywords.map(k => <span key={k} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">{k}</span>)}
                </div>
              )}
            </div>
          </FormField>
        )}

        {/* Description */}
        <FormField>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Тайлбар</SectionLabel>
          </div>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Тайлбар... Эсвэл дээрх 'AI Үүсгэх' товчийг ашиглаарай."
            className="rounded-xl bg-card border-border/60 min-h-[120px]"
          />
        </FormField>

        {/* Contact */}
        <FormField>
          <SectionLabel>Холбоо барих</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} placeholder="+1 555 123 4567" className="rounded-xl bg-card border-border/60" />
            <Input value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="email@..." className="rounded-xl bg-card border-border/60" />
          </div>
        </FormField>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
        <Button
          onClick={handleSubmit}
          disabled={!form.title || submitting}
          className="w-full rounded-xl py-6 text-base font-bold"
        >
          {submitting ? "Нийтлэж байна..." : "Нийтлэх"}
        </Button>
      </div>
    </div>
  );
}