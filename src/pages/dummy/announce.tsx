import PageContainer from "@components/common/PageContainer"
import { AnnounceSplash } from "@vectors/decorations/AnnounceSplash"
import ClubStatus from "@components/dummy/announce/ClubStatus"
import { useAuth } from "@client/auth"
import Router from "next/router"
import { isEmpty } from "@utilities/object"
import React, { useEffect, useState } from "react"
import ConfirmModal from "@components/dummy/select/ConfirmModal"
import DataModal from "@components/dummy/select/DataModal"
import { ExclamationIcon } from "@heroicons/react/solid"
import { Loader } from "@components/common/Loader"
import { useTimer } from "@utilities/timers"
import classnames from "classnames"
import { announceTime, endLastRound, endRegClubTime, lastround } from "@config/time"
import { WaitingScreen } from "@components/common/WaitingScreen"
import { ArrowLeftIcon, RefreshIcon, LogoutIcon } from "@heroicons/react/outline"
import { motion } from "framer-motion"

const Announce = () => {
  const [desc, setDesc] = useState(<></>)
  const [bottomDesc, setBottomDesc] = useState(<></>)
  const [userData, setUserData] = useState<any>({})
  const [reload, setReload] = useState(false)
  const [modalState, setModalState] = useState({ open: false, data: {} })
  const [select, setSelect] = useState({ state: false, mode: "confirm" })
  const [dataModal, setDataModal] = useState(false)
  const [isOverr, setOverr] = useState(false)
  const [reserved, setReserved] = useState(false)
  const [hideA, setHideA] = useState(false)
  const [completeHide, setCompHide] = useState(false)
  const [reserved2, setReserved2] = useState(false)
  const [loader, setLoader] = useState(false)

  const reFetch = () => {
    setReload(true)
  }

  useEffect(() => {
    const d = JSON.parse(localStorage.getItem("dummyData") || "{}")
    const aud = JSON.parse(localStorage.getItem("dummyAuditions") || "[]")
    const exState = JSON.parse(localStorage.getItem("dummyExState") || "{}")

    if (!aud.includes("ก40002")) {
      aud.unshift("ก40002")
    }
    if (!aud.includes("ก40000")) {
      aud.unshift("ก40000")
    }
    if (!aud.includes("ก40001")) {
      aud.unshift("ก40001")
    }

    if (Object.values(exState).length > 0) {
      setOverr(true)
    } else {
      setOverr(false)
    }
    const audobj = {}
    aud.forEach((e, i) => {
      if (e in exState) {
        audobj[e] = exState[e]
        return
      }

      audobj[e] = "passed"

      if (i === 0) {
        audobj[e] = "passed"
      }
      if (i === 1) {
        audobj[e] = "failed"
      }
      if (i === 2) {
        audobj[e] = "reserved"
      }
    })

    setUserData({ ...d, audition: audobj })

    setReload(false)
  }, [reload])

  const before = false

  const limit =
    new Date().getTime() < 1623776400000
      ? 1623776400000
      : new Date().getTime() < 1623862800000
      ? 1623862800000
      : 1623949200000

  const timer = useTimer(limit)
  const openTimer = useTimer(announceTime)

  useEffect(() => {
    const currentTime = new Date().getTime()

    if (currentTime < lastround) {
      setTimeout(() => {
        Router.push("/select")
      }, lastround - currentTime)
    }
  }, [])

  useEffect(() => {
    if (userData.audition && !isEmpty(userData.audition)) {
      setDesc(<></>)
      setBottomDesc(<></>)
      const values = Object.values(userData.audition)
      if (values.includes("passed")) {
        setDesc(
          <div className="px-6 mt-12 text-center md:mt-20">
            <p className="text-TUCMC-gray-700">
              กดยืนยันสิทธิ์หรือสละสิทธิ์ชมรมที่ผ่านการ คัดเลือกภายในวันนี้ (เหลือเวลาอีก {timer.hour} ชั่วโมง{" "}
              {timer.min} นาที)
            </p>
            <p className="text-TUCMC-gray-700">
              หากไม่ดำเนินการใด ๆ ภายในเวลาที่กำหนด จะถือว่าสละสิทธิ์ชมรมที่ผ่านการคัดเลือกโดยอัตโนมัติ
            </p>
          </div>
        )
      }
      if (
        (values.includes("rejected") || values.includes("failed")) &&
        !values.includes("passed") &&
        !values.includes("reserved")
      ) {
        setBottomDesc(
          <p className="max-w-md px-16 mx-auto mt-20 text-center text-TUCMC-gray-700">
            กรุณารอเลือกเข้าชมรมที่ไม่มีการ Audition และยังมีที่นั่งว่างอยู่ ในวันที่ 2 มิ.ย. 66
          </p>
        )
      }
      if (values.includes("passed") && values.includes("reserved")) {
        setDesc((prevState) => (
          <>
            {prevState}
            <h1 className="mt-6 text-center text-TUCMC-gray-700">หรือ</h1>
          </>
        ))
      }
      if (values.includes("reserved")) {
        setDesc((prevState) => (
          <>
            {prevState}
            <div className="flex flex-col items-center px-6 mt-6 space-y-2">
              <p className="text-TUCMC-gray-700">รอลุ้นลำดับสำรอง 2 รอบ</p>
              <div>
                <div className="flex items-center space-x-1">
                  <div
                    className={classnames(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-medium text-white",
                      reserved ? "bg-TUCMC-gray-700" : "bg-TUCMC-gray-500"
                    )}
                  >
                    1
                  </div>
                  <span className={classnames(reserved ? "text-TUCMC-gray-700" : "text-TUCMC-gray-500")}>
                    31 พ.ค. 66 เวลา 07.30 น.
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div
                    className={classnames(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-medium text-white",
                      reserved2 ? "bg-TUCMC-gray-700" : "bg-TUCMC-gray-500"
                    )}
                  >
                    2
                  </div>
                  <span className={classnames(reserved2 ? "text-TUCMC-gray-700" : "text-TUCMC-gray-500")}>
                    1 มิ.ย. 66 เวลา 07.30 น.
                  </span>
                </div>
              </div>
            </div>
          </>
        ))
      }
    }
  }, [userData, timer])

  const clearState = () => {
    setModalState({ open: false, data: {} })
  }

  return <PageContainer>
    <div className={classnames("fixed top-0 z-[98] mx-auto flex w-full justify-center", completeHide && "hidden")}>
      <motion.div
        onClick={() => {
          setHideA(true)
        }}
        animate={hideA ? { y: -80 } : { y: 0 }}
        transition={{ duration: 0.8 }}
        onAnimationComplete={() => {
          hideA &&
          setTimeout(() => {
            setCompHide(false)
            setHideA(false)
          }, 9000)
          setCompHide(hideA)
        }}
        className="flex items-center py-2 pl-4 pr-6 space-x-2 rounded-md shadow-md cursor-pointer bg-TUCMC-orange-500"
      >
        <ExclamationIcon className="w-10 h-10 mt-2 text-white animate-pulse" />
        <div>
          <div className="flex items-center space-x-2 font-medium text-white">
            <h1>คุณกำลังอยู่ในโหมดระบบจำลอง</h1>
          </div>
          <div className="flex justify-center text-sm text-white">
            <p>ทุกการกระทำในโหมดนี้จะไม่มีผลในระบบจริง</p>
          </div>
        </div>
      </motion.div>
    </div>
    <Loader display={loader} />
    <div className="fixed bottom-4 z-[10] flex w-full flex-col-reverse items-start px-4 sm:flex-row sm:items-center sm:space-x-4">
      <div
        onClick={() => {
          Router.push("/dummy/select")
        }}
        className="flex items-center px-6 py-2 mt-1 space-x-2 font-medium text-white rounded-full cursor-pointer bg-TUCMC-pink-400 sm:mt-0"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <h1>กลับสู่ช่วงเลือกชมรม</h1>
      </div>
      {isOverr && (
        <div
          onClick={() => {
            localStorage.setItem("dummyExState", "{}")
            reFetch()
          }}
          className="flex items-center px-6 py-2 space-x-2 font-medium text-white rounded-full cursor-pointer bg-TUCMC-pink-400"
        >
          <h1>ย้อนกลับสถานะ</h1>
          <RefreshIcon className="w-5 h-5" />
        </div>
      )}
    </div>
    <ConfirmModal
      onAgree={() => {
        setDataModal(true)
      }}
      clubData={modalState}
      TriggerDep={{
        dep: select.state,
        revert: () => {
          setSelect((prev) => ({ state: false, mode: prev.mode }))
        },
      }}
      mode={select.mode}
      setLoader={setLoader}
    />
    <DataModal
      setLoader={setLoader}
      state={modalState}
      refetcher={reFetch}
      closeFunc={clearState}
      TriggerDep={{
        dep: dataModal,
        revert: () => {
          setDataModal(false)
        },
      }}
      mode={select.mode}
    />
    <div className="flex flex-col items-center min-h-screen pt-14 md:pt-20">
      <div className="max-w-md px-4">
        <div className="flex flex-col items-center">
          {!before && <h1 className="text-4xl font-medium text-TUCMC-gray-700">ประกาศผล</h1>}
        </div>
        <div className="w-full mt-10 px-14 minClubs:px-20">
          <AnnounceSplash className="w-full" />
        </div>
        {!before ? (
          desc
        ) : (
          <div className="pt-10 mb-20 space-y-8">
            <div className="flex flex-col items-center text-TUCMC-gray-700">
              <h1 className="text-4xl">รอประกาศผล</h1>
              <h1 className="text-xl">30 พ.ค. 2566 เวลา 7.30 น.</h1>
            </div>
            <div className="flex flex-row justify-center space-x-2 text-TUCMC-gray-700">
              <div className="flex flex-col items-center">
                  <span className="h-[52px] w-[56px] rounded-lg bg-white p-2 text-center text-3xl font-bold shadow-md">
                    {openTimer.hour}
                  </span>
                <span className="mt-2 text-xs font-bold text-TUCMC-gray-600">HOUR</span>
              </div>
              <div className="flex flex-col items-center">
                  <span className="h-[52px] w-[56px] rounded-lg bg-white p-2 text-center text-3xl font-bold shadow-md">
                    {openTimer.min}
                  </span>
                <span className="mt-2 text-xs font-bold text-TUCMC-gray-600">MIN</span>
              </div>
              <div className="flex flex-col items-center">
                  <span className="h-[52px] w-[56px] rounded-lg bg-white p-2 text-center text-3xl font-bold shadow-md">
                    {openTimer.sec}
                  </span>
                <span className="mt-2 text-xs font-bold text-TUCMC-gray-600">SEC</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {!before && (
        <div className="w-full pt-12 pb-20 mt-16 bg-TUCMC-gray-100">
          <div className="max-w-md px-4 mx-auto space-y-4">
            {!before && userData.audition && !isEmpty(userData.audition) ? (
              Object.keys(userData.audition).map((key) => {
                return (
                  <ClubStatus
                    selectTrigger={setSelect}
                    action={setModalState}
                    key={key}
                    data={{
                      clubID: key,
                      status: userData.audition[key],
                    }}
                  />
                )
              })
            ) : (
              <div className="flex justify-center">
                <h1 className="mt-5 text-TUCMC-gray-700">ไม่มีชมรมที่เลือก Audition</h1>
              </div>
            )}
          </div>
          {!before && bottomDesc}
        </div>
      )}
    </div>
  </PageContainer>
}

export default Announce
