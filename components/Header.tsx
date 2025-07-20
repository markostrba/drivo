import React from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";

interface Props {
  accountId: string;
  ownerId: string;
  userEmail: string;
}

const Header = ({ accountId, ownerId, userEmail }: Props) => {
  return (
    <header className="hidden items-center justify-between gap-5 p-5 xl:flex">
      <Search ownerId={ownerId} userEmail={userEmail} />
      <FileUploader accountId={accountId} ownerId={ownerId} />
    </header>
  );
};

export default Header;
