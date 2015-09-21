var Entity = require('./entity');

function Employer(_opt){
  Entity.call(this,_opt);
  this.role = 'employer';
  this.location = _opt.location;
  this.admins = _opt.admins || [];
  this.openings = _opt.openings || [];
  this.recruiters = _opt.recruiters || [];
}
Employer.prototype = Object.create(Entity.prototype);
Employer.prototype.constructor = Employer;

module.exports = Employer;
