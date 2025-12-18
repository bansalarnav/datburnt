import { useState } from "react";
import PrimaryButton from "../../components/Button/Primary";
import axios from "../../utils/axios";
import { useUserStore } from "../../utils/userStore";

export default function Content() {
  const [userName, setUserName] = useState("");
  const [userPass, setUserPass] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUserStore();

  const [registering, setRegistering] = useState(false);

  const generateRandomNum = () => {
    const num1 = Math.floor(Math.random() * 10).toString();
    const num2 = Math.floor(Math.random() * 10).toString();
    const num3 = Math.floor(Math.random() * 10).toString();
    const num4 = Math.floor(Math.random() * 10).toString();
    const num5 = Math.floor(Math.random() * 10).toString();
    const num = num1 + num2 + num3 + num4 + num5;
    return num;
  };
  const [avatar, _setAvatar] = useState(
    `https://avatars.dicebear.com/api/adventurer-neutral/${generateRandomNum()}.svg`
  );
  return (
    <div className="flex flex-col items-center justify-center h-[90vh] w-full bg-[#f4f4f4]">
      <div className="h-[80vh] rounded-[10px] bg-white flex flex-col justify-between">
        <div className="text-[32px] font-extrabold m-10 mr-[216px] text-primary">
          Create an Account
        </div>
        <div className="flex flex-col items-center justify-center p-10">
          <div className="w-full text-[#4a4a4a] font-semibold text-lg mt-3">
            Username
          </div>
          <input
            className="w-full h-16 rounded-[10px] box-border my-1 border-[3px] border-primary/35 px-4 text-lg font-medium text-[#4a4a4a] focus:outline-none focus:border-primary"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            type="text"
          />
          <div className="w-full text-[#4a4a4a] font-semibold text-lg mt-3">
            Email
          </div>
          <input
            className="w-full h-16 rounded-[10px] box-border my-1 border-[3px] border-primary/35 px-4 text-lg font-medium text-[#4a4a4a] focus:outline-none focus:border-primary"
            value={userEmail}
            onChange={(e) => {
              setUserEmail(e.target.value);
            }}
            type="email"
          />
          <div className="w-full text-[#4a4a4a] font-semibold text-lg mt-3">
            Password
          </div>
          <input
            className="w-full h-16 rounded-[10px] box-border my-1 border-[3px] border-primary/35 px-4 text-lg font-medium text-[#4a4a4a] focus:outline-none focus:border-primary"
            value={userPass}
            onChange={(e) => {
              setUserPass(e.target.value);
            }}
            type="password"
          />
          <PrimaryButton
            className="text-lg font-bold w-full mt-6"
            onClick={async () => {
              setRegistering(true);
              const { data } = await axios.post("/auth/register", {
                username: userName,
                avatar: avatar,
                email: userEmail,
                password: userPass,
              });

              if (data.success) {
                setUser(data.user);
                return (window.location.href = "/home");
              } else {
                setError(data.message);
                setRegistering(false);
              }
            }}
            loading={registering}
          >
            Create Account
          </PrimaryButton>
          <div className="text-primary text-sm font-semibold mt-4 ml-1 self-start">
            {error}
          </div>
        </div>
      </div>
    </div>
  );
}
