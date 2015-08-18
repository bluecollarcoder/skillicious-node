/**
 * Base class for all entities in the system.
 * @class
 */
module.exports = function(_opt){
  this._id = _opt.id || _opt._id;
  this.name = _opt.name;
  this.role = _opt.role;
};
