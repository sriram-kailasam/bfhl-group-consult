export type Appointment = {
  id: string
  createdAt: Date;
  startTime: Date;
  endTime: Date;
  slotId: string;
  hprId: string;
  abhaId: string;

  isGroupConsult: boolean;
  groupConsult?: {
    name: string;
    hprId: string;
  }

  doctor: {
    name: string;
    gender?: string | null;
  },

  patient: {
    name: string;
    age?: string;
    abhaAddress: string,
    gender?: string
  }
}