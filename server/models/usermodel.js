const { getDB } = require('../db');
const db = require('./dummy_db');
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const UserModel = {

  async findById(userId) {
    const db = getDB();
    return await db.collection('users').findOne({ userId });
  },

  async getActiveOwners(){
    const db = getDB();

    const activeOwnerRecords = await db.collection('owners')
      .find({"activeSlots.0":{ $exists: true }})
      .toArray();

    const combinedActiveOwners = [];

    for (const owner of activeOwnerRecords) {
      const userDetails = await db.collection('users')
        .findOne({ userId: owner.userId });

      if (userDetails) {
        combinedActiveOwners.push({
          ...userDetails,
          publicId: owner.publicId
        });
      }
    }
    return combinedActiveOwners;
  },

  async findOwnerByPublicId(public_id) {
    const db = getDB();

    const ownerRecord = await db.collection('owners')
      .findOne({ public_id });

    if (!ownerRecord) return null;

    return await db.collection('users')
      .findOne({ userId: ownerRecord.userId, role: 'owner' }) ?? null;
  },

  async findByEmail(email) {
    const db = getDB();
    if (typeof email !== 'string') return null;
    const needle = email.trim().toLowerCase();
    return db.collection('users').findOne({email: needle});
  },

  async createUser({ name, email, password, job, role}) {
    const db = getDB();
    const userId = genId();
    const newUser = {
      userId,
      name,
      email,
      pwd: password,
      role,
      job,
      bookingsIds: [],
      requestBookingIds: [],
    };
    
    await db.collection('users').insertOne(newUser);

    if (role === 'owner') {
      const ownerRecord = {
        userId,
        publicId: genId(),
        activeSlots: [],
        privateSlots: [],
      };
      await db.collection('owners').insertOne(ownerRecord);
    }

    return newUser;
  },

};

module.exports = UserModel;
