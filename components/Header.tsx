import React from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { User } from "@/types/index";
import UserDropdown from "./UserDropdown";

const Header = ({
  accountId,
  $id: ownerId,
  email,
  avatar,
  fullName,
  plan,
}: Pick<
  User,
  "email" | "fullName" | "avatar" | "accountId" | "$id" | "plan"
>) => {
  return (
    <header className="hidden items-center justify-between gap-5 p-5 lg:pr-15 xl:flex">
      <Search ownerId={ownerId} userEmail={email} />
      <div className="flex h-[52px] items-center gap-3 lg:gap-9">
        <FileUploader accountId={accountId} ownerId={ownerId} />
        <div className="max-h-[52px]">
          <UserDropdown
            accountId={accountId}
            $id={ownerId}
            email={email}
            avatar={avatar}
            fullName={fullName}
            plan={plan}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
