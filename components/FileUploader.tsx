import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const FileUploader = () => {
  return (
    <Button className="bg-brand hover:bg-brand-100 flex h-[52px] gap-2 rounded-[41px] px-10 shadow-[0_8px_30px_0_rgba(65,89,214,0.3)]">
      <Image
        src="/assets/icons/upload.svg"
        alt="upload"
        width={20}
        height={20}
      />
      <span className="button">Upload</span>
    </Button>
  );
};

export default FileUploader;
