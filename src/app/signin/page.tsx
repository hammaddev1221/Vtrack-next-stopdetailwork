"use client";
import { useEffect, useState } from "react";
import logo from "../../../public/Images/logo.png";
import loadings from "../../../public/Images/loadinglogo.png";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { setLoginTime } from "../../utils/time";
import { GetUsersByClientId, GetLicenseById } from "@/utils/API_CALLS";
import "./login.css";
import https from "https";
import { useSession } from "next-auth/react";
import { fetchZone, vehicleClientById } from "@/lib/slices/zoneSlice";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { getToken, onMessage } from "firebase/messaging";
// import { messaging } from "../../utils/firebaseConfig";
import { useAppDispatch } from "@/lib/store/hooks";
import axios from "axios";
const vapidKey = "BNYAji6KJn9UVMKG3yd3X7jg80QgWLtdG4qEJDIuMgTG6z4XIja6QAWkvCGA7OEjSk9BgR9qCg0muij8K-kSimc"

const SignIn = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdparams = searchParams.get("clientId");
  const pageparams = searchParams.get("page");
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    token: ""
  });

  const { data: session } = useSession();
  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
 useEffect(() => {
  if (typeof window === "undefined") return;

  (async () => {
    const { getToken, onMessage } = await import("firebase/messaging");
    const { messaging } = await import("../../utils/firebaseConfig");

    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          getToken(messaging, { vapidKey })
            .then((currentToken) => {
              if (currentToken) {
                localStorage.setItem("fcmToken", currentToken);
                setFormData((prev) => ({ ...prev, token: currentToken }));
              }
            })
            .catch((err) => console.error("FCM error:", err));
        }
      });
    }

    onMessage(messaging, (payload) => {
      // console.log("Message received in foreground: ", payload);
    });
  })();
}, []);
  const dispatch = useAppDispatch();
  const handleClick = async () => {
    setLoading(true);
    const { userName, password ,token} = formData;
    const data = await signIn("credentials", {
      userName,
      password,
      token,
      redirect: false,
    });

    if (data?.error) {
      if (data.error) {
        toast.error(data.error, {
          position: "top-center",
        });
      }
    } else {
      router.push("/liveTracking");
    }
    if (
      data?.error == "User is deleted" ||
      data?.error == "License Expired" ||
      data?.error == "License Not Available" ||
      data?.error == "Invalid Password" ||
      data?.error == "Invalid UserName"
    ) {
      setLoading(false);
    }
  
  };

  // if (session) {
  //   dispatch(
  //     fetchZone({
  //       clientId: session?.clientId,
  //       token: session?.accessToken,
  //     })
  //   );
  //   dispatch(
  //     vehicleClientById({
  //       clientId: session?.clientId,
  //       token: session?.accessToken,
  //     })
  //   );
  // }
 useEffect(() => {
    if (session?.clientId && session?.accessToken) {
      // console.log("Session established in signin page:", session);
      dispatch(fetchZone({ clientId: session?.clientId, token: session?.accessToken }));
      dispatch(vehicleClientById({ clientId: session?.clientId, token: session?.accessToken }));
    }
  }, [session, dispatch]);
  
  useEffect(()=>{
    const fetchData = async () => {
      if (
        clientIdparams !== undefined &&
        clientIdparams !== null &&
        pageparams !== undefined &&
        pageparams !== null
      ) {
        try {
          const users = await GetUsersByClientId({
            // token: session.accessToken,
            clientId: clientIdparams,
          });
  
          const licenseInfo = await GetLicenseById({
            // token: session.accessToken,
            id: clientIdparams,
          });
          // setLoading(true);
    let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://backend.vtracksolutions.com/Portallogin",
          headers: {
            "Content-Type": "application/json",
          },
          httpsAgent: agent,
          data: {
            userName: licenseInfo[0].accountCode + "@" + users[0].userName,
            password: users[0].password,
          },
        };

        const response = await axios.request(config);

        if (response?.data?.accessToken) {        

          localStorage.setItem("user", JSON.stringify(response?.data));
          router.push("/liveTracking?screen=full");
        }
          // const data = await signIn("credentials", {
          //   userName: licenseInfo[0].accountCode + "@" + users[0].userName,
          //   password: users[0].password,
          //   token: formData?.token,
          //   redirect: false,
          // });
  
          // if (data?.error) {
          //   if (data.error) {
          //     toast.error(data.error, {
          //       position: "top-center",
          //     });
          //     setLoading(false);
          //   }
          // } else if (data?.ok) {
          //   // Wait a bit to ensure session is established
          //   setTimeout(() => {
          //     router.push("/liveTracking?screen=full");
          //   }, 500);
          // }
          // if (
          //   data?.error == "User is deleted" ||
          //   data?.error == "License Expired" ||
          //   data?.error == "License Not Available" ||
          //   data?.error == "Invalid Password" ||
          //   data?.error == "Invalid UserName"
          // ) {
          //   setLoading(false);
          // }
  
          
        } catch (error) {        
          console.error("Error fetching data:", error);
        }
      }
    };
  
    fetchData();

  },[clientIdparams, pageparams, router])

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleClick();
    }
  };
  return (
    <div
      className="w-100 h-screen bg-no-repeat bg-cover bg-center"
      style={{
        position: "relative",
        backgroundImage: "url(Images/bgLogo.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        // filter: "blur(4px)",
        // zIndex: "-1 !important",
      }}
    >
      <ToastContainer />
      {loading ? (
        <div>
          <div
            style={{
              display: "flex",
              height: "100vh",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image src={loadings} alt="" className="loading_all_page" />
          </div>
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline fixed top-20 right-0 bottom-0 left-0 m-auto w-12 h-12  text-green animate-spin dark:text-green fill-black"
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
            <span className="sr-only text-3xl">Loading...</span>
          </div>
        </div>
      ) : (
        // <div role="status">
        //   <svg
        //     aria-hidden="true"
        //     className="inline fixed  top-0 right-0 bottom-0 left-0 m-auto w-48 h-48  text-green animate-spin dark:text-green fill-black"
        //     viewBox="0 0 100 101"
        //     fill="none"
        //     xmlns="http://www.w3.org/2000/svg"
        //   >
        //     <path
        //       d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        //       fill="currentColor"
        //     />
        //     <path
        //       d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        //       fill="currentFill"
        //     />
        //   </svg>
        //   <span className="sr-only">Loading...</span>
        // </div>
        <div className="block  flex w-100 h-screen justify-center items-center">
          <div
            className=" mx-5 sm:mx-auto mt-20 mb-20 w-full sm:max-w-lg"
            id="login_bg_color_box"
          >
            <div className="bg-green" id="border_radius_logo">
              <Image
                className="mx-auto h-24  w-auto"
                src={logo}
                alt="Your Company"
              />
            </div>
            <p className="mt-5 text-center   font-popins text-4xl  leading-9 tracking-tight text-white ">
              Welcome!
            </p>

            <label className=" text-center block text-sm font-popins leading-6 text-white">
              <b> Login to get started</b>{" "}
            </label>

            <form className="space-y-6 lg:mx-5 mx-0" action="#" method="POST">
              <div className="lg:mx-0 mx-5">
                <div className="grid grid-cols-12 block mt-5 w-full rounded-md  py-1.5 text-labelColor shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-green  px-3 bg-white ">
                  <div className="col-span-11 ">
                    <input
                      id="userName"
                      required
                      placeholder="account_code@username"
                      className="outline-none w-full text-black font-bold"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-1 cursor-pointer">
                    <PersonSearchIcon className="text-gray lg:ms-5 ms-2" />
                  </div>
                </div>
              </div>
              <div className="lg:mx-0 mx-5">
                <div className="grid lg:grid-cols-12 grid-cols-12  rounded-md  py-1.5 text-labelColor shadow-sm border border-grayLight border hover:border-green  placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-green  px-3 bg-white">
                  <div className="col-span-11 ">
                    <input
                      id="password"
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="●●●●●●●●●●"
                      name="password"
                      className="outline-none w-full text-black font-bold"
                      value={formData.password}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
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
                        onKeyPress={handleKeyPress}
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
              </div>
              <p
                className="text-white font-popins text-sm mt-10 lg:mx-0 mx-8 cursor-pointer hover:text-red"
                onClick={() => router.push("/ForgetPassword")}
              >
                <b> Forgot Password</b>
              </p>
              <div className="lg:mx-0 mx-5">
                {/* <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-green px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-8"
                  onClick={handleClick}
                >
                  Log in
                </button> */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <a
                    onClick={handleClick}
                    className="animated-button1  cursor-pointer  mb-8"
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <p className="px-20"> Log In</p>
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
