import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { fetchAllMembers, fetchMembers } from "@client/fetcher/panel"
import { useAuth } from "@client/auth"
import { useToast } from "@components/common/Toast/ToastContext"
import Router from "next/router"
import { sortThaiDictionary } from "@utilities/object"
import { clubMap } from "@config/clubMap"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import pdfMake from "pdfmake"
import { sliceArrayIntoGroups, sliceArrN } from "@utilities/array"
import { request } from "@handlers/client/utilities/request"
import { Ellipsis } from "@vectors/Loaders/Ellipsis"

const fetchMemberData = async (
  panelID: string,
  setMemberData: Dispatch<SetStateAction<{}>>,
  setToast,
  reFetch,
  setInitMem,
  setCount
) => {
  const data = await fetchAllMembers(panelID)

  let sorted = {
    m4: [],
    m5: [],
    m6: [],
  }

  if (data.status) {
    data.data.forEach((item) => {
      if (item.level.replace("ม.", "") === "4") {
        sorted.m4.push(item)
      }
      if (item.level.replace("ม.", "") === "5") {
        sorted.m5.push(item)
      }
      if (item.level.replace("ม.", "") === "6") {
        sorted.m6.push(item)
      }
    })

    Object.keys(sorted).forEach((key) => {
      sorted[key] = sorted[key].sort(function (x, y) {
        return parseInt(x.room) - parseInt(y.room) || parseInt(x.number) - parseInt(y.number)
      })
    })

    const slcied = sliceArrayIntoGroups([...sorted.m4, ...sorted.m5, ...sorted.m6], 30)
    setMemberData(slcied)
    setCount([...sorted.m4, ...sorted.m5, ...sorted.m6].length)
    setInitMem(true)
  } else {
    switch (data.report) {
      case "sessionError":
        setToast({
          theme: "modern",
          icon: "cross",
          title: "พบข้อผิดพลาดของเซสชั่น",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง",
          crossPage: true,
        })
        reFetch()
        break
      case "invalidPermission":
        setToast({
          theme: "modern",
          icon: "cross",
          title: "คุณไม่ได้รับอนุญาตในการกระทำนี้",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้งหรือ หากยังไม่สามารถแก้ไขได้ให้ติดต่อทาง กช.",
        })
        break
    }
  }
}

const Page = () => {
  const { reFetch, onReady } = useAuth()
  const { addToast } = useToast()

  const [memberData, setMemberData] = useState([])
  const [current, setCurrentID] = useState("")
  const [count, setCount] = useState(0)
  const page = useRef([])
  const [display, setDisplay] = useState(
    <div className="flex flex-col space-y-6">
      <Ellipsis className="h-6 w-[2.4rem]" />
      <h1 className="animate-pulse">กำลังเตรียมไฟล์...</h1>
    </div>
  )
  const [storedPDF, setStoredPDF] = useState<HTMLAnchorElement | null>(null)

  const [initmember, setInitMember] = useState(false)

  const userData = onReady((logged, userData) => {
    if (!logged) {
      Router.push("/auth")
      return userData
    }
    if (!("panelID" in userData) || userData.panelID.length <= 0) {
      Router.push("/select")
      return userData
    }
    return userData
  })

  useEffect(() => {
    if (userData && userData.panelID) {
      refetch()
    }
  }, [userData])

  const refetch = () => {
    const currentID = localStorage.getItem("currentPanel") || userData.panelID[0]
    setCurrentID(currentID)
    fetchMemberData(currentID, setMemberData, addToast, reFetch, setInitMember, setCount)
  }

  const redownload = () => {
    document.getElementById("download").click()
  }

  const downloadpdf = async () => {
    const currentID = localStorage.getItem("currentPanel") || userData.panelID[0]

    const e = await request("database/files", "printReport", {
      panelID: currentID,
      data: memberData,
      meta: {
        clubName: clubMap[current],
        clubID: current,
        count: count,
      },
    })

    if (!e.status) return

    const res = await fetch(`http://clubreg.vercel.app/api/printTable?path=${e.data.path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    })

    const file = await res.blob()
    const blobUrl = URL.createObjectURL(file)
    let link = document.createElement("a") // Or maybe get it from the current document
    link.href = blobUrl
    link.download = `report-${current}.pdf`
    document.body.appendChild(link)
    link.click()
    link.id = "download"

    setDisplay(
      <div className="flex flex-col items-center">
        <h1 className="text-TUCMC-gray-800">สร้างเอกสารเสร็จสมบูรณ์</h1>
        <p className="text-TUCMC-gray-600">
          หากเอกสารยังไม่ถูกดาวน์โหลด{" "}
          <a onClick={redownload} className="cursor-pointer underline hover:text-TUCMC-pink-400">
            กดที่นี่
          </a>
        </p>
      </div>
    )
  }

  useEffect(() => {
    if (initmember) {
      downloadpdf()
    }
  }, [initmember])

  return (
    <div className="space-y-10">
      <div className="fix left-0 top-0 flex min-h-screen w-full items-center justify-center bg-white">{display}</div>
    </div>
  )
}

export default Page
