import PageContainer from "@components/common/PageContainer"
import { endOldClub, getFullDate, startOldClub } from "@config/time"
import { useAuth } from "@handlers/client/auth"
import { fetchClub } from "@client/fetcher/panel"
import { ClubData } from "@interfaces/clubData"
import { AnimateSharedLayout } from "framer-motion"
import { NextPage } from "next"
import Router from "next/router"
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react"
import { ClipboardCopyIcon, StarIcon } from "@heroicons/react/solid"
import { CatLoader } from "@components/common/CatLoader"
import { AnnounceSplash } from "@vectors/decorations/AnnounceSplash"
import { FC } from "react"
import Modal from "@components/common/Modals"
import { CheckCircleIcon, CheckIcon, ExclamationIcon } from "@heroicons/react/outline"
import { Input } from "@components/auth/Input"
import { confirmOldClub, regClub } from "@handlers/client/userAction"
import { useToast } from "@components/common/Toast/ToastContext"
import Link from "next/link"
import SelectSplash from "@vectors/decorations/SelectSplash"
import { Button } from "@components/common/Inputs/Button"
import { Ellipsis } from "@vectors/Loaders/Ellipsis"

const ModalSection: FC<{
  clubName: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  oldClubID: string
}> = ({ clubName, open, setOpen, oldClubID }) => {
  const [modalState, setModalState] = useState(false)
  const [closeState, setCloseState] = useState(false)
  const [pending, setPending] = useState(false)

  const { reFetch } = useAuth()

  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")

  const { addToast } = useToast()

  useEffect(() => {
    setModalState(open)
  }, [open])

  const submitData = async () => {
    setPending(true)
    const res = await confirmOldClub(password, oldClubID)
    setPending(false)

    try {
      if (res.status) {
        addToast({
          theme: "modern",
          icon: "tick",
          title: "ยืนยันสิทธิ์ชมรมแล้ว",
          text: "ขอให้มีความสุขกับกิจกรรมชมรม",
          lifeSpan: 30000,
          crossPage: true,
        })
        reFetch()
        Router.push({ href: "/card" })
      } else {
        switch (res.report) {
          case "sessionError":
            addToast({
              theme: "modern",
              icon: "cross",
              title: "พบข้อผิดพลาดของเซสชั่น",
              text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง",
              crossPage: true,
            })
            reFetch()
            break
          case "invalid_password":
            addToast({
              theme: "modern",
              icon: "cross",
              title: "รหัสผ่านไม่ถูกต้อง",
              text: "กรุณาลองกรอกข้อมูลใหม่อีกครั้งหรือ หากลืมรหัสผ่านสามารถติดต่อทาง กช. เพื่อขอเปลี่ยนรหัสผ่านได้",
            })
            break
          case "invalid_phone":
            addToast({
              theme: "modern",
              icon: "cross",
              title: "เบอร์โทรศัพท์ ที่ระบุไม่ถูกต้อง",
              text: "กรุณาลองกรอกข้อมูลใหม่อีกครั้งหรือหากยังพบการแจ้งเตือนนี้อีกในขณะที่ข้อมูลที่กรอกถูกต้องแล้วให้ติดต่อทาง กช.",
            })
            break
          case "club_full":
            addToast({
              theme: "modern",
              icon: "cross",
              title: "ขออภัยในขณะนี้โควต้าสมาชิกเก่าของชมรมนี้เต็มแล้ว",
              text: "กรุณาลองเลือกชมรมนี้ในฐานะสมาชิกใหม่ในวันเปิดระบบลงทะเบียนชมรม",
            })
            setCloseState(true)
            setPhone("")
            setPassword("")
            reFetch()
            break
          case "in_club":
            addToast({
              theme: "modern",
              icon: "cross",
              title: "ขออภัยคุณได้เลือกชมรมนี้ไปแล้ว",
              text: "กรุณาเลือกชมรมอื่นที่ยังว่างอยู่ในตอนนี้",
            })
            break
          case "in_audition":
            addToast({
              theme: "modern",
              icon: "cross",
              title: "ขออภัยคุณได้เลือกชมรมที่มีการ Audition ไปแล้ว",
              text: "กรุณาเลือกชมรมอื่น เนื่องจากหากลง Audition ไปแล้วจะไม่สามารถเลือกชมรมที่ไม่มีการ Audition ได้",
            })
            break
        }
      }
    } catch (error) {
      addToast({
        theme: "modern",
        icon: "cross",
        title: "พบข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        text: "กรุณาลองกรอกข้อมูลใหม่อีกครั้ง หากยังพบข้อผิดพลาดสามารถติดต่อทาง กช.",
      })
    }
  }

  return (
    <Modal
      overlayClassName="fixed flex flex-col items-center justify-center top-0 left-0 bg-black bg-opacity-20 w-full min-h-screen z-[99]"
      className="flex min-w-[340px] flex-col items-center rounded-lg bg-white"
      CloseDep={{
        dep: closeState,
        revert: () => {
          setCloseState(false)
        },
      }}
      TriggerDep={{
        dep: modalState,
        revert: () => {
          setModalState(false)
          setOpen(false)
        },
      }}
    >
      <div className="flex w-full flex-col items-center px-4 py-4">
        <div className="mt-1 mb-2 rounded-full bg-TUCMC-orange-200 p-3">
          <ExclamationIcon className="h-6 w-6 text-TUCMC-orange-500" />
        </div>
        <div className="w-full space-y-1">
          <h1 className="text-center text-TUCMC-gray-900">ยืนยันสิทธิ์ชมรม{clubName}</h1>
          <p className="text-center text-sm text-TUCMC-gray-600">
            หากยืนยันสิทธิ์ชมรมนี้แล้ว
            <br />
            จะไม่สามารถเปลี่ยนชมรมได้อีกจนกว่าจะหมดปีการศึกษา
          </p>
        </div>
      </div>
      <div className="w-full space-y-6 rounded-b-lg bg-TUCMC-gray-100 px-4 py-4">
        <Input stateUpdate={setPassword} type="password" className="h-10" placeholder="รหัสผ่าน" />
        <div className="space-y-2">
          <Button
            onClick={submitData}
            disabled={pending}
            className="flex w-full items-center justify-center space-x-1 rounded-lg bg-TUCMC-green-400 py-2 text-white"
          >
            {pending ? (
              <Ellipsis className="h-6 w-[2.4rem]" />
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                <span>ยืนยัน</span>
              </>
            )}
          </Button>
          <button
            onClick={() => {
              setCloseState(true)
            }}
            className="text-gray-TUCMC-600 w-full rounded-lg border border-gray-400 bg-white py-2"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </Modal>
  )
}

