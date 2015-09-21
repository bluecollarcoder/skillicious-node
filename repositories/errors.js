function DuplicateEmailError(message,err){
  Error.call(this);
  this.name = "DuplicateEmailError";
  this.message = message;
  if (err)
    this.stack = err.stack;
}
DuplicateEmailError.prototype = Object.create(Error.prototype);
DuplicateEmailError.prototype.constructor = DuplicateEmailError;

function DuplicateNameError(message,err){
  Error.call(this);
  this.name = "DuplicateNameError";
  this.message = message;
  if (err)
    this.stack = err.stack;
}
DuplicateNameError.prototype = Object.create(Error.prototype);
DuplicateNameError.prototype.constructor = DuplicateNameError;

module.exports = {
  "DuplicateEmailError":DuplicateEmailError,
  "DuplicateNameError":DuplicateNameError
};
