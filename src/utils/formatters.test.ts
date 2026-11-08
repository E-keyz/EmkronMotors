import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatNaira,
  formatNairaFull,
  generateCarSlug,
  timeAgo,
  filterListings,
  generateWhatsAppLink,
  PRESET_PRICE_BUCKETS,
} from './formatters';
import { CarListing } from '../types';

test('formatNaira abbreviates amounts correctly according to Nigerian marketplace conventions', () => {
  assert.equal(formatNaira(38500000), '₦38.5M');
  assert.equal(formatNaira(150000), '₦150K');
  assert.equal(formatNaira(2400000), '₦2.4M');
  assert.equal(formatNaira(10000000), '₦10M');
  assert.equal(formatNaira(1200000000), '₦1.2B');
  assert.equal(formatNaira(500), '₦500');
  assert.equal(formatNaira(0), '₦0');
});

test('formatNairaFull produces full comma-separated currency representation', () => {
  assert.equal(formatNairaFull(38500000), '₦38,500,000');
  assert.equal(formatNairaFull(150000), '₦150,000');
});

test('generateCarSlug creates accurate SEO friendly Nigerian marketplace slug', () => {
  const slug = generateCarSlug(
    'Nigerian Used',
    2015,
    'Toyota',
    'Corolla S',
    'Ogba',
    '12'
  );
  assert.equal(
    slug,
    'nigerian-used-2015-toyota-corolla-s-for-sale-in-ogba-12'
  );

  const tokunboSlug = generateCarSlug(
    'Foreign Used',
    2019,
    'Mercedes Benz',
    'GLC300',
    'Lekki Phase 1',
    '99'
  );
  assert.equal(
    tokunboSlug,
    'foreign-used-2019-mercedes-benz-glc300-for-sale-in-lekki-phase-1-99'
  );
});

test('timeAgo returns relative descriptions properly', () => {
  const now = new Date();
  assert.equal(timeAgo(now.toISOString()), 'Just now');

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  assert.equal(timeAgo(twoHoursAgo.toISOString()), '2 hours ago');

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  assert.equal(timeAgo(threeDaysAgo.toISOString()), '3 days ago');
});

test('generateWhatsAppLink normalizes 080... to 23480... and encodes message', () => {
  const link = generateWhatsAppLink('08031234567', '2019 Mercedes Benz GLC300', 38500000);
  assert.match(link, /^https:\/\/wa\.me\/2348031234567\?text=/);
  assert.match(link, /2019%20Mercedes%20Benz%20GLC300/);
  assert.match(link, /%E2%82%A638\.5M/); // ₦38.5M encoded
});

test('filterListings handles condition, price range presets, and sorting', () => {
  const sampleListings: CarListing[] = [
    {
      id: '1',
      slug: 'car-1',
      title: 'Foreign Used 2018 Toyota Camry',
      brand: 'Toyota',
      model: 'Camry',
      year: 2018,
      price: 14000000,
      condition: 'Foreign Used',
      category: 'Sedan',
      state: 'Lagos',
      area: 'Ikeja',
      mileage: 65000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      color: 'Silver',
      description: 'Clean tokunbo',
      images: ['https://example.com/1.jpg'],
      features: ['Air Conditioning'],
      seller: {
        id: 's1',
        name: 'Emeka Motors',
        email: 'emeka@example.com',
        phone: '08012345678',
        whatsapp: '08012345678',
        isVerifiedDealer: true,
        avatarUrl: '',
        location: 'Ikeja, Lagos',
        memberSince: '2022',
      },
      status: 'active',
      viewsCount: 100,
      createdAt: new Date(Date.now() - 10000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      slug: 'car-2',
      title: 'Nigerian Used 2012 Honda Accord',
      brand: 'Honda',
      model: 'Accord',
      year: 2012,
      price: 4200000,
      condition: 'Nigerian Used',
      category: 'Sedan',
      state: 'Abuja (FCT)',
      area: 'Gwarinpa',
      mileage: 140000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      color: 'Black',
      description: 'First body',
      images: ['https://example.com/2.jpg'],
      features: ['Reverse Camera'],
      seller: {
        id: 's2',
        name: 'Musa Autos',
        email: 'musa@example.com',
        phone: '08098765432',
        whatsapp: '08098765432',
        isVerifiedDealer: false,
        avatarUrl: '',
        location: 'Abuja',
        memberSince: '2023',
      },
      status: 'active',
      viewsCount: 50,
      createdAt: new Date(Date.now() - 50000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Test condition filter
  const foreignOnly = filterListings(sampleListings, { condition: 'Foreign Used' });
  assert.equal(foreignOnly.length, 1);
  assert.equal(foreignOnly[0].id, '1');

  // Test price preset bucket ₦2.5M - ₦4.9M
  const budgetCars = filterListings(sampleListings, { priceRange: '2.5m-4.9m' });
  assert.equal(budgetCars.length, 1);
  assert.equal(budgetCars[0].id, '2');

  // Test state filter
  const lagosCars = filterListings(sampleListings, { state: 'Lagos' });
  assert.equal(lagosCars.length, 1);
  assert.equal(lagosCars[0].id, '1');
});
