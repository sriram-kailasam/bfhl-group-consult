/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import Header from "app/components/Header";
import VideoCameraIcon from 'shared/assests/videoCameraIcon.svg';
import { DoctorSearchResponse } from "modules/doctor-search/types";
import './appointmentBooking.scss';
import Slots from "./Slots";
import { getPatientAvatar } from "shared/utils/utils";
import useDoctorApptBooking from './services/useDoctorApptBooking';
import { BASE_URL } from "shared/constants";

export interface ISlot {
  slotId: string;
  startTime: string;
  endTime: string;
}

export interface ISlots {
  slots: ISlot[];
}

export const getSlots: (k: string) => Promise<AxiosResponse<ISlots>> = (
  hprId: string
) => {
  return axios.get(`${BASE_URL}/eua/getSlots?hprId=${hprId}`);
};

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutation: { mutate: bookAppt }} = useDoctorApptBooking();
  const [selectedSlot, setSelectedSlot] = useState("");
  const isBookActive = !!selectedSlot;
  const doctorDetails = location.state as DoctorSearchResponse;
  const { gender, name, speciality, experience, fees } = doctorDetails;
  const docHprId = doctorDetails.hprId?.toString() || '';

  const { data: { data: { slots = [] } = {} } = {} } = useQuery<
        AxiosResponse<ISlots>,
        Error
    >(["doctor-slots", docHprId], () => getSlots(docHprId), {
        enabled: !!docHprId,
    });

  const handleOnBack = () => {
    navigate('../dashboard');
  }

  const handleApptBooking = () => {
    const finalSlot = slots.find((i) => i.slotId === selectedSlot) || {slotId: '', startTime: '', endTime: ''};
    bookAppt({
      slotId: selectedSlot,
      startTime: finalSlot?.startTime,
      endTime: finalSlot?.endTime,
      primaryDoctor: {
        hprId: localStorage.getItem('hpAddress')?.toString() || '',
        name: localStorage.getItem('name')?.toString() || '',
      },
      secondaryDoctor: {
        hprId: docHprId,
        name: name,
      },
      patient: {
        name: doctorDetails?.patient.name,
        abhaAddress: doctorDetails.patient.abhaAddress,
      }
    }, {
      onSuccess: (response) => {
        navigate('../dashboard');
      }
    })
  }

  return (
    <>
      <Header heading='Select Doctor' onBack={handleOnBack}/>
      <div className="min-h-screen msx-h-full w-full p-4 mt-16 bg-[#f2f3f9]">
        <div className="mt-4">
        <div className="doc-profile">
                <div className="card-main">
                    <div className="doc-name-logo">
                        <img
                            src={getPatientAvatar(gender)}
                            alt="Doctor Name"
                        />
                        <div className="doc-info-container">
                            <div className="doc-name">
                                {name?.split("-")[1].trim()}
                            </div>
                            <div className="doc-info">
                                <span className="doc-spec">{speciality}</span>
                                <div className="line-vert"></div>
                                <span className="doc-exp">
                                    {experience} Yrs
                                </span>
                            </div>
                            <div className="doc-fee-container">
                                <span className="doc-fees">₹ {fees}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: "10px" }}>
                    <span className="section-label">Consultation Type</span>
                    <Button className="e-cons-btn">
                        <img src={VideoCameraIcon} alt="video" />
                        <span>E-Consultation</span>
                    </Button>
                </div>
                <div style={{ marginTop: "10px" }}>
                    <span className="section-label">Date & Time</span>
                    <Slots
                        slots={slots}
                        onSlotSelect={(slotId) => setSelectedSlot(slotId)}
                        selectedSlotId={selectedSlot}
                    />
                </div>
                <div className="footer">
                    <Button
                        className={`book-btn${isBookActive ? "" : " disabled"}`}
                        onClick={handleApptBooking}
                    >
                        Book Appointment
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </>
  )
}

export default AppointmentBooking;