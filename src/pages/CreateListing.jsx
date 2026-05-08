import { useState, useEffect } from "react";
import { ArrowLeft, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { CATEGORIES } from "../lib/mockData";
import AIListingHelper from "../components/common/AIListingHelper";

export default function CreateListing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", price: "", price_type: "fixed",
    location_city: "", location_state: "", contact_phone: "", contact_email: "",
    // Car
    car_make: "", car_model: "", car_year: "", car_mileage: "", car_transmission: "", car_fuel: "", car_condition: "",
    // Job
    job_company: "", job_salary_min: "", job_salary_max: "", job_type: "", job_schedule: "", job_benefits: "",
    // Housing
    housing_bedrooms: "", housing_bathrooms: "", housing_type: "", housing_lease: "", housing_utilities: "", housing_furnished: false,
    // Event
    event_date: "", event_venue: "", event_ticket_price: "", event_organizer: "",
  });

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      setIsLoggedIn(authed);
      setLoading(false);
    });
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.title || !category) return;
    setSubmitting(true);
    const data = { ...form, category, price: form.price ? Number(form.price) : 0 };
    // Remove empty strings
    Object.keys(data).forEach((k) => { if (data[k] === "") delete data[k]; });
    await base44.entities.Listing.create(data);
    navigate("/");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
          <Camera className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-xl font-bold mb-2">Sign in to post</h1>
        <p className="text-sm text-muted-foreground mb-6">Create a free account to post listings, find jobs, and connect with the community.</p>
        <Button
          onClick={() => base44.auth.redirectToLogin()}
          className="rounded-xl bg-primary text-white px-8"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="glass sticky top-0 z-40 border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold">Create Listing</h1>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Category Selection */}
        <div>
          <Label className="text-xs font-semibold mb-2 block">Category *</Label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl text-center transition-smooth ${
                  category === cat.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-secondary text-foreground"
                }`}
              >
                <p className="text-lg mb-0.5">{cat.labelMn.slice(0, 2)}</p>
                <p className="text-[10px] font-medium">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* AI Helper */}
        <AIListingHelper
          category={category}
          onApply={(s) => setForm(f => ({ ...f, title: s.title || f.title, description: s.description || f.description, price: s.suggested_price || f.price }))}
        />

        {/* Common Fields */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Title *</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="What are you listing?" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your listing in Mongolian or English..." className="rounded-xl min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Price</Label>
              <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Price Type</Label>
              <Select value={form.price_type} onValueChange={(v) => update("price_type", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="hourly">Per Hour</SelectItem>
                  <SelectItem value="monthly">Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">City</Label>
              <Input value={form.location_city} onChange={(e) => update("location_city", e.target.value)} placeholder="Chicago" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">State</Label>
              <Input value={form.location_state} onChange={(e) => update("location_state", e.target.value)} placeholder="IL" className="rounded-xl" />
            </div>
          </div>
        </div>

        {/* Category-Specific Fields */}
        <AnimatePresence mode="wait">
          {category === "cars" && (
            <motion.div key="cars" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800">🚗 Car Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Make (e.g. Toyota)" value={form.car_make} onChange={(e) => update("car_make", e.target.value)} className="rounded-xl bg-white" />
                <Input placeholder="Model (e.g. Prius)" value={form.car_model} onChange={(e) => update("car_model", e.target.value)} className="rounded-xl bg-white" />
                <Input type="number" placeholder="Year" value={form.car_year} onChange={(e) => update("car_year", e.target.value)} className="rounded-xl bg-white" />
                <Input type="number" placeholder="Mileage" value={form.car_mileage} onChange={(e) => update("car_mileage", e.target.value)} className="rounded-xl bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.car_transmission} onValueChange={(v) => update("car_transmission", v)}>
                  <SelectTrigger className="rounded-xl bg-white"><SelectValue placeholder="Transmission" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.car_fuel} onValueChange={(v) => update("car_fuel", v)}>
                  <SelectTrigger className="rounded-xl bg-white"><SelectValue placeholder="Fuel Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {category === "jobs" && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <h3 className="text-sm font-bold text-emerald-800">💼 Job Details</h3>
              <Input placeholder="Company Name" value={form.job_company} onChange={(e) => update("job_company", e.target.value)} className="rounded-xl bg-white" />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Min Salary" value={form.job_salary_min} onChange={(e) => update("job_salary_min", e.target.value)} className="rounded-xl bg-white" />
                <Input type="number" placeholder="Max Salary" value={form.job_salary_max} onChange={(e) => update("job_salary_max", e.target.value)} className="rounded-xl bg-white" />
              </div>
              <Select value={form.job_type} onValueChange={(v) => update("job_type", v)}>
                <SelectTrigger className="rounded-xl bg-white"><SelectValue placeholder="Job Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="temp">Temporary</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Schedule (e.g. Mon-Fri)" value={form.job_schedule} onChange={(e) => update("job_schedule", e.target.value)} className="rounded-xl bg-white" />
              <Input placeholder="Benefits" value={form.job_benefits} onChange={(e) => update("job_benefits", e.target.value)} className="rounded-xl bg-white" />
            </motion.div>
          )}

          {category === "housing" && (
            <motion.div key="housing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
              <h3 className="text-sm font-bold text-orange-800">🏠 Housing Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Bedrooms" value={form.housing_bedrooms} onChange={(e) => update("housing_bedrooms", e.target.value)} className="rounded-xl bg-white" />
                <Input type="number" placeholder="Bathrooms" value={form.housing_bathrooms} onChange={(e) => update("housing_bathrooms", e.target.value)} className="rounded-xl bg-white" />
              </div>
              <Select value={form.housing_type} onValueChange={(v) => update("housing_type", v)}>
                <SelectTrigger className="rounded-xl bg-white"><SelectValue placeholder="Property Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Lease Term" value={form.housing_lease} onChange={(e) => update("housing_lease", e.target.value)} className="rounded-xl bg-white" />
              <Input placeholder="Utilities included?" value={form.housing_utilities} onChange={(e) => update("housing_utilities", e.target.value)} className="rounded-xl bg-white" />
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Furnished</Label>
                <Switch checked={form.housing_furnished} onCheckedChange={(v) => update("housing_furnished", v)} />
              </div>
            </motion.div>
          )}

          {category === "events" && (
            <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 p-4 rounded-2xl bg-pink-50 border border-pink-100">
              <h3 className="text-sm font-bold text-pink-800">🎉 Event Details</h3>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Event Date</Label>
                <Input type="datetime-local" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} className="rounded-xl bg-white" />
              </div>
              <Input placeholder="Venue" value={form.event_venue} onChange={(e) => update("event_venue", e.target.value)} className="rounded-xl bg-white" />
              <Input type="number" placeholder="Ticket Price" value={form.event_ticket_price} onChange={(e) => update("event_ticket_price", e.target.value)} className="rounded-xl bg-white" />
              <Input placeholder="Organizer" value={form.event_organizer} onChange={(e) => update("event_organizer", e.target.value)} className="rounded-xl bg-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold">Contact Info</h3>
          <Input placeholder="Phone number" value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} className="rounded-xl" />
          <Input placeholder="Email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} className="rounded-xl" />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!form.title || !category || submitting}
          className="w-full rounded-xl bg-primary text-white py-6 text-base font-bold hover:bg-primary/90"
        >
          {submitting ? "Posting..." : "Post Listing"}
        </Button>
      </div>
    </div>
  );
}