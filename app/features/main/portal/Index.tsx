"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import usePortal from "./hook/usePortal";

interface PortalRenderProps {
  portal_id: string;
}

const PortalRender = ({ portal_id }: PortalRenderProps) => {
  const { portalData, setPortalData, handlePortal, isLoading } = usePortal();

  useEffect(() => {
    if (portal_id) {
      setPortalData({ portal_id });
      handlePortal({ portal_id });
    }
  }, [portal_id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="flex flex-col items-center max-w-sm w-full space-y-10 text-center">
        {/* Logo Section */}
        <div className="relative w-32 h-32 mb-4 drop-shadow-sm">
          <img
            src="https://storage.ensigame.com/logos/teams/be384481caba4964ce41eda884e4ad24.png"
            alt="FoodSphere Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Status Section */}
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              {/* Outer Pulse Effect */}
              <div className="absolute inset-0 rounded-full bg-primary-orange-main/20 animate-ping" />
              <div className="relative bg-white rounded-full p-2">
                <Loader2 className="w-10 h-10 text-primary-orange-main animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">กำลังเข้าสู่ระบบ</h2>
          </div>

          <div className="space-y-3">
            <p className="text-textcolor-gray-01 text-lg font-medium">กรุณารอสักครู่...</p>
            <p className="text-textcolor-gray-01/60 text-base">เรากำลังเตรียมเมนูอร่อยๆ ให้คุณ</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-20">
          <p className="text-[10px] text-textcolor-gray-01/40 uppercase tracking-widest font-bold">
            Portal ID: {portalData.portal_id || portal_id}
          </p>
          <p className="text-[10px] text-textcolor-gray-01/30 mt-1">© 2024 FoodSphere Ordering System</p>
        </div>
      </div>
    </div>
  );
};

export default PortalRender;
