import BottomNavigation from "@/app/components/BottomNavigation";
import CartRender from "@/app/features/main/cart/Index";

const page = () => {
  return (
    <div>
      <CartRender />
      <BottomNavigation />
    </div>
  );
};

export default page;
