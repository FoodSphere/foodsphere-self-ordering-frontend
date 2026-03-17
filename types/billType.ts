export interface Bill {
  id: string;
  create_time: string;
  update_time: string | null;
  table_id: number;
  table_name: string;
  consumer_id: string | null;
  pax: number;
  status: number;
}
