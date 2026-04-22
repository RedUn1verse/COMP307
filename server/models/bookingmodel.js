const { getDB } = require('../db');
const UserModel = require('./usermodel');
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const BookingModel = {

async findById(bookingId) {
	const db = getDB();
	return await db.collection('bookings').findOne({ bookingId }) ?? null;
},
  
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

async create(userId, ownerId, slotId) {
	const db = getDB();
	const bookingId = genId();

	const newBooking = {
		bookingId,
		userId,
		slotId,
	}

	await db.collection('bookings').insertOne(newBooking);

	await db.collection('users').updateMany(
		{
		userId: {$in: [userId, ownerId]},
		},
		{ $push: { bookingIds: bookingId} }
	);

	return newBooking;
},

async delete(bookingId, userId, ownerId) {
	const db = getDB();

	const booking = await db.collection('bookings').findOne({ bookingId });
	if (!booking) return false;

	await db.collection('bookings').deleteOne({ bookingId });
	await db.collection('slots').updateOne(
		{ slotId: booking.slotId },
		{ $set: { isBooked: false} }
	);
	await db.collection('users').updateMany(
        { 
            userId: { $in: [userId, ownerId] } 
        },
        {
            $pull: {
                bookingIds: bookingId, 
            }
        }
    );

	return true;
},

async getListBooking(bookingIds) {
	const db = getDB();
	if (!Array.isArray(bookingIds) || bookingIds.length === 0) return [];

	const bookings = await db.collection('bookings')
		.find({ bookingId: { $in: bookingIds } })
		.toArray();

	return Promise.all(bookings.map(async (booking) => {
		const user = await db.collection('users').findOne({ userId: booking.userId });
		return {
			...booking,
			userName:  user?.name  ?? null,
			userEmail: user?.email ?? null,
		};
	}));
},


async findBookingsByUser(userId) {
	const db = getDB();
	const bookingIds = await UserModel.getAllBookingIds(userId);

	const bookings = await db.collection('bookings').find({ 
        bookingId: { $in: bookingIds } 
    }).toArray();
	return Promise.all(bookings.map(async (booking) => {
		const slot = await db.collection('slots').findOne({ slotId: booking.slotId }) ?? null;
		let owner = null;
		if (slot) {
			const ownerUser = await db.collection('users').findOne({ userId: slot.ownerId }) ?? null;
			const ownerRecord = await db.collection('owners').findOne({ userId: slot.ownerId }) ?? null;
			if (ownerUser || ownerRecord) {
				owner = { ...(ownerUser ?? {}), publicId: ownerRecord?.publicId ?? null };
			}
		}
		return { ...booking, slot, owner };
	}));
},

};

module.exports = BookingModel;
