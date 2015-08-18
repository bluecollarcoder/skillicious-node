var config = {
  "dev":{
    "port":3001,
    "mongo":{
      "host":"127.0.0.1",
      "port":27017,
      "db":"Skillicious"
    },
    "security":{
      "jwt-secret":"testietestie",
      "passphrase":"testietestie"
    }
  },
  "stage":{},
  "prod":{}
};

module.exports = (function(env){
  var c = config[env || process.env.ENV_NAME || "dev"];
  return c || config.dev;
})();
