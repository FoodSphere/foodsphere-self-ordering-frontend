export interface IPaymentCreateFromSignalR {
  id: number;
  create_time: string;
  update_time: string | null;
  payment_method: string;
  amount: number;
  status: number;
}

export interface IPaymentUpdateFromSignalR {
  resource: {
    billId: string;
    id: number;
  };
  status: number;
}