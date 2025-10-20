/**
 * Mock Sample Data - Realistic data based on actual application usage
 */

import { generateId, mockStorage, STORAGE_KEYS } from './mockStorage';

// Sample PIs from screenshots
export const mockPIs = [
  { id: generateId(), name: 'McLelland, Megan', created_at: '2025-09-01T00:00:00Z' },
  { id: generateId(), name: 'Walker, Marcia', created_at: '2025-09-01T00:00:00Z' },
  { id: generateId(), name: 'Edwards, Mark', created_at: '2025-09-02T00:00:00Z' },
  { id: generateId(), name: 'King, David', created_at: '2025-09-03T00:00:00Z' },
  { id: generateId(), name: 'Gaines, Lisa', created_at: '2025-09-04T00:00:00Z' },
  { id: generateId(), name: 'Furuno, Jon', created_at: '2025-09-05T00:00:00Z' },
  { id: generateId(), name: 'Weingrow, Meagan', created_at: '2025-09-06T00:00:00Z' },
  { id: generateId(), name: 'Merriner, Seithan', created_at: '2025-09-07T00:00:00Z' },
  { id: generateId(), name: 'Kaboi, David', created_at: '2025-09-08T00:00:00Z' },
  { id: generateId(), name: 'Lin, Dong', created_at: '2025-09-09T00:00:00Z' },
  { id: generateId(), name: 'Muzzy, Allen K.', created_at: '2025-09-10T00:00:00Z' },
  { id: generateId(), name: 'Graff, Jason R.', created_at: '2025-09-11T00:00:00Z' },
];

// Sample Sponsors from screenshots
export const mockSponsors = [
  { id: generateId(), name: 'MBRC', created_at: '2025-09-01T00:00:00Z' },
  { id: generateId(), name: 'Western United States Agricultural Trade Association', created_at: '2025-09-01T00:00:00Z' },
  { id: generateId(), name: 'Oregon Legislative Policy and Research Office', created_at: '2025-09-02T00:00:00Z' },
  { id: generateId(), name: 'Fastmarkets RISI', created_at: '2025-09-03T00:00:00Z' },
  { id: generateId(), name: 'Northwest Fisheries Science Center', created_at: '2025-09-04T00:00:00Z' },
  { id: generateId(), name: 'Abt Associates', created_at: '2025-09-05T00:00:00Z' },
  { id: generateId(), name: 'University of Bath', created_at: '2025-09-06T00:00:00Z' },
  { id: generateId(), name: 'Oregon Association of Clean Water Agencies', created_at: '2025-09-07T00:00:00Z' },
  { id: generateId(), name: 'Korea Institute of Robotics & Technology Convergence (KRC)', created_at: '2025-09-08T00:00:00Z' },
  { id: generateId(), name: 'University of Louisiana at Lafayette', created_at: '2025-09-09T00:00:00Z' },
  { id: generateId(), name: 'Argonne National Lab', created_at: '2025-09-10T00:00:00Z' },
  { id: generateId(), name: 'CENTRE NATIONAL D ETUDES SPATIALES', created_at: '2025-09-11T00:00:00Z' },
  { id: generateId(), name: 'Universidad de la Republica Uruguay', created_at: '2025-09-12T00:00:00Z' },
  { id: generateId(), name: 'DRHS Health and Behavioral Services', created_at: '2025-09-13T00:00:00Z' },
];

