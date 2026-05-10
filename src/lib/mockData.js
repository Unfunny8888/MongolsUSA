// ─────────────────────────────────────────────────────────────────────────────
// NomadLink — Realistic Seeded Test Dataset
// 100+ entries across all categories, cities, and content types.
// Interconnected ecosystem: companies ↔ jobs ↔ groups ↔ posts ↔ rideshares.
// ─────────────────────────────────────────────────────────────────────────────

const NOW = Date.now();
const ago = (h) => new Date(NOW - h * 3600000).toISOString();

// ─── AVATARS (reusable pool) ──────────────────────────────────────────────────
const AV = {
  bold:     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  sarnai:   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  temujin:  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  oyunaa:   "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  ganbold:  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  munkh:    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
  nomin:    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
  batbold:  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
  tsolmon:  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
  enkhjin:  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  narantsetseg: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
  davaasuren: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
  anand:    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
  altai:    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  zaya:     "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop&crop=face",
};

// ─── LISTINGS (100+) ─────────────────────────────────────────────────────────
export const MOCK_LISTINGS = [

  // ══════════════════ JOBS ══════════════════
  {
    id: "job-1",
    title: "CDL-A Driver — OTR Routes $2,000–$2,400/wk",
    description: "NomadTruck LLC is hiring experienced CDL-A drivers. Over-the-road and regional routes. Home weekends available. Health insurance, 401k. Монгол хэлтэй диспетч байна. Яаралтай авна!",
    category: "jobs", price: 2200, price_type: "weekly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800"],
    status: "active", is_featured: true, views: 891, saves: 134,
    poster_name: "NomadTruck LLC", poster_avatar: AV.ganbold,
    job_company: "NomadTruck LLC", job_salary_min: 2000, job_salary_max: 2400,
    job_type: "full-time", job_schedule: "OTR, home weekends",
    job_benefits: "Health, 401k, paid vacation",
    tags: ["cdl", "driver", "trucking", "otr"], created_date: ago(6)
  },
  {
    id: "job-2",
    title: "Owner Operator Opportunity — Flatbed $3,500+/wk",
    description: "Looking for owner operators with their own truck. Flatbed loads, great lanes. Монгол эзэд тавтай морил! Quick pay, fuel card, 24/7 dispatch support.",
    category: "jobs", price: 3500, price_type: "weekly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"],
    status: "active", is_featured: true, views: 1230, saves: 201,
    poster_name: "SteppeHaul Inc", poster_avatar: AV.batbold,
    job_company: "SteppeHaul Inc", job_salary_min: 3200, job_salary_max: 4000,
    job_type: "contract", job_schedule: "Flexible",
    job_benefits: "Fuel card, quick pay",
    tags: ["owner operator", "flatbed", "trucking"], created_date: ago(10)
  },
  {
    id: "job-3",
    title: "Mongolian Restaurant — Kitchen Staff Needed",
    description: "Khaan's Kitchen Chicago seeking line cook and prep cook. Experience preferred but not required. Will train. Монгол хоолны дотоод ажилтан авна. $18–22/hr.",
    category: "jobs", price: 20, price_type: "hourly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"],
    status: "active", views: 312, saves: 47,
    poster_name: "Khaan's Kitchen", poster_avatar: AV.sarnai,
    job_company: "Khaan's Kitchen", job_salary_min: 18, job_salary_max: 22,
    job_type: "full-time", job_schedule: "Tue–Sun 10am–9pm",
    tags: ["restaurant", "cook", "chicago"], created_date: ago(14)
  },
  {
    id: "job-4",
    title: "Part-time Cashier — Mongolian Restaurant Seattle",
    description: "Ulaanbaatar Grill Seattle is hiring a part-time cashier. Mongolian/English bilingual preferred. Weekends required. Flexible hours. $17–19/hr.",
    category: "jobs", price: 18, price_type: "hourly",
    location_city: "Seattle", location_state: "WA",
    images: ["https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800"],
    status: "active", views: 167, saves: 28,
    poster_name: "UB Grill Seattle", poster_avatar: AV.munkh,
    job_company: "UB Grill Seattle", job_salary_min: 17, job_salary_max: 19,
    job_type: "part-time", job_schedule: "Fri–Sun + flexible",
    tags: ["cashier", "restaurant", "seattle"], created_date: ago(20)
  },
  {
    id: "job-5",
    title: "Babysitter / Nanny — Монгол хүүхэд харах",
    description: "Mongolian family in LA needs a babysitter 3 days/week. Mongolian-speaking required. 2 kids ages 4 and 7. $20/hr. Friendly home, flexible hours.",
    category: "jobs", price: 20, price_type: "hourly",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1587400988673-1bc4afe38d58?w=800"],
    status: "active", views: 223, saves: 56,
    poster_name: "Оюунцэцэг Л.", poster_avatar: AV.oyunaa,
    job_company: null, job_salary_min: 18, job_salary_max: 22,
    job_type: "part-time", job_schedule: "Mon, Wed, Fri 8am–4pm",
    tags: ["babysitter", "nanny", "la", "mongolian"], created_date: ago(18)
  },
  {
    id: "job-6",
    title: "Moving Crew Member — Cash Daily Pay",
    description: "Local moving company in Denver needs strong helpers. No experience needed. Cash paid same day. Weekends available. Денвэрт нүүлгэн шилжилтийн туслах авна.",
    category: "jobs", price: 180, price_type: "fixed",
    location_city: "Denver", location_state: "CO",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    status: "active", views: 144, saves: 19,
    poster_name: "Батжаргал Н.", poster_avatar: AV.davaasuren,
    job_company: "Rocky Mountain Movers", job_salary_min: 160, job_salary_max: 200,
    job_type: "cash", job_schedule: "Weekends + weekdays",
    tags: ["moving", "cash", "denver"], created_date: ago(30)
  },
  {
    id: "job-7",
    title: "Immigration Paralegal — Mongolian Speaker",
    description: "Steppe Law Group in Virginia hiring a paralegal with Mongolian language skills. Must be detail-oriented. 2+ years experience preferred. $22–27/hr.",
    category: "jobs", price: 25, price_type: "hourly",
    location_city: "Virginia", location_state: "VA",
    images: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"],
    status: "active", is_featured: true, views: 445, saves: 88,
    poster_name: "Steppe Law Group", poster_avatar: AV.batbold,
    job_company: "Steppe Law Group", job_salary_min: 22, job_salary_max: 27,
    job_type: "full-time", job_schedule: "Mon–Fri 9am–5pm",
    job_benefits: "Health, dental, PTO",
    tags: ["immigration", "legal", "virginia", "mongolian"], created_date: ago(48)
  },
  {
    id: "job-8",
    title: "Warehouse Associate — $18/hr Night Shift",
    description: "Amazon fulfillment center in Minneapolis hiring warehouse workers. Night shift 10pm–6am. No experience needed. Immediate start. Нэн яаралтай авна.",
    category: "jobs", price: 18, price_type: "hourly",
    location_city: "Minneapolis", location_state: "MN",
    images: ["https://images.unsplash.com/photo-1553413077-190dd305871c?w=800"],
    status: "active", views: 534, saves: 76,
    poster_name: "Мөнх-Эрдэнэ Т.", poster_avatar: AV.enkhjin,
    job_company: "Amazon Fulfillment MN", job_salary_min: 18, job_salary_max: 20,
    job_type: "full-time", job_schedule: "Sun–Thu 10pm–6am",
    job_benefits: "Health insurance, stock, paid time off",
    tags: ["warehouse", "amazon", "minneapolis"], created_date: ago(36)
  },
  {
    id: "job-9",
    title: "Truck Dispatcher — Mongolian Company NY",
    description: "Growing trucking company in NY seeks Mongolian-speaking dispatcher. Must know load boards, routing, and driver communication. Remote possible. $3,500–4,500/mo.",
    category: "jobs", price: 4000, price_type: "monthly",
    location_city: "New York", location_state: "NY",
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"],
    status: "active", views: 678, saves: 112,
    poster_name: "EagleFreight NY", poster_avatar: AV.ganbold,
    job_company: "EagleFreight NY", job_salary_min: 3500, job_salary_max: 4500,
    job_type: "full-time", job_schedule: "Mon–Fri, some weekends",
    tags: ["dispatcher", "trucking", "new york"], created_date: ago(72)
  },
  {
    id: "job-10",
    title: "Cleaning Service Worker — Hotel Dallas",
    description: "Hyatt hotel in Dallas hiring housekeeping staff. Full-time and part-time available. Health benefits for full-time. $16/hr + tips. Монгол хэлтэй менежер байна.",
    category: "jobs", price: 16, price_type: "hourly",
    location_city: "Dallas", location_state: "TX",
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"],
    status: "active", views: 234, saves: 38,
    poster_name: "Нарантуяа Ч.", poster_avatar: AV.nomin,
    job_company: "Hyatt Dallas", job_salary_min: 16, job_salary_max: 18,
    job_type: "full-time", job_schedule: "Rotating shifts",
    tags: ["hotel", "cleaning", "dallas"], created_date: ago(55)
  },
  {
    id: "job-11",
    title: "Forklift Operator — $21/hr Immediate Hire",
    description: "Logistics company in Arlington VA needs certified forklift operators. Day shift available. Bilingual English/Mongolian supervisor on site.",
    category: "jobs", price: 21, price_type: "hourly",
    location_city: "Arlington", location_state: "VA",
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"],
    status: "active", views: 189, saves: 31,
    poster_name: "Батсүх Г.", poster_avatar: AV.bold,
    job_company: "ArlingtonLogistics", job_salary_min: 20, job_salary_max: 22,
    job_type: "full-time", job_schedule: "Mon–Fri 6am–2pm",
    tags: ["forklift", "warehouse", "arlington"], created_date: ago(66)
  },
  {
    id: "job-12",
    title: "Barista — Mongolian Café San Francisco",
    description: "Steppe Café SF needs an experienced barista. Latte art a plus. Mongolian or English speaker. $19/hr + tips. Fun team environment!",
    category: "jobs", price: 19, price_type: "hourly",
    location_city: "San Francisco", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"],
    status: "active", views: 298, saves: 44,
    poster_name: "Steppe Café SF", poster_avatar: AV.zaya,
    job_company: "Steppe Café SF", job_salary_min: 19, job_salary_max: 21,
    job_type: "part-time", job_schedule: "Flexible shifts",
    tags: ["barista", "cafe", "san francisco"], created_date: ago(40)
  },

  // ══════════════════ HOUSING ══════════════════
  {
    id: "hous-1",
    title: "2BR Apartment — Uptown Chicago $1,200/mo",
    description: "Spacious 2BR in Uptown, steps from Red Line. Heat and water included. Mongolian community building. 2 өрөө байр, халаалт усны хамт.",
    category: "housing", price: 1200, price_type: "monthly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
    status: "active", views: 445, saves: 82,
    poster_name: "Сарнай Д.", poster_avatar: AV.sarnai,
    housing_bedrooms: 2, housing_bathrooms: 1, housing_furnished: false,
    housing_utilities: "Heat & water included", housing_lease: "12 months",
    housing_type: "apartment", tags: ["apartment", "uptown", "chicago"], created_date: ago(24)
  },
  {
    id: "hous-2",
    title: "Furnished Studio — Lincoln Square Chicago $900/mo",
    description: "Fully furnished studio in Lincoln Square. All bills included. Close to Mongolian community center. Short-term lease ok. Тавилгатай студи байр.",
    category: "housing", price: 900, price_type: "monthly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
    status: "active", views: 334, saves: 61,
    poster_name: "Дэлгэрмаа Ж.", poster_avatar: AV.tsolmon,
    housing_bedrooms: 0, housing_bathrooms: 1, housing_furnished: true,
    housing_utilities: "All included", housing_lease: "3–12 months",
    housing_type: "studio", tags: ["studio", "furnished", "chicago"], created_date: ago(32)
  },
  {
    id: "hous-3",
    title: "Room for Rent — Female Only, Seattle $780/mo",
    description: "Private room in shared 3BR house in Beacon Hill. Quiet neighborhood, close to buses. Female tenants only. Монгол эмэгтэй нөхөр хайж байна.",
    category: "housing", price: 780, price_type: "monthly",
    location_city: "Seattle", location_state: "WA",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"],
    status: "active", views: 223, saves: 39,
    poster_name: "Мөнхцэцэг А.", poster_avatar: AV.nomin,
    housing_bedrooms: 1, housing_bathrooms: 1, housing_furnished: true,
    housing_utilities: "Wifi + water included", housing_lease: "6 months",
    housing_type: "room", tags: ["room", "female", "seattle"], created_date: ago(28)
  },
  {
    id: "hous-4",
    title: "3BR House — Denver, $1,800/mo",
    description: "Quiet 3BR house in Aurora/Denver area. Garage included. Close to I-70 for truckers. Mongolian family preferred. Гараж бүхий 3 өрөө байшин.",
    category: "housing", price: 1800, price_type: "monthly",
    location_city: "Denver", location_state: "CO",
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"],
    status: "active", views: 312, saves: 54,
    poster_name: "Баярсайхан Ц.", poster_avatar: AV.bold,
    housing_bedrooms: 3, housing_bathrooms: 2, housing_furnished: false,
    housing_utilities: "Tenant pays utilities", housing_lease: "12 months",
    housing_type: "house", tags: ["house", "denver", "family"], created_date: ago(60)
  },
  {
    id: "hous-5",
    title: "Room Near Koreatown LA — $750/mo",
    description: "Private room in Koreatown. Shared kitchen/bath. Near metro & bus. Mongolian & Korean neighbors. Азийн гудамж ойрхон, тав тухтай.",
    category: "housing", price: 750, price_type: "monthly",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"],
    status: "active", views: 267, saves: 43,
    poster_name: "Оюунаа М.", poster_avatar: AV.oyunaa,
    housing_bedrooms: 1, housing_bathrooms: 1, housing_furnished: true,
    housing_type: "room", housing_lease: "6 months",
    tags: ["room", "la", "koreatown"], created_date: ago(44)
  },
  {
    id: "hous-6",
    title: "1BR Apartment — Arlington VA, $1,450/mo",
    description: "Clean 1BR near Ballston metro. Hardwood floors, updated kitchen. Mongolian community nearby. 1 өрөө, метроны ойрхон.",
    category: "housing", price: 1450, price_type: "monthly",
    location_city: "Arlington", location_state: "VA",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
    status: "active", views: 189, saves: 33,
    poster_name: "Энхтуяа Б.", poster_avatar: AV.sarnai,
    housing_bedrooms: 1, housing_bathrooms: 1, housing_furnished: false,
    housing_utilities: "Tenant pays electric", housing_lease: "12 months",
    housing_type: "apartment", tags: ["apartment", "arlington", "metro"], created_date: ago(52)
  },
  {
    id: "hous-7",
    title: "Furnished Room — Minneapolis $650/mo",
    description: "Furnished room in Mongolian household in south Minneapolis. Family environment. Bus line nearby. Utilities included. Тав тухтай гэртэй байр.",
    category: "housing", price: 650, price_type: "monthly",
    location_city: "Minneapolis", location_state: "MN",
    images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800"],
    status: "active", views: 198, saves: 37,
    poster_name: "Болормаа Д.", poster_avatar: AV.tsolmon,
    housing_bedrooms: 1, housing_bathrooms: 1, housing_furnished: true,
    housing_type: "room", housing_utilities: "All included", housing_lease: "Month-to-month",
    tags: ["room", "minneapolis", "mongolian"], created_date: ago(72)
  },
  {
    id: "hous-8",
    title: "2BR Condo — Flushing NY $1,600/mo",
    description: "Large 2BR condo in Flushing near Mongolian grocery stores. Laundry in building. 10 min to Manhattan by subway. 2 өрөө, субвэй ойрхон.",
    category: "housing", price: 1600, price_type: "monthly",
    location_city: "New York", location_state: "NY",
    images: ["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800"],
    status: "active", views: 378, saves: 67,
    poster_name: "Батбаяр Н.", poster_avatar: AV.enkhjin,
    housing_bedrooms: 2, housing_bathrooms: 1, housing_furnished: false,
    housing_type: "condo", housing_lease: "12 months",
    tags: ["condo", "flushing", "new york"], created_date: ago(80)
  },
  {
    id: "hous-9",
    title: "Room Available — Dallas TX $700/mo",
    description: "Nice room in shared house in North Dallas. Quiet Mongolian family home. All utilities included. Close to I-635. Хэмнэлттэй, тайван байр.",
    category: "housing", price: 700, price_type: "monthly",
    location_city: "Dallas", location_state: "TX",
    images: ["https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800"],
    status: "active", views: 156, saves: 24,
    poster_name: "Ганцэцэг П.", poster_avatar: AV.zaya,
    housing_bedrooms: 1, housing_bathrooms: 1, housing_furnished: true,
    housing_type: "room", housing_utilities: "All included", housing_lease: "Month-to-month",
    tags: ["room", "dallas", "family"], created_date: ago(96)
  },
  {
    id: "hous-10",
    title: "Studio near Downtown SF — $1,300/mo",
    description: "Compact furnished studio near BART station. Bills included. Mongolian-friendly building. Month-to-month lease. Нэг хүнд тохиромжтой.",
    category: "housing", price: 1300, price_type: "monthly",
    location_city: "San Francisco", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"],
    status: "active", views: 234, saves: 41,
    poster_name: "Туяа Э.", poster_avatar: AV.oyunaa,
    housing_bedrooms: 0, housing_bathrooms: 1, housing_furnished: true,
    housing_type: "studio", housing_utilities: "All included", housing_lease: "Month-to-month",
    tags: ["studio", "san francisco", "bart"], created_date: ago(88)
  },

  // ══════════════════ CARS / VEHICLES ══════════════════
  {
    id: "car-1",
    title: "2019 Toyota Prius — 45k miles, Excellent Condition",
    description: "One-owner Prius. All service records. Perfect for Uber/Lyft or commute. Дэлхийн хамгийн хэмнэлттэй машин! New tires, clean title.",
    category: "cars", price: 8500, price_type: "negotiable",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800"],
    status: "active", is_featured: true, views: 678, saves: 112,
    poster_name: "Болд Б.", poster_avatar: AV.bold,
    car_make: "Toyota", car_model: "Prius", car_year: 2019, car_mileage: 45000,
    car_transmission: "automatic", car_fuel: "hybrid", car_condition: "excellent",
    tags: ["toyota", "prius", "hybrid", "chicago"], created_date: ago(12)
  },
  {
    id: "car-2",
    title: "2021 Honda Civic — Low Miles, Clean Title",
    description: "One-owner civic, dealer-serviced. No accidents. Backup camera, Apple CarPlay. Цэвэр Honda Civic. Бага гарз, сайн засвар.",
    category: "cars", price: 15500, price_type: "negotiable",
    location_city: "New York", location_state: "NY",
    images: ["https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800"],
    status: "active", views: 456, saves: 78,
    poster_name: "Батбаяр Н.", poster_avatar: AV.enkhjin,
    car_make: "Honda", car_model: "Civic", car_year: 2021, car_mileage: 28000,
    car_transmission: "automatic", car_fuel: "gasoline", car_condition: "excellent",
    tags: ["honda", "civic", "new york"], created_date: ago(20)
  },
  {
    id: "car-3",
    title: "2016 Freightliner Cascadia — CDL Ready",
    description: "Sleeper truck, 500k miles, recently serviced. ELD compliant. Good condition for OTR. Монгол CDL жолооч эздэд тохиромжтой.",
    category: "cars", price: 32000, price_type: "negotiable",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800"],
    status: "active", views: 567, saves: 89,
    poster_name: "Ганбаатар Ж.", poster_avatar: AV.ganbold,
    car_make: "Freightliner", car_model: "Cascadia", car_year: 2016, car_mileage: 500000,
    car_transmission: "manual", car_fuel: "diesel", car_condition: "good",
    tags: ["truck", "cdl", "semi", "chicago"], created_date: ago(36)
  },
  {
    id: "car-4",
    title: "2020 Toyota Camry — Perfect Rideshare Car",
    description: "Camry in great shape, Uber-ready. Non-smoker, no pets. Regular oil changes. $12,000 OBO. Убэр хийхэд бэлэн, сайн машин.",
    category: "cars", price: 12000, price_type: "negotiable",
    location_city: "Seattle", location_state: "WA",
    images: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800"],
    status: "active", views: 334, saves: 51,
    poster_name: "Эрдэнэбаяр О.", poster_avatar: AV.anand,
    car_make: "Toyota", car_model: "Camry", car_year: 2020, car_mileage: 62000,
    car_transmission: "automatic", car_fuel: "gasoline", car_condition: "excellent",
    tags: ["toyota", "camry", "seattle", "rideshare"], created_date: ago(48)
  },
  {
    id: "car-5",
    title: "2018 Ford F-150 — Work Truck, Dallas",
    description: "F-150 crew cab, tow package, bed liner. Used for construction but well maintained. Great work truck. $21,000 firm. Ажлын том пикап машин.",
    category: "cars", price: 21000, price_type: "fixed",
    location_city: "Dallas", location_state: "TX",
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"],
    status: "active", views: 289, saves: 45,
    poster_name: "Гомбосүрэн Ч.", poster_avatar: AV.davaasuren,
    car_make: "Ford", car_model: "F-150", car_year: 2018, car_mileage: 78000,
    car_transmission: "automatic", car_fuel: "gasoline", car_condition: "good",
    tags: ["ford", "f150", "truck", "dallas"], created_date: ago(60)
  },
  {
    id: "car-6",
    title: "2022 Tesla Model 3 — FSD Package",
    description: "Like-new Model 3 with Full Self Driving. White exterior, black interior. Under warranty. Perfect for LA driving. Тесла цаашид зарна.",
    category: "cars", price: 29000, price_type: "fixed",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800"],
    status: "active", is_featured: true, views: 1120, saves: 198,
    poster_name: "Тэмүүлэн Г.", poster_avatar: AV.munkh,
    car_make: "Tesla", car_model: "Model 3", car_year: 2022, car_mileage: 18000,
    car_transmission: "automatic", car_fuel: "electric", car_condition: "excellent",
    tags: ["tesla", "electric", "la", "fsd"], created_date: ago(22)
  },
  {
    id: "car-7",
    title: "2017 Chevy Silverado 2500 — Diesel",
    description: "Duramax diesel, towing package, 4WD. Good for heavy hauling. Denver area. $28,500 OBO. 4 дугуйтай дизель пикап.",
    category: "cars", price: 28500, price_type: "negotiable",
    location_city: "Denver", location_state: "CO",
    images: ["https://images.unsplash.com/photo-1570733577524-3a047079e80d?w=800"],
    status: "active", views: 198, saves: 34,
    poster_name: "Нямгэрэл Д.", poster_avatar: AV.altai,
    car_make: "Chevrolet", car_model: "Silverado 2500", car_year: 2017, car_mileage: 95000,
    car_transmission: "automatic", car_fuel: "diesel", car_condition: "good",
    tags: ["chevy", "silverado", "diesel", "denver"], created_date: ago(80)
  },

  // ══════════════════ EVENTS ══════════════════
  {
    id: "evt-1",
    title: "Tsagaan Sar Celebration 2026 — Midwest",
    description: "Biggest Mongolian New Year celebration in the Midwest! Traditional food, throat singing, biyelgee dance, buuz-making contest. Цагаан Сарын баярын арга хэмжээ — Дорнод Америк.",
    category: "events", price: 30, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"],
    status: "active", is_featured: true, views: 2341, saves: 389,
    poster_name: "MACA Chicago", poster_avatar: AV.narantsetseg,
    event_date: "2026-06-14T18:00:00Z", event_venue: "Hyatt Regency Chicago, IL",
    event_ticket_price: 30, event_organizer: "Mongolian American Cultural Association",
    tags: ["tsagaan sar", "culture", "chicago", "celebration"], created_date: ago(72)
  },
  {
    id: "evt-2",
    title: "Mongolian Community BBQ — Seattle Woodland Park",
    description: "Monthly free community BBQ! Bring хорхог, гурилтай шөл, хуушуур. Family-friendly. All Mongolians welcome! Сар бүрийн нийтийн зуслан.",
    category: "events", price: 0, price_type: "free",
    location_city: "Seattle", location_state: "WA",
    images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"],
    status: "active", views: 789, saves: 134,
    poster_name: "Seattle Mongolian Community", poster_avatar: AV.nomin,
    event_date: "2026-05-25T17:00:00Z", event_venue: "Woodland Park, Seattle WA",
    event_ticket_price: 0, event_organizer: "Seattle Mongols",
    tags: ["bbq", "free", "seattle", "community"], created_date: ago(48)
  },
  {
    id: "evt-3",
    title: "Mongolian Basketball Tournament — Chicago",
    description: "Annual 3-on-3 basketball tournament for Mongolian teams. Register before May 30. Prizes for top 3 teams! Монгол сагсан бөмбөгийн тэмцээн.",
    category: "events", price: 20, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1546519638405-a2ffca98ee59?w=800"],
    status: "active", views: 456, saves: 78,
    poster_name: "Mongolian Sports Club", poster_avatar: AV.bold,
    event_date: "2026-06-07T10:00:00Z", event_venue: "North Park University Gym",
    event_ticket_price: 20, event_organizer: "Mongolian Sports Association Chicago",
    tags: ["basketball", "sports", "chicago", "tournament"], created_date: ago(60)
  },
  {
    id: "evt-4",
    title: "Naadam Games — Denver Mongolian Cultural Festival",
    description: "Traditional Mongolian Naadam with wrestling, archery, and horse competition (polo version). Food vendors, kids games, cultural performances. Наадамд тавтай морилно уу!",
    category: "events", price: 15, price_type: "fixed",
    location_city: "Denver", location_state: "CO",
    images: ["https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800"],
    status: "active", is_featured: true, views: 1234, saves: 212,
    poster_name: "Denver Mongolian Association", poster_avatar: AV.ganbold,
    event_date: "2026-07-11T11:00:00Z", event_venue: "Clement Park, Littleton CO",
    event_ticket_price: 15, event_organizer: "Denver Mongolian Cultural Association",
    tags: ["naadam", "culture", "denver", "festival"], created_date: ago(96)
  },
  {
    id: "evt-5",
    title: "Mongolian Language Class — Adults, Los Angeles",
    description: "Free Mongolian language class for heritage speakers and beginners. Every Saturday 10am. Children's class also available. Монгол хэлний хичээл нээлттэй.",
    category: "events", price: 0, price_type: "free",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800"],
    status: "active", views: 678, saves: 123,
    poster_name: "LA Mongolian School", poster_avatar: AV.oyunaa,
    event_date: "2026-05-17T10:00:00Z", event_venue: "Koreatown Community Center, LA",
    event_ticket_price: 0, event_organizer: "Mongolian Education Foundation LA",
    tags: ["language", "school", "la", "free"], created_date: ago(84)
  },
  {
    id: "evt-6",
    title: "Кино үзэлт — Mongolian Film Night Minneapolis",
    description: "Movie screening of recent Mongolian films with English subtitles. Popcorn and buuz provided. Free for community members. Монгол кино үзэх үдэш.",
    category: "events", price: 0, price_type: "free",
    location_city: "Minneapolis", location_state: "MN",
    images: ["https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800"],
    status: "active", views: 345, saves: 56,
    poster_name: "Twin Cities Mongolians", poster_avatar: AV.munkh,
    event_date: "2026-05-22T19:00:00Z", event_venue: "Brian Coyle Community Center",
    event_ticket_price: 0, event_organizer: "Twin Cities Mongolian Community",
    tags: ["movie", "film", "minneapolis", "free"], created_date: ago(70)
  },
  {
    id: "evt-7",
    title: "CDL Career Day — Job Fair for Mongolian Drivers",
    description: "Meet top Mongolian-owned trucking companies in one place. Free career counseling, CDL test prep info, job offers on the spot. CDL ажлын ярилцлагын өдөр.",
    category: "events", price: 0, price_type: "free",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800"],
    status: "active", is_featured: true, views: 1567, saves: 289,
    poster_name: "NomadTruck LLC", poster_avatar: AV.ganbold,
    event_date: "2026-05-31T09:00:00Z", event_venue: "Rosemont Convention Center, IL",
    event_ticket_price: 0, event_organizer: "Mongolian Trucking Association USA",
    tags: ["cdl", "career", "chicago", "jobs"], created_date: ago(50)
  },
  {
    id: "evt-8",
    title: "Mongolian Food Festival — New York",
    description: "First annual Mongolian Food Festival in NYC! 15+ food vendors, cooking demos, khorkhog, airag, and more. Нью Йоркийн монгол хоолны наадам!",
    category: "events", price: 10, price_type: "fixed",
    location_city: "New York", location_state: "NY",
    images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"],
    status: "active", views: 2100, saves: 412,
    poster_name: "NY Mongolian Community", poster_avatar: AV.narantsetseg,
    event_date: "2026-06-21T12:00:00Z", event_venue: "Flushing Meadows Corona Park, NY",
    event_ticket_price: 10, event_organizer: "NYC Mongolian Cultural Foundation",
    tags: ["food", "festival", "new york", "culture"], created_date: ago(40)
  },

  // ══════════════════ SERVICES ══════════════════
  {
    id: "svc-1",
    title: "Tax Preparation — Монгол хэлээр, Virginia/DC",
    description: "Certified CPA. Individual, self-employed, business tax returns. IRS enrolled agent. Монгол, орос, англи хэлээр. $150 from. Free 30-min consultation.",
    category: "services", price: 150, price_type: "fixed",
    location_city: "Virginia", location_state: "VA",
    images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800"],
    status: "active", is_featured: true, views: 890, saves: 145,
    poster_name: "Ганбаатар CPA", poster_avatar: AV.batbold,
    tags: ["tax", "cpa", "virginia", "mongolian"], created_date: ago(96)
  },
  {
    id: "svc-2",
    title: "Immigration Attorney — Visa, Green Card Help",
    description: "Steppe Law Group offers immigration legal services. Family petitions, work visas, green card, citizenship. Mongolian-speaking staff. Free first consultation.",
    category: "services", price: 300, price_type: "fixed",
    location_city: "Virginia", location_state: "VA",
    images: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800"],
    status: "active", is_featured: true, views: 1234, saves: 234,
    poster_name: "Steppe Law Group", poster_avatar: AV.batbold,
    tags: ["immigration", "lawyer", "visa", "virginia"], created_date: ago(80)
  },
  {
    id: "svc-3",
    title: "Mongolian Interpreter / Translator",
    description: "Certified Mongolian-English interpreter. Court, medical, business, legal appointments. Remote and in-person. All US states. Орчуулагч-тайлбарлагч.",
    category: "services", price: 75, price_type: "hourly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800"],
    status: "active", views: 567, saves: 89,
    poster_name: "Цэрэндулам О.", poster_avatar: AV.tsolmon,
    tags: ["interpreter", "translator", "mongolian", "chicago"], created_date: ago(64)
  },
  {
    id: "svc-4",
    title: "Babysitting / Nanny Service — Chicago Area",
    description: "Experienced Mongolian nanny. References available. CPR certified. Mongolian and English. $18–20/hr. Background check passed. Хүүхэд харах туршлагатай.",
    category: "services", price: 19, price_type: "hourly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1587400988673-1bc4afe38d58?w=800"],
    status: "active", views: 345, saves: 67,
    poster_name: "Батцэцэг М.", poster_avatar: AV.sarnai,
    tags: ["babysitter", "nanny", "chicago", "mongolian"], created_date: ago(72)
  },
  {
    id: "svc-5",
    title: "Car Wash & Detailing — Mobile Service Denver",
    description: "Full detail at your location. Interior/exterior. Steam clean, ceramic coating available. Book online. Denver/Aurora area. $80–200. Машины үйлчилгээ.",
    category: "services", price: 100, price_type: "fixed",
    location_city: "Denver", location_state: "CO",
    images: ["https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800"],
    status: "active", views: 212, saves: 35,
    poster_name: "Пүрэвжав Г.", poster_avatar: AV.davaasuren,
    tags: ["car wash", "detailing", "denver"], created_date: ago(55)
  },
  {
    id: "svc-6",
    title: "Moving Service — Local & Long Distance",
    description: "Mongolian-owned moving company. Professional packers, licensed & insured. Local moves $350+. Cross-country available. Дотоод болон хол нүүлгэн.",
    category: "services", price: 350, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    status: "active", views: 445, saves: 78,
    poster_name: "Nomad Movers LLC", poster_avatar: AV.bold,
    tags: ["moving", "movers", "chicago"], created_date: ago(44)
  },
  {
    id: "svc-7",
    title: "Truck Driving School — CDL Training",
    description: "CDL-A license in 4 weeks. Hands-on training. Job placement assistance after graduation. Монгол сургагч багш байна. $3,500 tuition.",
    category: "services", price: 3500, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800"],
    status: "active", is_featured: true, views: 789, saves: 167,
    poster_name: "Steppe CDL Academy", poster_avatar: AV.ganbold,
    tags: ["cdl", "training", "school", "chicago"], created_date: ago(88)
  },
  {
    id: "svc-8",
    title: "Mongolian Food Delivery — Chicago Homemade",
    description: "Order homemade Mongolian food: buuz, tsuivan, khorkhog. Delivery within 10 miles of Uptown Chicago. Min order $30. Гэрийн монгол хоол хүргэдэг.",
    category: "services", price: 30, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800"],
    status: "active", views: 678, saves: 112,
    poster_name: "Хонгор Б.", poster_avatar: AV.narantsetseg,
    tags: ["food", "delivery", "buuz", "chicago"], created_date: ago(30)
  },
  {
    id: "svc-9",
    title: "Airport Pickup & Drop — LAX, Mongolian Driver",
    description: "Reliable airport transportation in Los Angeles. Available 24/7. Flat rate from LAX to anywhere in LA. Монгол жолооч, аэропорт хүргэх.",
    category: "services", price: 65, price_type: "fixed",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800"],
    status: "active", views: 456, saves: 87,
    poster_name: "Сумъяа Д.", poster_avatar: AV.anand,
    tags: ["airport", "lax", "taxi", "la"], created_date: ago(20)
  },
  {
    id: "svc-10",
    title: "Hair & Beauty — Mongolian Salon Los Angeles",
    description: "Nomad Beauty specializes in Asian hair textures. Keratin treatment, highlights, cuts. Mongolian & English. Book by text. Гоо сайхны салон.",
    category: "services", price: 80, price_type: "fixed",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"],
    status: "active", views: 345, saves: 58,
    poster_name: "Nomad Beauty", poster_avatar: AV.zaya,
    tags: ["salon", "beauty", "hair", "la"], created_date: ago(48)
  },

  // ══════════════════ ELECTRONICS / MARKETPLACE ══════════════════
  {
    id: "mkt-1",
    title: "iPhone 15 Pro 256GB — 2 Months Old",
    description: "Natural Titanium. Barely used, in original box. No scratches. Face ID works perfectly. Шинэ шиг айфон зарна.",
    category: "electronics", price: 850, price_type: "fixed",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"],
    status: "active", views: 567, saves: 89,
    poster_name: "Тэмүүлэн Г.", poster_avatar: AV.munkh,
    tags: ["iphone", "apple", "phone", "la"], created_date: ago(14)
  },
  {
    id: "mkt-2",
    title: "MacBook Pro 14in M3 — Like New",
    description: "M3 Pro chip, 18GB RAM, 512GB SSD. Space Black. Only 3 months old. Selling because upgrading to M4. Зурагт компьютер зарна.",
    category: "electronics", price: 1600, price_type: "fixed",
    location_city: "San Francisco", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
    status: "active", views: 789, saves: 134,
    poster_name: "Очирбат Н.", poster_avatar: AV.altai,
    tags: ["macbook", "apple", "laptop", "sf"], created_date: ago(22)
  },
  {
    id: "mkt-3",
    title: "Traditional Mongolian Deel — New, Size M",
    description: "Hand-sewn silk deel from Mongolia. Deep blue with traditional embroidery. Never worn in US. Size M. Perfect for Tsagaan Sar. Монгол дэл шинэ байгаа.",
    category: "community", price: 180, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    status: "active", views: 234, saves: 45,
    poster_name: "Дулмаа Ц.", poster_avatar: AV.tsolmon,
    tags: ["deel", "mongolian", "clothing", "chicago"], created_date: ago(38)
  },
  {
    id: "mkt-4",
    title: "Samsung 65\" 4K Smart TV — $380",
    description: "2022 Samsung QLED 65 inch. Perfect picture. Remote included. Moving sale — must go! Телевиз зарна, яаралтай.",
    category: "electronics", price: 380, price_type: "fixed",
    location_city: "Seattle", location_state: "WA",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=800"],
    status: "active", views: 345, saves: 56,
    poster_name: "Батжаргал Д.", poster_avatar: AV.bold,
    tags: ["tv", "samsung", "electronics", "seattle"], created_date: ago(30)
  },
  {
    id: "mkt-5",
    title: "Baby Items Bundle — Stroller, Crib, More",
    description: "Selling all baby items. Uppababy stroller, IKEA crib with mattress, baby bouncer, clothes 0-6 months. All excellent condition. Хүүхдийн зүйл багцаар зарна.",
    category: "community", price: 320, price_type: "negotiable",
    location_city: "Virginia", location_state: "VA",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800"],
    status: "active", views: 189, saves: 34,
    poster_name: "Нарантуяа Ч.", poster_avatar: AV.nomin,
    tags: ["baby", "stroller", "kids", "virginia"], created_date: ago(44)
  },
  {
    id: "mkt-6",
    title: "Mongolian Grocery Items — Buuz, Tsuivan",
    description: "Selling homemade frozen buuz (50 pack) and tsuivan noodles. Made fresh weekly. Chicago pickup only. Гэрийн буузны цуглаа.",
    category: "community", price: 45, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800"],
    status: "active", views: 456, saves: 78,
    poster_name: "Хонгор Б.", poster_avatar: AV.narantsetseg,
    tags: ["food", "buuz", "homemade", "chicago"], created_date: ago(16)
  },
  {
    id: "mkt-7",
    title: "PlayStation 5 Bundle — $450",
    description: "PS5 disc edition with 2 controllers and 5 games. Everything works perfectly. Selling to pay rent lol. Сонирхсон хүн холбоо барина уу.",
    category: "electronics", price: 450, price_type: "fixed",
    location_city: "Minneapolis", location_state: "MN",
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800"],
    status: "active", views: 567, saves: 92,
    poster_name: "Сэрээнэнмэнд Д.", poster_avatar: AV.munkh,
    tags: ["ps5", "gaming", "minneapolis"], created_date: ago(26)
  },
  {
    id: "mkt-8",
    title: "Men's Winter Clothes — Large, Bundle",
    description: "Bundle of winter clothes: 3 jackets, 5 sweaters, 4 jeans. All size L. Good condition. $80 takes all. Өвлийн хувцас багцаар зарна.",
    category: "community", price: 80, price_type: "fixed",
    location_city: "New York", location_state: "NY",
    images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"],
    status: "active", views: 134, saves: 19,
    poster_name: "Ганзориг Т.", poster_avatar: AV.ganbold,
    tags: ["clothes", "men", "new york"], created_date: ago(50)
  },

  // ══════════════════ RIDE SHARE ══════════════════
  {
    id: "ride-1",
    title: "Chicago → Denver, May 25 — 2 Seats Available",
    description: "Leaving Chicago Sunday morning. 2 spots available. Sharing gas cost ($60/person). Leaving 7am from O'Hare area. Чикагоос Денвер явна, хамт явах хүн бий юу?",
    category: "community", price: 60, price_type: "fixed",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"],
    status: "active", views: 234, saves: 45,
    poster_name: "Мөнхбаяр О.", poster_avatar: AV.bold,
    tags: ["rideshare", "chicago", "denver", "road trip"], created_date: ago(2)
  },
  {
    id: "ride-2",
    title: "LA → San Francisco, Every Friday",
    description: "Weekly trip LA to SF every Friday evening. Space for 2 passengers. $40/person. Departure 5pm from Koreatown. LA-SF замаар тогтмол явна.",
    category: "community", price: 40, price_type: "fixed",
    location_city: "Los Angeles", location_state: "CA",
    images: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800"],
    status: "active", views: 189, saves: 34,
    poster_name: "Сумъяа Д.", poster_avatar: AV.anand,
    tags: ["rideshare", "la", "sf", "weekly"], created_date: ago(8)
  },
  {
    id: "ride-3",
    title: "Seattle → Portland, This Saturday",
    description: "One seat available. Leaving Saturday 9am from Seattle. $30 gas share. Non-smoker car, clean. Сэйтлаас Портланд явна.",
    category: "community", price: 30, price_type: "fixed",
    location_city: "Seattle", location_state: "WA",
    images: ["https://images.unsplash.com/photo-1507812984078-917a274065be?w=800"],
    status: "active", views: 145, saves: 23,
    poster_name: "Эрдэнэбаяр О.", poster_avatar: AV.anand,
    tags: ["rideshare", "seattle", "portland"], created_date: ago(5)
  },
  {
    id: "ride-4",
    title: "NYC → DC, Saturday Morning",
    description: "Going from New York to DC this Saturday. 2 seats. $35/person. Leaving 8am from Flushing Queens. Нью Йоркоос Вашингтон явна.",
    category: "community", price: 35, price_type: "fixed",
    location_city: "New York", location_state: "NY",
    images: ["https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800"],
    status: "active", views: 167, saves: 28,
    poster_name: "Батбаяр Н.", poster_avatar: AV.enkhjin,
    tags: ["rideshare", "new york", "dc"], created_date: ago(4)
  },
  {
    id: "ride-5",
    title: "Minneapolis → Chicago, Memorial Day Weekend",
    description: "Driving to Chicago for the CDL job fair May 31. Taking 2 passengers. $50/person gas share. Departure 6am from south Minneapolis.",
    category: "community", price: 50, price_type: "fixed",
    location_city: "Minneapolis", location_state: "MN",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"],
    status: "active", views: 223, saves: 41,
    poster_name: "Мөнх-Эрдэнэ Т.", poster_avatar: AV.davaasuren,
    tags: ["rideshare", "minneapolis", "chicago"], created_date: ago(6)
  },

  // ══════════════════ COMMUNITY / MISC ══════════════════
  {
    id: "com-1",
    title: "Looking for Mongolian Language Tutor — Kids",
    description: "Need a Mongolian language tutor for my 8-year-old son in Chicago. 2x per week. Must be patient and experienced with children. $25/hr. Хүүхэдтэй тэвчээртэй байх нь чухал.",
    category: "community", price: 25, price_type: "hourly",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800"],
    status: "active", views: 189, saves: 34,
    poster_name: "Дулмаа Ц.", poster_avatar: AV.tsolmon,
    tags: ["tutor", "mongolian", "kids", "chicago"], created_date: ago(24)
  },
  {
    id: "com-2",
    title: "Mongolian Grocery Store Items Wanted",
    description: "Anyone bringing groceries from Korea Town or Mongolian stores? Need: tsagaan toroom, tarag, mongolian candy, borts. Can pay or exchange. Монгол хүнсний бараа хэрэгтэй.",
    category: "community", price: null, price_type: "contact",
    location_city: "Denver", location_state: "CO",
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    status: "active", views: 123, saves: 21,
    poster_name: "Нямгэрэл Д.", poster_avatar: AV.altai,
    tags: ["grocery", "mongolian food", "denver"], created_date: ago(16)
  },
  {
    id: "com-3",
    title: "Need Help with English Documents — Dallas",
    description: "Looking for someone to help translate and fill out important English documents. Medical forms, lease agreement, bank forms. Dallas area. Монгол-англи орчуулга хэрэгтэй.",
    category: "community", price: null, price_type: "contact",
    location_city: "Dallas", location_state: "TX",
    images: ["https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800"],
    status: "active", views: 89, saves: 12,
    poster_name: "Ганцэцэг П.", poster_avatar: AV.zaya,
    tags: ["translation", "documents", "dallas"], created_date: ago(10)
  },
  {
    id: "com-4",
    title: "Mongolian Cooking Class — Chicago, Free",
    description: "Teaching buuz, tsuivan, and khorkhog to anyone interested! My apartment, small group max 8 people. Free! Just bring good energy. Монгол хоол заана, үнэгүй.",
    category: "community", price: 0, price_type: "free",
    location_city: "Chicago", location_state: "IL",
    images: ["https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800"],
    status: "active", views: 567, saves: 112,
    poster_name: "Цэрэнпунцаг Э.", poster_avatar: AV.sarnai,
    tags: ["cooking", "buuz", "class", "chicago"], created_date: ago(32)
  },
  {
    id: "com-5",
    title: "Mongolian Soccer Team Forming — Seattle",
    description: "Starting a Mongolian soccer team in Seattle for casual weekend play. Looking for players of all skill levels. Family welcome. Сиэтлд монгол хөлбөмбөгийн баг байгуулна.",
    category: "community", price: 0, price_type: "free",
    location_city: "Seattle", location_state: "WA",
    images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"],
    status: "active", views: 345, saves: 67,
    poster_name: "Болормаа Д.", poster_avatar: AV.munkh,
    tags: ["soccer", "sports", "seattle", "team"], created_date: ago(40)
  },
  {
    id: "com-6",
    title: "Free Mongolian Prayer Beads — Buddhist",
    description: "Giving away 5 sets of Mongolian Buddhist prayer beads. Free to good home. Pick up only in Arlington VA. Буддын тахилын ном судар ч бий.",
    category: "community", price: 0, price_type: "free",
    location_city: "Arlington", location_state: "VA",
    images: ["https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800"],
    status: "active", views: 78, saves: 14,
    poster_name: "Энхтуяа Б.", poster_avatar: AV.sarnai,
    tags: ["buddhist", "free", "arlington"], created_date: ago(52)
  },
];

