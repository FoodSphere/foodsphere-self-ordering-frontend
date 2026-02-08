import PortalRender from "@/app/features/main/portal/Index";

interface PortalPageProps {
  params: Promise<{
    portal_id: string;
  }>;
}

const page = async (props: PortalPageProps) => {
  const params = await props.params;
  const portal_id: string = params.portal_id;

  return (
    <div>
      <PortalRender portal_id={portal_id} />
    </div>
  );
};

export default page;
