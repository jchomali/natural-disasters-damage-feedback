exports = function(phone){

   const twilio = context.services.get("natural_collect");

  twilio.send({
    to: phone,
    from: "+17372043399",
    body: "PRESIDENTIAL ALERT: A natural disaster was recorded in your area. Please report the intensity of the damage in your neighborhood. Rate from 1 (Lowest) to 5 (Highest) and indicate your zipcode after a space. E.g. 2 48109"

  });
};
