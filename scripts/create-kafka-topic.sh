#! /bin/bash

docker exec apxkfk_kafka kafka-topics  --create --bootstrap-server localhost:29092 --replication-factor 1 --partitions 1 --topic apisix_test
