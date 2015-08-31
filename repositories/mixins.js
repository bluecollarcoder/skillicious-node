var MongoDB = require("mongodb");

module.exports = {
  "processQuery":function(query){
    if (typeof query._id == 'string')
      query._id = new MongoDB.ObjectID(query._id);
    return query;
  }
};
