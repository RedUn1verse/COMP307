const SlotModel    = require('../models/slotmodel');
const UserModel    = require('../models/usermodel');
const BookingModel = require('../models/bookingmodel');
const SlotDto = require('../dtos/slotdto');
const EmailService = require('../services/emailservice');

const SlotController = {

  async getAvailableByOwner(req, res) {
    const owner = await UserModel.findOwnerByPublicId(req.params.ownerId);
    if (!owner) return res.status(404).json({ errors: ['Owner not found'] });

    const slots = await SlotModel.getActiveByOwner(owner.userId);

    res.json(SlotDto.responseSlots(slots));
  },

  async create(req, res) {

    const ownerId = req.user.userId;
    const owner = await UserModel.findById(ownerId);
    if (owner.role !== "owner") {
      return res.status(403).json({ error: 'Owner role required' });
    }

    const errors = [];
    const { date, startTime, endTime, title } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '') errors.push('title is required');
    if (typeof date !== 'string' || date.trim() === '') errors.push('date is required');
    if (typeof startTime !== 'string' || startTime.trim() === '') errors.push('startTime is required');
    if (typeof endTime !== 'string' || endTime.trim() === '') errors.push('endTime is required');
    if (errors.length) return res.status(400).json({ error: error[0] });
   

    const slot = await SlotModel.create(ownerId, date, startTime, endTime, title, false, true); // isBooked = false, isPrivate = true
    res.status(201).json(SlotDto.responseSlot(slot));
  },

  async getOwned(req, res) {

    const ownerId = req.user.userId;
    const owner = await UserModel.findById(ownerId);

    if (owner.role !== 'owner') {
      return res.status(403).json({ error: 'Owner role required' });
    }

    const slots = await SlotModel.getAllSlots(ownerId);
    const bookingIds = await UserModel.getAllBookingIds(ownerId);
    const bookings = await BookingModel.getListBooking(bookingIds);
    
    res.status(200).json(SlotDto.responseSlotsAndBooking(slots, bookings));
  },

  async activate(req, res) {
    const slot = await SlotModel.findById(req.body.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Only the owner can activate this slot' });
    }

    const updated = await SlotModel.setActive(slot.slotId);
    res.json(SlotDto.responseSlot(updated));
  },

  async findBySlotId(slotId) {
    const db = getDB();
    return await db.collection('slots').findOne({ slotId }) ?? null;
  },

  async deleteSlot(req, res) {
    const slot = await SlotModel.findBySlotId(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Only the owner can delete this slot' });
    }

    const bookingIds = await UserModel.getSlotBookingIds(slot.slotId);

    emails = []
    
    if (bookingIds){
      const bookings = await BookingModel.getListBooking(bookingIds);
      emails = bookings.map(booking => booking.email);
      Promise.all(bookingIds.map( bookingId => await BookingModel.delete(bookingId)))
    }

    const { bookedUser } = await SlotModel.delete(slot.slotId);

    let notifyUrl = null;
    if (emails) {
      const subject = `Your booking for "${slot.title}" has been cancelled`;
      const body = `Your booking on ${slot.date} from ${slot.startTime} to ${slot.endTime} for "${slot.title}" has been cancelled by the owner.\n\n`;
      notifyUrl = EmailService.buildMailto(bookedUser.email, subject, body);
    }

    res.json({ deleted: true, notifyUrl });
  },

  
};

module.exports = SlotController;