// Generate mock proposals based on screenshots
export const generateMockFiles = (pis: any[], sponsors: any[]) => {
  const statuses = ['In', 'Pending', 'Pending Signatures', 'Process', 'Done', 'On Hold', 'Withdrawn'];

  // Create proposals matching screenshot data (4 In, 16 Pending, 14 Pending Signatures, etc.)
  const proposals = [
    // 4 "In" status
    {
      id: generateId(),
      db_no: '1711',
      pi_id: pis.find(p => p.name === 'McLelland, Megan')?.id || pis[0].id,
      sponsor_id: sponsors.find(s => s.name === 'MBRC')?.id || sponsors[0].id,
      cayuse: null,
      status: 'In' as const,
      date_received: '2025-09-28T00:00:00Z',
      date_status_change: '2025-09-29T00:00:00Z',
      to_set_up: null,
      notes: null,
      external_link: null,
      created_at: '2025-09-28T00:00:00Z',
      updated_at: '2025-09-29T00:00:00Z',
    },
    {
      id: generateId(),
      db_no: '1703',
      pi_id: pis.find(p => p.name === 'Walker, Marcia')?.id || pis[1].id,
      sponsor_id: sponsors.find(s => s.name === 'Western United States Agricultural Trade Association')?.id || sponsors[1].id,
      cayuse: null,
      status: 'In' as const,
      date_received: '2025-09-25T00:00:00Z',
      date_status_change: '2025-09-29T00:00:00Z',
      to_set_up: null,
      notes: null,
      external_link: null,
      created_at: '2025-09-25T00:00:00Z',
      updated_at: '2025-09-29T00:00:00Z',
    },
    {
      id: generateId(),
      db_no: '1649',
      pi_id: pis.find(p => p.name === 'Edwards, Mark')?.id || pis[2].id,
      sponsor_id: sponsors.find(s => s.name === 'Oregon Legislative Policy and Research Office')?.id || sponsors[2].id,
      cayuse: null,
      status: 'In' as const,
      date_received: '2025-09-24T00:00:00Z',
      date_status_change: '2025-09-25T00:00:00Z',
      to_set_up: null,
      notes: null,
      external_link: null,
      created_at: '2025-09-24T00:00:00Z',
      updated_at: '2025-09-25T00:00:00Z',
    },
    {
      id: generateId(),
      db_no: '1619',
      pi_id: pis.find(p => p.name === 'King, David')?.id || pis[3].id,
      sponsor_id: sponsors.find(s => s.name === 'Fastmarkets RISI')?.id || sponsors[3].id,
      cayuse: null,
      status: 'In' as const,
      date_received: '2025-09-18T00:00:00Z',
      date_status_change: '2025-09-25T00:00:00Z',
      to_set_up: null,
      notes: null,
      external_link: null,
      created_at: '2025-09-18T00:00:00Z',
      updated_at: '2025-09-25T00:00:00Z',
    },

    // 16 "Pending" status
    ...Array.from({ length: 16 }, (_, i) => ({
      id: generateId(),
      db_no: `${1700 - i}`,
      pi_id: pis[i % pis.length].id,
      sponsor_id: sponsors[i % sponsors.length].id,
      cayuse: i % 3 === 0 ? `25-${1323 + i}` : null,
      status: 'Pending' as const,
      date_received: `2025-09-${15 + (i % 10)}T00:00:00Z`,
      date_status_change: `2025-09-${18 + (i % 10)}T00:00:00Z`,
      to_set_up: null,
      notes: i % 5 === 0 ? 'Follow up needed' : null,
      external_link: null,
      created_at: `2025-09-${15 + (i % 10)}T00:00:00Z`,
      updated_at: `2025-09-${18 + (i % 10)}T00:00:00Z`,
    })),

    // 14 "Pending Signatures" status
    ...Array.from({ length: 14 }, (_, i) => ({
      id: generateId(),
      db_no: `${1650 - i}`,
      pi_id: pis[i % pis.length].id,
      sponsor_id: sponsors[i % sponsors.length].id,
      cayuse: i % 2 === 0 ? `24-${2032 + i}` : null,
      status: 'Pending Signatures' as const,
      date_received: `2025-08-${20 + (i % 8)}T00:00:00Z`,
      date_status_change: `2025-09-${10 + (i % 15)}T00:00:00Z`,
      to_set_up: null,
      notes: null,
      external_link: null,
      created_at: `2025-08-${20 + (i % 8)}T00:00:00Z`,
      updated_at: `2025-09-${10 + (i % 15)}T00:00:00Z`,
    })),

    // A few in other statuses
    {
      id: generateId(),
      db_no: '1600',
      pi_id: pis[0].id,
      sponsor_id: sponsors[0].id,
      cayuse: null,
      status: 'Process' as const,
      date_received: '2025-09-10T00:00:00Z',
      date_status_change: '2025-09-12T00:00:00Z',
      to_set_up: '2025-10-15T00:00:00Z',
      notes: 'In progress',
      external_link: null,
      created_at: '2025-09-10T00:00:00Z',
      updated_at: '2025-09-12T00:00:00Z',
    },
    {
      id: generateId(),
      db_no: '1550',
      pi_id: pis[1].id,
      sponsor_id: sponsors[1].id,
      cayuse: '24-1234',
      status: 'Done' as const,
      date_received: '2025-08-15T00:00:00Z',
      date_status_change: '2025-08-20T00:00:00Z',
      to_set_up: null,
      notes: 'Completed successfully',
      external_link: null,
      created_at: '2025-08-15T00:00:00Z',
      updated_at: '2025-08-20T00:00:00Z',
    },
  ];

  return proposals;
};

// Initialize mock data in localStorage
export const initializeMockData = () => {
  // Only initialize if no data exists
  if (mockStorage.getAll(STORAGE_KEYS.PIS).length === 0) {
    mockStorage.setInitialData(STORAGE_KEYS.PIS, mockPIs);
  }

  if (mockStorage.getAll(STORAGE_KEYS.SPONSORS).length === 0) {
    mockStorage.setInitialData(STORAGE_KEYS.SPONSORS, mockSponsors);
  }

  if (mockStorage.getAll(STORAGE_KEYS.FILES).length === 0) {
    const pis = mockStorage.getAll(STORAGE_KEYS.PIS);
    const sponsors = mockStorage.getAll(STORAGE_KEYS.SPONSORS);
    const files = generateMockFiles(pis, sponsors);
    mockStorage.setInitialData(STORAGE_KEYS.FILES, files);
  }

  console.log('✅ Mock data initialized');
};