// ─── GROUPS ──────────────────────────────────────────────────────────────────
export const MOCK_GROUPS = [
  {
    id: "grp-1",
    name: "Chicago Mongolians",
    description: "Largest Mongolian community group in Chicago. Share news, events, jobs, and connect with fellow community members. Чикагогийн Монголчуудын бүлэг.",
    cover_image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
    avatar: "🏙️", category: "community", city: "Chicago",
    member_count: 3847, is_verified: true, privacy: "public"
  },
  {
    id: "grp-2",
    name: "CDL Drivers USA — Монгол",
    description: "For Mongolian CDL and owner-operator truck drivers across the US. Share routes, company reviews, tips, and job leads. CDL жолооч, эзэн операторуудад.",
    cover_image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
    avatar: "🚛", category: "professional",
    member_count: 2341, is_verified: true, privacy: "public"
  },
  {
    id: "grp-3",
    name: "Seattle Mongolian Community",
    description: "Connecting Mongolians in the Seattle/Tacoma/Bellevue area. Monthly BBQs, sports, jobs, and community support. Сиатлын монголчуудын нийгэмлэг.",
    cover_image: "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800",
    avatar: "🌲", category: "community", city: "Seattle",
    member_count: 1234, is_verified: true, privacy: "public"
  },
  {
    id: "grp-4",
    name: "Mongolian Students USA",
    description: "Support network for Mongolian students in American universities. Scholarships, housing, campus life, and networking. Монгол оюутнуудын холбоо.",
    cover_image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800",
    avatar: "🎓", category: "education",
    member_count: 1867, is_verified: true, privacy: "public"
  },
  {
    id: "grp-5",
    name: "Mongolian Entrepreneurs USA",
    description: "Network of Mongolian business owners, founders, and aspiring entrepreneurs across the US. Share resources, find partners, grow together. Бизнес эрхлэгчдийн бүлэг.",
    cover_image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800",
    avatar: "💼", category: "business",
    member_count: 892, is_verified: true, privacy: "public"
  },
  {
    id: "grp-6",
    name: "Denver Mongolian Association",
    description: "Official Denver-area Mongolian community org. Naadam festival, cultural events, newcomer support. Денвэрийн монголчуудын нийгэмлэг.",
    cover_image: "https://images.unsplash.com/photo-1581262208435-41726149a759?w=800",
    avatar: "🏔️", category: "community", city: "Denver",
    member_count: 678, is_verified: true, privacy: "public"
  },
  {
    id: "grp-7",
    name: "Mongolian Moms USA — Mothers Group",
    description: "Support group for Mongolian mothers in the USA. Parenting tips, playdate coordination, school advice, and friendship. Монгол ээжүүдийн бүлэг.",
    cover_image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800",
    avatar: "👩‍👧", category: "social",
    member_count: 1123, is_verified: false, privacy: "public"
  },
  {
    id: "grp-8",
    name: "NY/NJ Mongolians",
    description: "New York and New Jersey Mongolian community. Events, jobs, housing, and meetups in the tri-state area. Нью Йоркийн монголчууд.",
    cover_image: "https://images.unsplash.com/photo-1485871800521-4c4c2ac6b2f6?w=800",
    avatar: "🗽", category: "community", city: "New York",
    member_count: 1456, is_verified: true, privacy: "public"
  },
  {
    id: "grp-9",
    name: "Mongolian Sports League USA",
    description: "Organizing soccer, basketball, wrestling, and volleyball leagues for Mongolian communities across the US. Монгол спортын холбоо.",
    cover_image: "https://images.unsplash.com/photo-1546519638405-a2ffca98ee59?w=800",
    avatar: "⚽", category: "sports",
    member_count: 567, is_verified: false, privacy: "public"
  },
  {
    id: "grp-10",
    name: "Mongolian Health & Wellness USA",
    description: "Connect with Mongolian healthcare providers, share health resources, find Mongolian-speaking doctors and clinics across the US. Эрүүл мэндийн бүлэг.",
    cover_image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    avatar: "🏥", category: "community",
    member_count: 434, is_verified: false, privacy: "public"
  },
  {
    id: "grp-11",
    name: "LA Mongolians — Los Angeles",
    description: "Mongolian community in the greater Los Angeles area. Food, events, jobs, and resources for SoCal Mongolians. Лос Анжелесийн монголчууд.",
    cover_image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800",
    avatar: "🌴", category: "community", city: "Los Angeles",
    member_count: 987, is_verified: true, privacy: "public"
  },
  {
    id: "grp-12",
    name: "Trucking Life — Owner Operators",
    description: "For Mongolian owner-operators running their own authority. Share load board tips, lane advice, fuel stops, and business insights. Эзэн операторуудын бүлэг.",
    cover_image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    avatar: "🚚", category: "professional",
    member_count: 734, is_verified: true, privacy: "public"
  },
];

