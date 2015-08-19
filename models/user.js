var Entity = require('./entity');
var CandidateProfile = require('./profile').CandidateProfile;

/**
 * Abstract class for all entities that can log into the system.
 * @class
 * @augments Entity
 * @abstract
 */
function User(_opt){
  Entity.call(this,_opt);

  this.first = _opt.first;
  this.last = _opt.last;
  this.email = _opt.email;
}
User.prototype = Object.create(Entity.prototype);
User.prototype.constructor = User;

/**
 * Class representing a job candidate.
 * @class
 * @augments User
 */
function Candidate(_opt){
  User.call(this,_opt);

  // private
  var pwdHash = _opt.pwdHash;

  // public
  this.role = "candidate";
  this.profile = new CandidateProfile(_opt.profile || {});

  this.getPasswordHash = function(){
    return pwdHash;
  };
}
Candidate.prototype = Object.create(User.prototype);
Candidate.prototype.constructor = Candidate;

/**
 * Class representing a recruiter.
 * @class
 * @augments User
 */
function Recruiter(_opt) {
  User.call(this,_opt);

  // private
  var pwdHash = _opt.pwdHash;

  // public
  this.role = "recruiter";
  this.openings = _opt.openings;

  this.getPasswordHash = function(){
    return pwdHash;
  };
}
Recruiter.prototype = Object.create(User.prototype);
Recruiter.prototype.constructor = Recruiter;

module.exports = {
  /**
   * Factory class for creating the right instance of a user based on the
   * "role" property.
   */
  "create": function(_opt) {
    switch (_opt.role) {
      case 'candidate':
        return new Candidate(_opt);
      case 'recruiter':
        return new Recruiter(_opt);
      default:
        throw new Error("Invalid user type");
    }
  },
  "Candidate": Candidate,
  "Recruiter": Recruiter
};
