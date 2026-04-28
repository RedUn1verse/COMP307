// Author: Christina Vuong
// Student ID: 260929195
const BookingModel = require('../models/bookingmodel');
const SlotModel = require('../models/slotmodel');
const UserModel = require('../models/usermodel');
const BookingDto   = require('../dtos/bookingdto');
const UserDto      = require('../dtos/userdto');
const EmailService = require('../services/emailservice.js');


const BookingController = {

  async getMyBookings(req, res) {
    const userId = req.params.userId;
    const bookings = await BookingModel.findBookingsByUser(userId);
    res.status(200).json(BookingDto.responseBookings(bookings));
  },

  async deleteBooking(req, res) {
    userId = req.params.userId;
    const booking = await BookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }

    const slot = await SlotModel.findById(booking.slotId);
    const owner = slot ? await UserModel.findById(slot.ownerId) : null;

    await BookingModel.delete(booking.bookingId, userId, slot.ownerId);


    let url = "";
    if (slot && owner) {
      const subject = `A booking for "${slot.title}" has been cancelled`;
      const body = `The booking on ${slot.date} from ${slot.startTime} to ${slot.endTime} for "${slot.title}" has been cancelled by the user. The slot is now available again.\n\n`;
      url = EmailService.buildMailto(owner.email, subject, body);
    }

    res.status(200).json(url);
  },

  async emailBookedUser(req, res) {
    userId = req.params.userId
    const booking = await BookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const slot = await SlotModel.findById(booking.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the slot owner can email the booked user' });
    }
	const bookedUser = await UserModel.findById(booking.userId);
    if (!bookedUser) return res.status(404).json({ error: 'Booked user not found' });

    const url = EmailService.buildMailto(bookedUser.email, "","");
    res.status(200).json(url);
	
},

};

module.exports = BookingController;