// ─── BUSINESSES ──────────────────────────────────────────────────────────────
export const MOCK_BUSINESSES = [
  {
    id: "biz-1",
    name: "Khaan's Kitchen — Chicago",
    description: "Authentic Mongolian restaurant in Chicago's North Side. Famous for buuz, khuushuur, tsuivan, and khorkhog. Catering available. Жинхэнэ монгол хоол.",
    category: "restaurant",
    logo: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200",
    banner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    gallery: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"
    ],
    city: "Chicago", state: "IL", address: "4521 N Broadway, Chicago IL",
    phone: "(312) 555-8888", email: "info@khaansKitchen.com",
    hours: "Mon-Sat 11am–10pm, Sun 12pm–8pm",
    rating: 4.8, review_count: 312, is_verified: true, is_premium: true,
    owner_name: "Болд Д.", tags: ["mongolian", "restaurant", "buuz", "catering"]
  },
  {
    id: "biz-2",
    name: "NomadTruck LLC",
    description: "Mongolian-owned trucking company based in Chicago. OTR, regional, flatbed, and reefer loads. Always hiring CDL-A drivers. Great home time and pay.",
    category: "trucking",
    logo: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200",
    banner: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    city: "Chicago", state: "IL", address: "2230 W Armitage Ave, Chicago IL",
    phone: "(773) 555-5678", email: "dispatch@nomadtruck.com",
    hours: "Mon-Fri 8am–6pm, 24/7 dispatch",
    rating: 4.5, review_count: 156, is_verified: true, is_premium: true,
    owner_name: "Ганбаатар Ж.", tags: ["trucking", "cdl", "jobs", "otr"]
  },
  {
    id: "biz-3",
    name: "SteppeHaul Inc",
    description: "Owner operator focused freight brokerage. Specializing in flatbed and oversized loads. Mongolian dispatchers available 24/7. Top pay, fuel advances.",
    category: "trucking",
    logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200",
    banner: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
    city: "Chicago", state: "IL",
    phone: "(773) 555-9999",
    hours: "24/7 dispatch",
    rating: 4.2, review_count: 89, is_verified: true, is_premium: false,
    owner_name: "Батболд Т.", tags: ["owner operator", "flatbed", "dispatch"]
  },
  {
    id: "biz-4",
    name: "Ганбаатар CPA Services",
    description: "Full-service accounting, tax, and bookkeeping. Mongolian and English speaking CPA. Individual, self-employed, LLC, corporations. IRS enrolled agent.",
    category: "tax",
    logo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200",
    banner: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    city: "Virginia", state: "VA", address: "1850 Centennial Park Dr, Reston VA",
    phone: "(703) 555-7890",
    hours: "Mon-Fri 9am–5pm, Sat by appt",
    rating: 4.9, review_count: 245, is_verified: true, is_premium: true,
    owner_name: "Ганбаатар Ц.", tags: ["tax", "cpa", "accounting", "mongolian"]
  },
  {
    id: "biz-5",
    name: "Steppe Law Group",
    description: "Full-service immigration law firm. Family visas, green cards, work authorization, citizenship. Mongolian-speaking attorneys. Free consultations.",
    category: "legal",
    logo: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200",
    banner: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    city: "Virginia", state: "VA",
    phone: "(703) 555-2222",
    hours: "Mon-Fri 9am–6pm",
    rating: 4.7, review_count: 178, is_verified: true, is_premium: true,
    owner_name: "Батсайхан Б.", tags: ["immigration", "lawyer", "visa", "legal"]
  },
  {
    id: "biz-6",
    name: "Nomad Beauty Salon",
    description: "Premium beauty salon specializing in Asian hair care. Keratin treatments, color, cuts, and lash extensions. Mongolian owned and operated in LA.",
    category: "salon",
    logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
    banner: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800",
    city: "Los Angeles", state: "CA",
    phone: "(213) 555-4567",
    hours: "Tue-Sun 10am–7pm",
    rating: 4.6, review_count: 134, is_verified: true, is_premium: true,
    owner_name: "Нарантуяа Б.", tags: ["salon", "beauty", "hair", "la"]
  },
  {
    id: "biz-7",
    name: "UB Grill — Seattle",
    description: "Mongolian BBQ and hot pot restaurant in Seattle's South End. All-you-can-eat option. Family friendly. Group reservations welcome. Улаанбаатар мэт орчин.",
    category: "restaurant",
    logo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200",
    banner: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    city: "Seattle", state: "WA",
    phone: "(206) 555-3333",
    hours: "Wed-Mon 12pm–9pm",
    rating: 4.4, review_count: 98, is_verified: true, is_premium: false,
    owner_name: "Мөнхцэцэг Д.", tags: ["mongolian", "bbq", "hot pot", "seattle"]
  },
  {
    id: "biz-8",
    name: "Steppe Café San Francisco",
    description: "Cozy Mongolian-owned coffee shop with Mongolian pastries, teas, and specialty drinks. Perfect for remote work. Sain baina uu! Come hang out.",
    category: "restaurant",
    logo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200",
    banner: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800",
    city: "San Francisco", state: "CA",
    phone: "(415) 555-7777",
    hours: "Mon-Fri 7am–6pm, Sat 8am–4pm",
    rating: 4.7, review_count: 167, is_verified: true, is_premium: false,
    owner_name: "Сарнай Э.", tags: ["cafe", "coffee", "mongolian", "sf"]
  },
  {
    id: "biz-9",
    name: "Nomad Movers LLC — Chicago",
    description: "Full-service moving company. Local, long-distance, packing and storage. Mongolian-speaking crew. Licensed & insured. Quick quotes via call or text.",
    category: "other",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    banner: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800",
    city: "Chicago", state: "IL",
    phone: "(312) 555-6666",
    hours: "Mon-Sat 7am–8pm",
    rating: 4.3, review_count: 78, is_verified: true, is_premium: false,
    owner_name: "Болд Д.", tags: ["movers", "moving", "chicago"]
  },
  {
    id: "biz-10",
    name: "Steppe CDL Academy",
    description: "CDL-A training school with Mongolian-speaking instructors. 4-week program. Job placement assistance. PTDI certified. Graduates work nationwide.",
    category: "education",
    logo: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200",
    banner: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    city: "Chicago", state: "IL",
    phone: "(773) 555-4444",
    hours: "Mon-Fri 8am–5pm",
    rating: 4.6, review_count: 201, is_verified: true, is_premium: true,
    owner_name: "Ганбаатар Ж.", tags: ["cdl", "school", "training", "chicago"]
  },
  {
    id: "biz-11",
    name: "EagleFreight NY",
    description: "New York-based trucking company. Hiring CDL drivers and dispatchers. Mongolian ownership. Dry van and flatbed lanes available. Good home time.",
    category: "trucking",
    logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
    banner: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
    city: "New York", state: "NY",
    phone: "(718) 555-1111",
    hours: "Mon-Fri 8am–6pm",
    rating: 4.1, review_count: 67, is_verified: true, is_premium: false,
    owner_name: "Ганзориг Б.", tags: ["trucking", "cdl", "new york"]
  },
  {
    id: "biz-12",
    name: "Blue Sky Grocery — Mongolian Products",
    description: "Online and local pickup of Mongolian groceries: aarts, borts, mongolian candy, airag, traditional tea, and more. Ships nationwide from Chicago.",
    category: "retail",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200",
    banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    city: "Chicago", state: "IL",
    phone: "(312) 555-0001",
    hours: "Mon-Sat 10am–7pm",
    rating: 4.8, review_count: 189, is_verified: true, is_premium: true,
    owner_name: "Цэрэнпунцаг Э.", tags: ["grocery", "mongolian food", "chicago", "online"]
  },
];

