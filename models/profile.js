function CandidateProfile(_opt) {
  this.summary = _opt.summary || '';
  this.skills = _opt.skills || {};
  this.work = _opt.work || [];
  this.edu = _opt.edu || [];
}

module.exports = {
  "CandidateProfile":CandidateProfile
};
