import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <div className="bg-brand hidden flex-[4] justify-center p-10 text-white lg:flex">
        <div className="flex max-h-[800px] max-w-[74%] flex-col justify-center space-y-12">
          <Image
            src="/assets/icons/logo-full.svg"
            alt="Drivo"
            width={209}
            height={81}
            className="h-auto"
          />
          <div className="flex flex-col gap-4.5">
            <span className="h1">Manage your files the best way</span>
            <span className="body-1">
              Awesome, we&apos;ve created the perfect place for you to store all
              your documents
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-center">
            <Image
              src="/assets/images/files.png"
              alt="files"
              width={342}
              height={342}
              className="transition-all hover:scale-105 hover:rotate-2"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-[6] flex-col items-center p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <Image
            src="/assets/icons/logo-full-brand.svg"
            alt="Drivo"
            width={224}
            height={82}
            className="h-auto w-[200px] lg:w-[250px]"
          />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
