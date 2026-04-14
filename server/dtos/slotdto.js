class SlotResponseDto {
  constructor(slot) {
    this.public_id   = slot.public_id;
    this.date        = slot.date;
    this.start_time   = slot.start_time;
    this.end_time     = slot.end_time;
  }
 
  static responseSlot(dbSlot){
    if (!dbSlot) return null;
    return new SlotResponseDto(dbSlot);
}
 
  static responseSlots(dbSlots) {
    return dbSlots.map(SlotResponseDto.responseSlot);
  }
}
 


module.exports = SlotResponseDto
