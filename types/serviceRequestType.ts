import { EServiceRequestStatus } from "./enum";

export interface ServiceRequestResponse {
  id: string;
  create_time: string;
  update_time: string | null;
  reason: string;
  status: EServiceRequestStatus;
}

export interface ServiceRequestCreateRequest {
  reason: string;
}

export interface ServiceRequestUpdateRequest {
  status: EServiceRequestStatus;
}

export interface ServiceRequestFromSignalR extends ServiceRequestResponse {
  bill_id: string;
}