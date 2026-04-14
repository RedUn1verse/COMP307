const { v4: uuidv4 } = require('uuid');
// TODO: Replace db with Real db and appropriate function impl
const db = require('./dummy_db');
 
const SlotModel = {

  findById(slotId) {
    return db.slots.find(s => s.slot_id === Number(slotId)) ?? null;
  },
 
  findByPublicId(public_id) {
    return db.slots.find(s => s.public_id === public_id) ?? null;
  },
 
  getActiveByOwner(ownerId) {
    return db.slots.filter(s =>
      s.ownerId    === ownerId  &&
      !s.is_private             &&
      s.curr_user  < s.user_limit
    );
  },
 
  getByOwner(ownerId) {
    return db.slots.filter(s => s.ownerId === ownerId);
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