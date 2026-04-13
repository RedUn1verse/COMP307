const db = {
  users: [
    { userId: 'u1', name: 'Alice Smith', email: 'alice@example.com', pwd: 'password123', role: 'user', bookings: [], request_booking: [],},
    { userId: 'u2', name: 'Bob Jones',   email: 'bob@example.com',   pwd: 'password123', role: 'user' , bookings: [], request_booking: [],},
    { userId: 'o1', name: 'Carol Owner', email: 'carol@example.com', pwd: 'password123', role: 'owner', bookings: [], request_booking: [],},
    { userId: 'o2', name: 'Dave Owner',  email: 'dave@example.com',  pwd: 'password123', role: 'owner', bookings: [], request_booking: [],},
  ],

  owners: [
    { userId: 'o1', active_slot:[], private_slot:[]},
  ]
  
};

 
module.exports = db;