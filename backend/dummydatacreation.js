// const axios = require('axios');

// // Configuration
// const STRAPI_URL = process.env.SERVERURL || 'http://localhost:1347'; // Change this to your Strapi URL
// const JWT_TOKEN = process.env.SERVERJWTTOKEN || 'dd6d8148f62566d339adda03f1e89a3acdc484410bdf7ce52862a230e7cc970571863110e64eea85615aa6fd2172af86aa7846601b0828c0e23fdcac40b805a6a42cbafba38b3273ca25b024c6fcc9b4679ea7ffeca70e124e3968e051eb55936958ee621ff4a8da34740af60bb2baf8e923ae43398d2ca1b2fe8f901a392e37'// Replace with your actual JWT token

// console.log('STRAPI_URL', STRAPI_URL, "JWT_TOKEN", JWT_TOKEN)

// // Helper function to make API calls
// const api = axios.create({
//   baseURL: `${STRAPI_URL}/api`,
//   headers: {
//     'Authorization': `Bearer ${JWT_TOKEN}`,
//     'Content-Type': 'application/json'
//   }
// })

// // Helper to handle errors
// const handleError = (error, context) => {
//   console.error(`Error in ${context}:`, error.response?.data || error.message);
// };

// // Helper to find or create an entry
// async function findOrCreate(endpoint, data, uniqueField) {
//   try {
//     // Try to find existing entry
//     const searchValue = data[uniqueField];
//     const findResponse = await api.get(`${endpoint}?filters[${uniqueField}][$eq]=${encodeURIComponent(searchValue)}`);

//     if (findResponse.data.data && findResponse.data.data.length > 0) {
//       console.log(`⊙ Found existing: ${searchValue}`);
//       return findResponse.data.data[0];
//     }

//     // Create new entry if not found
//     const createResponse = await api.post(endpoint, { data });
//     console.log(`✓ Created: ${searchValue}`);
//     return createResponse.data.data;
//   } catch (error) {
//     handleError(error, `Finding or creating ${endpoint}`);
//     return null;
//   }
// }

// // Store created IDs for relations
// const createdIds = {};

// // Dummy data generators
// const dummyData = {
//   currencies: [
//     { code: 'ZMW', symbol: 'ZK', minimum_national_bid: 50.0 },
//     { code: 'NGN', symbol: '₦', minimum_national_bid: 2000.0 },
//     { code: 'KES', symbol: 'KSh', minimum_national_bid: 500.0 },
//     { code: 'GHS', symbol: 'GH₵', minimum_national_bid: 30.0 },
//     { code: 'ZAR', symbol: 'R', minimum_national_bid: 80.0 },
//     { code: 'UGX', symbol: 'USh', minimum_national_bid: 15000.0 },
//     { code: 'TZS', symbol: 'TSh', minimum_national_bid: 10000.0 }
//   ],

//   countries: (currencyIds) => [
//     { name: 'Zambia', iso_code: 'ZM', cities: ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[0] },
//     { name: 'Nigeria', iso_code: 'NG', cities: ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano'], gig_local_term_singular: 'Job', gig_local_term_plural: 'Jobs', currency: currencyIds[1] },
//     { name: 'Kenya', iso_code: 'KE', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[2] },
//     { name: 'Ghana', iso_code: 'GH', cities: ['Accra', 'Kumasi', 'Tamale'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[3] },
//     { name: 'South Africa', iso_code: 'ZA', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[4] },
//     { name: 'Uganda', iso_code: 'UG', cities: ['Kampala', 'Gulu', 'Mbarara'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[5] },
//     { name: 'Tanzania', iso_code: 'TZ', cities: ['Dar es Salaam', 'Dodoma', 'Mwanza'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[6] }
//   ],

