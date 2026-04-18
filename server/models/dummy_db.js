const db = {
  users: [
    { userId: 'u1', name: 'Alice Smith', email: 'alice@example.com', pwd: 'password123', role: 'user', bookingIds: ['b1', 'b3'], requestBookingIds: ['b5'] },
    { userId: 'u2', name: 'Bob Jones',   email: 'bob@example.com',   pwd: 'password123', role: 'user', bookingIds: ['b2', 'b4', 'b6'], requestBookingIds: [] },
    { userId: 'o1', name: 'Carol Owner', email: 'carol@example.com', pwd: 'password123', role: 'owner', bookingIds: [], requestBookingIds: [] },
    { userId: 'o2', name: 'Dave Owner',  email: 'dave@example.com',  pwd: 'password123', role: 'owner', bookingIds: [], requestBookingIds: [] },
    { userId: 'o3', name: 'Eve Owner',   email: 'eve@example.com',   pwd: 'password123', role: 'owner', bookingIds: [], requestBookingIds: [] },
    { userId: 'o4', name: 'Frank Owner', email: 'frank@example.com', pwd: 'password123', role: 'owner', bookingIds: ['b7'], requestBookingIds: [] },
    { userId: 'o5', name: 'Grace Owner', email: 'grace@example.com', pwd: 'password123', role: 'owner', bookingIds: [], requestBookingIds: [] },
  ],

  owners: [
    {
      userId:           'o1',
      publicId:        'd290f1ee-6c54-4b01-90e6-d701748f0851',
      hasActiveSlot:  true,
      activeSlots:     [1, 2],
      privateSlots:    [3],
    },
    {
      userId:           'o2',
      publicId:        '8a514d79-9941-4560-a297-b8fdb2cba4a2',
      hasActiveSlot:  true,
      activeSlots:     [4, 5],
      privateSlots:    [],
    },
    {
      userId:           'o3',
      publicId:        'c4e75924-118e-4f36-b633-8998495bc27d',
      hasActiveSlot:  true,
      activeSlots:     [6],
      privateSlots:    [7],
    },
    {
      userId:           'o4',
      publicId:        'f9b3e12a-8745-4299-8d19-48209825b746',
      hasActiveSlot:  false,
      activeSlots:     [],
      privateSlots:    [],
    },
    {
      userId:           'o5',
      publicId:        '3b185b17-7682-4f9e-990a-a1b415a20822',
      hasActiveSlot:  false,
      activeSlots:     [],
      privateSlots:    [],
    },
  ],
 
  slots: [
    // ── Carol (o1) ──────────────────────────────────────────
    {
      slotId:    1,
      publicId:  'a1b2c3d4-0001-4000-8000-000000000001',
      ownerId:    'o1',
      date:       '2026-04-20',
      startTime: '09:00',
      endTime:   '10:00',
      userLimit: 5,
      currUser:  2,
      isPrivate: false,
      bookingIds: ['b1', 'b2'],
    },
    {
      slotId:    2,
      publicId:  'a1b2c3d4-0002-4000-8000-000000000002',
      ownerId:    'o1',
      date:       '2026-04-21',
      startTime: '14:00',
      endTime:   '15:30',
      userLimit: 3,
      currUser:  0,
      isPrivate: false,
      bookingIds: [],
    },
    {
      slotId:    3,
      publicId:  'a1b2c3d4-0003-4000-8000-000000000003',
      ownerId:    'o1',
      date:       '2026-04-22',
      startTime: '11:00',
      endTime:   '12:00',
      userLimit: 1,
      currUser:  0,
      isPrivate: true,
      bookingIds: [],
    },
 
    // ── Dave (o2) ───────────────────────────────────────────
    {
      slotId:    4,
      publicId:  'a1b2c3d4-0004-4000-8000-000000000004',
      ownerId:    'o2',
      date:       '2026-04-20',
      startTime: '10:00',
      endTime:   '11:00',
      userLimit: 10,
      currUser:  1,
      isPrivate: false,
      bookingIds: ['b3'],
    },
    {
      slotId:    5,
      publicId:  'a1b2c3d4-0005-4000-8000-000000000005',
      ownerId:    'o2',
      date:       '2026-04-23',
      startTime: '16:00',
      endTime:   '17:00',
      userLimit: 4,
      currUser:  1,
      isPrivate: false,
      bookingIds: ['b4'],
    },
 
    // ── Eve (o3) ────────────────────────────────────────────
    {
      slotId:    6,
      publicId:  'a1b2c3d4-0006-4000-8000-000000000006',
      ownerId:    'o3',
      date:       '2026-04-24',
      startTime: '08:00',
      endTime:   '09:00',
      userLimit: 6,
      currUser:  3,
      isPrivate: false,
      bookingIds: ['b5', 'b6', 'b7'],
    },
    {
      slotId:    7,
      publicId:  'a1b2c3d4-0007-4000-8000-000000000007',
      ownerId:    'o3',
      date:       '2026-04-25',
      startTime: '13:00',
      endTime:   '14:00',
      userLimit: 2,
      currUser:  0,
      isPrivate: true,
      bookingIds: [],
    },
  ],
 
  bookings: [
    { id: 'b1', userId: 'u1', slotId: 1, is_confirmed: true },
    { id: 'b2', userId: 'u2', slotId: 1, is_confirmed: true },
    { id: 'b3', userId: 'u1', slotId: 4, is_confirmed: true },
    { id: 'b4', userId: 'u2', slotId: 5, is_confirmed: false },
    { id: 'b5', userId: 'u1', slotId: 6, is_confirmed: true },
    { id: 'b6', userId: 'u2', slotId: 6, is_confirmed: true },
    { id: 'b7', userId: 'o4', slotId: 6, is_confirmed: true }
  ],


  proposals: [
    {
      proposalId: 'p1',
      ownerId:    'o1',
      userIds:    ['u1', 'u2'],
      title: "Midterm Review",
      options: [
        {
          optionId:   'p1-opt-a',
          date:       '2026-05-04',
          startTime: '09:00',
          endTime:   '10:00',
          votes:      ['u1', 'u2'],
        },
        {
          optionId:   'p1-opt-b',
          date:       '2026-05-05',
          startTime: '14:00',
          endTime:   '15:00',
          votes:      ['u1'],
        },
        {
          optionId:   'p1-opt-c',
          date:       '2026-05-06',
          startTime: '16:00',
          endTime:   '17:00',
          votes:      [],
        },
      ],
    },

    {
      proposalId: 'p2',
      ownerId:    'o2',
      title: "Exam time",
      userIds:    ['u1'],
      options: [
        {
          optionId:   'p2-opt-a',
          date:       '2026-05-10',
          startTime: '11:00',
          endTime:   '12:00',
          votes:      [],
        },
        {
          optionId:   'p2-opt-b',
          date:       '2026-05-11',
          startTime: '13:00',
          endTime:   '14:00',
          votes:      [],
        },
      ],
    },
  ],

};

module.exports = db;