import BottomNavigation from "../components/BottomNavigation";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      {children}
      <BottomNavigation />
    </div>
  );
}
