"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import Image from "next/image";
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "sonner";
// import { uploadFile } from "@/lib/actions/file.action";
import { convertFileToUrl, getFileType } from "@/lib/utils";
import useUploadFile from "@/hooks/useUploadFile";
import { UploadProgress } from "appwrite";
import { Progress } from "@/components/ui/progress";
import Thumbnail from "./Thumbnail";
interface Props {
  accountId: string;
  ownerId: string;
}

const FileUploader = ({ ownerId, accountId }: Props) => {
  const [files, setFiles] = useState<{ file: File; progress: number }[]>([]);
  const { uploadFile, cancelUploadFile } = useUploadFile({
    accountId,
    ownerId,
  });

  const onProgress = (progress: UploadProgress, fileName: string) => {
    console.log("progress", progress, fileName);
    setFiles((prevFiles) =>
      prevFiles.map((prevFile) =>
        prevFile.file.name === fileName
          ? { ...prevFile, progress: progress.progress }
          : prevFile,
      ),
    );
    // setFiles((prevFiles) =>
    //   prevFiles.map(
    //     ({ file, progress }) =>
    //       file.name === fileName && { file, progress: progress.progress },
    //   ),
    // );
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file) => ({ file, progress: 0 })));

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((files) =>
            files.filter(({ file: prevFile }) => prevFile.name !== file.name),
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

        return uploadFile(file, onProgress)
          .then((uploadFile) => {
            if (uploadFile) {
              setFiles((prevFiles) =>
                prevFiles.filter(
                  ({ file: prevFile }) => prevFile.name !== file.name,
                ),
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
    [uploadFile],
  );
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleDelete = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    cancelUploadFile(fileName);
    setFiles((prevFiles) =>
      prevFiles.filter(({ file: prevFile }) => prevFile.name !== fileName),
    );
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button
        className="bg-brand hover:bg-brand-100 !shadow-2 flex h-[52px] gap-2 rounded-[41px] px-10"
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
        <ul className="!shadow-1 fixed right-10 bottom-10 z-50 flex size-full h-fit max-w-[480px] flex-col gap-3 rounded-[20px] bg-white p-7">
          <h4 className="h4 text-light-100">Uploading</h4>
          {files.map(({ file, progress }, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${file.name}-${index}`}
                className="!shadow-3 flex items-center justify-between gap-3 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <div className="max-w-[300px]">
                    <span className="subtitle-2 mb-2 line-clamp-1">
                      {file.name}
                    </span>
                    <Progress value={progress} className="h-[4px] w-[80px]" />
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
