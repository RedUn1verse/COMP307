// Author: Christina Vuong
// Student ID: 260929195
class SlotResponseDto {
  constructor(slot) {
    this.slotId = slot.slotId;
    this.title   = slot.title;
    this.date        = slot.date;
    this.startTime   = slot.startTime;
    this.endTime     = slot.endTime;
    this.isBooked = slot.isBooked;
    this.isPrivate = slot.isPrivate;
  }
 
  static responseSlot(dbSlot){
    if (!dbSlot) return null;
    return new SlotResponseDto(dbSlot);
}
 
  static responseSlots(dbSlots) {
    return dbSlots.map(SlotResponseDto.responseSlot);
  }

  static responseSlotsAndBooking(slots, bookings) {
    // Map<slotId, Booking[]>
    const bookingsBySlotId = new Map();
    
    for (const booking of bookings ?? []) {
      if (booking?.slotId) {
        
        if (!bookingsBySlotId.has(booking.slotId)) {
          bookingsBySlotId.set(booking.slotId, []);
        }
        bookingsBySlotId.get(booking.slotId).push(booking);
      }
    }

    return (slots ?? []).map(slot => {
      
      const slotBookings = bookingsBySlotId.get(slot.slotId) ?? [];
      
      return {
        slotId:    slot.slotId,
        title:     slot.title,
        date:      slot.date,
        startTime: slot.startTime,
        endTime:   slot.endTime,
        isPrivate: slot.isPrivate,
        isBooked:  slot.isBooked,
        bookings:  slotBookings.map(booking => ({
          bookingId: booking.bookingId,
          userName:  booking.userName ?? null,
          userEmail: booking.userEmail ?? null,
        }))
      };
    });
  }
}
 


module.exports = SlotResponseDto
