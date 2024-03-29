import { SendMessageRequest } from "../dto/sendMessage.dto";
import axios from "axios"
import { v4 as uuid } from 'uuid'
import { getCache } from "../cache";

const cache = getCache();

export async function sendMessage(payload: SendMessageRequest) {
  const promises: Promise<unknown>[] = []

  let transactionId: string | undefined;
  if (payload.appointmentId) {
    transactionId = cache.get(`transactionId:${payload.appointmentId}`);
    if (!transactionId) {
      console.log("transactionId not found for appointment ", payload.appointmentId);
    }
  } else {
    console.log("No appointmentId received while sending message to ", payload.receiverId);
  }

  payload.receiverId.forEach(receiverId => {
    const baseUrl = cache.get<string>(`providerUri:${receiverId}`);

    if (!baseUrl) {
      console.log(`baseUrl not found for ${receiverId}`);
      return;
    }

    promises.push((async () => {
      try {
        await axios({
          baseURL: baseUrl,
          url: '/on_message',
          method: 'post',
          data:
          {
            "context": {
              "domain": "nic2004:85111",
              "country": "IND",
              "city": "std:080",
              "action": "on_message",
              "core_version": "0.7.1",
              "consumer_uri": baseUrl,
              "provider_id": process.env.HSPA_CONSUMER_ID,
              "provider_uri": process.env.HSPA_CONSUMER_URI,
              "message_id": uuid(),
              "timestamp": new Date().toISOString(),
              "transaction_id": transactionId || uuid()
            },
            "message": {
              "intent": {
                "chat": {
                  "sender": {
                    "person": {
                      "cred": payload.senderId,
                      "name": "Sriram Kailasam",
                      "gender": "M",
                      "image": "image",
                    }
                  },
                  "receiver": {
                    "person": {
                      "cred": receiverId,
                      "name": "Ganesh Vikram Borse",
                      "gender": "M",
                      "image": "image",
                    }
                  },
                  "content": {
                    "content_id": payload.content.id,
                    "content_value": JSON.stringify(payload),
                    "content_type": "video_call_signalling"
                  },
                  "time": {
                    "timestamp": payload.timestamp
                  }
                }
              }
            }
          }
        });

        console.log('on_message sent for ', receiverId)
      } catch (err) {
        console.log('on_message error for ', receiverId, err)
      }
    })())
  }
  )

  await Promise.allSettled(promises)
}