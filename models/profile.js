function CandidateProfile(_opt) {
  this.summary = _opt.summary || '';
  this.skills = _opt.skills || {};
}

module.exports = {
  "CandidateProfile":CandidateProfile
};
