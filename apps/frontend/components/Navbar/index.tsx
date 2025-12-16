import Image from 'next/image';
import Logo from '../../public/icons/logo.svg';
import { useRouter } from 'next/router';

interface NavbarProps {
  type?: 'light' | 'dark';
}

export default function Navbar(props: NavbarProps) {
  const router = useRouter();
  return (
    <div className="absolute top-2 left-0 z-10 w-full h-[10vh] flex flex-row justify-between items-center px-8">
      <div className="flex justify-center items-center">
        <Logo />
        <h1
          style={{ color: `${props.type == 'light' ? '#ffffff' : ''}` }}
          className="text-2xl font-extrabold ml-6 text-[#4a4a4a] italic"
        >
          datburnttt
        </h1>
      </div>
      <div className="flex items-center">
        {router.pathname === '/home' ? (
          <div></div>
        ) : (
          <button className="bg-primary-light text-white text-base font-bold rounded-[10px] px-8 py-4 border-none shadow-[0px_8px_0px_#cc2a2a] transition-all duration-200 cursor-pointer active:shadow-none active:translate-y-0.5">
            Start a fire!
          </button>
        )}
      </div>
    </div>
  );
}
