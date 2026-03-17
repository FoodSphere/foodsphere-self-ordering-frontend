"use client";

import {
  StripeVerificationResult,
  verifyCheckoutSession,
} from "@/services/stripe";
import Link from "next/link";
import { CheckCircle2, ReceiptText } from "lucide-react";
import { EPaymentMethod, EPaymentStatus } from "@/types/enum";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Bill } from "@/types/billType";
import { apiGet, apiPut } from "@/services/common";
import { useSearchParams } from "next/navigation";
import { toast } from "@/app/components/ui/toast/use-toast";
import ConfirmationModal from "@/app/components/ConfirmationModal";

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
          <span className="text-gray-500 text-sm">Status</span>
          <span className="text-green-600 text-sm font-bold uppercase">
            {status}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-500 text-sm">Table</span>
          <span className="text-gray-600 text-sm font-bold uppercase">
            {table_name}
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
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const payment_method = searchParams.get("payment_method");

  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripeResult, setStripeResult] =
    useState<StripeVerificationResult | null>(null);
  const [showCompleteBillConfirmation, setShowCompleteBillConfirmation] =
    useState<boolean>(false);

  const fetchBill = async () => {
    try {
      const response = await apiGet(`/bill`);
      setBill(response?.data ?? null);
    } catch (error) {
      console.error("Failed to fetch bill:", error);
      toast({
        variant: "error",
        description: "Failed to fetch bill",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!session_id || !payment_method || !bill) {
      return redirect("/payment/failed/invalid_session");
    }

    if (payment_method === EPaymentMethod.PROMPTPAY) {
      const verify = async () => {
        try {
          const result = await verifyCheckoutSession(session_id, bill.id);
          console.log(result);
          if (result.success) {
            setStripeResult(result);
          }
        } catch (error) {
          console.error("Failed to verify checkout session:", error);
          toast({
            variant: "error",
            description: "Failed to verify checkout session",
          });
        }
      };
      verify();
    }
  }, [session_id, payment_method, bill, isLoading]);

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

  if (payment_method === EPaymentMethod.PROMPTPAY && stripeResult && bill) {
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
        table_name={bill.table_name}
        status={stripeResult.status as EPaymentStatus}
        amount_total={stripeResult.amount_total}
        payment_method={payment_method as EPaymentMethod}
        onCompleteBill={() => setShowCompleteBillConfirmation(true)}
      />
      </>
    );
  }

  // if (payment_method === EPaymentMethod.CASH && bill) {
  //   return (
  //     <PaymentSuccess
  //       bill_id={bill.id}
  //       status={EPaymentStatus.PAID}
  //       amount_total={bill.total_amount}
  //       payment_method={payment_method as EPaymentMethod}
  //     />
  //   );
  // }
};

export default PaymentSuccessRender;
