"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ReceiptText } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import ConfirmationModal from "@/app/components/ConfirmationModal";
import { toast } from "@/app/components/ui/toast/use-toast";
import { apiGet, apiPut } from "@/services/common";
import { Bill, BillUpdateFromSignalR } from "@/types/billType";
import {
  EPaymentMethod,
  EPaymentStatus,
  EBillStatus,
} from "@/types/enum";
import { IPaymentCreateFromSignalR } from "@/types/paymentType";
import { getCookie } from "@/libs/cookie";
import * as signalR from "@microsoft/signalr";

function PaymentSuccess({
  status,
  amount_total,
  payment_method,
  table_name,
  onCompleteBill,
}: {
  status: EPaymentStatus;
  amount_total: number;
  payment_method: EPaymentMethod;
  table_name: string;
  onCompleteBill: () => void;
}) {
  const getStatusText = (status: EPaymentStatus) => {
    switch (status) {
      case EPaymentStatus.PENDING:
        return "PENDING";
      case EPaymentStatus.SUCCEEDED:
        return "PAID";
      case EPaymentStatus.FAILED:
        return "FAILED";
      case EPaymentStatus.REFUNDED:
        return "REFUNDED";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto relative z-10" />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-6">
        Your payment of{" "}
        <span className="font-bold text-gray-900">
          ฿{amount_total?.toFixed(2)}
        </span>{" "}
        has been processed successfully.
      </p>

      <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500 text-sm">Table</span>
          <span className="text-gray-600 text-sm font-bold uppercase">
            {table_name}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-500 text-sm">Status</span>
          <span className="text-green-600 text-sm font-bold uppercase">
            {getStatusText(status)}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-500 text-sm">Payment Method</span>
          <span className="text-gray-600 text-sm font-bold uppercase">
            {payment_method}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button
          onClick={onCompleteBill}
          className="w-full bg-[var(--primary-orange-main)] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
        >
          Complete Bill <ReceiptText />
        </button>
      </div>
    </div>
  );
}

const PaymentSuccessRender = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bill_id = searchParams.get("bill_id");

  const [payment, setPayment] = useState<IPaymentCreateFromSignalR | null>(
    null
  );
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteBillConfirmation, setShowCompleteBillConfirmation] =
    useState<boolean>(false);

  const fetchBill = async () => {
    try {
      const response = await apiGet(`/bill`);
      const billData = response?.data ?? null;
      setBill(billData);

      if (billData?.status === EBillStatus.PAID) {
        console.log("Bill is paid, redirecting to success page");
        router.push(`/payment/success?bill_id=${billData.id}`);
      } else if (billData?.status === EBillStatus.COMPLETED) {
        console.log("Bill is completed, redirecting to thank you page");
        router.push("/thank-you");
      }
    } catch (error) {
      console.error("Failed to fetch bill:", error);
      toast({
        variant: "error",
        description: "Failed to fetch bill",
      });
    }
  };

  const fetchPayment = async () => {
    try {
      const response = await apiGet(`/bill/payments`);
      const payments = response?.data ?? [];
      const completedPayment = payments.find(
        (p: IPaymentCreateFromSignalR) => p.status === EPaymentStatus.SUCCEEDED
      );
      setPayment(completedPayment ?? null);
    } catch (error) {
      console.error("Failed to fetch payment:", error);
      toast({
        variant: "error",
        description: "Failed to fetch payment",
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchBill(), fetchPayment()]);
      setIsLoading(false);
    };

    init();

    const accessToken = getCookie("accessToken");

    const connect = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_BASE_API_URL}/hubs/ordering`, {
        accessTokenFactory: () => `${accessToken}`,
      })
      .withAutomaticReconnect()
      .build();
    connect
      .start()
      .catch((err) =>
        console.error("Error while connecting to SignalR Hub:", err)
      );

    connect.on("bill_status_updated", (updatedBill: BillUpdateFromSignalR) => {
      if (bill && updatedBill.resource.id === bill.id) {
        if (updatedBill.status === EBillStatus.PAID) {
          router.push(`/payment/success?bill_id=${bill.id}`);
        } else if (updatedBill.status === EBillStatus.COMPLETED) {
          router.push("/thank-you");
        }
      }
    });

    return () => {
      connect.stop();
    };
  }, []);

  const handleCompleteBill = async () => {
    try {
      await apiPut(`/bill/complete`);
      setShowCompleteBillConfirmation(false);
    } catch (error) {
      console.error("Failed to complete bill:", error);
      toast({
        variant: "error",
        description: "Failed to complete bill",
      });
    }
  };

  if (isLoading) return;

  if (!bill_id || !bill || bill_id !== bill.id || !payment) {
    router.push("/payment/failed/invalid_session");
    return;
  }

  localStorage.removeItem('cartItems');

  return (
    <>
      {showCompleteBillConfirmation && (
        <ConfirmationModal
          isOpen={showCompleteBillConfirmation}
          title="Complete Bill"
          message="Are you sure you want to complete this bill?"
          onConfirm={handleCompleteBill}
          onClose={() => setShowCompleteBillConfirmation(false)}
        />
      )}
      <PaymentSuccess
        table_name={bill.table.name}
        status={payment.status as EPaymentStatus}
        amount_total={payment.amount}
        payment_method={payment.payment_method as EPaymentMethod}
        onCompleteBill={() => setShowCompleteBillConfirmation(true)}
      />
    </>
  );
};

export default PaymentSuccessRender;
