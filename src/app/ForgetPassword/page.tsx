"use client";
import {  useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { forgetEmailByClientId } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";

import logo from "../../../public/Images/logo.png";
import "./forget.css";
export default function ForgetPassword() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [showVerificationText, setshowVerificationText] = useState<any>(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    userName: "",
  });

  const handleInputChange = (key: any, e: any) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const newformdata = {
      ...formData,
      clientId: session?.clientId,
    };
    if (showVerificationText == false) {
      const response = await forgetEmailByClientId({
        token: session?.accessToken,
        newformdata: newformdata,
      });

      // {
      //   loading: "Saving data...",
      //   error: "Error saving data. Please try again.",
      // },
      // {
      // style: {
      //   border: "1px solid #00B56C",
      //   padding: "16px",
      //   color: "#1A202C",
      // },
      // success: {
      //   duration: 2000,
      //   iconTheme: {
      //     primary: "#00B56C",
      //     secondary: "",
      //   },
      // },
      // error: {
      //   duration: 2000,
      //   iconTheme: {
      //     primary: "#00B56C",
      //     secondary: "#FFFAEE",
      //   },
      // },
      // }
      // );

      setFormData({
        userName: "",
        email: "",
      });
      if (response.Msg == "Reset Link send successfully") {
        setshowVerificationText(true);
        toast.success(response.Msg, {
          position: "top-center",
        });
      } else {
        toast.error(response.Msg, {
          position: "top-center",
        });
      }
    }
  };


  return (
    <div
      className="w-100 h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: "url(Images/bgLogo.png)" }}
    >
      {loading ? (
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline fixed  top-0 right-0 bottom-0 left-0 m-auto w-48 h-48  text-green animate-spin dark:text-green fill-black"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <div className="block  flex w-100 h-screen justify-center items-center">
          <div
            className="mx-5 sm:mx-auto mt-20 mb-20 w-full sm:max-w-lg  shadow-lg"
            id="forget_card_bg_color"
          >
            <div className="bg-green" id="border_radius_logo_forget">
              <Image
                className="mx-auto h-24  w-auto"
                src={logo}
                alt="Your Company"
              />
            </div>
            <p className="mt-5 text-start   font-popins text-2xl  leading-9 tracking-tight text-white px-5">
              Forgot Your Password?
            </p>

            <p className="mt-3 text-start   font-popins text-xl  leading-9 tracking-tight text-white px-5">
              Not to worry, we got you! let's get you a new password
            </p>

            {/* <label className=" text-start lg:mx-0 mx-5 block text-sm font-seri leading-6 pt-2 text-gray">
              Not to worry, we got you! let's get you a new password
            </label> */}

            <form className="space-y-6 mx-6" onSubmit={handleSubmit}>
              {showVerificationText ? (
                <p className="text-white text-xl pt-2 text-justify">
                  {" "}
                  We have sent an email with a confirmation link to your email
                  address. In order to complete the reset process, please click
                  the confirmation link. If you do not receive a confirmation
                  email, please check your spam folder. Also, please verify that
                  you entered a valid email address.
                </p>
              ) : (
                <div className="lg:mx-0 mx-5">
                  <div className="grid grid-cols-12 block mt-5 w-full rounded-md  py-1.5 text-gray shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 bg-white sm:text-sm sm:leading-6 outline-green  px-3">
                    <div className="col-span-12 ">
                      <input
                        required
                        placeholder="Please Input Your Name"
                        className="outline-none w-full text-black font-bold"
                        type="text"
                        value={formData.userName}
                        onChange={(e: any) => handleInputChange("userName", e)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 block mt-5 w-full rounded-md  py-1.5 text-gray shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 bg-white sm:text-sm sm:leading-6 outline-green  px-3">
                    <div className="col-span-12 ">
                      <input
                        required
                        placeholder="Please Input Your Email Address"
                        className="outline-none w-full text-black font-bold"
                        type="email"
                        value={formData.email}
                        onChange={(e: any) => handleInputChange("email", e)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {showVerificationText ? (
                ""
              ) : (
                <div className="lg:mx-0 px-20">
                  <button
                    type="submit"
                    className="flex w-full mt-20 justify-center rounded-md bg-green px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-8"
                  >
                    Reset My Password
                  </button>
                </div>
              )}
              <p
                className="text-white text-sm lg:mx-0 mx-5 cursor-pointer hover:text-red pb-0"
                onClick={() => router.push("/signin")}
              >
                <b> Back To Sign In</b>
              </p>
              <br></br>
            </form>
          </div>
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
