const SlotModel    = require('../models/slotmodel');
const UserModel    = require('../models/usermodel');
const SlotDto = require('../dtos/slotdto');

const SlotController = {

  async getAvailableByOwner(req, res) {
    const owner = await UserModel.findOwnerByPublicId(req.params.owner_id);
    if (!owner) return res.status(404).json({ errors: ['Owner not found'] });

    const slots = await SlotModel.getActiveByOwner(owner.userId);

    res.json(SlotDto.responseSlots(slots));
  },

  async create(req, res) {
    const ownerId = req.user.userId;
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Owner role required' });
    }

    const errors = [];
    const { date, startTime, endTime, title } = body ?? {};
    if (typeof title !== 'string' || title.trim() === '') errors.push('title is required');
    if (typeof date !== 'string' || date.trim() === '') errors.push('date is required');
    if (typeof startTime !== 'string' || startTime.trim() === '') errors.push('startTime is required');
    if (typeof endTime !== 'string' || endTime.trim() === '') errors.push('endTime is required');
    if (errors.length) return res.status(400).json({ error: error[0] });
   

    const slot = await SlotModel.create(ownerId, date, startTime, endTime, title, false, true); // isBooked = false, isPrivate = true
    res.status(201).json(SlotDto.responseSlot(slot));
  },
};

module.exports = SlotController;
