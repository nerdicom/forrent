export const cities = {
  Bozeman: { state: 'MT', center: [45.679, -111.042], subtitle: 'Mountain air. Room to make it yours.' },
  Denver: { state: 'CO', center: [39.748, -104.995], subtitle: 'City energy, with the mountains close by.' },
  Austin: { state: 'TX', center: [30.268, -97.748], subtitle: 'Find your own corner of a creative city.' },
  Seattle: { state: 'WA', center: [47.614, -122.33], subtitle: 'A little more green. A place to settle in.' }
};
const base = [
  { name: 'The Juniper', area: 'Downtown', rent: 1875, fees: 85, beds: 2, baths: 2, sqft: 1040, photo: 1, tags: ['Pet friendly', 'In-unit laundry', 'Parking', 'Balcony'], description: 'A bright, open living space with room for slow mornings and friends around the table. A private balcony brings a little of the outdoors home.', offset: [0.005, -0.006] },
  { name: 'Northline Lofts', area: 'Northside', rent: 1650, fees: 65, beds: 1, baths: 1, sqft: 780, photo: 2, tags: ['Pet friendly', 'In-unit laundry', 'Gym'], description: 'Warm textures, clean lines, and an open kitchen make this loft easy to settle into. A separate bedroom gives the living area room to breathe.', offset: [0.014, -0.013] },
  { name: 'Aspen House', area: 'Westside', rent: 2150, fees: 100, beds: 2, baths: 2, sqft: 1185, photo: 3, tags: ['Pet friendly', 'In-unit laundry', 'Parking', 'Gym'], description: 'An airy two-bedroom with generous living space, thoughtful storage, and a kitchen designed for everyday cooking. Room for a home office or a fresh start.', offset: [0.001, -0.042] },
  { name: 'The Mason', area: 'Midtown', rent: 1425, fees: 55, beds: 0, baths: 1, sqft: 560, photo: 4, tags: ['In-unit laundry', 'Parking'], description: 'A compact studio that makes the most of its space. An efficient layout keeps your sleeping, cooking, and living areas comfortably connected.', offset: [0.009, -0.025] },
  { name: 'Willow & Main', area: 'Downtown', rent: 2290, fees: 95, beds: 3, baths: 2, sqft: 1320, photo: 5, tags: ['Pet friendly', 'Parking', 'Balcony'], description: 'A relaxed home with three flexible bedrooms and a spacious shared living area. Step outside onto the balcony for a moment of fresh air.', offset: [-0.005, 0.008] },
  { name: 'Parkside Commons', area: 'Southside', rent: 1795, fees: 75, beds: 2, baths: 1, sqft: 950, photo: 6, tags: ['Pet friendly', 'In-unit laundry', 'Parking'], description: 'Comfortable proportions and a welcoming layout make this apartment a practical home base. A second bedroom adds space for hobbies, guests, or work.', offset: [-0.016, -0.012] }
];
export const demoListings = Object.entries(cities).flatMap(([city, data], c) => base.map((p, i) => ({
  ...p, id: `demo-${city.toLowerCase()}-${i+1}`, city, state: data.state,
  rent: p.rent + [0, 180, 90, 420][c], fees: p.fees,
  lat: data.center[0] + p.offset[0], lng: data.center[1] + p.offset[1],
  image: `/images/apartment-${p.photo}.jpg`,
  available: 'Illustrative availability', deposit: p.rent + [0, 180, 90, 420][c],
  source: 'Sample collection', is_demo: true
})));
export const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
