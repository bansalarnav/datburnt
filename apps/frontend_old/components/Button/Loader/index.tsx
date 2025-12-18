export default function Loader() {
  return (
    <div className="inline-flex">
      <span className="w-2 h-2 rounded-full bg-white animate-[flashing_1.4s_infinite_linear] mx-1 inline-block"></span>
      <span className="w-2 h-2 rounded-full bg-white animate-[flashing_1.4s_infinite_linear] mx-1 inline-block [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-white animate-[flashing_1.4s_infinite_linear] mx-1 inline-block [animation-delay:0.4s]"></span>
    </div>
  );
}
