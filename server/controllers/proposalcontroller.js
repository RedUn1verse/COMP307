const db = require('../models/dummy_db');
const ProposalModel = require('../models/proposalmodel');
const ProposalDto   = require('../dtos/proposaldto');

const findUser = (userId) => db.users.find(u => u.userId === userId) ?? null;


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
    }
    
  };


module.exports = ProposalController;