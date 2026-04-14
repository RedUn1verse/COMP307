const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');

const SlotModel = {

  async findById(slotId) {
    const db = getDB();
    return await db.collection('slots')
      .findOne({ slot_id: Number(slotId) }) ?? null;
  },

  async findByPublicId(public_id) {
    const db = getDB();
    return await db.collection('slots')
      .findOne({ public_id }) ?? null;
  },

  async getActiveByOwner(ownerId) {
    const db = getDB();
    return await db.collection('slots')
      .find({
        ownerId: ownerId,
        is_private: false,
        $expr: { $lt: ["$curr_user", "$user_limit"] }
      })
      .toArray();
  },

  async getByOwner(ownerId) {
    const db = getDB();
    return await db.collection('slots')
      .find({ ownerId: ownerId })
      .toArray();
  },

// ================== TO IMPLEMENT =============================
   create() {
    return
  },

  update(slotId) {
    return
  },

  delete(slotId) {
    return
  },
};

module.exports = SlotModel;
