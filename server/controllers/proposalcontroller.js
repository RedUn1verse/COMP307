const db = require('../models/dummy_db');
const ProposalModel = require('../models/proposalmodel');
const ProposalDto   = require('../dtos/proposaldto');
const BookingDto   = require('../dtos/bookingdto');

// TODO: Move to user Model + Convert to MongoDB
const findUser = (userId) => db.users.find(u => u.userId === userId) ?? null;
const findUserByName = (name)  => db.users.find(u => u.name?.toLowerCase() === name.toLowerCase()) ?? null;


const ProposalController = {
    
    getUserProposals(req, res) {
        const userId = req.user.userId;
        const proposalList = ProposalModel.findForUser(userId);
        res.json(ProposalDto.responseListForUser(proposalList, userId));
        
    },
    
    getOwnerProposals(req, res) {
        const ownerId = req.user.userId;
        const proposalList = ProposalModel.findForOwner(ownerId);
        res.json(ProposalDto.responseListForOwner(proposalList));
    },

    create(req, res){
        const ownerId = req.user.userId;
        // TODO: ROLE VERIFICATION IN MIDDLEWARE
        // if (!me || me.role !== 'owner') return res.status(403).json({ error: 'Owner role required' });

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
        if (invalidOption) return res.status(400).json({ error: 'each option needs date, start_time, end_time' });

        const unknownUserNames = [];
        const userIds = [];
        for (const raw of userNames) {
            if (typeof raw !== 'string') {unknownUserNames.push(raw); continue; }
            const user = findUserByName(raw.trim());
            if (!user || user.userId === ownerId) unknownUserNames.push(raw);
            else if (!userIds.includes(user.userId)) userIds.push(user.userId);
            // prevent double adding
            }
        if (unknownUserNames.length) {
        return res.status(400).json({ error: 'Unknown or invalid userNames', userNames: unknownUserNames });
        }
        const proposal = ProposalModel.create(ownerId, title.trim(), userIds, options);
        res.status(201).json(ProposalDto.responseForOwner(proposal));
    },

    select(req, res) {
        const { optionId } = req.body ?? {};
        if (!optionId) return res.status(400).json({ error: 'optionId required' });

        const p = ProposalModel.findById(req.params.proposalId);
        if (!p) return res.status(404).json({ error: 'Proposal not found' });
        if (p.ownerId !== req.user.userId) return res.status(403).json({ error: 'Only the owner can select' });

        const option = p.options.find(opt => opt.optionId === optionId);
        if (!option) return res.status(400).json({ error: 'Invalid optionId' });

        const ownerBooking = ProposalModel.select(p.proposalId, optionId);

        res.json(BookingDto.responseBooking(ownerBooking));
    },


}


module.exports = ProposalController;