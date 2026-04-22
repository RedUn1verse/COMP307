const db = require('./dummy_db');
const { getDB } = require('../db');
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const UserModel = require('./usermodel');
const SlotModel = require('./slotmodel');
const BookingModel = require('./bookingmodel');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);



function addDays(dateStr, days) {
  const d = dayjs(dateStr, 'YYYY-MM-DD', true);
  if (!d.isValid()) return null;
  return d.add(days, 'day').format('YYYY-MM-DD');
}

const ProposalModel = {

  async findForUser(userId) {
    const db = getDB();
    const proposals = await db.collection('proposals').find({ userIds: userId }).toArray();
    return Promise.all(proposals.map(UserModel.enrichOwnerName));
  },

  async findForOwner(ownerId) {
    const db = getDB();
    const proposals = await db.collection('proposals').find({ ownerId }).toArray();
    return Promise.all(proposals.map(p => ProposalModel.enrichInvitedUsers(p)));
  },

  async create(ownerId, title, userIds, options) {
    const db = getDB();
    const proposal = {
      proposalId: genId(),
      ownerId,
      title,
      userIds: [...userIds],
      options: options.map(o => ({
        optionId:  genId(),
        date:      o.date,
        startTime: o.startTime,
        endTime:   o.endTime,
        votes:     [],
      })),
    };
    await db.collection('proposals').insertOne(proposal);
    return ProposalModel.enrichInvitedUsers(proposal);
  },

  async select(proposalId, optionId) {

    const proposal = await ProposalModel.findById(proposalId);
    if (!proposal) return null;
    const option = proposal.options.find(o => o.optionId === optionId);
    if (!option) return null;


    const slot = await SlotModel.create(
      proposal.ownerId,
      option.date,
      option.startTime,
      option.endTime,
      proposal.title,
      true,
      true,
    );

    await Promise.all(proposal.userIds.map(uid =>
      BookingModel.create(uid, proposal.ownerId, slot.slotId )
    ));

    await ProposalModel.delete(proposalId);
    return proposal;
  },

  async selectR(proposalId, optionId, recurrence = 1) {

    const proposal = await ProposalModel.findById(proposalId);
    if (!proposal) return null;
    const option = proposal.options.find(o => o.optionId === optionId);
    if (!option) return null;

    const dates = [];
    for (let i = 0; i < recurrence; i++) {
      const d = addDays(option.date, i * 7);
      if (!d) return null;
      dates.push(d);
    }

    const slots = [];
    for (const date of dates) {
      const slot = await SlotModel.create(
        proposal.ownerId,
        date,
        option.startTime,
        option.endTime,
        proposal.title,
        true,
        true
      );
      await Promise.all(proposal.userIds.map(uid =>
        BookingModel.create(uid, proposal.ownerId, slot.slotId)
      ));
      slots.push(slot);
    }
    console.log(slots)
    await ProposalModel.delete(proposalId);
    return { ...proposal, slots };
  },



  async vote(proposalId, userId, optionIds) {
    const db = getDB();
    const proposal = await ProposalModel.findById(proposalId);

    await db.collection('proposals').updateOne(
      { proposalId },
      { $addToSet: { 'options.$[opt].votes': userId } },
      { arrayFilters: [{ 'opt.optionId': { $in: optionIds } }] }
    );

    const updated = await ProposalModel.findById(proposalId);
    return await UserModel.enrichOwnerName(updated);
  },


  
  // ==============HELPER FUNCTIONS ==============
  // TODO : Move to user Model

  
  async enrichInvitedUsers(proposal) {
    if (!proposal) return null;
    const db = getDB();
    const users = await db.collection('users').find({ userId: { $in: proposal.userIds } }).toArray();
    const nameMap = Object.fromEntries(users.map(u => [u.userId, u.name]));
    return { ...proposal, invitedUsers: proposal.userIds.map(id => nameMap[id] ?? null) };
  },

  async findById(proposalId) {
    const db = getDB();
    return await db.collection('proposals').findOne({ proposalId }) ?? null;
  },

  async delete(proposalId) {
    const db = getDB();
    await db.collection('proposals').deleteOne({ proposalId });
  },
}

module.exports = ProposalModel;