// ─── DISCUSSIONS / COMMUNITY POSTS ───────────────────────────────────────────
export const MOCK_DISCUSSIONS = [
  {
    id: "disc-1",
    author_name: "Мөнхбаяр О.",
    author_avatar: AV.bold,
    content: "Маргааш 7 цагт Чикагоос Денвер явах хүн байна уу? Хойр хүн, тэшүүр байна. Бензиний мөнгийг хуваана. DM илгээгээрэй 🙏",
    city: "Chicago", tag: "Ride Share", tone: "urgent",
    reply_count: 5, views: 124, likes: 9,
    created_date: ago(0.6),
    top_reply: { name: "Батхүү Д.", avatar: AV.enkhjin, text: "Бид хойр явна! DM илгээгээрэй." }
  },
  {
    id: "disc-2",
    author_name: "Түмэнбаяр Ц.",
    author_avatar: AV.munkh,
    content: "Сая Чикаго ирсэн, танилцах монгол найз хайж байна. Мэдэрч байна уу? Цай ууж санаа нийлэх хүн бий юу? 😊",
    city: "Chicago", tag: "New Here", tone: "lonely",
    reply_count: 12, views: 234, likes: 22,
    created_date: ago(1.5),
    top_reply: { name: "Дашдъямба О.", avatar: AV.oyunaa, text: "Бид ч Pilsen дуурт байгаа. DM хийгээрэй, цай ууцгаая!" }
  },
  {
    id: "disc-3",
    author_name: "Ариунаа С.",
    author_avatar: AV.sarnai,
    content: "Арлингтоны ойролцоо өрөөний нөхөр хайж байна. Эмэгтэй, ажилтай, тамхи татдаггүй, тэжээвэр амьтангүй. $750/mo хүртэл. Хэн саналтай бол?",
    city: "Arlington", tag: "Roommate", tone: "practical",
    reply_count: 14, views: 312, likes: 27,
    created_date: ago(2.5),
    top_reply: { name: "Номин Г.", avatar: AV.nomin, text: "Манайд нэг өрөө гарна Мэй сүүлд. DM хийгээрэй!" }
  },
  {
    id: "disc-4",
    author_name: "Ганзориг Б.",
    author_avatar: AV.ganbold,
    content: "Чикагод хамгийн амттай монгол хоол заадаг газар аль вэ? Монголоос айлчлагч найз ирж байгаа, сайхан ресторан захиалах гэж байна 🥩",
    city: "Chicago", tag: "Food", tone: "active",
    reply_count: 24, views: 489, likes: 41,
    created_date: ago(5),
    top_reply: { name: "Khaan's Kitchen", avatar: AV.sarnai, text: "Манай ресторан буузаараа алдартай! (312) 555-8888 — ширээ захиалаарай." }
  },
  {
    id: "disc-5",
    author_name: "Пүрэвсүрэн Д.",
    author_avatar: AV.enkhjin,
    content: "Монголоос хүн ирэх гэж байна — JFK дамжна. Нислэгийн хооронд 6 цаг байна. Хотоор аялж болох уу? Зааж өгч чадах хүн бий юу?",
    city: "New York", tag: "Help", tone: "lonely",
    reply_count: 3, views: 89, likes: 5,
    created_date: ago(7),
    top_reply: { name: "Батбаяр Н.", avatar: AV.enkhjin, text: "Фlushing Queens дээр Монгол ресторан олон байдаг, 1 цаг болно." }
  },
  {
    id: "disc-6",
    author_name: "Оюунцэцэг Л.",
    author_avatar: AV.nomin,
    content: "CDL авах сургалтанд хамрагдсан хүн байна уу? Ямар сургуульд орсон, ямар компанид эхлэх нь дээр вэ? Туршлагаасаа хуваалцаарай 🙏",
    city: "Chicago", tag: "CDL", tone: "active",
    reply_count: 31, views: 678, likes: 54,
    created_date: ago(11),
    top_reply: { name: "NomadTruck LLC", avatar: AV.ganbold, text: "Steppe CDL Academy-д орж үзэгтэй, Монгол сургагч байна! (773) 555-4444" }
  },
  {
    id: "disc-7",
    author_name: "Мөнхтуяа В.",
    author_avatar: AV.tsolmon,
    content: "Сиэтлд энэ долоо хоногт сонирхолтой арга хэмжээ болж байна уу? 🌲 Гэр бүлтэйгээ явах боломжтой ямар нэг зүйл байна уу?",
    city: "Seattle", tag: "Events", tone: "quiet",
    reply_count: 7, views: 167, likes: 14,
    created_date: ago(16),
    top_reply: { name: "Seattle Mongolian Community", avatar: AV.munkh, text: "Нямдугаар Woodland Park-т BBQ болно, бүх гэр бүл тавтай морилно уу!" }
  },
  {
    id: "disc-8",
    author_name: "Батболд Т.",
    author_avatar: AV.batbold,
    content: "LA-д монгол хэлтэй эмч эсвэл эмнэлэг байдаг уу? Даатгалгүй байж болно. Монголоор ярьж болдог хүн хэрэгтэй байна.",
    city: "Los Angeles", tag: "Ask", tone: "lonely",
    reply_count: 8, views: 156, likes: 11,
    created_date: ago(22),
    top_reply: { name: "Mongolian Health Group", avatar: AV.zaya, text: "Манай бүлэгт монгол эмч байдаг, нэгдэгтэй! Link in bio." }
  },
  {
    id: "disc-9",
    author_name: "Дашдъямба О.",
    author_avatar: AV.oyunaa,
    content: "Owner operator болохыг хүсч байна. Truck авах зээл яаж авах вэ? Ямар банк зээл өгдөг вэ? Туршлагатай хүн туслаарай 🚛",
    city: "Chicago", tag: "CDL", tone: "active",
    reply_count: 19, views: 445, likes: 38,
    created_date: ago(30),
    top_reply: { name: "SteppeHaul Inc", avatar: AV.batbold, text: "Бид шинэ OO-д зориулсан financing сонголт байдаг. DM хийгээрэй!" }
  },
  {
    id: "disc-10",
    author_name: "Нарантуяа Ч.",
    author_avatar: AV.narantsetseg,
    content: "Далласт монгол гэр бүлийн нийгэмлэг байдаг уу? Сая нүүж ирсэн, танилцах монгол хүн хайж байна. Хүүхэдтэй, аюулгүй байрлал хэрэгтэй.",
    city: "Dallas", tag: "New Here", tone: "lonely",
    reply_count: 11, views: 234, likes: 19,
    created_date: ago(36),
    top_reply: { name: "Ганцэцэг П.", avatar: AV.zaya, text: "Бид North Dallas-т байдаг! Манай бүлэгт нэгдэгтэй, монгол гэр бүл олон байна." }
  },
  {
    id: "disc-11",
    author_name: "Эрдэнэтуяа Г.",
    author_avatar: AV.altai,
    content: "Миннеаполист монгол хоол хийж зардаг хүн байна уу? Замундаа буузны захиалга хийхийг хүсч байна. 50+ захиалах боломжтой.",
    city: "Minneapolis", tag: "Food", tone: "active",
    reply_count: 6, views: 123, likes: 10,
    created_date: ago(48),
    top_reply: { name: "Болормаа Д.", avatar: AV.tsolmon, text: "Би долоо хоногт нэг удаа буузны захиалга авдаг! DM хийгээрэй." }
  },
  {
    id: "disc-12",
    author_name: "Сэрээнэнмэнд Д.",
    author_avatar: AV.davaasuren,
    content: "Энэ орны нийгмийн даатгалын (Social Security) тухай ойлгосон хүн бий юу? Хэдэн жил ажилласнаас тэтгэвэр авдаг вэ? Монголоос ирсэн хүнд хэрхэн тооцдог вэ?",
    city: "Chicago", tag: "Ask", tone: "helpful",
    reply_count: 15, views: 334, likes: 29,
    created_date: ago(60),
    top_reply: { name: "Ганбаатар CPA", avatar: AV.batbold, text: "Татварын зөвлөгөө чөлөөтэй өгнө, холбоо бариарай: (703) 555-7890" }
  },
];

