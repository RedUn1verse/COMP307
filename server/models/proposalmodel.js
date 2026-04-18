const db = require('./dummy_db');
const BookingModel = require('./bookingmodel');


const findRaw = (proposalId) =>
  db.proposals.find(p => p.proposalId === proposalId) ?? null;

const nameFor = (userId) =>
  db.users.find(u => u.userId === userId)?.name ?? null;

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

};

module.exports = ProposalModel;