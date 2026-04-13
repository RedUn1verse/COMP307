const db = {
    users: [
    { userId: 'u1', name: 'Alice Smith', email: 'alice@example.com', pwd: 'password123', role: 'user', bookings: [], request_booking: [] },
    { userId: 'u2', name: 'Bob Jones',   email: 'bob@example.com',   pwd: 'password123', role: 'user',  bookings: [], request_booking: [] },
    { userId: 'o1', name: 'Carol Owner', email: 'carol@example.com', pwd: 'password123', role: 'owner', bookings: [], request_booking: [] },
    { userId: 'o2', name: 'Dave Owner',  email: 'dave@example.com',  pwd: 'password123', role: 'owner', bookings: [], request_booking: [] },
    { userId: 'o3', name: 'Eve Owner',   email: 'eve@example.com',   pwd: 'password123', role: 'owner', bookings: [], request_booking: [] },
    { userId: 'o4', name: 'Frank Owner', email: 'frank@example.com', pwd: 'password123', role: 'owner', bookings: [], request_booking: [] },
    { userId: 'o5', name: 'Grace Owner', email: 'grace@example.com', pwd: 'password123', role: 'owner', bookings: [], request_booking: [] },
    ],

    owners: [
        { 
        userId: 'o1', 
        public_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        active_slot: false, 
        active_slots: [], 
        private_slots: []
        },
        { 
        userId: 'o2', 
        public_id: '8a514d79-9941-4560-a297-b8fdb2cba4a2',
        active_slot: true, 
        active_slots: [], 
        private_slots: []
        },
        { 
        userId: 'o3', 
        public_id: 'c4e75924-118e-4f36-b633-8998495bc27d',
        active_slot: true, 
        active_slots: [], 
        private_slots: []
        },
        { 
        userId: 'o4', 
        public_id: 'f9b3e12a-8745-4299-8d19-48209825b746',
        active_slot: false, 
        active_slots: [], 
        private_slots: []
        },
        { 
        userId: 'o5', 
        public_id: '3b185b17-7682-4f9e-990a-a1b415a20822',
        active_slot: false, 
        active_slots: [], 
        private_slots: []
        }
    ]
  
};

 
module.exports = db;