/*
  See https://www.twilio.com/docs/api/twiml/sms/twilio_request for
  an example of a payload that Twilio would send.

  Try running in the console below.
*/



exports = function(payload) {

  const db = context.services.get("mongodb-atlas").db("disasters");
  const responses = db.collection("responses");


  console.log("Got message");
  const originalText = payload.Body;

  const damage = Number(originalText.substr(0,1));
  const zip = originalText.substr(2,originalText.length);



  const httpService = context.services.get("geocodeZip");

  var ans = httpService.get({url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+zip+'&key=AIzaSyD-c5a9-TC1PYlZx9DpHCYOrT0q_x1q7BQ'})
  .then(resp => {
    var as_json = EJSON.parse(resp.body.text());
    var lat = JSON.stringify(as_json.results[0].geometry.location.lat);
    var lng = JSON.stringify(as_json.results[0].geometry.location.lng);

    const message = { "text": payload.Body, "damage": damage, "zip": zip, "lat": lat, "long": lng, "phone": Number(payload.From), "time": Date() };


    if(payload.Body.length==7 && Number(payload.Body.substr(0,1))>= 1 && Number(payload.Body.substr(0,1))<=5 && payload.Body.substr(1,1)==" "
                          && /^([0-9])/.test(payload.Body.substr(3,5)) && /^([0-9] )/.test(payload.Body) ){
      responses.insertOne(message);
    }
    else{
      console.log('ERROR IN MESSAGE BRO!');
    }


  });



  return true;


};
