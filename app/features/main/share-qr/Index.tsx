"use client";

import { useEffect, useState } from "react";
import QRCode from "@/app/components/QrCode";
import Link from "next/link";
import usePortal from "@/app/features/main/portal/hook/usePortal";
import { toast } from "sonner";
import { apiGet } from "@/services/common";
import { Bill } from "@/types/billType";
import { EBillStatus } from "@/types/enum";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const ShareQrRender = () => {
  const { handleGetPortal } = usePortal();

  const [qrData, setQrData] = useState<string | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);

  const fetchQRData = async () => {
    const response = await handleGetPortal();
    if (response?.id != "") {
      const data = `${BASE_URL}/portals/${response?.id}`;
      setQrData(data);
    } else {
      toast.error("Failed to get portal");
      setQrData(null);
    }
  };

  const fetchBill = async () => {
    const response = await apiGet("/bill");
    const billData = response?.data;
    if (billData != null) {
      setBill(billData);
      if (billData.status === EBillStatus.PAID) {
        return redirect(`/payment/success?bill_id=${billData.id}`);
      } else if (billData.status === EBillStatus.COMPLETED) {
        return redirect(`/thank-you`);
      }
    } else {
      toast.error("Failed to get bill");
      setBill(null);
    }
  };

  useEffect(() => {
    fetchQRData();
    fetchBill();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 gap-6">
      <h1 className="text-2xl font-bold">Share QR</h1>

      <div className="bg-[var(--primary-orange-main)] px-6 py-2 rounded-lg">
        <p className="text-lg font-bold text-white">Table {bill?.table.name}</p>
      </div>

      {qrData ? (
        <div className="p-6 border rounded-lg flex flex-col items-center gap-4 bg-white shadow-sm mb-20">
          <QRCode data={qrData} width={400} />
          <Link
            href={qrData}
            target="_blank"
            className="text-xs text-center text-gray-500 break-all max-w-xs"
          >
            {qrData}
          </Link>
        </div>
      ) : (
        <div className="mt-8 p-6 flex flex-col items-center gap-4 bg-white">
          <p>No QR data available</p>
        </div>
      )}
    </div>
  );
};

export default ShareQrRender;
