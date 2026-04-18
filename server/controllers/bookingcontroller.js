const BookingModel = require('../models/bookingmodel');
const BookingDto   = require('../dtos/bookingdto');
const UserDto      = require('../dtos/userdto');

BookingController = {

  	async getMyBookings(req, res) {
    		const userId = UserDto.validateUserId(req.user.userId);
    		if (!userId) return res.status(400).json({ error: 'Bad User Id' });
    		// 
    		const bookings = BookingModel.findByUser(userId);
    		res.json(BookingDto.responseBookings(bookings));
  	},


};

module.exports = BookingController;