const BaseData: ClubData & { clubID: string } = {
  new_count: 0,
  new_count_limit: 0,
  old_count: 0,
  old_count_limit: 0,
  count_limit: 0,
  place: "",
  audition: false,
  message: "",
  contact: { type: "", context: "" },
  contact2: { type: "", context: "" },
  contact3: { type: "", context: "" },
  teacher_count: 0,
  status: "pending",
  title: "",
  clubID: "",
}

const fetchClubDataAction = async (
  clubID: string,
  setClubData: Dispatch<SetStateAction<{}>>,
  setLoad: Dispatch<SetStateAction<boolean>>
) => {
  if (!clubID) return

  const data = await fetchClub(`${clubID}_1`)
  const data2 = await fetchClub(`${clubID}_2`)

  setLoad(false)
  setClubData([
    { ...data, clubID: `${clubID}_1` },
    { ...data2, clubID: `${clubID}_2` },
  ])
}

const Confirm: NextPage = () => {
  const [clubData, setClubData] = useState<Array<ClubData & { clubID: string }>>([BaseData, BaseData])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoad] = useState(true)

  const { onReady, tracker, reFetch } = useAuth()

  const { userData } = onReady((logged, userData) => {
    if (!logged) {
      Router.push("/auth")
    } else {
      if (!(new Date().getTime() < endOldClub && new Date().getTime() >= startOldClub)) {
        Router.push("/")
        return { userData }
      }

      if (userData.club !== "") {
        Router.push("/card")
      } else if (userData?.old_club === "" || !userData?.old_club) {
        Router.push("/")
      } else if (!["ก30921"].includes(userData?.old_club)) {
        Router.push("/confirm")
      }
    }
    return { userData }
  })

  const [currTitle, setCurrTitle] = useState(clubData[0]?.title)
  const [currOldClubID, setCurrOldClubID] = useState(`${userData?.old_club}_1`)

  const refetchData = () => {
    fetchClubDataAction(userData?.old_club, setClubData, setLoad)
  }

  useEffect(() => {
    refetchData()
  }, [userData])

  if (loading) return <CatLoader />
  else
    return (
      <PageContainer>
        <AnimateSharedLayout>
          <ModalSection oldClubID={currOldClubID} clubName={currTitle} open={modalOpen} setOpen={setModalOpen} />

          <div className="flex min-h-screen flex-col items-center space-y-8 py-14 px-4">
            <div className="md:max-w-xs">
              <div className="flex flex-col items-center">
                <h1 className="text-4xl font-medium">ยืนยันสิทธิ์ชมรมเดิม</h1>
                <span className="text-sm tracking-tight">ภายในวันที่ {getFullDate(endOldClub)}</span>
              </div>
              <div className="mt-6 w-full min-w-[300px] px-8">
                <SelectSplash />
              </div>
            </div>

            <div className="flex flex-col justify-center space-x-8 sm:flex-row">
              {clubData.map((data, i) => {
                return (
                  <Fragment key={`${data.clubID}-${i}`}>
                    {data?.old_count_limit - data?.old_count > 0 ? (
                      <div className="flex max-w-lg flex-col items-start space-y-4 rounded-lg bg-white p-4 py-6 shadow-md">
                        <h2 className="text-lg font-medium tracking-tight">โควตายืนยันสิทธิ์ชมรมเดิม</h2>
                        <p className="tracking-tight text-gray-600">
                          นักเรียนสามารถใช้โควตายืนยันสิทธิ์ชมรมเดิมได้ทันที [ชมรม{data?.title}] *โควตามีจำนวนจำกัด
                        </p>
                        <div className="relative">
                          <Link href="/FAQ" passHref>
                            <a target="_blank" className="cursor-pointer tracking-tight text-TUCMC-gray-700">
                              ดูรายละเอียดเพิ่มเติม →
                            </a>
                          </Link>
                        </div>
                        <Button
                          onClick={() => {
                            setCurrOldClubID(data.clubID)
                            setCurrTitle(data.title)
                            setModalOpen(true)
                          }}
                          className="mt-4 rounded-full bg-TUCMC-green-400 py-3 px-6 text-white transition-colors hover:bg-TUCMC-green-500"
                        >
                          ยืนยันสิทธิ์ชมรมเดิม
                        </Button>
                      </div>
                    ) : (
                      <div className="flex max-w-lg flex-col space-y-4 rounded-lg bg-white p-4 py-6 shadow-md">
                        <h2 className="text-lg font-medium tracking-tight">โควตายืนยันสิทธิ์ชมรมเดิม</h2>
                        <p className="tracking-tight text-gray-600">
                          นักเรียนไม่สามารถยืนยันสิทธิ์ได้ (ชมรม{data.title}) เนื่องจากชมรม
                          <span className="text-TUCMC-red-400">
                            {userData && data?.old_count_limit === 0
                              ? "ไม่อนุญาตให้ยืนยันสิทธิ์ชมรมเดิม"
                              : "ไม่มีโควตาสมาชิกเก่าเหลือแล้ว"}
                          </span>
                          <br />
                          หากต้องการอยู่ชมรมเดิม ให้กดลงทะเบียนเข้าชมรมเดิมในฐานะสมาชิกใหม่
                        </p>
                        <div className="relative">
                          <Link href="/FAQ" passHref>
                            <a target="_blank" className="cursor-pointer tracking-tight text-TUCMC-gray-700">
                              ดูรายละเอียดเพิ่มเติม →
                            </a>
                          </Link>
                        </div>
                      </div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </AnimateSharedLayout>
      </PageContainer>
    )
}

export default Confirm
