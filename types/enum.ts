export enum EHttpStatusCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INVALID_TOKEN = 498,
  SERVER_ERROR = 500,
}

export enum ESort {
  ASC = "asc",
  DESC = "desc",
}

export enum EOrderStatus {
  ALL = "all",
  DRAFT = 0,
  PENDING = 1,
  COOKING = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export enum EOrderStatusString {
  ALL = "all",
  PENDING = "pending",
  COOKING = "cooking",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface OrderStatus {
  [EOrderStatusString.ALL]: EOrderStatus.ALL;
  [EOrderStatusString.PENDING]: EOrderStatus.PENDING;
  [EOrderStatusString.COOKING]: EOrderStatus.COOKING;
  [EOrderStatusString.COMPLETED]: EOrderStatus.COMPLETED;
  [EOrderStatusString.CANCELLED]: EOrderStatus.CANCELLED;
}

export enum EPaymentMethod {
  CASH = "cash",
  PROMPTPAY = "promptpay",
}

export enum EPaymentStatus {
  PAID = "paid",
  UNPAID = "unpaid",
  NO_PAYMENT_REQUIRED = "no_payment_required",
  CANCELLED = "cancelled",
}

export enum EServiceRequestStatus {
  PENDING = 0,
  ACKNOWLEDGED = 1,
  DONE = 2,
  CANCELLED = 3,
}

export enum EServiceRequestType {
  CALL_WAITER = "call_waiter",
  CASH_PAYMENT = "cash_payment",
}