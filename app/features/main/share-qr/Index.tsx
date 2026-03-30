"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "@/app/components/QrCode";
import Link from "next/link";
import usePortal from "@/app/features/main/portal/hook/usePortal";
import { toast } from "@/app/components/ui/toast/use-toast";
import { apiGet } from "@/services/common";
import { Bill, BillUpdateFromSignalR } from "@/types/billType";
import { EBillStatus } from "@/types/enum";
import { useRouter } from "next/navigation";
import { getCookie } from "@/libs/cookie";
import * as signalR from "@microsoft/signalr";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const ShareQrRender = () => {
  const router = useRouter();
  const { handleGetPortal } = usePortal();

  const [qrData, setQrData] = useState<string | null>(null);
  const billRef = useRef<Bill | null>(null);

  const fetchQRData = async () => {
    const response = await handleGetPortal();
    if (response?.id != "") {
      const data = `${BASE_URL}/portals/${response?.id}`;
      setQrData(data);
      toast({
        title: "Success",
        description: "QR data fetched successfully",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to get portal",
        variant: "error",
      });
      setQrData(null);
    }
  };

  const fetchBill = async () => {
    const response = await apiGet("/bill");
    const billData = response?.data;
    if (billData != null) {
      billRef.current = billData;
      if (billData.status === EBillStatus.PAID) {
        router.push(`/payment/success?bill_id=${billData.id}`);
      } else if (billData.status === EBillStatus.COMPLETED) {
        router.push(`/thank-you`);
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to get bill",
        variant: "error",
      });
      billRef.current = null;
    }
  };

  useEffect(() => {
    fetchQRData();
    fetchBill();

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
      const currentBill = billRef.current;
      if (currentBill && updatedBill.resource.id === currentBill.id) {
        if (updatedBill.status === EBillStatus.PAID) {
          router.push(`/payment/success?bill_id=${currentBill.id}`);
        } else if (updatedBill.status === EBillStatus.COMPLETED) {
          router.push("/thank-you");
        }
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 gap-6">
      <h1 className="text-2xl font-bold">Share QR</h1>

      <div className="bg-[var(--primary-orange-main)] px-6 py-2 rounded-lg">
        <p className="text-lg font-bold text-white">Table {billRef.current?.table.name}</p>
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
