const db = require('../models/dummy_db');
const ProposalModel = require('../models/proposalmodel');
const ProposalDto   = require('../dtos/proposaldto');
const BookingDto   = require('../dtos/bookingdto');
const UserModel = require('../models/usermodel');
const EmailService = require('../services/emailservice.js');

// TODO: Move to user Model + Convert to MongoDB
const findUser = (userId) => db.users.find(u => u.userId === userId) ?? null;
const findUserByName = (name)  => db.users.find(u => u.name?.toLowerCase() === name.toLowerCase()) ?? null;


const ProposalController = {

    async test(req, res){

        const { optionId, reccurence } = req.body ?? {};
        if (!optionId) return res.status(400).json({ error: 'optionId required' });

        const recurrence = reccurence ?? 1;
        if (!Number.isInteger(recurrence) || recurrence < 1) {
            return res.status(400).json({ error: 'reccurence must be a positive integer' });
        }

        p = await ProposalModel.findById(req.params.proposalId);
        date = p.options[0].date
        console.log(date)
        const dates = [];

        for (let i = 0; i < recurrence; i++) {
            
            const d = addDays(date, i * 7);
            console.log(d)
            if (!d) return null;
            dates.push(d);
        }

        return res.json("done")
    },
    
    async getUserProposals(req, res) {
        const userId = req.params.userId;
        const proposalList = await ProposalModel.findForUser(userId);
        res.status(200).json(ProposalDto.responseListForUser(proposalList, userId));
        
    },
    
    async getOwnerProposals(req, res) {
        const ownerId = req.params.userId;
        const owner = await UserModel.findById(ownerId)

        if (owner.role !== "owner") return res.status(400).json("You are not an owner")
        const proposalList = await ProposalModel.findForOwner(ownerId);
        res.status(200).json(ProposalDto.responseListForOwner(proposalList));
    },

    async create(req, res){
        const ownerId = req.params.userId;
        const owner = await UserModel.findById(ownerId)

        if (owner.role !== "owner") return res.status(400).json("You are not an owner")
        const { title, userNames, options } = req.body ?? {};
        if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'title is required' });
        }
        if (!Array.isArray(userNames) || userNames.length === 0) {
        return res.status(400).json({ error: 'userNames must be a non-empty array' });
        }
        if (!Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ error: 'options must be a non-empty array' });
        }
        const invalidOption = options.some(o => !o?.date || !o?.startTime || !o?.endTime);
        if (invalidOption) return res.status(400).json({ error: 'each option needs date, startTime, endTime' });

        const unknownUserNames = [];
        const userIds = [];
        for (const raw of userNames) {
            if (typeof raw !== 'string') {unknownUserNames.push(raw); continue; }
            const user = await UserModel.findUserByName(raw.trim());
            if (!user || user.userId === ownerId) unknownUserNames.push(raw);
            else if (!userIds.includes(user.userId)) userIds.push(user.userId);
            // prevent double adding
            }
        if (unknownUserNames.length) {
        return res.status(400).json({ error: 'Unknown or invalid userNames', userNames: unknownUserNames });
        }
        const proposal = await ProposalModel.create(ownerId, title.trim(), userIds, options);
        res.status(201).json(ProposalDto.responseForOwner(proposal));
    },
    
    async selectR(req, res) {
        const { optionId, reccurence } = req.body ?? {};
        if (!optionId) return res.status(400).json({ error: 'optionId required' });

        const recurrence = reccurence ?? 1;
        if (!Number.isInteger(recurrence) || recurrence < 1) {
            return res.status(400).json({ error: 'reccurence must be a positive integer' });
        }

        const p = await ProposalModel.findById(req.params.proposalId);
        if (!p) return res.status(404).json({ error: 'Proposal not found' });
        if (p.ownerId !== req.params.userId) return res.status(403).json({ error: 'Only the owner can select' });

        const option = p.options.find(opt => opt.optionId === optionId);
        if (!option) return res.status(400).json({ error: 'Invalid optionId' });

        const accepted = await ProposalModel.selectR(p.proposalId, optionId, recurrence);
        if (!accepted) return res.status(400).json({ error: 'Invalid date on selected option' });
   
        const owner = await UserModel.findById(p.ownerId);

        const to = owner.email;
        const subject = `New booking for ${p.title}`;
        const lines = accepted.slots.map(s => `- ${s.date} from ${s.startTime} to ${s.endTime}`).join('\n');
        const intro = accepted.slots.length > 1
            ? `You have ${recurrence} recurring bookings for ${p.title}:`
            : `You have a booking for ${accepted.title}:`;
        const body = `${intro}\n${lines}\n\n`;

        const url = EmailService.buildMailto(to, subject, body);

        res.status(201).json({ url });
    },

    
    async select(req, res) {
        const { optionId } = req.body ?? {};
        if (!optionId) return res.status(400).json({ error: 'optionId required' });

        const p = await ProposalModel.findById(req.params.proposalId);
        if (!p) return res.status(404).json({ error: 'Proposal not found' });
        if (p.ownerId !== req.params.userId) return res.status(403).json({ error: 'Only the owner can select' });

        const option = p.options.find(opt => opt.optionId === optionId);
        if (!option) return res.status(400).json({ error: 'Invalid optionId' });

        const accepted = await ProposalModel.select(p.proposalId, optionId);

        const owner = await UserModel.findById(p.ownerId);

        const to = owner.email;
        const subject = `New booking for ${accepted.title}`
        const body = `You have a booking for ${option.date} from ${option.startTime} to ${option.endTime} for ${accepted.title}.\n\n`;
      
        const url = EmailService.buildMailto(to, subject, body);

        res.status(201).json({url});
    },

    async vote(req, res) {
  
    const { optionIds } = req.body ?? {};
    if (!Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ error: 'optionIds must be a non-empty array' });
    }

    const p = await ProposalModel.findById(req.params.proposalId);
    if (!p) return res.status(404).json({ error: 'Proposal not found' });
    if (!p.userIds.includes(req.params.userId)) return res.status(404).json({ error: 'user is not invited' });
    if (p.options.some(o => o.votes.includes(req.params.userId))) return res.status(404).json({ error: 'already voted' });
    
    const proposal = await ProposalModel.vote(req.params.proposalId, req.params.userId, optionIds);
    res.status(200).json(ProposalDto.responseForUser(proposal, req.params.userId));
  },






}


module.exports = ProposalController;