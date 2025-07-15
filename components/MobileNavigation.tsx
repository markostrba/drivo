"use client";
import Image from "next/image";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import FileUploader from "./FileUploader";
import NavLinks from "./NavLinks";
import { User } from "@/types/global";

const MobileNavigation = ({
  email,
  fullName,
  avatar,
  accountId,
  $id: ownerId,
}: Pick<User, "email" | "fullName" | "avatar" | "accountId" | "$id">) => {
  return (
    <header className="flex h-[60px] items-center justify-between px-5 py-3 sm:hidden">
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={127}
        height={52}
        className="h-10 w-auto"
      />
      <Sheet>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="Search"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent className="h-screen px-3 pt-0!">
          <SheetTitle>
            <div className="text-light-1 my-3 flex items-center gap-2 rounded-full p-1">
              <Image
                src={avatar}
                alt="avatar"
                width={44}
                height={44}
                className="aspect-square w-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="h5">{fullName}</span>
                <span className="text-light-2 text-[14px] leading-[10px]">
                  {email}
                </span>
              </div>
            </div>
          </SheetTitle>
          <NavLinks isMobileNav className="justify-start" />
          <div className="flex flex-col justify-between gap-5 pb-5">
            <FileUploader accountId={accountId} ownerId={ownerId} />
            <Button
              type="submit"
              className="h5 bg-brand/10 text-brand hover:bg-brand/20 flex h-[52px] w-full items-center gap-4 rounded-full px-6 shadow-none transition-all"
              onClick={async () => {}}
            >
              <Image
                src="/assets/icons/logout.svg"
                alt="logo"
                width={24}
                height={24}
              />
              <p>Logout</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