//   skillsCatalog: [
//     { name: 'Plumbing', category: 'Manual Trades', icon: 'wrench' },
//     { name: 'Electrical Wiring', category: 'Manual Trades', icon: 'zap' },
//     { name: 'Carpentry', category: 'Manual Trades', icon: 'hammer' },
//     { name: 'Welding', category: 'Manual Trades', icon: 'flame' },
//     { name: 'Graphic Design', category: 'Digital Services', icon: 'pen-tool' },
//     { name: 'Web Development', category: 'Digital Services', icon: 'code' },
//     { name: 'Social Media Management', category: 'Digital Services', icon: 'share-2' },
//     { name: 'House Cleaning', category: 'Domestic Services', icon: 'sparkles' },
//     { name: 'Childcare', category: 'Domestic Services', icon: 'baby' },
//     { name: 'Motorbike Delivery', category: 'Transport & Logistics', icon: 'bike' },
//     { name: 'Truck Driving', category: 'Transport & Logistics', icon: 'truck' },
//     { name: 'Photography', category: 'Creative & Media', icon: 'camera' },
//     { name: 'Videography', category: 'Creative & Media', icon: 'video' },
//     { name: 'Accounting', category: 'Professional Services', icon: 'calculator' },
//     { name: 'Legal Consulting', category: 'Professional Services', icon: 'scale' }
//   ],

//   jobs: (countryIds, currencyIds, skillIds) => [
//     { title: 'Fix leaking kitchen pipe', description: 'Kitchen sink pipe is leaking under the counter, needs urgent repair.', target_city: 'Lusaka', scope: 'LOCAL', status: 'open', budget_amount: 250, escrow_status: 'unfunded', country: countryIds[0], budget_currency: currencyIds[0], skills_required: [skillIds[0]] },
//     { title: 'Build a WordPress site for small business', description: 'Need a 5-page WordPress site with contact form and gallery.', target_city: 'Lagos', scope: 'FOR_EVERYONE', status: 'open', budget_amount: 45, escrow_status: 'unfunded', country: countryIds[1], budget_currency: currencyIds[1], skills_required: [skillIds[5]] },
//     { title: 'Weekend house deep clean', description: 'Three-bedroom house, deep clean including kitchen and bathrooms.', target_city: 'Nairobi', scope: 'LOCAL', status: 'open', budget_amount: 1500, escrow_status: 'unfunded', country: countryIds[2], budget_currency: currencyIds[2], skills_required: [skillIds[7]] },
//     { title: 'Wire new office extension', description: 'New office room needs electrical wiring and socket installation.', target_city: 'Accra', scope: 'LOCAL', status: 'open', budget_amount: 350, escrow_status: 'unfunded', country: countryIds[3], budget_currency: currencyIds[3], skills_required: [skillIds[1]] },
//     { title: 'Product photography for online store', description: 'Need 30 product photos shot and lightly edited for an e-commerce store.', target_city: 'Johannesburg', scope: 'FOR_EVERYONE', status: 'open', budget_amount: 600, escrow_status: 'unfunded', country: countryIds[4], budget_currency: currencyIds[4], skills_required: [skillIds[11]] },
//     { title: 'Motorbike courier for same-day parcels', description: 'Daily parcel deliveries across the city, own motorbike required.', target_city: 'Kampala', scope: 'LOCAL', status: 'open', budget_amount: 40000, escrow_status: 'unfunded', country: countryIds[5], budget_currency: currencyIds[5], skills_required: [skillIds[9]] },
//     { title: 'Bookkeeping for small retail shop', description: 'Monthly bookkeeping and reconciliation for a small retail business.', target_city: 'Dar es Salaam', scope: 'LOCAL', status: 'open', budget_amount: 80000, escrow_status: 'unfunded', country: countryIds[6], budget_currency: currencyIds[6], skills_required: [skillIds[13]] }
//   ]
// };

// // Main execution function
// async function populateData() {
//   console.log('Starting data population...\n');

