// Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';
import {connect} from 'react-redux';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import KeplerGl from 'kepler.gl';
import {addDataToMap} from 'kepler.gl/actions';
import Processors from 'kepler.gl/processors';
import KeplerGlSchema from 'kepler.gl/schemas';
import Button from './button';
import downloadJsonFile from "./file-download";
import sfoConfig from './data/keplergl.json';
import sfoSubset from './data/sfo-subset.csv';


const MAPBOX_TOKEN = process.env.MapboxAccessToken;

class App extends Component {
  render() {
    return (

      <div style={{position: 'absolute', width: '100%', height: '100%'}}>
        <AutoSizer>
          {({height, width}) => (
            <KeplerGl
              mapboxApiAccessToken={MAPBOX_TOKEN}
              id="map"
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  componentDidMount() {

      const initData = 'phone,damage,timestamp,latitude,longitude\n123456789,0.6,1539302400,2.1,2.1'
      const data = Processors.processCsvData(initData);
      const dataset = {
        data,
        info: {
          id: 'my_data'
        }
      };
      this.props.dispatch(addDataToMap({datasets: dataset, config: sfoConfig}));

      var thisRef = this;
      setInterval(function() {
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
            mongoCSV = "phone,damage,timestamp,latitude,longitude\n";
            var responsesIncludeJuanNumber = false;
            for (var i = 0; i < fetchedData.length; i++) {
              var response = fetchedData[i];
              mongoCSV += response['phone']['$numberDouble']+','+response['damage']['$numberDouble']/5.001+","+Date.parse(response['time'])+','+response['lat']+','+response['long']+'\n';
              if (response['phone']['$numberDouble'] == 17348813358){
                responsesIncludeJuanNumber = true;
              }

            }

            if (responsesIncludeJuanNumber) {
              mongoCSV += sfoSubset.replace("phone,damage,timestamp,latitude,longitude\n", "");
            }

            console.log(mongoCSV);

            const data = Processors.processCsvData(mongoCSV);

            // Create dataset structure
            const dataset = {
              data,
              info: {
                id: 'my_data'
              }
            };

            const config = thisRef.getMapConfig();
            console.log(config);
            thisRef.props.dispatch(addDataToMap({datasets: dataset, config}));

          }
        }

      }, 10000);

  }

  getMapConfig() {
      const {keplerGl} = this.props;
      const {map} = keplerGl;

      return KeplerGlSchema.getConfigToSave(map);
  }

}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(mapStateToProps, dispatchToProps)(App);
