import axios from "axios";
import { useQuery } from 'react-query';
import { BASE_URL } from "shared/constants";
import { AppointmentListPayload, AppointmentData } from '../types';

const getAppointmentList = async (payload: AppointmentListPayload) => {
  const response = await axios.get<{results: AppointmentData[]}>(`${BASE_URL}/hspa/getAppointmentList`, {
    params: {
      hpAddress: payload.hpAddress,
    }
  });
  if (response.status >= 400) return Promise.reject(response);
  return response.data;
};

const useGetAppointmentList = (hpAddress: string) => {
  return useQuery(hpAddress, () => getAppointmentList({hpAddress}), {
    enabled: !!hpAddress,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export default useGetAppointmentList;