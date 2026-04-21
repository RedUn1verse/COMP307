const { getDB } = require('../db');
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
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


  async create(ownerId, date, startTime, endTime, title, isBooked, isPrivate) {
    const db = getDB();
    slotId = genId();
    const newSlot = {
      slotId,
      ownerId,
      date,
      startTime,
      endTime,
      title,
      isBooked,
      isPrivate
    }
    await db.collection("slots").insertOne(newSlot);

    const targetArray = isPrivate ? "privateSlots" : "activeSlots";
    await db.collection("owners").updateOne(
    { userId: ownerId }, 
    { $push: { [targetArray]: slotId } }
    )
    
    return newSlot
  },
// ================== TO IMPLEMENT =============================
  update(slotId) {
    return
  },

  delete(slotId) {
    return
  },
};

module.exports = SlotModel;
