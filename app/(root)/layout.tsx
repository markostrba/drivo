import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import TransactionResultModal from "@/components/TransactionResultModal";
import { getCurrentUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { data: user } = await getCurrentUser();

  if (!user) redirect("/sign-in");
  return (
    <div className="flex h-screen xl:pr-9 xl:pb-10">
      <div className="xl:w-[23%]">
        <Sidebar />
      </div>

      <div className="flex h-full flex-1 flex-col xl:w-[77%]">
        <MobileNavigation {...user} />
        <Header {...user} />

        <div className="h-full flex-1 overflow-y-auto bg-[#F2F4F8] p-5 pt-6 xl:rounded-[30px]">
          {children}
          <TransactionResultModal />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
