const BookingModel = require('../models/bookingmodel');
const BookingDto   = require('../dtos/bookingdto');
const UserDto      = require('../dtos/userdto');

const BookingController = {

  async getMyBookings(req, res) {
    const userId = req.user.userId;
    const bookings = await BookingModel.findBookingsByUser(userId);
	console.log(bookings)
    res.status(200).json(BookingDto.responseBookings(bookings));
  },

  


};

module.exports = BookingController;