//   try {
//     // Step 1: Create Currencies
//     console.log('Creating Currencies...');
//     createdIds.currencies = [];
//     for (const currency of dummyData.currencies) {
//       const result = await findOrCreate('/currencies', currency, 'code');
//       if (result) createdIds.currencies.push(result.id);
//     }

//     // Step 2: Create Countries
//     console.log('\nCreating Countries...');
//     createdIds.countries = [];
//     for (const country of dummyData.countries(createdIds.currencies)) {
//       const result = await findOrCreate('/countries', country, 'iso_code');
//       if (result) createdIds.countries.push(result.id);
//     }

//     // Step 3: Create Skills Catalog
//     console.log('\nCreating Skills Catalog...');
//     createdIds.skillsCatalog = [];
//     for (const skill of dummyData.skillsCatalog) {
//       const result = await findOrCreate('/skills-catalogs', skill, 'name');
//       if (result) createdIds.skillsCatalog.push(result.id);
//     }

//     // Step 4: Create Jobs
//     console.log('\nCreating Jobs...');
//     createdIds.jobs = [];
//     for (const job of dummyData.jobs(createdIds.countries, createdIds.currencies, createdIds.skillsCatalog)) {
//       const result = await findOrCreate('/jobs', job, 'title');
//       if (result) createdIds.jobs.push(result.id);
//     }

//     console.log('\n✅ Data population completed successfully!');
//     console.log('\nCreated IDs summary:');
//     console.log(`Currencies: ${createdIds.currencies?.length || 0}`);
//     console.log(`Countries: ${createdIds.countries?.length || 0}`);
//     console.log(`Skills Catalog: ${createdIds.skillsCatalog?.length || 0}`);
//     console.log(`Jobs: ${createdIds.jobs?.length || 0}`);

//   } catch (error) {
//     console.error('\n❌ Fatal error during data population:', error.message);
//     process.exit(1);
//   }
// }

// // Run the script
// populateData();
const axios = require('axios');

// Configuration
const STRAPI_URL = process.env.SERVERURL || 'http://localhost:1347'; // Change this to your Strapi URL
const JWT_TOKEN = process.env.SERVERJWTTOKEN || 'dd6d8148f62566d339adda03f1e89a3acdc484410bdf7ce52862a230e7cc970571863110e64eea85615aa6fd2172af86aa7846601b0828c0e23fdcac40b805a6a42cbafba38b3273ca25b024c6fcc9b4679ea7ffeca70e124e3968e051eb55936958ee621ff4a8da34740af60bb2baf8e923ae43398d2ca1b2fe8f901a392e37'// Replace with your actual JWT token


// Helper function to make API calls
const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Separate client for auth endpoints (registration is public, no bearer needed,
// but Strapi ignores the extra header either way)
const authApi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Helper to handle errors
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error.response?.data || error.message);
};

// Helper to find or create an entry
async function findOrCreate(endpoint, data, uniqueField) {
  try {
    // Try to find existing entry
    const searchValue = data[uniqueField];
    const findResponse = await api.get(`${endpoint}?filters[${uniqueField}][$eq]=${encodeURIComponent(searchValue)}`);

    if (findResponse.data.data && findResponse.data.data.length > 0) {
      console.log(`⊙ Found existing: ${searchValue}`);
      return findResponse.data.data[0];
    }

    // Create new entry if not found
    const createResponse = await api.post(endpoint, { data });
    console.log(`✓ Created: ${searchValue}`);
    return createResponse.data.data;
  } catch (error) {
    handleError(error, `Finding or creating ${endpoint}`);
    return null;
  }
}

