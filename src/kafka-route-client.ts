import * as protobuf from 'protobufjs'
import WebSocket from 'ws';

const PROTO_FILE = __dirname + '/../src/pubsub.proto';
const TOPIC= "apisix_test"
const URL='ws://localhost:9080/kafka'

console.log("Loading protobuf file: " + PROTO_FILE);

protobuf.load(PROTO_FILE, function (err:any, root:any) {

  if (err) {
    console.error("Error while loading protobuf:", err);
    process.exit(1);
  }
  if (root) {
    console.log("File pubsub.proto loaded");

    const ws = new WebSocket(URL);

    ws.on('error', console.error);

    ws.on('open', function open() {
      console.log("Websocket opened, URL:", URL)
      const payload: any = {
        sequence: 2,
        cmdKafkaFetch: {
          topic: TOPIC,
          partition: 0,
          offset: 0
        }
      }

      const PubSubReq = root.lookupType("PubSubReq");
      const PubSubResp = root.lookupType("PubSubResp");
      if (PubSubReq && PubSubResp){
        console.log('PubSubReq and PubSubResp types loaded');

        ws.on('message', (data: Buffer) => {
          const decoded: any = PubSubResp.decode(data);
          console.log('Recieved decoded data', decoded);
          (decoded?.kafkaFetchResp?.messages).forEach((message :any) => {
            console.log('      Recieved message:', message?.value?.toString());
            
          });
        });
        
        const encoded = PubSubReq.encode(payload).finish();
        console.log('Sending PubSubReq, topic', TOPIC);
        ws.send(encoded, {binary: true}, (err: any) => console.log('In send callback: ', err ? err : "no error detected"));
      } else {
        console.error('Unable to load PubSubReq Type');
        process.exit(1);
      }
    });
  } else {
    console.log('Error: enable to load root from protobuf definition: ', PROTO_FILE);
    process.exit(1);
  }
});