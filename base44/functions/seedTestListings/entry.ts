import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const cities = ['Ulaanbaatar', 'Chicago', 'New York', 'Los Angeles', 'Denver', 'Seattle', 'Austin', 'Boston'];
    const states = ['MN', 'CO', 'NY', 'CA', 'WA', 'TX', 'MA', 'IL'];

    const firstNames = ['Alex', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Taylor', 'Quinn', 'Drew', 'Emma', 'Olivia', 'Michael', 'James', 'Sarah', 'Maria', 'David', 'John'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Lee', 'Chen', 'Kim', 'Kumar', 'Patel'];

    const carListings = [
      { make: 'Toyota', model: 'Camry', year: 2019, mileage: 45000, condition: 'excellent', fuel: 'gasoline', transmission: 'automatic', price: 18500, title: '2019 Toyota Camry - Low Mileage, Well Maintained' },
      { make: 'Honda', model: 'Civic', year: 2020, mileage: 32000, condition: 'excellent', fuel: 'gasoline', transmission: 'automatic', price: 21000, title: '2020 Honda Civic Sport - Recent Oil Change' },
      { make: 'Ford', model: 'F-150', year: 2018, mileage: 62000, condition: 'good', fuel: 'gasoline', transmission: 'automatic', price: 24500, title: '2018 Ford F-150 XLT - Towing Package' },
      { make: 'Tesla', model: 'Model 3', year: 2021, mileage: 28000, condition: 'excellent', fuel: 'electric', transmission: 'automatic', price: 42000, title: '2021 Tesla Model 3 - Autopilot Included' },
      { make: 'BMW', model: 'X5', year: 2019, mileage: 55000, condition: 'good', fuel: 'gasoline', transmission: 'automatic', price: 38000, title: '2019 BMW X5 - Full Service History' },
    ];

    const jobListings = [
      { title: 'Senior Web Developer - Remote', company: 'TechStart LLC', salary_min: 85000, salary_max: 120000, type: 'full-time', description: 'Looking for experienced React/Node developers. Must have 5+ years experience.' },
      { title: 'Marketing Manager', company: 'Digital Media Co', salary_min: 65000, salary_max: 85000, type: 'full-time', description: 'Lead marketing campaigns and manage social media presence.' },
      { title: 'Freelance Graphic Designer', company: 'Self-Employed', salary_min: 40, salary_max: 80, type: 'contract', description: 'Logo design, branding, and social media graphics.' },
      { title: 'Data Analyst', company: 'Analytics Corp', salary_min: 70000, salary_max: 95000, type: 'full-time', description: 'Analyze large datasets and create visualizations.' },
      { title: 'Customer Service Rep', company: 'Support Plus', salary_min: 30000, salary_max: 40000, type: 'full-time', description: 'Help customers via phone and email. Flexible hours available.' },
    ];

    const housingListings = [
      { title: 'Modern 2BR Apartment Downtown', bedrooms: 2, bathrooms: 1, furnished: true, lease: '12 months', type: 'apartment', price: 1800, description: 'Recently renovated with in-unit laundry' },
      { title: '3BR House with Yard', bedrooms: 3, bathrooms: 2, furnished: false, lease: 'flexible', type: 'house', price: 2200, description: 'Great neighborhood, close to schools' },
      { title: 'Studio Apartment - Cozy & Affordable', bedrooms: 0, bathrooms: 1, furnished: true, lease: '6 months', type: 'studio', price: 950, description: 'Perfect for professionals' },
      { title: 'Room in Shared House', bedrooms: 1, bathrooms: 1, furnished: true, lease: '3 months', type: 'room', price: 750, description: 'Utilities included, no lease required' },
      { title: 'Luxury Condo - Full Amenities', bedrooms: 2, bathrooms: 2, furnished: true, lease: '12 months', type: 'condo', price: 3200, description: 'Gym, pool, 24/7 security' },
    ];

    const serviceListings = [
      { title: 'Professional House Cleaning', price: 150, price_type: 'fixed', description: 'Reliable and thorough cleaning service. 10 years experience.' },
      { title: 'Personal Training Sessions', price: 60, price_type: 'hourly', description: 'Certified trainer. Specializing in fitness and weight loss.' },
      { title: 'Web Design & Development', price: 75, price_type: 'hourly', description: 'Custom websites, e-commerce, SEO optimization.' },
      { title: 'Tutoring - Math & Science', price: 45, price_type: 'hourly', description: 'High school and college level. Exam prep available.' },
      { title: 'Photography - Events & Portraits', price: 500, price_type: 'fixed', description: 'Professional photographer. 2000+ happy clients.' },
    ];

    const eventListings = [
      { title: 'Community BBQ & Potluck', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Central Park', price: 0, description: 'Free community gathering. Bring a dish to share!' },
      { title: 'Yoga Class - Beginner Level', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Wellness Studio', price: 15, description: 'Join us for a relaxing yoga session.' },
      { title: 'Networking Mixer - Tech Industry', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Downtown Loft', price: 25, description: 'Meet local tech professionals.' },
      { title: 'Live Music Night - Jazz Band', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), venue: 'The Blue Room', price: 20, description: 'Local jazz band performing live.' },
      { title: 'Farmers Market - Weekly', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Main Street', price: 0, description: 'Fresh produce, crafts, and local goods.' },
    ];

    const images = [
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300',
      'https://images.unsplash.com/photo-1523492212066-e68d2f01d6a1?w=400&h=300',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300',
      'https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=400&h=300',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300',
      'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300',
    ];

    function getRandomItem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomCity() {
      const idx = cities.indexOf(getRandomItem(cities));
      return { city: cities[idx], state: states[idx] };
    }

    const listingsToCreate = [];

    // Add 20 car listings
    for (let i = 0; i < 20; i++) {
      const car = getRandomItem(carListings);
      const { city, state } = getRandomCity();
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const isFeatured = Math.random() > 0.8;

      listingsToCreate.push({
        title: car.title,
        category: 'cars',
        description: `${car.year} ${car.make} ${car.model} in ${car.condition} condition. ${car.mileage.toLocaleString()} miles. ${car.transmission} transmission.`,
        price: car.price,
        price_type: 'fixed',
        location_city: city,
        location_state: state,
        images: [getRandomItem(images)],
        status: 'active',
        is_featured: isFeatured,
        is_boosted: isFeatured && Math.random() > 0.5,
        poster_name: `${firstName} ${lastName}`,
        poster_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        contact_phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        contact_email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@example.com`,
        car_make: car.make,
        car_model: car.model,
        car_year: car.year,
        car_mileage: car.mileage,
        car_transmission: car.transmission,
        car_fuel: car.fuel,
        car_condition: car.condition,
        views: Math.floor(Math.random() * 500),
        saves: Math.floor(Math.random() * 100),
      });
    }

    // Add 20 job listings
    for (let i = 0; i < 20; i++) {
      const job = getRandomItem(jobListings);
      const { city, state } = getRandomCity();
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const isFeatured = Math.random() > 0.85;

      listingsToCreate.push({
        title: job.title,
        category: 'jobs',
        description: job.description,
        price: Math.random() > 0.5 ? job.salary_min : 0,
        price_type: Math.random() > 0.5 ? 'fixed' : 'contact',
        location_city: city,
        location_state: state,
        images: [getRandomItem(images)],
        status: 'active',
        is_featured: isFeatured,
        is_boosted: isFeatured && Math.random() > 0.5,
        poster_name: job.company,
        poster_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.company}`,
        contact_phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        contact_email: `${job.company.toLowerCase().replace(/\s/g, '')}@example.com`,
        job_company: job.company,
        job_salary_min: job.salary_min,
        job_salary_max: job.salary_max,
        job_type: job.type,
        job_schedule: 'Full-time or flexible',
        views: Math.floor(Math.random() * 800),
        saves: Math.floor(Math.random() * 150),
      });
    }

    // Add 20 housing listings
    for (let i = 0; i < 20; i++) {
      const housing = getRandomItem(housingListings);
      const { city, state } = getRandomCity();
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const isFeatured = Math.random() > 0.8;

      listingsToCreate.push({
        title: housing.title,
        category: 'housing',
        description: housing.description,
        price: housing.price,
        price_type: 'monthly',
        location_city: city,
        location_state: state,
        images: [getRandomItem(images)],
        status: 'active',
        is_featured: isFeatured,
        is_boosted: isFeatured && Math.random() > 0.5,
        poster_name: `${firstName} ${lastName}`,
        poster_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        contact_phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        contact_email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@example.com`,
        housing_bedrooms: housing.bedrooms,
        housing_bathrooms: housing.bathrooms,
        housing_furnished: housing.furnished,
        housing_lease: housing.lease,
        housing_type: housing.type,
        views: Math.floor(Math.random() * 600),
        saves: Math.floor(Math.random() * 120),
      });
    }

    // Add 20 service listings
    for (let i = 0; i < 20; i++) {
      const service = getRandomItem(serviceListings);
      const { city, state } = getRandomCity();
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const isFeatured = Math.random() > 0.85;

      listingsToCreate.push({
        title: service.title,
        category: 'services',
        description: service.description,
        price: service.price,
        price_type: service.price_type,
        location_city: city,
        location_state: state,
        images: [getRandomItem(images)],
        status: 'active',
        is_featured: isFeatured,
        is_boosted: isFeatured && Math.random() > 0.5,
        poster_name: `${firstName} ${lastName}`,
        poster_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        contact_phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        contact_email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@example.com`,
        views: Math.floor(Math.random() * 400),
        saves: Math.floor(Math.random() * 80),
      });
    }

    // Add 20 event listings
    for (let i = 0; i < 20; i++) {
      const event = getRandomItem(eventListings);
      const { city, state } = getRandomCity();
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const isFeatured = Math.random() > 0.8;

      listingsToCreate.push({
        title: event.title,
        category: 'events',
        description: event.description,
        price: event.price,
        price_type: event.price === 0 ? 'free' : 'fixed',
        location_city: city,
        location_state: state,
        images: [getRandomItem(images)],
        status: 'active',
        is_featured: isFeatured,
        is_boosted: isFeatured && Math.random() > 0.5,
        poster_name: `${firstName} ${lastName}`,
        poster_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        contact_phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        contact_email: `${firstName.toLowerCase()}${lastName.toLowerCase()}@example.com`,
        event_date: event.date,
        event_venue: event.venue,
        event_ticket_price: event.price,
        views: Math.floor(Math.random() * 700),
        saves: Math.floor(Math.random() * 140),
      });
    }

    const result = await base44.entities.Listing.bulkCreate(listingsToCreate);

    return Response.json({
      success: true,
      listings_created: result.length || 100,
      featured_count: listingsToCreate.filter(l => l.is_featured).length,
      boosted_count: listingsToCreate.filter(l => l.is_boosted).length,
      message: `Created ${result.length || 100} test listings including featured & boosted VIP listings`,
    });
  } catch (error) {
    console.error('Error seeding listings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});