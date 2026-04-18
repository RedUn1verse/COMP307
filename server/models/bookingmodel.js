const { getDB } = require('../db');
const BookingModel = {
  
async findByUser(userId) {
	const db = getDB();

	const user = await db.collection('users').findOne({ userId });
	if (!user) return [];
	const resolve = async (bookingId, status) => {
		const booking = await db.collection('bookings')
			.findOne({ bookingId: bookingId });
		if (!booking) return null;
		const slot = await db.collection('slots')
			.findOne({ slot_id: Number(booking.slot_id) }) ?? null;
		const owner = slot
			? await db.collection('users')
			.findOne({ userId: slot.ownerId }) ?? null
			: null;
		return { ...booking, status, slot, owner };
	};
	const confirmed = await Promise.all(
		(user.bookings_ids ?? []).map(id => resolve(id, 'confirmed'))
	);
	const unconfirmed = await Promise.all(
		(user.request_booking_ids ?? []).map(id => resolve(id, 'unconfirmed'))
	);
	return [...confirmed, ...unconfirmed].filter(Boolean);
},

async create({userId, slotId}) {
	const db = getDB();
	const newBooking = {
		bookingId: Date.now(),
		userId,
		slot_id: slotId,
		status: 'confirmed'
	}
	await db.collection('bookings').insertOne(newBooking);

	await db.collection('users').updateOne(
		{userId},
		{ $push: { bookings_ids: newBooking.bookingId } }
	);

	return newBooking;
},

async delete({bookingId, userId}) {
	const db = getDB();
	
	const booking = await db.collection('bookings').findOne({bookingId});
	if (!booking) return false;
	await db.collection('bookings').deleteOne({ bookingId });
	await db.collection('users').updateOne(
		{ userId },
		{
      			$pull: {
        			bookings_ids: bookingId,
        			request_booking_ids: bookingId
      			}
    		}
  	);

  	return true;
},

};

module.exports = BookingModel;
