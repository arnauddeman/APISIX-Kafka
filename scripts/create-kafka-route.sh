#! /bin/bash

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