import { useState } from "react";
import axios from "../../utils/axios";
import { useUserStore } from "../../utils/userStore";
import PrimaryButton from "../../components/Button/Primary";

export default function Content() {
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [userPass, setUserPass] = useState("");
  const { setUser } = useUserStore();
  const [loggingIn, setLoggingIn] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-[90vh] w-full bg-[#f4f4f4]">
      <div className="h-[80vh] rounded-[10px] bg-white flex flex-col justify-between">
        <div className="text-[32px] font-extrabold m-10 mr-[216px] text-primary">Login to an account</div>
        <div className="flex flex-col items-center justify-center p-10">
          <div className="w-full text-[#4a4a4a] font-semibold text-lg mt-3">Email</div>
          <input
            className="w-full h-16 rounded-[10px] box-border my-1 border-[3px] border-primary/35 px-4 text-lg font-medium text-[#4a4a4a] focus:outline-none focus:border-primary"
            value={userEmail}
            onChange={(e) => {
              setUserEmail(e.target.value);
            }}
            type="email"
          />
          <div className="w-full text-[#4a4a4a] font-semibold text-lg mt-3">Password</div>
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
              setLoggingIn(true);
              const { data } = await axios.post("/auth/login", {
                email: userEmail,
                password: userPass,
              });

              if (data.success) {
                setUser(data.user);
                return (window.location.href = "/home");
              } else {
                setError(data.message);
                setLoggingIn(false);
              }
            }}
            loading={loggingIn}
          >
            Login
          </PrimaryButton>
          <div className="text-primary text-sm font-semibold mt-4 ml-1 self-start">{error}</div>
        </div>
      </div>
    </div>
  );
}
