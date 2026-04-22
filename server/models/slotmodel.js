const { getDB } = require('../db');
const BookingModel = require('./bookingmodel');
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);



function addDays(dateStr, days) {
  const d = dayjs(dateStr, 'YYYY-MM-DD', true);
  if (!d.isValid()) return null;
  return d.add(days, 'day').format('YYYY-MM-DD');
}

const SlotModel = {

  async findById(slotId) {
    const db = getDB();
    return await db.collection('slots')
      .findOne({slotId}) ?? null;
  },

  async getActiveByOwner(ownerId) {
    const db = getDB();
    return await db.collection('slots')
      .find({
        ownerId: ownerId,
        isPrivate: false,
        isBooked: false,
      })
      .toArray();
  },

  async getByOwner(ownerId) {
    const db = getDB();
    return await db.collection('slots')
      .find({ ownerId: ownerId })
      .toArray();
  },

   async getAllSlots(ownerId) {
    const db = getDB();
    return await db.collection('slots').find({ ownerId }).toArray();
  },

  async createR(ownerId, date, startTime, endTime, title, isBooked, isPrivate, recurrence = 1) {
    const dates = [];
    for (let i = 0; i < recurrence; i++) {
      const d = addDays(date, i * 7);
      if (!d) return null;
      dates.push(d);
    }

    const slots = [];
    for (const d of dates) {
      const slot = await SlotModel.create(ownerId, d, startTime, endTime, title, isBooked, isPrivate);
      slots.push(slot);
    }
    return slots;
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

async setActive(slotId) {
    const db = getDB();
    const slot = await db.collection('slots').findOne({ slotId });
    if (!slot) return null;
    await db.collection('slots').updateOne(
      { slotId },
      { $set: { isPrivate: false } }
    );
    await db.collection('owners').updateOne(
      { userId: slot.ownerId },
      { $pull: { privateSlots: slotId }, $push: { activeSlots: slotId } }
    );
    return { ...slot, isPrivate: false };
  },


  async delete(slotId) {
    const db = getDB();
    const slot = await db.collection('slots').findOne({ slotId });
    if (!slot) return null;

    await db.collection('slots').deleteOne({ slotId });
    await db.collection('owners').updateOne(
      { userId: slot.ownerId },
      { $pull: { activeSlots: slotId, privateSlots: slotId } }
    );

    return slot;
  },

  async book(slotId, userId) {
    const db = getDB();
    const slot = await db.collection('slots').findOne({ slotId });
    if (!slot) return null;

    const booking = await BookingModel.create(userId, slot.ownerId, slot.slotId)
    await db.collection('slots').updateOne(
      { slotId },
      { $set: { isBooked: true } }
    );
   
    return booking;
  },

};

module.exports = SlotModel;
