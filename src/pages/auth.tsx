import PageContainer from "@components/common/PageContainer";
import React, {Fragment, useEffect, useState} from "react";
import {DefaultCard} from "@components/common/Cards";
import Router from "next/router";
import LoginSection from "@components/auth/LoginSection";
import {useAuth} from "@client/auth";
import RegisterSection from "@components/auth/RegisterSection";
import {Loader} from "@components/common/Loader"
import {useToast} from "@components/common/Toast/ToastContext";


const Auth = ({query}) => {

  const {onReady} = useAuth()
  const {addToast} = useToast()
  const [action, setAction] = useState(("register" in query) ? "register" : "login")
  const [loader, setLoader] = useState(false)

  onReady((logged, userData) => {
    if(logged) {
      if (userData.club !== "") {
        return Router.push("/card")
      }
      const lastVisited = localStorage.getItem("lastVisited")
      if (lastVisited && lastVisited !== "") return Router.push(lastVisited)
      Router.push("/select")
    }
  })

  const goRegister = () => {
    Router.push({
        pathname: '',
        query: "register"
      },
      undefined, { shallow: true }
    )
    setAction("register")
  }

  useEffect(() => {
    const cause = localStorage.getItem("beforeExit")

    switch (cause) {
      case "sessionError" :
        addToast({
          theme:"modern",
          icon: "cross",
          title: "พบข้อผิดพลาดของเซสชั่น",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง"
        })
        break
      case "sessionRejected" :
        addToast({
          theme:"modern",
          icon: "cross",
          title: "เซสชั่นของเบราว์เซอร์นี้ถูกปฏิเสธ",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง หากยังไม่สามารถเข้าสู่ระบบได้กรุณาติดต่อทาง กช. โดยเร็ว"
        })
        break
      case "sessionExpired" :
        addToast({
          theme:"modern",
          icon: "info",
          title: "เซสชั่นก่อนหน้าได้หมดอายุไปแล้ว",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง"
        })
        break
      case "missingCookie" :
        addToast({
          theme:"modern",
          icon: "info",
          title: "ไม่พบข้อมูลเซสชั่นบนเบราว์เซอร์",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง"
        })
        break
      case "userNotFound" :
        addToast({
          theme:"modern",
          icon: "cross",
          title: "ไม่พบข้อมูลผู้ใช้งานนี้บนฐานข้อมูล",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง หากยังไม่สามารถเข้าสู่ระบบได้กรุณาติดต่อทาง กช. โดยเร็ว"
        })
        break
    }
    localStorage.setItem("beforeExit","")
  }, [])

  return (
    <PageContainer footer={false}>
      <Loader display={loader}/>
      <div style={{maxWidth: "26rem"}} className="mx-auto my-6 mb-16 md:my-10 md:mb-10 space-y-8 min-h-screen">
        <DefaultCard>
          <p className="font-normal">ในรอบนี้เป็นการสร้างบัญชีสำหรับครูที่ปรึกษาชมรมเท่านั้น หากมีข้อผิดพลาดหรือไม่สามารถสร้างบัญชีได้กรุณาติดต่อ กช.</p>
        </DefaultCard>
        {action == "login" && <LoginSection primaryAction={goRegister} setLoader={setLoader}/>}
        {action == "register" && <RegisterSection swapFunction={() => {setAction("login")}} setLoader={setLoader}/>}
      </div>
    </PageContainer>
  )
}

Auth.getInitialProps = ({query}) => {
  return {query}
}

export default Auth