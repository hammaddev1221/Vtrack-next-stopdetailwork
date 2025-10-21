// import { authenticate } from "@/services/authService"
/* import NextAuth from 'next-auth'
import type { AuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

import https from 'https'

const agent = new https.Agent({
  rejectUnauthorized: false,
})

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userName: { label: 'userName', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      //@ts-ignore
      async authorize(credentials, req) {
        if (typeof credentials !== 'undefined') {
          let data = JSON.stringify({
            userName: credentials?.userName,
            password: credentials?.password,
          })

          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://backend.vtracksolutions.com/Portallogin',
            headers: {
              'Content-Type': 'application/json',
            },
            httpsAgent: agent,
            data: data,
          }
          try {
            const response = await axios.request(config)

            if (response?.data?.accessToken) {
              return response.data
            } else {
              return null
            }
          } catch (error) {
            return null
          }
        } else {
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    //@ts-ignore
    async session({ session, token, user }) {
      return { ...token, accessToken: token.accessToken }
    },
    async jwt({ token, user }) {
      if (typeof user !== 'undefined') {
        return (user as unknown) as JWT
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } */

import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userName: { label: "userName", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "token", type: "text" },
      },
      //@ts-ignore
      async authorize(credentials, req) {
        if (typeof credentials !== "undefined") {
          let data = JSON.stringify({
            userName: credentials?.userName,
            password: credentials?.password,
            token: credentials?.token,
          });

          let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://backend.vtracksolutions.com/Portallogin",
            // url: "http://localhost:80/Portallogin",
            headers: {
              "Content-Type": "application/json",
            },
            httpsAgent: agent,
            data: data,
          };
          try {
            const user: any = await axios.request(config);
            if (user.data.success == false) {
              throw new Error(user.data.message);
              // return {message:user.message}
            } else {
              return user.data;
            }
            // if (user?.data?.accessToken) {
            //   return user;
            // } else {
            //   return user;

            // }
          } catch (error: any) {
            
            throw new Error(error.message);

            return error;
          }
        } else {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    //@ts-ignore
    async session({ session, token, user }) {
      return { ...token, accessToken: token.accessToken };
    },
    async jwt({ token, user }) {
      if (typeof user !== "undefined") {
        return user as unknown as JWT;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
