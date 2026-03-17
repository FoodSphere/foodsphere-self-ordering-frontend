"use client";

import { useEffect, useState } from "react";
import QRCode from "@/app/components/QrCode";
import Link from "next/link";
import usePortal from "@/app/features/main/portal/hook/usePortal";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const ShareQrRender = () => {
  const { handleGetPortal } = usePortal();

  const [qrData, setQrData] = useState<string | null>(null);

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

  useEffect(() => {
    fetchQRData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 gap-6">
      <h1 className="text-2xl font-bold">Share QR</h1>

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
