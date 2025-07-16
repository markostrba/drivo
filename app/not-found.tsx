import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="mb-10 flex max-w-[200px] flex-col items-center gap-5 md:mb-50 md:max-w-full">
        <h1 className="h1 !text-7xl text-red-100">404</h1>
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-light-1/85 h2 !text-2xl">Page not found</h2>
          <p className="text-light-2 subtitle-2">
            Sorry, the page or file you&apos;re looking for doesn&apos;t exist.
          </p>
          <button className="bg-brand button shadow-2 mt-8 rounded-full px-10 py-5 text-white hover:scale-105">
            <Link href="/">Go back home</Link>
          </button>
        </div>
      </div>
    </div>
  );
}
