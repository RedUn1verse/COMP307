const db = require('./dummy_db');
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);


const findRaw = (proposalId) =>
  db.proposals.find(p => p.proposalId === proposalId) ?? null;

const nameFor = (userId) =>
  db.users.find(u => u.userId === userId)?.name ?? null;

const findUser = (userId) =>
  db.users.find(u => u.userId === userId) ?? null;

const enrichOwner = (proposal) => {
  if (!proposal) return null;
  return { ...proposal, ownerName: nameFor(proposal.ownerId)  };
};

const enrichUser = (proposal) => {
    if (!proposal) return null;
    return {...proposal, invitedUsers: proposal.userIds.map(nameFor)}
}

const ProposalModel = {

  findForUser(userId) {
    return db.proposals.filter(p => p.userIds.includes(userId)).map(enrichOwner);
  },

  findForOwner(ownerId){
    return db.proposals.filter(p => p.ownerId === ownerId).map(enrichUser);
  },

  findById(proposalId) {
    return findRaw(proposalId);
  },

  create(ownerId, title, userIds, options) {
    const proposal = {
      proposalId: genId(),
      ownerId,
      title,
      userIds: [...userIds],
      options: options.map(o => ({
        optionId:   genId(),
        date:       o.date,
        startTime: o.startTime,
        endTime:   o.endTime,
        votes:      [],
      })),
    };
    db.proposals.push(proposal);
    inserted_proposal = db.proposals.find(p => p.proposalId === proposal.proposalId)
    
    return enrichUser(inserted_proposal);
  },

  delete(proposalId){
    db.proposals = db.proposals.filter(p => p.proposalId !== proposalId);
  },

  select(proposalId, optionId) {
    
    const proposal = findRaw(proposalId);
    if (!proposal) return null;
    const option = proposal.options.find(o => o.optionId === optionId);
    if (!option) return null;

    const slot = DummySlotModel.create({
      ownerId:    proposal.ownerId,
      date:       option.date,
      startTime: option.startTime,
      endTime:   option.endTime,
      userTimit: Number.MAX_VALUE,
      currUser:  proposal.userIds.length,
      isPrivate: true,
    });

    // TODO: Replace with real BookingModel
    // We make the booking confirmed
    ownerBooking = DummyBookingModel.create(proposal.ownerId, slot.slot_id, true);
    proposal.userIds.forEach(uid => {
      DummyBookingModel.create(uid, slot.slot_id, true);
    });

    ProposalModel.delete(proposalId);

    return {...ownerBooking, slot:slot, owner:findUser(slot.ownerId)};
  },

  hasVoted(proposal, userId) {
    return proposal.options.some(o => o.votes.includes(userId));
  },

  vote(proposalId, userId, optionIds) {
    const proposal = findRaw(proposalId);
    if (!proposal) return { error: 'proposal does not exist' };
    if (!proposal.userIds.includes(userId))      return { error: 'user is not invited' };
    if (this.hasVoted(proposal, userId))         return { error: 'already_voted' };

    optionIds.forEach(oid => {
        const opt = proposal.options.find(o => o.optionId === oid);
        if (opt && !opt.votes.includes(userId)) opt.votes.push(userId);
        });

    return {proposal: enrichOwner(proposal)};
  },

};

const DummyBookingModel = {

  create(userId, slotId){
    bookingId = genId();
    db.bookings.push({
      bookingId: bookingId,
      userId: userId,
      slotId: slotId,
    })
    return db.bookings.find(b=> b.bookingId === bookingId);
  },
}

const DummyUserModel = {

  addBooking(userId, bookingId){
    const user = db.users.find(u => u.userId === targetUserId);
    user.bookingIds.push(booking.id);

  }

}

const DummySlotModel = {
    create({ ownerId, date, startTime, endTime, userLimit, isPrivate = true, currUser = 0 }) {
    const slot = {
      slotId:    genId(),
      ownerId: ownerId,
      date: date,
      startTime: startTime,
      endTime: endTime,
      userLimit: userLimit,
      currUser: currUser,
      isPrivate: isPrivate,
      confirmedUserIds: [],
    };
    db.slots.push(slot);
    return slot;
  },
}

module.exports = ProposalModel;