// Try running in the console below.

exports = function(payload) {

  const db = context.services.get("mongodb-atlas").db("disasters");
  const responses = db.collection("responses");
  
  return responses.find().toArray();

};
