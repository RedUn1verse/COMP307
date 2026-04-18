const db = require('./dummy_db');
const BookingModel = require('./bookingmodel');


const findRaw = (proposalId) =>
  db.proposals.find(p => p.proposalId === proposalId) ?? null;

const enrich = (proposal) => {
  if (!proposal) return null;
  const owner = db.users.find(u => u.userId === proposal.ownerId) ?? null;
  return { ...proposal, ownerName: owner?.name ?? null };
};


const ProposalModel = {

  findForUser(userId) {
    return db.proposals.filter(p => p.userIds.includes(userId)).map(enrich);
  },



};

module.exports = ProposalModel;