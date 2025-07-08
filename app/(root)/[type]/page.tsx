import React from "react";

const Page = async ({ params }: { params: Promise<{ type: string }> }) => {
  const type = (await params).type || "";

  const files = [
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
    { name: "file4" },
    { name: "file5" },
  ];

  return (
    <div className="flex flex-col gap-9 pt-[34px] pr-[40px] pb-[58px] pl-[37px]">
      <section className="text-light-1">
        <h1 className="h1 mb-2.5">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </h1>
        <div className="flex justify-between">
          <div className="body-1">
            Total: <span className="h5">12GB</span>
          </div>
          <div className="text-light-2 flex gap-2.5 text-[14px] font-medium">
            Sort by: <div>sort</div>
          </div>
        </div>
      </section>

      {!files.length ? (
        <section className="grid w-full gap-6.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => (
            <div key={file.name} className="border-red border">
              {file.name}
            </div>
          ))}
        </section>
      ) : (
        <p className="body-1 text-light-2 mt-45 text-center">
          No Files Uploaded
        </p>
      )}
    </div>
  );
};

export default Page;
