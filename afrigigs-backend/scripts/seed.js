'use strict';

/**
 * Pre-seeds currencies, countries (with cities + localized gig terminology),
 * and a starter skills catalog.
 *
 * Usage:  npm run seed   (with the Strapi app NOT running, or via
 *         `strapi console` — this script boots Strapi headlessly, seeds,
 *         then exits)
 */

const strapi = require('@strapi/strapi');

const CURRENCIES = [
  { code: 'ZMW', symbol: 'ZK', minimum_national_bid: 50.0 },
  { code: 'NGN', symbol: '₦', minimum_national_bid: 2000.0 },
  { code: 'KES', symbol: 'KSh', minimum_national_bid: 500.0 },
  { code: 'GHS', symbol: 'GH₵', minimum_national_bid: 30.0 },
  { code: 'ZAR', symbol: 'R', minimum_national_bid: 80.0 },
  { code: 'UGX', symbol: 'USh', minimum_national_bid: 15000.0 },
  { code: 'TZS', symbol: 'TSh', minimum_national_bid: 10000.0 },
];

const COUNTRIES = [
  {
    name: 'Zambia',
    iso_code: 'ZM',
    currencyCode: 'ZMW',
    cities: ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe'],
  },
  {
    name: 'Nigeria',
    iso_code: 'NG',
    currencyCode: 'NGN',
    cities: ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano'],
    gig_local_term_singular: 'Job',
    gig_local_term_plural: 'Jobs',
  },
  {
    name: 'Kenya',
    iso_code: 'KE',
    currencyCode: 'KES',
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
  },
  {
    name: 'Ghana',
    iso_code: 'GH',
    currencyCode: 'GHS',
    cities: ['Accra', 'Kumasi', 'Tamale'],
  },
  {
    name: 'South Africa',
    iso_code: 'ZA',
    currencyCode: 'ZAR',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
  },
  {
    name: 'Uganda',
    iso_code: 'UG',
    currencyCode: 'UGX',
    cities: ['Kampala', 'Gulu', 'Mbarara'],
  },
  {
    name: 'Tanzania',
    iso_code: 'TZ',
    currencyCode: 'TZS',
    cities: ['Dar es Salaam', 'Dodoma', 'Mwanza'],
  },
];

const SKILLS = [
  { name: 'Plumbing', category: 'Manual Trades' },
  { name: 'Electrical Wiring', category: 'Manual Trades' },
  { name: 'Carpentry', category: 'Manual Trades' },
  { name: 'Welding', category: 'Manual Trades' },
  { name: 'Graphic Design', category: 'Digital Services' },
  { name: 'Web Development', category: 'Digital Services' },
  { name: 'Social Media Management', category: 'Digital Services' },
  { name: 'House Cleaning', category: 'Domestic Services' },
  { name: 'Childcare', category: 'Domestic Services' },
  { name: 'Motorbike Delivery', category: 'Transport & Logistics' },
  { name: 'Truck Driving', category: 'Transport & Logistics' },
  { name: 'Photography', category: 'Creative & Media' },
  { name: 'Videography', category: 'Creative & Media' },
  { name: 'Accounting', category: 'Professional Services' },
  { name: 'Legal Consulting', category: 'Professional Services' },
];

async function seed() {
  const app = await strapi().load();

  console.log('Seeding currencies...');
  const currencyIdByCode = {};
  for (const c of CURRENCIES) {
    const existing = await app.entityService.findMany('api::currency.currency', {
      filters: { code: c.code },
      limit: 1,
    });
    const record = existing[0]
      ? existing[0]
      : await app.entityService.create('api::currency.currency', { data: c });
    currencyIdByCode[c.code] = record.id;
  }

  console.log('Seeding countries...');
  for (const country of COUNTRIES) {
    const existing = await app.entityService.findMany('api::country.country', {
      filters: { iso_code: country.iso_code },
      limit: 1,
    });
    if (existing[0]) continue;

    await app.entityService.create('api::country.country', {
      data: {
        name: country.name,
        iso_code: country.iso_code,
        currency: currencyIdByCode[country.currencyCode],
        cities: country.cities,
        gig_local_term_singular: country.gig_local_term_singular || 'Gig',
        gig_local_term_plural: country.gig_local_term_plural || 'Gigs',
      },
    });
  }

  console.log('Seeding skills catalog...');
  for (const skill of SKILLS) {
    const existing = await app.entityService.findMany('api::skills-catalog.skills-catalog', {
      filters: { name: skill.name },
      limit: 1,
    });
    if (existing[0]) continue;

    await app.entityService.create('api::skills-catalog.skills-catalog', { data: skill });
  }

  console.log('Seed complete.');
  await app.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