// ─── CATEGORIES / ICONS ───────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: "jobs",        label: "Jobs",        labelMn: "Ажил",           icon: "Briefcase" },
  { id: "housing",     label: "Housing",     labelMn: "Байр",           icon: "Home" },
  { id: "events",      label: "Events",      labelMn: "Арга хэмжээ",   icon: "Calendar" },
  { id: "cars",        label: "Cars",        labelMn: "Машин",          icon: "Car" },
  { id: "services",    label: "Services",    labelMn: "Үйлчилгээ",     icon: "Wrench" },
  { id: "electronics", label: "Electronics", labelMn: "Электроник",    icon: "Smartphone" },
  { id: "community",   label: "Community",   labelMn: "Нийгэмлэг",    icon: "Users" }
];

export const ICONS = {
  Car: "🚗", Briefcase: "💼", Home: "🏠",
  Wrench: "🔧", Calendar: "📅", Smartphone: "📱", Users: "👥"
};

export const TRENDING_SEARCHES = [
  "CDL ажил Chicago", "furnished apartment near me", "монгол ресторан",
  "owner operator truck", "машин зарна", "room for rent LA", "buuz delivery",
  "immigration lawyer", "tax preparation монгол", "babysitter mongolian",
  "tsagaan sar event", "denver mongolian community"
];

export const CITIES = [
  { name: "Chicago",       state: "IL", count: 1847 },
  { name: "Los Angeles",   state: "CA", count: 1234 },
  { name: "Seattle",       state: "WA", count: 890 },
  { name: "New York",      state: "NY", count: 756 },
  { name: "Virginia",      state: "VA", count: 534 },
  { name: "Denver",        state: "CO", count: 423 },
  { name: "Dallas",        state: "TX", count: 312 },
  { name: "Minneapolis",   state: "MN", count: 289 },
  { name: "San Francisco", state: "CA", count: 245 },
  { name: "Arlington",     state: "VA", count: 198 },
];