class MeetingDto {

  static responseForUser(r) {
    if (!r) return null;
    return {
      ownerName: r.ownerName,
      title: r.title,
      message:    r.message,
      date:       r.date,
      startTime: r.startTime,
      endTime:   r.endTime,
      
    };
  }
  
  static responseForOwner(r) {
    if (!r) return null;
    return {
      meetingId: r.meetingId,
      userName:  r.userName,
      title: r.title,
      message:    r.message,
      date:       r.date,
      startTime: r.startTime,
      endTime:   r.endTime,
    };
  }


  static responseListForOwner(list) {
    if(!list) return [];
    return list.map(MeetingDto.responseForOwner);
  }

  static responseListForUser(list){
    if(!list) return [];
    return list.map(MeetingDto.responseForUser);
  }
}


module.exports = MeetingDto;
