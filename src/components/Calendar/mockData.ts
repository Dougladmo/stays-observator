import type { Unit } from './types';

export const mockUnits: Unit[] = [
  {
    id: '1',
    code: 'LAG-323-Z',
    thumbnail: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=200&h=150&fit=crop',
    reservations: [
      {
        id: 'r1',
        guestName: 'CHEN-2 - RONNIE LEE (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 9, 27), // Oct 27
        endDate: new Date(2025, 9, 31), // Oct 31
      },
      {
        id: 'r2',
        guestName: 'C1632 - MARIANA LEGORNI (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 10, 7), // Nov 7
        endDate: new Date(2025, 10, 14), // Nov 14
      },
    ],
  },
  {
    id: '2',
    code: 'A-AAD-290',
    thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=150&fit=crop',
    reservations: [],
  },
  {
    id: '3',
    code: 'A-ECM-13',
    thumbnail: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&h=150&fit=crop',
    reservations: [],
  },
  {
    id: '4',
    code: 'ECM-TH-1',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=150&fit=crop',
    reservations: [],
  },
  {
    id: '5',
    code: 'C-AA-1260-202',
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=150&fit=crop',
    reservations: [
      {
        id: 'r3',
        guestName: 'LG814 - JEROME AHLSWORTH (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 9, 27), // Oct 27
        endDate: new Date(2025, 10, 1), // Nov 1
      },
      {
        id: 'r4',
        guestName: 'C1632 - THORAN BARBIAN (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 10, 3), // Nov 3
        endDate: new Date(2025, 10, 9), // Nov 9
      },
    ],
  },
  {
    id: '6',
    code: 'C-AA-1536-1101',
    thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=150&fit=crop',
    reservations: [],
  },
  {
    id: '7',
    code: 'C-RD-238-199',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop',
    reservations: [
      {
        id: 'r5',
        guestName: 'B6127 - MATILDE DE OLIVEIRA MARQUES LAUREANO FERNANDES (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 9, 27), // Oct 27
        endDate: new Date(2025, 10, 13), // Nov 13
      },
      {
        id: 'r6',
        guestName: 'Z.AR1 - BLOQUEADO',
        type: 'blocked',
        startDate: new Date(2025, 10, 13), // Nov 13
        endDate: new Date(2025, 10, 14), // Nov 14
      },
    ],
  },
  {
    id: '8',
    code: 'C-RD-238-199 (GL',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=150&fit=crop',
    reservations: [
      {
        id: 'r7',
        guestName: 'B6127 - DARNEILL ALEIXANDRE SHEFTON (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 9, 28), // Oct 28
        endDate: new Date(2025, 10, 1), // Nov 1
      },
      {
        id: 'r8',
        guestName: 'QUER2 - KAREN BADIN (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 10, 1), // Nov 1
        endDate: new Date(2025, 10, 7), // Nov 7
      },
      {
        id: 'r9',
        guestName: 'QUER3 - PRIMO BUFOLO DE BARROS (R',
        type: 'reserved',
        startDate: new Date(2025, 10, 8), // Nov 8
        endDate: new Date(2025, 10, 10), // Nov 10
      },
    ],
  },
  {
    id: '9',
    code: 'C-MBV-146-101',
    thumbnail: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&h=150&fit=crop',
    reservations: [],
  },
  {
    id: '10',
    code: 'G-MSV-146-601',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=150&fit=crop',
    reservations: [
      {
        id: 'r10',
        guestName: 'GG92 - JEROME AHLSWORTH (RESERVA)',
        type: 'reserved',
        startDate: new Date(2025, 9, 28), // Oct 28
        endDate: new Date(2025, 10, 4), // Nov 4
      },
    ],
  },
];
