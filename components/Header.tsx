import React from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";

interface Props {
  accountId: string;
  ownerId: string;
}

const Header = ({ accountId, ownerId }: Props) => {
  return (
    <header className="hidden items-center justify-between gap-5 p-5 sm:flex">
      <Search />
      <FileUploader accountId={accountId} ownerId={ownerId} />
    </header>
  );
};

export default Header;
