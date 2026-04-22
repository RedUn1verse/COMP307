const SlotDto = require('./slotdto');

class BookingDto {
  constructor(booking) {
    this.bookingId  = booking.bookingId;
    this.title      = booking.slot?.title     ?? null;
    this.date       = booking.slot?.date      ?? null;
    this.startTime  = booking.slot?.startTime ?? null;
    this.endTime    = booking.slot?.endTime   ?? null;
    this.ownerName     = booking.owner?.name     ?? null;
    this.ownerEmail    = booking.owner?.email    ?? null;
    this.ownerPublicId = booking.owner?.publicId ?? null;
  }

  static responseBooking(booking) {
    if (!booking) return null;
    return new BookingDto(booking);
  }

  static responseBookings(bookings) {
    return bookings.map(BookingDto.responseBooking);
  }
}

module.exports = BookingDto;
