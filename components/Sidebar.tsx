import React from "react";
import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import { User } from "@/types/global";
const Sidebar = ({
  fullName,
  email,
  avatar,
}: Pick<User, "fullName" | "email" | "avatar">) => {
  return (
    <aside className="remove-scrollbar hidden h-full flex-col overflow-auto sm:flex">
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
        <div className="flex justify-center gap-[14px] lg:justify-start">
          <Image
            src={avatar}
            alt="avatar"
            width={60}
            height={60}
            className="aspect-square rounded-full object-cover"
          />
          <div className="hidden flex-col lg:flex">
            <span className="h5 text-light-1 gap-0.5">{fullName}</span>
            <span className="text-light-2 text-xs leading-[24px] xl:text-[14px]">
              {email}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
//w-[90px] lg:w-[280px] xl:w-[325px]
