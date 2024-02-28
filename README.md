# APISIX-Kafka
APISIX and Kafka integration experimentation.

**N.B.:** 
- This repository has been set for linux. Under another OS the commands and npm scripts may have to be adapted.
- If the conainer's name for apisix is not **example-apisix-1**, adapt the npm scripts in **package.json** with the actual name.

## Principle: 
- There are 2 docker compose files. One for apisix: **apisix-docker/example/docker.compose.yml** and one for kafka: **kafka/docker-compose.yml**
- The file **package.json** contains the scripts to make the tests: start/ stop containers, start the client, apply the patch, etc. 
- The client to test the APISIX route for kafka is **src/kafka-route-client.ts**. It is a nodejs script.
- The file **src/pubsub.proto** has been copied form the apisix docker container.
- The file **src/patched-pubsub.lua** is the modified file in order to recieve the messages.

## How to make the test

1. Get The repository
```
git clone git@github.com:arnauddeman/APISIX-Kafka.git --recurse
cd APISIX-Kafka
npm i
```
2. Start the containers 
```
npm run start-containers
```
3. List the containers (optional)
```
npm run ls-containers
```
Example of outputs:
```
> apisix-kafka@1.0.0 ls-containers
> docker ps --last 8 --format 'table {{.ID}}    {{.Names}}      {{.Status}}     {{.Ports}}'

CONTAINER ID   NAMES               STATUS          PORTS
aeefc52d4845   apxkfk_kafka_ui     Up 14 minutes   0.0.0.0:8082->8080/tcp, :::8082->8080/tcp
011666d784a9   apxkfk_kafka        Up 14 minutes   9092/tcp, 0.0.0.0:29092->29092/tcp, :::29092->29092/tcp
0529c8b19511   apxkfk_zookeeper    Up 14 minutes   2888/tcp, 3888/tcp, 0.0.0.0:22181->2181/tcp, :::22181->2181/tcp
6e8d10abb451   example-apisix-1    Up 7 minutes    0.0.0.0:9080->9080/tcp, :::9080->9080/tcp, 0.0.0.0:9091-9092->9091-9092/tcp, :::9091-9092->9091-9092/tcp, 0.0.0.0:9180->9180/tcp, :::9180->9180/tcp, 0.0.0.0:9443->9443/tcp, :::9443->9443/tcp
26ce0a8cbf6b   example-web2-1      Up 14 minutes   0.0.0.0:9082->80/tcp, :::9082->80/tcp
bb0812acc222   example-web1-1      Up 14 minutes   0.0.0.0:9081->80/tcp, :::9081->80/tcp
caf5055611b5   example-grafana-1   Up 14 minutes   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp
5aa93b61484d   example-etcd-1      Up 14 minutes   0.0.0.0:2379->2379/tcp, :::2379->2379/tcp, 2380/tcp
```
4. Create the kafka topic (first time only)
```
npm run create-topic 
```

5. list the kafka topics (optional)
```
npm run ls-topics 
```

6. Create a route for kafka:
```
curl --location --request PUT 'http://127.0.0.1:9180/apisix/admin/routes/kafka' \
--header 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
--header 'Content-Type: application/json' \
--data-raw '
{
  "uri": "/kafka",
  "name": "kafka",
  "upstream": {
    "nodes": [
      {
        "host": "apxkfk_kafka",
        "port": 9092,
        "weight": 1
      }
    ],
    "type": "none",
    "scheme": "kafka"
  }
}'
```
7. Send messages to Kafka (interactive)
```
npm run send-messages
```
Each line entered in the console will be a message sent to kafka.

8. View the messages with Kafka UI (optional)
Open  [Kafka UI](http://localhost:8082) and navigate to Topics/apisix_test/Messages
 
9. Compile and start The nodejs client (no message should be recieved)
```
npm run start-client
```
Expected outputs:
```
Loading protobuf file: (...)/dist/../src/pubsub.proto
File pubsub.proto loaded
Websocket opened, URL: ws://localhost:9080/kafka
PubSubReq and PubSubResp types loaded
Sending PubSubReq, topic apisix_test
In send callback:  no error detected
```
8. Stop the client (CTRL C)

9. Apply the patch and restart the Apisix container:
npm run patch

9. Start the client (messages should be recieved)
```
npm run start-client
```
or to avoid compilation:
```
node dist/kafka-route-client.js
```

Expected outputs example:
```
Loading protobuf file: (...)/src/pubsub.proto
File pubsub.proto loaded
Websocket opened, URL: ws://localhost:9080/kafka
PubSubReq and PubSubResp types loaded
Sending PubSubReq, topic apisix_test
In send callback:  no error detected
Recieved decoded data PubSubResp {
  kafkaFetchResp: KafkaFetchResp {
    messages: [ [KafkaMessage], [KafkaMessage], [KafkaMessage] ]
  },
  sequence: Long { low: 2, high: 0, unsigned: false }
}
      Recieved message: foo
      Recieved message: foo
      Recieved message: bar
```