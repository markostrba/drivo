import React from "react";
import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
const Sidebar = () => {
  return (
    <aside className="remove-scrollbar hidden h-full flex-col overflow-auto xl:flex">
      <div className="flex h-full min-w-[90px] flex-col justify-stretch px-4 lg:px-2 xl:px-4">
        <div className="mb-10 flex items-center py-5 lg:py-7">
          <Link href="/">
            <Image
              src="/assets/icons/logo-full-brand.svg"
              alt="logo"
              width={127}
              height={52}
              className="hidden lg:block"
            />
            <Image
              src="/assets/icons/logo-brand.svg"
              alt="logo"
              width={52}
              height={52}
              className="lg:hidden"
            />
          </Link>
        </div>
        <NavLinks />
      </div>
    </aside>
  );
};

export default Sidebar;
