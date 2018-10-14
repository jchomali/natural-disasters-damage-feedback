
const Http = new XMLHttpRequest();
const url='https://webhooks.mongodb-stitch.com/api/client/v2.0/app/natural_disaster-rcpou/service/responsesRequest/incoming_webhook/requestWebhook';
Http.open("GET", url);
Http.send();

var fetchedData;
var mongoCSV;

Http.onreadystatechange=(e)=>{
  if (Http.responseText.length > 0) {
    console.log(Http.responseText);
    fetchedData = JSON.parse(Http.responseText);
    mongoCSV = '';
    for (var i = 0; i < fetchedData.length; i++) {
      var response = fetchedData[i];
      mongoCSV += response['phone']+', '+response['damage']['$numberDouble']/5+", "+Date.parse(response['time'])+', '+response['lat']+', '+response['long']+' \n';
    }

    console.log(mongoCSV);
  }
}


export default `phone, damage, timestamp, latitude, longitude
  123456789, 0.1, 1539302400, 37.3322109,-122.0329665
  123456789, 0.1, 1539302400, 39.173943,-123.190974
  `;
