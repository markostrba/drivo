"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import Image from "next/image";
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "sonner";
import { uploadFile } from "@/lib/actions/file.action";
import { usePathname } from "next/navigation";
import { convertFileToUrl } from "@/lib/utils";
interface Props {
  accountId: string;
  ownerId: string;
}

const FileUploader = ({ ownerId, accountId }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [canceledFiles, setCanceledFiles] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((files) =>
            files.filter((prevFile) => prevFile.name !== file.name),
          );

          return toast(file.name, {
            description: "Max file size is 50MB",
            classNames: {
              title: "font-semibold!",
              description: "body-2!",
            },
            className: "!text-white !bg-red !rounded-[10px]",
          });
        }
        if (canceledFiles.has(file.name)) return;
        return uploadFile({ file, ownerId, accountId, pathname })
          .then((uploadFile) => {
            if (uploadFile) {
              setFiles((prevFiles) =>
                prevFiles.filter((prevFile) => prevFile.name !== file.name),
              );
            }
          })
          .catch((err) => {
            console.log(err);
            toast(err.message, {
              classNames: {
                title: "font-semibold!",
                description: "body-2!",
              },
              className: "!text-white !bg-red !rounded-[10px]",
            });
          });
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, pathname, canceledFiles],
  );
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleDelete = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    setCanceledFiles((prev) => new Set(prev).add(fileName));
    setFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.name !== fileName),
    );
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button
        className="bg-brand hover:bg-brand-100 flex h-[52px] gap-2 rounded-[41px] px-10 shadow-[0_8px_30px_0_rgba(65,89,214,0.3)]"
        onClick={open}
      >
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={20}
          height={20}
        />
        <span className="button">Upload</span>
      </Button>
      {files.length > 0 && (
        <ul className="fixed right-10 bottom-10 z-50 flex size-full h-fit max-w-[480px] flex-col gap-3 rounded-[20px] bg-white p-7 shadow-[0_8px_30px_0_rgba(65,89,214,0.1)]">
          <h4 className="h4 text-light-100">Uploading</h4>
          {files.map((file, index) => {
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl p-3 shadow-[0_8px_30px_0_rgba(65,89,214,0.1)]"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={convertFileToUrl(file)}
                    width={15}
                    height={15}
                    alt={file.name}
                  />
                  <div className="max-w-[300px]">
                    <span className="subtitle-2 mb-2 line-clamp-1">
                      {file.name}
                    </span>
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={56}
                      alt="Loader"
                    />
                  </div>
                </div>
                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleDelete(e, file.name)}
                  className="cursor-pointer"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