// Helper to find or register a user account
async function findOrCreateUser(userData) {
  try {
    // Try to find existing user (requires the API token's role to have
    // users-permissions.user.find enabled; falls back to registering
    // straight through if the lookup fails)
    try {
      const findResponse = await api.get(`/users?filters[email][$eq]=${encodeURIComponent(userData.email)}`);
      if (findResponse.data && findResponse.data.length > 0) {
        console.log(`⊙ Found existing user: ${userData.email}`);
        return findResponse.data[0];
      }
    } catch (lookupError) {
      // Lookup permission may not be enabled — fall through to register,
      // which will itself fail loudly if the email is already taken.
    }

    const registerResponse = await authApi.post('/auth/local/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password
    });

    console.log(`✓ Registered: ${userData.email}`);
    return registerResponse.data.user;
  } catch (error) {
    if (error.response?.data?.error?.message?.includes('already taken')) {
      console.log(`⊙ Already registered, fetching: ${userData.email}`);
      const findResponse = await api.get(`/users?filters[email][$eq]=${encodeURIComponent(userData.email)}`);
      return findResponse.data?.[0] || null;
    }
    handleError(error, `Registering user ${userData.email}`);
    return null;
  }
}

// Store created IDs for relations
const createdIds = {};

// Dummy data generators
const dummyData = {
  currencies: [
    { code: 'ZMW', symbol: 'ZK', minimum_national_bid: 50.0 },
    { code: 'NGN', symbol: '₦', minimum_national_bid: 2000.0 },
    { code: 'KES', symbol: 'KSh', minimum_national_bid: 500.0 },
    { code: 'GHS', symbol: 'GH₵', minimum_national_bid: 30.0 },
    { code: 'ZAR', symbol: 'R', minimum_national_bid: 80.0 },
    { code: 'UGX', symbol: 'USh', minimum_national_bid: 15000.0 },
    { code: 'TZS', symbol: 'TSh', minimum_national_bid: 10000.0 }
  ],

  countries: (currencyIds) => [
    { name: 'Zambia', iso_code: 'ZM', cities: ['Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[0] },
    { name: 'Nigeria', iso_code: 'NG', cities: ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano'], gig_local_term_singular: 'Job', gig_local_term_plural: 'Jobs', currency: currencyIds[1] },
    { name: 'Kenya', iso_code: 'KE', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[2] },
    { name: 'Ghana', iso_code: 'GH', cities: ['Accra', 'Kumasi', 'Tamale'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[3] },
    { name: 'South Africa', iso_code: 'ZA', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[4] },
    { name: 'Uganda', iso_code: 'UG', cities: ['Kampala', 'Gulu', 'Mbarara'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[5] },
    { name: 'Tanzania', iso_code: 'TZ', cities: ['Dar es Salaam', 'Dodoma', 'Mwanza'], gig_local_term_singular: 'Gig', gig_local_term_plural: 'Gigs', currency: currencyIds[6] }
  ],

  skillsCatalog: [
    { name: 'Plumbing', category: 'Manual Trades', icon: 'wrench' },
    { name: 'Electrical Wiring', category: 'Manual Trades', icon: 'zap' },
    { name: 'Carpentry', category: 'Manual Trades', icon: 'hammer' },
    { name: 'Welding', category: 'Manual Trades', icon: 'flame' },
    { name: 'Graphic Design', category: 'Digital Services', icon: 'pen-tool' },
    { name: 'Web Development', category: 'Digital Services', icon: 'code' },
    { name: 'Social Media Management', category: 'Digital Services', icon: 'share-2' },
    { name: 'House Cleaning', category: 'Domestic Services', icon: 'sparkles' },
    { name: 'Childcare', category: 'Domestic Services', icon: 'baby' },
    { name: 'Motorbike Delivery', category: 'Transport & Logistics', icon: 'bike' },
    { name: 'Truck Driving', category: 'Transport & Logistics', icon: 'truck' },
    { name: 'Photography', category: 'Creative & Media', icon: 'camera' },
    { name: 'Videography', category: 'Creative & Media', icon: 'video' },
    { name: 'Accounting', category: 'Professional Services', icon: 'calculator' },
    { name: 'Legal Consulting', category: 'Professional Services', icon: 'scale' }
  ],

  // 5 dummy accounts. Each is pre-mapped to a country index (into
  // createdIds.countries) so job owners and same-country bidders can be
  // assigned deterministically below.
  users: [
    { username: 'user1', email: 'email1@email.com', password: 'Passw0rd!23', countryIndex: 0 }, // Zambia
    { username: 'user2', email: 'email2@email.com', password: 'Passw0rd!23', countryIndex: 1 }, // Nigeria
    { username: 'user3', email: 'email3@email.com', password: 'Passw0rd!23', countryIndex: 2 }, // Kenya
    { username: 'user4', email: 'email4@email.com', password: 'Passw0rd!23', countryIndex: 3 }, // Ghana
    { username: 'user5', email: 'email5@email.com', password: 'Passw0rd!23', countryIndex: 4 }  // South Africa
  ],

  // jobOwnerIndex / bidderIndex both index into createdIds.users.
  // Bidder is deliberately a different user in the SAME country as the
  // job, so the domestic bid-floor path is exercised (not the $5 USD
  // international fallback).
  jobs: (countryIds, currencyIds, skillIds) => [
    { title: 'Fix leaking kitchen pipe', description: 'Kitchen sink pipe is leaking under the counter, needs urgent repair.', target_city: 'Lusaka', scope: 'LOCAL', job_status: 'open', budget_amount: 250, escrow_status: 'unfunded', country: countryIds[0], budget_currency: currencyIds[0], skills_required: [skillIds[0]], jobOwnerIndex: 0, bidderIndex: 0 },
    { title: 'Build a WordPress site for small business', description: 'Need a 5-page WordPress site with contact form and gallery.', target_city: 'Lagos', scope: 'FOR_EVERYONE', job_status: 'open', budget_amount: 45, escrow_status: 'unfunded', country: countryIds[1], budget_currency: currencyIds[1], skills_required: [skillIds[5]], jobOwnerIndex: 1, bidderIndex: 1 },
    { title: 'Weekend house deep clean', description: 'Three-bedroom house, deep clean including kitchen and bathrooms.', target_city: 'Nairobi', scope: 'LOCAL', job_status: 'open', budget_amount: 1500, escrow_status: 'unfunded', country: countryIds[2], budget_currency: currencyIds[2], skills_required: [skillIds[7]], jobOwnerIndex: 2, bidderIndex: 2 },
    { title: 'Wire new office extension', description: 'New office room needs electrical wiring and socket installation.', target_city: 'Accra', scope: 'LOCAL', job_status: 'open', budget_amount: 350, escrow_status: 'unfunded', country: countryIds[3], budget_currency: currencyIds[3], skills_required: [skillIds[1]], jobOwnerIndex: 3, bidderIndex: 3 },
    { title: 'Product photography for online store', description: 'Need 30 product photos shot and lightly edited for an e-commerce store.', target_city: 'Johannesburg', scope: 'FOR_EVERYONE', job_status: 'open', budget_amount: 600, escrow_status: 'unfunded', country: countryIds[4], budget_currency: currencyIds[4], skills_required: [skillIds[11]], jobOwnerIndex: 4, bidderIndex: 4 }
  ],

  // proposed_amount_local computed at creation time (needs the resolved
  // currency minimum), so bids are built programmatically below instead
  // of as a flat array — see populateData().
};

// Main execution function
async function populateData() {
  console.log('Starting data population...\n');

  try {
    // Step 1: Create Currencies
    console.log('Creating Currencies...');
    createdIds.currencies = [];
    for (const currency of dummyData.currencies) {
      const result = await findOrCreate('/currencies', currency, 'code');
      if (result) createdIds.currencies.push(result.id);
    }

    // Step 2: Create Countries
    console.log('\nCreating Countries...');
    createdIds.countries = [];
    for (const country of dummyData.countries(createdIds.currencies)) {
      const result = await findOrCreate('/countries', country, 'iso_code');
      if (result) createdIds.countries.push(result.id);
    }

    // Step 3: Create Skills Catalog
    console.log('\nCreating Skills Catalog...');
    createdIds.skillsCatalog = [];
    for (const skill of dummyData.skillsCatalog) {
      const result = await findOrCreate('/skills-catalogs', skill, 'name');
      if (result) createdIds.skillsCatalog.push(result.id);
    }

    // Step 4: Register User Accounts
    console.log('\nRegistering Users...');
    createdIds.users = [];
    for (const user of dummyData.users) {
      const result = await findOrCreateUser(user);
      if (result) {
        createdIds.users.push(result.id);

        // Attach the user's country (needed by the bid lifecycle's
        // domestic-vs-international check)
        try {
          await api.put(`/users/${result.id}`, {
            country: createdIds.countries[user.countryIndex]
          });
          console.log(`  ↳ Set country for ${user.email}`);
        } catch (error) {
          handleError(error, `Setting country for ${user.email}`);
        }
      } else {
        createdIds.users.push(null);
      }
    }

    // Step 5: Create Jobs (owner = one of the registered users)
    console.log('\nCreating Jobs...');
    createdIds.jobs = [];
    const jobDefs = dummyData.jobs(createdIds.countries, createdIds.currencies, createdIds.skillsCatalog);
    for (const jobDef of jobDefs) {
      const { jobOwnerIndex, bidderIndex, ...jobData } = jobDef;
      jobData.owner = createdIds.users[jobOwnerIndex];

      const result = await findOrCreate('/jobs', jobData, 'title');
      if (result) {
        createdIds.jobs.push({
          id: result.id,
          currencyIndex: dummyData.currencies.findIndex(c => c.code === dummyData.countries(createdIds.currencies)[0] && false) // unused fallback
        });
      }
    }

    // Re-fetch jobs with their currency's minimum_national_bid so bids can
    // be created above the floor without re-deriving indices by hand.
    console.log('\nCreating Bids...');
    createdIds.bids = [];
    for (let i = 0; i < jobDefs.length; i++) {
      const jobDef = jobDefs[i];
      const createdJob = createdIds.jobs[i];
      if (!createdJob) continue;

      const bidderId = createdIds.users[jobDef.bidderIndex];
      if (!bidderId) continue;

      // Same country as the job owner => domestic bid path. Look up the
      // currency minimum directly from the seed data using the job's
      // currency relation index.
      const currencyIndex = createdIds.currencies.indexOf(jobDef.budget_currency);
      const minimumBid = dummyData.currencies[currencyIndex]?.minimum_national_bid || 0;
      const proposedLocal = Math.ceil(minimumBid + minimumBid * 0.2); // 20% above floor

      const bidData = {
        job: createdJob.id,
        user: bidderId,
        proposed_amount_local: proposedLocal,
        proposed_amount_usd: null,
        message: `I can complete "${jobDef.title}" to a high standard — happy to discuss details.`,
        bid_status: 'pending'
      };

      try {
        const bidResponse = await api.post('/bids', { data: bidData });
        console.log(`✓ Created bid on: ${jobDef.title} (${proposedLocal})`);
        createdIds.bids.push(bidResponse.data.data.id);
      } catch (error) {
        handleError(error, `Creating bid on ${jobDef.title}`);
      }
    }

    console.log('\n✅ Data population completed successfully!');
    console.log('\nCreated IDs summary:');
    console.log(`Currencies: ${createdIds.currencies?.length || 0}`);
    console.log(`Countries: ${createdIds.countries?.length || 0}`);
    console.log(`Skills Catalog: ${createdIds.skillsCatalog?.length || 0}`);
    console.log(`Users: ${createdIds.users?.filter(Boolean).length || 0}`);
    console.log(`Jobs: ${createdIds.jobs?.length || 0}`);
    console.log(`Bids: ${createdIds.bids?.length || 0}`);

  } catch (error) {
    console.error('\n❌ Fatal error during data population:', error.message);
    process.exit(1);
  }
}

// Run the script
populateData();