import MenuRender from "@/app/features/main/menu/Index";
import BottomNavigation from "@/app/components/BottomNavigation";
import CartButton from "@/app/components/CartButton";

const page = () => {
  return (
    <div>
      <MenuRender />
      <BottomNavigation />
      <CartButton />
    </div>
  );
};

export default page;
