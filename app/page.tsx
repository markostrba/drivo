export default function Home() {
  return (
    <>
      <div className="bg-brand px-4 py-2 text-3xl text-white sm:px-8 sm:py-3">
        <span className="text-light-1 h1">light1</span>
        <span className="text-light-2 h2">light2</span>
        <span className="text-light-3 h3">light3</span>
        <span className="text-dark-1 h4">dark1</span>
        <span className="text-dark-2 h5">dark2</span>
        <span className="text-dark-3 subtitle-1">dark3</span>
        <span className="text-blue subtitle-2">blue</span>
        <span className="text-green body-1">green</span>
        <span className="text-pink body-2">pink</span>
        <span className="text-orange button">orange</span>
        <span className="text-blue caption">blue</span>
      </div>
      <div className="bg-red mt-2">red</div>
    </>
  );
}
