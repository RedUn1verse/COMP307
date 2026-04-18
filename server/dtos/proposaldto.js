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
        startTime: o.start_time,
        endTime:   o.end_time,
        myVote:    o.votes.includes(userId),
      })),
    };
  }

  static responseListForUser(list, userId) {
    return list.map(p => ProposalDto.responseForUser(p, userId));
  }

}

module.exports = ProposalDto;