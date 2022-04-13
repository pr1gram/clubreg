import React, { useEffect } from "react"
import { AppProps } from "next/app"
import "@styles/tailwind.css"
import "react-quill/dist/quill.bubble.css"
import Head from "next/head"
import { AuthProvider } from "@client/auth"
import { ToastProvider } from "@components/common/Toast/ToastContext"
import AlertModal from "@components/alert/AlertModal"

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <div className="font-display antialiased">
      <Head>
        <title>TUCMC Club Registration System</title>
      </Head>
      <AuthProvider>
        <ToastProvider>
          <AlertModal />
          <Component {...pageProps} />
        </ToastProvider>
      </AuthProvider>
    </div>
  )
}

export default App
