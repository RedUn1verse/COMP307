const SlotModel    = require('../models/slotmodel');
const UserModel    = require('../models/usermodel');
const BookingModel = require('../models/bookingmodel');
const SlotDto = require('../dtos/slotdto');
const EmailService = require('../services/emailservice');

const SlotController = {

  async getAvailableByOwner(req, res) {
    const owner = await UserModel.findOwnerByPublicId(req.params.publicId);
    if (!owner) return res.status(404).json({ errors: ['Owner not found'] });

    const slots = await SlotModel.getActiveByOwner(owner.userId);

    res.json(SlotDto.responseSlots(slots));
  },

  async create(req, res) {

    const ownerId = req.params.userId;
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

    const ownerId = req.params.userId;
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
    const slot = await SlotModel.findById(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.ownerId !== req.params.userId) {
      return res.status(403).json({ error: 'Only the owner can activate this slot' });
    }

    const updated = await SlotModel.setActive(slot.slotId);
    res.json(SlotDto.responseSlot(updated));
  },


  async deleteSlot(req, res) {
    const slot = await SlotModel.findById(req.params.slotId);
    const eSlot = await UserModel.enrichOwnerName(slot);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.ownerId !== req.params.userId) {
      return res.status(403).json({ error: 'Only the owner can delete this slot' });
    }    

    const bookingIds = await UserModel.getSlotBookingIds(slot.ownerId, slot.slotId);

    emails = []
  
    if (bookingIds && bookingIds.length > 0) {
      const bookings = await BookingModel.getListBooking(bookingIds);
      emails = bookings.map(booking => booking.userEmail); 
      await Promise.all(bookingIds.map(bookingId => BookingModel.delete(bookingId)));
    }
    
    await SlotModel.delete(slot.slotId);

    url = ""
    if (emails && emails.length > 0) {
      // Join array of emails into a single string: "email1@test.com,email2@test.com"s
      const to = emails.join(',');
      const subject = `Your booking for "${slot.title}" has been cancelled`;
      const body = `Your booking on ${slot.date} from ${slot.startTime} to ${slot.endTime} for "${slot.title}" has been cancelled by ${eSlot.ownerName}.\n\n`;
      url = EmailService.buildMailto(to, subject, body);

    }
    res.status(200).json({url});
  },

  async book(req, res) {

    const bookerId = req.params.userId;
    const slot = await SlotModel.findById(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.isPrivate) return res.status(403).json({ error: 'Slot is not active' });
    if (slot.isBooked) return res.status(400).json({ error: 'Slot is already booked' });
    if (slot.ownerId === bookerId) return res.status(400).json({ error: 'Cannot book your own slot' });

    const booking = await SlotModel.book(slot.slotId, bookerId);

    const owner = await UserModel.findById(slot.ownerId);

    const to = owner.email;
    const subject = `New booking for ${slot.title}`
    const body = `You have a booking for ${slot.date} from ${slot.startTime} to ${slot.endTime} for ${slot.title}.\n\n`;
  
    const url = EmailService.buildMailto(to, subject, body);

    res.status(201).json({
      bookingId: booking.bookingId,
      slot: SlotDto.responseSlot({...slot, isBooked: true}),
      url,
    });
  },

  async emailOwner(req, res) {
    const slot = await SlotModel.findById(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    const owner = await UserModel.findById(slot.ownerId);

    const url = EmailService.buildMailto(owner.email, "", "");
    res.status(200).json(url);
  },
};

module.exports = SlotController;
