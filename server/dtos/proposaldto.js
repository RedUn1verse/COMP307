class ProposalDto {

  static responseForUser(p, userId) {
    if (!p) return null;
    return {
      proposalId:       p.proposalId,
      title:            p.title,
      ownerName:        p.ownerName,
      options: p.options.map(o => ({
        optionId:   o.optionId,
        date:       o.date,
        startTime: o.startTime,
        endTime:   o.endTime,
        myVote:    o.votes.includes(userId),
      })),
    };
  }

  static responseListForUser(list, userId) {
    return list.map(p => ProposalDto.responseForUser(p, userId));
  }

  static responseForOwner(p) {
    if (!p) return null;
    return {
      proposalId:       p.proposalId,
      title:            p.title,
      invitedUsers:     p.invitedUsers,
      options: p.options.map(o => ({
        date:       o.date,
        startTime: o.startTime,
        endTime:   o.endTime,
        voteCount: o.votes.length,
      })),
    };
  }

  static responseListForOwner(list) {
    return list.map(ProposalDto.responseForOwner);
  }

}

module.exports = ProposalDto;