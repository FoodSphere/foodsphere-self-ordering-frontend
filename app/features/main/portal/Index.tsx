"use client";

import { useEffect } from "react";
import usePortal from "./hook/usePortal";

interface PortalRenderProps {
  portal_id: string;
}

const PortalRender = ({ portal_id }: PortalRenderProps) => {
  const { portalData, setPortalData, handlePortal } = usePortal();

  useEffect(() => {
    setPortalData({ portal_id });
    handlePortal({ portal_id });
  }, [portal_id]);

  return (
    <div>
      <h1>Portal {portalData.portal_id}</h1>
    </div>
  );
};

export default PortalRender;
