// pages/expired-link.js
'use client'
import Head from 'next/head';
import logo from "@/../public/Images/logo.png";
import Image from "next/image";

export default function ExpiredLinkPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
            <Head>
                <title>Link Expired | Your Brand</title>
                <meta name="description" content="This tracking link has expired" />
            </Head>

            <div className="w-full max-w-2xl px-4 rounded-2xl border border-green-100 p-8 shadow-xl">
                {/* Logo Placeholder - Replace with your actual logo */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        {/* Replace this div with your logo component */}
                        <Image src={logo} alt="Logo" className="h-10 w-auto lg:h-14" />

                    </div>
                </div>

                <div className="bg-white  md:p-10   text-center ">
                    <div className="relative mb-8">
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center justify-center w-20 h-20 bg-green-500 rounded-full shadow-lg">
                                <svg
                                    className="w-12 h-12 text-white"
                                    fill="none"
                                    stroke="green"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Tracking Link Expired
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                        This vehicle tracking link is no longer available. Please contact the sender for a new link if you need continued access.
                    </p>

                    {/* <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                        >
                            Return to Homepage
                        </button>
                        <button
                            onClick={() => window.location.href = '/contact'}
                            className="px-6 py-3 bg-white border border-green-500 text-green-500 hover:bg-green-50 font-medium rounded-lg shadow-sm transition duration-300"
                        >
                            Contact Support
                        </button>
                    </div> */}
                </div>

                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Designed by Vtrack Solutions</p>
                </div>
            </div>

            {/* Floating decorative elements */}
            <div className="fixed bottom-0 left-0 w-full h-16 bg-green-500 opacity-10 -z-10"></div>
            <div className="fixed top-1/4 -left-20 w-40 h-40 rounded-full bg-green-100 opacity-50 -z-10"></div>
            <div className="fixed bottom-1/3 -right-20 w-48 h-48 rounded-full bg-green-100 opacity-50 -z-10"></div>
        </div>
    );
}