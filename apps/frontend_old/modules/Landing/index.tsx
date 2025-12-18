import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Barbeque from "../../public/icons/barbeque.png";

export default function Content() {
  const _router = useRouter();

  const [_loginLoading, _setLoginLoading] = useState(false);
  const [_registerLoading, _setRegisterLoading] = useState(false);
  return (
    <div className="w-full h-[90vh] flex flex-col justify-center items-center">
      <div className="flex justify-center items-center w-[72vw] mb-[8vh]">
        <div className="mr-8">
          <h1 className="text-[56px] font-extrabold text-white mb-12">
            You might need some{" "}
            <span className="bg-gradient-to-r from-[#a4b4ff] to-[#3f3cd8] bg-clip-text text-transparent">
              Ice
            </span>{" "}
            because
            <span className="bg-gradient-to-r from-[#e5af23] to-[#f2411a] bg-clip-text text-transparent">
              {" "}
              datburnttt
            </span>
          </h1>
          <p className="text-2xl font-semibold text-[#bdbdbd]">
            You just might be a barbeque..... who knows
          </p>
          <button className="bg-white/10 text-white text-xl font-semibold rounded-[10px] px-10 py-5 border-none transition-all duration-200 cursor-pointer hover:bg-white/20">
            <span className="mr-8">Learn More</span> →
          </button>
        </div>
        <div className="ml-8">
          <Image src={Barbeque} height={500} width={500} alt="Barbeque" />
        </div>
      </div>
    </div>
  );
}
