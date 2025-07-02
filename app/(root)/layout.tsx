import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import React from "react";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen sm:pr-9 sm:pb-10">
      <div className="lg:w-[23%]">
        <Sidebar />
      </div>

      <div className="flex h-full flex-1 flex-col lg:w-[77%]">
        <MobileNavigation />
        <Header />
        <div className="flex-1 bg-[#F2F4F8] sm:rounded-[30px]">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
