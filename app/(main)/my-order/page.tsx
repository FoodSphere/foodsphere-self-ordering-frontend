import MyOrderRender from "@/app/features/main/my-order/Index";
import BottomNavigation from "@/app/components/BottomNavigation";
import CartButton from "@/app/components/CartButton";

const page = () => {
  return (
    <div>
      <MyOrderRender />
      <BottomNavigation />
      <CartButton />
    </div>
  );
};

export default page;
