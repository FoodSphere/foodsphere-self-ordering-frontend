export interface Bill {
  id: string;
  create_time: string;
  update_time: string | null;
  table: {
    id: number;
    name: string;
  };
  consumer_id: string | null;
  pax: number;
  status: number;
}

export interface BillUpdateFromSignalR {
  resource: { id: string };
  branch: {
    restaurantId: string;
    id: number;
  };
  status: number;
}
