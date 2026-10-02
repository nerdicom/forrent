export const defaultFilters = { city: 'Bozeman', maxRent: '', beds: 'any', pets: false, parking: false, laundry: false };
export function interpretQuery(input, currentCity = 'Bozeman') {
  const q = String(input).toLowerCase();
  const result = { ...defaultFilters, city: currentCity };
  const names = ['Bozeman', 'Denver', 'Austin', 'Seattle'];
  const city = names.find(c => new RegExp(`\\b${c.toLowerCase()}\\b`).test(q));
  if (city) result.city = city;
  const budget = q.match(/(?:under|below|up to|budget(?: of)?|max(?:imum)?(?: of)?|less than|no more than)\s*\$?\s*([\d,]+(?:\.\d+)?)(k)?\b/) || q.match(/\$\s*([\d,]+(?:\.\d+)?)(k)?\b/);
  if (budget) result.maxRent = Math.round(Number(budget[1].replaceAll(',', '')) * (budget[2] ? 1000 : 1));
  const bedroom = q.match(/\b(one|two|three|four|[0-4])[- ]?(?:bed(?:room)?s?|br)\b/);
  if (/\bstudio\b/.test(q)) result.beds = '0';
  else if (bedroom) result.beds = String(({one:1,two:2,three:3,four:4})[bedroom[1]] ?? Number(bedroom[1]));
  result.pets = /\b(dog|dogs|cat|cats|pet|pets|pet-friendly)\b/.test(q) && !/\b(no pets|no dogs|no cats|without pets|don't have (?:a )?(?:dog|cat))\b/.test(q);
  result.parking = /\b(parking|garage)\b/.test(q) && !/\b(no parking|don't need parking|without parking)\b/.test(q);
  result.laundry = /\b(laundry|washer|washing machine)\b/.test(q) && !/\b(no laundry|don't need laundry|without laundry)\b/.test(q);
  return result;
}
export function getMatches(listings, filters) {
  return listings.filter(p =>
    p.city.toLowerCase() === filters.city.toLowerCase() &&
    (!filters.maxRent || p.rent + p.fees <= Number(filters.maxRent)) &&
    (filters.beds === 'any' || (filters.beds === '3+' ? p.beds >= 3 : p.beds === Number(filters.beds))) &&
    (!filters.pets || p.tags.includes('Pet friendly')) &&
    (!filters.parking || p.tags.includes('Parking')) &&
    (!filters.laundry || p.tags.includes('In-unit laundry'))
  );
}
export function matchReasons(p, filters) {
  const reasons = [];
  if (filters.maxRent) reasons.push(`Listed monthly cost is within your $${Number(filters.maxRent).toLocaleString()} budget`);
  if (filters.beds !== 'any') reasons.push(p.beds === 0 ? 'The studio layout you asked for' : `${p.beds} bedrooms to fit your search`);
  if (filters.pets && p.tags.includes('Pet friendly')) reasons.push('Pets allowed; restrictions still need confirmation');
  if (filters.parking) reasons.push('Parking listed as an amenity');
  if (filters.laundry) reasons.push('In-unit laundry included in the listing');
  return reasons.length ? reasons : [`Located in ${p.area}, ${p.city}`, `${p.sqft.toLocaleString()} sq ft of living space`, p.tags[0]];
}
