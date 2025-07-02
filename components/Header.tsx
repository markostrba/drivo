import React from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";
const Header = () => {
  return (
    <header className="hidden items-center justify-between gap-5 p-5 sm:flex">
      <Search />
      <FileUploader />
    </header>
  );
};

export default Header;
