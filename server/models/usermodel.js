const { getDB } = require('../db');

const UserModel = {

  async findById(userId) {
    const db = getDB();
    return await db.collection('users').findOne({ userId });
  },

  async getActiveOwners(){
    const db = getDB();

    const activeOwnerRecords = await db.collection('owners')
      .find({ has_active_slot: true })
      .toArray();

    const combinedActiveOwners = [];

    for (const owner of activeOwnerRecords) {
      const userDetails = await db.collection('users')
        .findOne({ userId: owner.userId });

      if (userDetails) {
        combinedActiveOwners.push({
          ...userDetails,
          public_id: owner.public_id
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

};

module.exports = UserModel;
