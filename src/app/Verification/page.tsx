"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { forgetPasswordClientId, expireForgotLink } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";
import moment from "moment";

import logo from "../../../public/Images/logo.png";
import { base64encode, base64decode } from "nodejs-base64";

import "./verification.css";
import { Button } from "@mui/material";
export default function Verification() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [expireLink, setExpireLink] = useState<any>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id: any = searchParams.get("q");
  
  const [formData, setFormData] = useState<any>({
    password: "",
    link: base64decode(id),
  });

  const [inputConfirmPassword, setinputConfirmPassword] = useState("");
  const [lineExpire, setLinkExpire] = useState(false);
  const moment = require("moment-timezone");
  // Use the decoded value in your component
  
  const handleInputChange = (key: any, e: any) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  // useEffect(() => {
  //   const timeOut = setTimeout(() => {
  //     setLinkExpire(true);
  //   }, 60000);
  //   return () => clearTimeout(timeOut);
  // }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // const newformdata = {
    //   ...formData,
    //   clientId: session?.clientId,
    // };
    if (formData.password.length < 6 || inputConfirmPassword.length < 6) {
      toast.error("Password Max Lenght Is 6 Character");
    } else if (
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password || inputConfirmPassword)
    ) {
      toast.error(
        "Please include at least one special character in the password",
        { position: "top-center" }
      );
    } else {
      if (inputConfirmPassword == formData.password) {
        const response = await toast.promise(
          forgetPasswordClientId({
            token: session?.accessToken,
            newformdata: formData,
          }),
          {
            loading: "Saving data...",
            success: "Data saved successfully!",
            error: "Error saving data. Please try again.",
          },
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C",
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE",
              },
            },
            error: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE",
              },
            },
          }
        );

        toast.success("Password Successfully Updated");
    router.push("/signin");
        setFormData({
          password: "",
        });
        setinputConfirmPassword("");
      } else {
        toast.error("please Enter Same Passord", {
          position: "top-center",
        });
      }
    }
  };

  useEffect(() => {
    const func = async () => {
      const result = await expireForgotLink({ link: base64decode(id) });
      setExpireLink(result);
    };
    func();
  }, []);

  useEffect(() => {
    const originalTimestamp: any = new Date(expireLink.timestamp);
    const currentTimestamp: any = new Date();
    const timeDifference = currentTimestamp - originalTimestamp;

    if (timeDifference >= 5 * 60 * 1000) {
      setLinkExpire(true);
    } else {
      setLinkExpire(false);
    }
  }, [expireLink?.timestamp]);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleShowPasswordConfirm = () => {
    setshowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div
      className="w-100 h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: "url(Images/bgLogo.png)" }}
    >
      {/* <ToastContainer /> */}

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

            {lineExpire ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  flexDirection: "column",
                }}
              >
                <h2 className="text-2xl font-bold text-white font-popins py-16 text-center">
                  Link Has Been Expired Please Try Again
                </h2>
                <button
                  onClick={() => router.push("/signin")}
                  className="flex w-full mt-20 justify-center rounded-md bg-green px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-8"
                >
                  Back To Sign In
                </button>
              </div>
            ) : (
              <div>
                <p className="mt-5 text-start   font-popins text-2xl  leading-9 tracking-tight text-white px-5">
                  Enter New Password
                </p>
                <form className="space-y-6 mx-6" onSubmit={handleSubmit}>
                  <div className="lg:mx-0 mx-5">
                    <div className="grid grid-cols-12 block mt-5 w-full rounded-md  py-1.5 text-gray shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 bg-white sm:text-sm sm:leading-6 outline-green  px-3">
                      {/* <div className="col-span-12 ">
                    <input
                      required
                      placeholder="Please Enter Your New Password"
                      className="outline-none w-full text-black font-bold"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e: any) => handleInputChange("password", e)}
                    />
                  </div> */}
                      <div className="col-span-11 ">
                        <input
                          required
                          placeholder="Please Enter Your New Password"
                          className="outline-none w-full text-black font-bold"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e: any) =>
                            handleInputChange("password", e)
                          }
                        />
                      </div>
                      <div className="col-span-1 cursor-pointer">
                        {showPassword ? (
                          <svg
                            className="h-4 lg:w-16 w-10 text-gray mt-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            onClick={handleShowPassword}
                          >
                            {" "}
                            <circle cx="12" cy="12" r="10" />{" "}
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 lg:w-16 w-10 text-gray mt-1"
                            onClick={handleShowPassword}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* <div className="grid grid-cols-12 block mt-5 w-full rounded-md  py-1.5 text-gray shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 bg-white sm:text-sm sm:leading-6 outline-green  px-3">
                  <div className="col-span-12 ">
                    <input
                      required
                      placeholder="Please Enter Your Confirm Password"
                      className="outline-none w-full text-black font-bold"
                      type="email"
                      value={formData.email}
                      onChange={(e: any) => handleInputChange("password", e)}
                    />
                  </div>
                </div> */}
                  </div>
                  <div className="lg:mx-0 mx-5">
                    <div className="grid grid-cols-12 block mt-5 w-full rounded-md  py-1.5 text-gray shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 bg-white sm:text-sm sm:leading-6 outline-green  px-3">
                      {/* <div className="col-span-12 ">
                    <input
                      required
                      placeholder="Please Enter Confirm Password"
                      className="outline-none w-full text-black font-bold"
                      type={showPassword ? "text" : "password"}
                      value={inputConfirmPassword}
                      onChange={(e: any) =>
                        setinputConfirmPassword(e.target.value)
                      }
                    />
                  </div> */}
                      <div className="col-span-11 ">
                        <input
                          required
                          placeholder="Please Enter Confirm Password"
                          className="outline-none w-full text-black font-bold"
                          type={showConfirmPassword ? "text" : "password"}
                          value={inputConfirmPassword}
                          onChange={(e: any) =>
                            setinputConfirmPassword(e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-1 cursor-pointer">
                        {showConfirmPassword ? (
                          <svg
                            className="h-4 lg:w-16 w-10 text-gray mt-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            onClick={handleShowPasswordConfirm}
                          >
                            {" "}
                            <circle cx="12" cy="12" r="10" />{" "}
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 lg:w-16 w-10 text-gray mt-1"
                            onClick={handleShowPasswordConfirm}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* <div className="grid grid-cols-12 block mt-5 w-full rounded-md  py-1.5 text-gray shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 bg-white sm:text-sm sm:leading-6 outline-green  px-3">
                  <div className="col-span-12 ">
                    <input
                      required
                      placeholder="Please Enter Your Confirm Password"
                      className="outline-none w-full text-black font-bold"
                      type="email"
                      value={formData.email}
                      onChange={(e: any) => handleInputChange("password", e)}
                    />
                  </div>
                </div> */}
                  </div>

                  <div className="lg:mx-0 px-20">
                    <button
                      type="submit"
                      className="flex w-full mt-10 justify-center rounded-md bg-green px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-8"
                      // onClick={handleClick}
                    >
                      Save
                    </button>
                  </div>
                  <br></br>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
