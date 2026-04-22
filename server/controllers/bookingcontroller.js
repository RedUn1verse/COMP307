const BookingModel = require('../models/bookingmodel');
const SlotModel = require('../models/slotmodel');
const UserModel = require('../models/usermodel');
const BookingDto   = require('../dtos/bookingdto');
const UserDto      = require('../dtos/userdto');
const EmailService = require('../services/emailservice.js');


const BookingController = {

  async getMyBookings(req, res) {
    const userId = req.user.userId;

    const bookings = await BookingModel.findBookingsByUser(userId);
	console.log(bookings)
    res.status(200).json(BookingDto.responseBookings(bookings));
  },

  async deleteBooking(req, res) {

    const booking = await BookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }

    const slot = await SlotModel.findById(booking.slotId);
    const owner = slot ? await UserModel.findById(slot.ownerId) : null;

    await BookingModel.delete(booking.bookingId, req.user.userId, slot.ownerId);


    let url = "";
    if (slot && owner) {
      const subject = `A booking for "${slot.title}" has been cancelled`;
      const body = `The booking on ${slot.date} from ${slot.startTime} to ${slot.endTime} for "${slot.title}" has been cancelled by the user. The slot is now available again.\n\n`;
      url = EmailService.buildMailto(owner.email, subject, body);
    }

    res.status(200).json(url);
  },


};

module.exports = BookingController;
