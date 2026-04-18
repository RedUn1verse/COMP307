const SlotDto = require('./slotdto');

class BookingDto {
  constructor(booking) {
    this.bookingId  = booking.bookingId;
    this.owner_name = booking.owner?.name ?? null;
    this.date       = booking.slot?.date ?? null;
    this.start_time = booking.slot?.start_time ?? null;
    this.end_time   = booking.slot?.end_time ?? null;
    this.status     = booking.status;
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
