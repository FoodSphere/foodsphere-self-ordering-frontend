import { apiGet } from "@/services/common";
import { EBillStatus } from "@/types/enum";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PaymentFailedRenderProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const PaymentFailedRender = ({
  title,
  description,
  buttonText,
  buttonLink,
}: PaymentFailedRenderProps) => {
  const router = useRouter();

  const fetchBill = async () => {
    try {
      const response = await apiGet(`/bill`);
      const billData = response?.data ?? null;

      if (billData?.status === EBillStatus.PAID) {
        console.log("Bill is paid, redirecting to success page");
        router.push(`/payment/success?bill_id=${billData.id}`);
      } else if (billData?.status === EBillStatus.COMPLETED) {
        console.log("Bill is completed, redirecting to thank you page");
        router.push("/thank-you");
      }
    } catch (error) {
      console.error("Failed to fetch bill:", error);
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
      <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-600 mb-8">
        {description}
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href={buttonLink}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailedRender;