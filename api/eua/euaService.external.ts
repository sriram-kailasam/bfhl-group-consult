import axios from "axios"
import { waitForData } from "../util/waitForData"
import { v4 as uuid } from 'uuid'
import { SearchResult } from "./dto/searchResult.dto";
import { GatewayOnSearchRequest } from "../uhi/eua/dto/gatewayOnSearch.dto";
import { defaultHspaBaseUrl, euaConsumerId, euaConsumerUri, gatewayBaseUrl } from "../configuration";
import { getCache } from "../cache";
import { HspaSearchResult } from "./dto/hspaSearchResult.dto";
import dayjs from 'dayjs'
import { UhiPayload } from "../uhi/dto/uhiPayload";

const cache = getCache();

export async function searchDoctors(name: string): Promise<SearchResult[]> {
  const transactionId = await sendSearchDoctorsRequest(name);
  const result = await waitForData<GatewayOnSearchRequest>(`gatewaySearch:${transactionId}`)

  const searchResults: SearchResult[] = result.message.catalog.fulfillments?.map(fulfillment => {
    const hprId = fulfillment.agent.id;
    cache.set(`providerUri:${hprId}`, result.context.provider_uri)

    return {
      hprId: hprId,
      name: fulfillment.agent.name,
      education: fulfillment.agent.tags?.['@abdm/gov/in/education'],
      experience: Number(fulfillment.agent.tags?.["@abdm/gov/in/experience"]),
      fees: Number(fulfillment.agent.tags?.["@abdm/gov/in/first_consultation"]),
      gender: fulfillment.agent.gender,
      imageUri: fulfillment.agent.image,
      speciality: fulfillment.agent.tags?.["@abdm/gov/in/speciality"],
      languages: fulfillment.agent.tags?.["@abdm/gov/in/languages"]?.split(',')
    }
  }) || []

  return searchResults
}

async function sendSearchDoctorsRequest(name: string) {
  const transactionId = uuid()
  await axios({
    baseURL: process.env.GATEWAY_BASE_URL,
    url: 'search',
    method: 'post',
    data:
    {
      "context": {
        "domain": "nic2004:85111",
        "country": "IND",
        "city": "std:080",
        "action": "on_search",
        "timestamp": new Date().toISOString(),
        "core_version": "0.7.1",
        "consumer_id": euaConsumerId,
        "consumer_uri": euaConsumerUri,
        "transaction_id": transactionId
      },
      "message": {
        "intent": {
          "fulfillment": {
            "agent": {
              "name": name
            },
            "type": "PhysicalConsultation"
          }
        }
      }
    }



  })

  return transactionId
}


export async function getSlots(hprId: string): Promise<Slot[]> {
  const transactionId = await sendGetSlotsRequest(hprId)

  const result = await waitForData<UhiPayload<HspaSearchResult>>(`gatewaySearch:${transactionId}`);

  console.log({ result })
  return result.message.catalog.fulfillments?.map((fulfillment: any) => ({
    slotId: fulfillment.id,
    startTime: dayjs(fulfillment.start.time.timestamp).toISOString(),
    endTime: dayjs(fulfillment.end.time.timestamp).toISOString()
  }))

}

async function sendGetSlotsRequest(hprId: string) {
  const transactionId = uuid()

  const providerUri = cache.get<string>(`providerUri:${hprId}`);

  await axios({
    baseURL: providerUri || defaultHspaBaseUrl,
    url: "/search",
    method: 'post',
    data: {
      "context": {
        "domain": "nic2004:85111",
        "country": "IND",
        "city": "std:080",
        "action": "search",
        "timestamp": new Date().toISOString(),
        "core_version": "0.7.1",
        "consumer_id": euaConsumerId,
        "consumer_uri": euaConsumerUri,
        "transaction_id": transactionId
      },
      "message": {
        "intent": {
          "fulfillment": {
            "agent": {
              cred: hprId
            },
            "start": {
              "time": {
                "timestamp": new Date().toISOString()
              }
            },
            "end": {
              "time": {
                "timestamp": "2022-07-17T23:59:59"
              }
            },
            "type": "Teleconsultation"
          }
        }
      }
    }
  })


  return transactionId
}