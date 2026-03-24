export interface Restaurant {
  restaurant_name: string;
  restaurant_id: string;
  branch_name: string;
  branch_id: number;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  stripe_account_id: string;
  address: string;
  opening_time: string;
  closing_time: string;
}
