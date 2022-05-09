import PageContainer from "@components/common/PageContainer"
import SelectSplash from "@vectors/decorations/SelectSplash"
import { ArrowRightIcon, ExclamationIcon, XIcon } from "@heroicons/react/solid"
import ClubList from "@components/dummy/select/ClubList"
import ClubModal from "@components/dummy/select/ClubModal"
import { useCallback, useEffect, useRef, useState } from "react"
import { FilterSearch } from "@components/common/Inputs/Search"
import Modal from "@components/common/Modals"
import ConfirmModal from "@components/dummy/select/ConfirmModal"
import DataModal from "@components/dummy/select/DataModal"
import { useAuth } from "@client/auth"
import Router from "next/router"
import { GetServerSideProps, GetStaticProps } from "next"
import ReactTypingEffect from "react-typing-effect"
import * as fs from "fs"
import { useWindowDimensions } from "@utilities/document"
import { fetchClub } from "@client/fetcher/club"
import { Loader } from "@components/common/Loader"
import { isEmpty, objToArr, searchKeyword, sortAudition, sortThaiDictionary } from "@utilities/object"
import { sliceArr } from "@utilities/array"
import { clubMap } from "../../config/clubMap"
import { regClub } from "@client/userAction"
import { CatLoader } from "@components/common/CatLoader"
import { AnimatePresence, motion } from "framer-motion"
import { endLastRound, endRegClubTime, lastround } from "@config/time"
import { useToast } from "@components/common/Toast/ToastContext"
import { Tooltip } from "@components/dummy/common/Tooltip"
import { Helmet } from "react-helmet"
import Image from "next/image"
import classnames from "classnames"
import { Vacant } from "@vectors/texts/ClubStates"

/*const blockContent = (dataObj) => {
  let newObj = {}
  Object.keys(dataObj).forEach(val => {
    if (!dataObj[val].audition) {
      newObj[val] = {...dataObj[val], blocked: true}
    } else {
      newObj[val] = dataObj[val]
    }
  })
  return newObj
}*/

export const getStaticProps: GetStaticProps = async () => {
  const files = fs.readdirSync("./public/assets/thumbnails/")
  return {
    props: {
      thumbPaths: files,
    },
  }
}

const Select = ({ thumbPaths }) => {
  const { onReady, tracker } = useAuth()
  const { width, height } = useWindowDimensions()

  const [modalState, setModalState] = useState({ open: false, data: {} })
  const [select, setSelect] = useState(false)
  const [dataModal, setDataModal] = useState(false)
  const [sortedData, setSortedData] = useState([])
  const [sortMode, setSortMode] = useState("ascending")
  const [tutorial, setTutorial] = useState(false)
  const [scene, setScene] = useState(1)
  const [narratText, setNarrateText] = useState(<></>)
  const [isCon, setIsCon] = useState(false)
  const [exitAnimation, setExit] = useState(false)
  const notAuRef = useRef(null)
  const auRef = useRef(null)
  const fullRef = useRef(null)
  const clubsRef = useRef(null)
  const [superSpeed, setSuperSpeed] = useState(false)
  const [searchContext, setSearchContext] = useState("")
  const [rawSorted, setRawSorted] = useState([])
  const [clubData, setClubData] = useState({})
  const [reload, setReload] = useState(false)
  const [auditionList, setAuditionList] = useState(<></>)
  const [userData, setUserData] = useState<any>({})
  const [loader, setLoader] = useState(false)
  const [initclub, setInitclub] = useState(false)
  const { addToast } = useToast()

  const auTrigger = useRef(null)
  const noAu = new Date().getTime() > lastround
  const time = endLastRound

  const reFetch = () => {
    setReload(true)
  }

  useEffect(() => {
    const d = JSON.parse(localStorage.getItem("dummyData") || "{}")
    const aud = JSON.parse(localStorage.getItem("dummyAuditions") || "[]")
    if (!aud.includes("ก40000")) {
      aud.push("ก40000")
    }
    if (!aud.includes("ก40001")) {
      aud.push("ก40001")
    }
    if (!aud.includes("ก40002")) {
      aud.push("ก40002")
    }

    const audobj = {}
    aud.forEach((e) => {
      audobj[e] = "waiting"
    })

    setUserData({ ...d, audition: audobj })

    setReload(false)
  }, [reload])

  const apply = () => {
    const dataArr = objToArr(clubData, (val) => {
      if (!noAu) return val
      return val.audition ? null : val
    })

    switch (sortMode) {
      case "ascending":
        {
          const sorted = sortThaiDictionary(dataArr, (obj) => obj.title)
          setRawSorted(sorted)
        }
        break
      case "descending":
        {
          const sorted = sortThaiDictionary(dataArr, (obj) => obj.title, true)
          setRawSorted(sorted)
        }
        break
      case "hasAudition":
        {
          const sorted = sortAudition(dataArr)
          setRawSorted(sorted)
        }
        break
      case "notHasAudition": {
        const sorted = sortAudition(dataArr, true)
        setRawSorted(sorted)
      }
    }
  }

  useEffect(() => {
    const load = async () => {
      const value = await fetchClub()
      setClubData(value)
      setInitclub(true)
    }

    userData && Object.keys(userData).length > 2 && load()
  }, [userData])

  useEffect(() => {
    userData &&
      "audition" in userData &&
      Object.keys(clubData).length > 0 &&
      setAuditionList(
        <>
          {Object.keys(userData.audition).map((val) => {
            return (
              <h1 key={val} className="border-t py-3 px-4">
                ชมรม{clubMap[val]}
              </h1>
            )
          })}
        </>
      )
  }, [clubData, userData])

  useEffect(() => {
    switch (scene) {
      case 1:
        setNarrateText(
          <ReactTypingEffect
            key={1}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            text={[
              "สวัสดี เรา กันย์ นักบินอวกาศหมายเลข 1 วันนี้เราจะมาพาทุกคนมาทัวร์ระบบลงทะเบียนชมรม ถ้าพร้อมแล้วไปกันเลย !",
            ]}
          />
        )
        return
      case 2:
        setTimeout(() => {
          scene === 2 && setIsCon(true)
        }, 7600)
        setNarrateText(
          <ReactTypingEffect
            key={2}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            typingDelay={0}
            text={["โดยโรงเรียนของเราชมรมอยู่สองประเภทด้วยกันก็คือ ชมรมที่ไม่มีการออดิชั่น และ ชมรมที่มีการออดิชั่น"]}
          />
        )
        return
      case 3:
        notAuRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        setTimeout(() => {
          setIsCon(true)
        }, 500)
        break
      case 4:
        auRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        setTimeout(() => {
          setIsCon(true)
        }, 500)
        break
      case 5:
        setTimeout(() => {
          setScene((prev) => {
            prev === 5 && setIsCon(true)
            return prev
          })
        }, 8000)
        setNarrateText(
          <ReactTypingEffect
            key={3}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            typingDelay={0}
            text={[
              "ข้อควรระวัง หากลงทะเบียนชมรมที่ไม่มีการออดิชั่นไปแล้วจะไม่สามารถกลับไปเลือกชมรมอื่นหรือออดิชั่นชมรมใดได้อีก",
            ]}
          />
        )
        return
      case 6:
        setTimeout(() => {
          fullRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 400)
        setTimeout(() => {
          setScene((prev) => {
            prev === 6 && setIsCon(true)
            return prev
          })
        }, 8000)
        setNarrateText(
          <ReactTypingEffect
            key={4}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            typingDelay={0}
            text={["ชมรมที่ไม่มีการออดิชั่นทุกชมรม หากเต็มแล้วจะไม่สามารถลงทะเบียนเข้าไปได้"]}
          />
        )
        return
      case 7:
        clubsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        setTimeout(() => {
          setScene((prev) => {
            prev === 7 && setIsCon(true)
            return prev
          })
        }, 8000)
        setNarrateText(
          <ReactTypingEffect
            key={5}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            typingDelay={0}
            text={["นักเรียนสามารถตรวจสอบรายชื่อชมรมที่ได้กดออดิชั่นไป ได้ที่ส่วนนี้เลย อย่าลืมไปออดิชั่นด้วยหล่ะ !"]}
          />
        )
        return
      case 8:
        setTimeout(() => {
          setScene((prev) => {
            prev === 7 && setIsCon(true)
            return prev
          })
        }, 7000)
        setNarrateText(
          <ReactTypingEffect
            key={6}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            typingDelay={0}
            text={["น้อง ๆ คงจะอยากลองใช้งานระบบดูแล้ว งั้นเราไปก่อนนะ ขอให้สนุกกับการเลือกชมรมครับ !"]}
          />
        )
        return
      case 9:
        setTimeout(() => {
          setExit(true)
        }, 700)
        localStorage.setItem("tutorial", "yes")
        return
    }
  }, [scene, superSpeed])

  useEffect(() => {
    apply()
  }, [sortMode, clubData, width])

  useEffect(() => {
    const tu = localStorage.getItem("tutorial")
    if (tu !== "yes") {
      setTutorial(true)
    }
  }, [])

  useEffect(() => {
    const escaped = searchContext.replace("ชมรม", "")
    if (escaped !== "") {
      const searchResult = searchKeyword(rawSorted, escaped, (obj) => obj.title)
      setSortedData(sliceArr(searchResult, width))
    } else {
      setSortedData(sliceArr(rawSorted, width))
    }
  }, [searchContext, rawSorted])

  const clearState = () => {
    setModalState({ open: false, data: {} })
  }

  const selectClub = () => {
    setSelect(true)
  }

  const confirmOld = () => {
    setModalState({
      open: false,
      data: { ...clubData[userData.old_club], clubID: userData.old_club, oldClubConfirm: true },
    })
    setSelect(true)
  }
  useEffect(() => {
    if (!isCon) {
      setSuperSpeed(false)
    }
  }, [isCon])

  return (
    new Date().getTime() < time && (
      <PageContainer hide={!initclub}>
        <div className="fixed top-0 z-[98] mx-auto flex w-full justify-center">
          <div className="flex items-center space-x-2 rounded-md bg-TUCMC-orange-500 py-2 pl-4 pr-6 shadow-md">
            <ExclamationIcon className="mt-2 h-10 w-10 animate-pulse text-white" />
            <div>
              <div className="flex items-center space-x-2 font-medium text-white">
                <h1>คุณกำลังอยู่ในโหมดระบบจำลอง</h1>
              </div>
              <div className="flex justify-center text-sm text-white">
                <p>ทุกการกระทำในโหมดระบบจำลองจะไม่มีผลในระบบจริง</p>
              </div>
            </div>
          </div>
        </div>
        {initclub && tutorial && (
          <div
            onClick={() => {
              if (!isCon) {
                setSuperSpeed(true)
                setIsCon(true)
              } else {
                setIsCon(false)
                setScene((prev) => prev + 1)
              }
            }}
            className="fixed top-0 left-0 z-[99] flex min-h-screen w-full cursor-pointer items-start justify-center bg-gray-500 bg-opacity-50 backdrop-blur backdrop-filter"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={isCon ? { opacity: 1 } : { opacity: 0 }}
              className="text-lg font-medium text-white"
            >
              <h1 className="mt-16 animate-pulse">แตะเพื่อไปต่อ</h1>
            </motion.div>
            <motion.div
              animate={scene === 9 ? { y: -height - 220 } : { y: -220 }}
              transition={scene === 9 ? { duration: 0.5 } : { duration: 2 }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  setScene((prev) => {
                    prev === 1 && setIsCon(true)
                    return prev
                  })
                }, 5200)
              }}
              className="fixed bottom-[-200px] right-[-30px]"
            >
              <div className="absolute left-[-160px] top-[100px]">
                {scene < 9 && (
                  <Tooltip type="right" className="w-[220px] min-w-[220px]">
                    {narratText}
                  </Tooltip>
                )}
              </div>
              <Image src="/assets/dummy/astro-1.png" width={200} height={200} />
            </motion.div>
            <motion.div
              initial={{ rotate: 45, y: 240, x: 0 }}
              animate={exitAnimation && { rotate: 45, y: -height - 220, x: -width }}
              transition={{ duration: 1 }}
              className="fixed bottom-0 right-0"
            >
              <Image src="/assets/dummy/astro-2.png" width={289} height={200} />
            </motion.div>
            {width && (
              <motion.div
                initial={{ rotate: 35, y: -200, x: -width - 420, scaleX: -1 }}
                animate={exitAnimation && { rotate: 20, y: -height - 220, x: width, scale: 0.7 }}
                transition={{ duration: 1, delay: 1 }}
                onAnimationComplete={() => {
                  exitAnimation && setTutorial(false)
                }}
                className="fixed bottom-0 right-0"
              >
                <Image src="/assets/dummy/astro-2.png" width={289} height={200} />
              </motion.div>
            )}
          </div>
        )}
        <Loader display={loader} />
        <ConfirmModal
          onAgree={() => {
            setDataModal(true)
          }}
          clubData={modalState}
          TriggerDep={{
            dep: select,
            revert: () => {
              setSelect(false)
            },
          }}
          refetcher={reFetch}
          setLoader={setLoader}
        />
        <ClubModal
          state={modalState}
          userData={userData}
          closeAction={clearState}
          action={selectClub}
          thumbPaths={thumbPaths}
          confirmOldClub={confirmOld}
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
        />
        <AnimatePresence>
          {initclub ? (
            <div className="flex flex-col items-center py-14 px-4 md:flex-row md:items-start md:justify-center md:space-x-6">
              <div className="md:max-w-xs">
                <div className="flex flex-col items-center">
                  <h1 className="text-4xl font-medium">เลือกชมรม</h1>
                  <span className="text-sm tracking-tight">ในระบบลงทะเบียนชมรมจำลอง</span>
                </div>
                <div className="mt-6 w-full min-w-[300px] px-8">
                  <SelectSplash />
                </div>
                <div className="mt-10 space-y-6 px-2">
                  {!noAu && userData && !isEmpty(userData.audition) && (
                    <div
                      ref={clubsRef}
                      className={classnames(
                        "relative",
                        scene === 7 ? "z-[100]" : "z-[10]",
                        "flex flex-col space-y-4 rounded-lg bg-white p-4 py-6 shadow-md"
                      )}
                    >
                      <h1 className="text-lg font-medium tracking-tight">คุณได้ลงชื่อ Audition ชมรมไว้</h1>
                      <p className="tracking-tight text-gray-600">
                        ให้ไปทำการ Audition ตามเวลาและสถานที่ที่ชมรมนั้น ๆ กำหนด โดยติดตามรายละเอียดการ Audition
                        จากช่องทางประชาสัมพันธ์ของชมรมนั้นโดยตรง และรอการประกาศผลในวันที่ 25 พ.ค. 2565 เวลา 7.30 น.
                      </p>
                      <div className="relative md:hidden">
                        <a ref={auTrigger} className="cursor-pointer tracking-tight text-TUCMC-pink-500">
                          ดูรายชื่อชมรมที่ลงชื่อ Audition ไว้ →
                        </a>
                        <Modal
                          TriggerRef={auTrigger}
                          CloseID="audiClose"
                          className="absolute z-20 mt-1 w-full rounded-lg shadow-md"
                        >
                          <div className="flex items-start justify-between rounded-t-lg bg-gray-50 py-2 px-4 text-sm text-gray-500">
                            <h1 className="mt-1">รายชื่อชมรมที่ลงชื่อ Audition ไว้</h1>
                            <XIcon id="audiClose" className="h-7 w-7 cursor-pointer text-TUCMC-gray-400" />
                          </div>
                          <div className="rounded-b-lg bg-white">{auditionList}</div>
                        </Modal>
                      </div>
                    </div>
                  )}
                  {!noAu && userData && !isEmpty(userData.audition) && (
                    <div className="z-20 mt-1 hidden rounded-lg shadow-md md:block">
                      <div className="flex items-start justify-between rounded-t-lg bg-gray-50 py-2 px-4 text-sm text-gray-500">
                        <h1 className="mt-1">รายชื่อชมรมที่ลงชื่อ Audition ไว้</h1>
                      </div>
                      <div className="rounded-b-lg bg-white">{auditionList}</div>
                    </div>
                  )}

                  {/* {!noAu &&
                    (!isEmpty(clubData) &&
                    userData &&
                    "old_club" in userData &&
                    userData.old_club !== "" &&
                    clubData[userData.old_club].old_count < clubData[userData.old_club].old_count_limit ? (
                      <div className="flex flex-col items-start space-y-4 rounded-lg bg-white p-4 py-6 shadow-md">
                        <h1 className="text-lg font-medium tracking-tight">โควตายืนยันสิทธิ์ชมรมเดิม</h1>
                        <p className="tracking-tight text-gray-600">
                          นักเรียนสามารถใช้โควตายืนยันสิทธิ์ชมรมเดิมได้ทันที [ชมรม{clubMap[userData.old_club]}]
                          *โควตามีจำนวนจำกัด
                        </p>
                        <a
                          onClick={confirmOld}
                          className="cursor-pointer whitespace-nowrap rounded-3xl bg-TUCMC-green-400 px-5 py-2.5 text-white shadow-md"
                        >
                          ยืนยันสิทธิ์ชมรมเดิม
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-4 rounded-lg bg-white p-4 py-6 shadow-md">
                        <h1 className="text-lg font-medium tracking-tight">โควตายืนยันสิทธิ์ชมรมเดิม</h1>
                        <p className="tracking-tight text-gray-600">
                          นักเรียนไม่สามารถยืนยันสิทธิ์ได้ (ชมรม{userData && clubMap[userData.old_club]}) เนื่องจากชมรม
                          {userData && clubData[userData.old_club]?.old_count_limit === 0
                            ? "ไม่อนุญาตให้ยืนยันสิทธิ์ชมรมเดิม"
                            : "ไม่มีโควตาสมาชิกเก่าเหลือแล้ว"}
                          หากต้องการอยู่ชมรมเดิม ให้กดลงทะเบียนเข้าชมรมเดิมในฐานะสมาชิกใหม่
                        </p>
                        <div className="relative md:hidden">
                          <a href="/FAQ" target="_blank" className="cursor-pointer tracking-tight text-TUCMC-gray-700">
                            ดูรายละเอียดเพิ่มเติม →
                          </a>
                        </div>
                      </div>
                    ))} */}
                </div>
              </div>
              <div className="fixed right-4 bottom-4 z-[20]">
                {!tutorial && (
                  <Tooltip type="right" className="top-[-60px] ml-[50px]">
                    กดที่ตัวนักบินเพื่อเข้า
                    <br />
                    โหมดฝึกสอนอีกรอบ
                  </Tooltip>
                )}
                <motion.div
                  initial={{ y: 0, x: 0, scaleX: -1 }}
                  animate={tutorial ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => {
                    localStorage.setItem("tutorial", "no")
                    setExit(false)
                    setScene(1)
                    setTutorial(true)
                  }}
                  className="absolute top-[-80px] right-0 cursor-pointer"
                >
                  <Image src="/assets/dummy/astro-3.png" width={100} height={100} />
                </motion.div>
                {!isEmpty(userData.audition) && (
                  <div
                    onClick={() => {
                      Router.push("/dummy/announce")
                    }}
                    className="flex cursor-pointer items-center space-x-2 rounded-full bg-TUCMC-pink-400 px-6 py-2 font-semibold text-white"
                  >
                    <h1>จำลองการประกาศผลการออดิชั่น</h1>
                    <ArrowRightIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div style={width > 768 ? { width: width - 376, maxWidth: 952 } : {}} className="mt-16 md:mt-0">
                <div className="mx-4 border-b pb-5">
                  <div>
                    <FilterSearch setSearchContext={setSearchContext} sortMode={sortMode} setSortMode={setSortMode} />
                  </div>
                </div>
                <div className="mt-6 flex flex-col md:flex-row md:space-x-4">
                  <div className="space-y-2 md:w-1/2">
                    <div
                      className={classnames(
                        "relative",
                        scene === 3 || scene === 4 || scene === 5 ? "z-[100]" : "z-[1]",
                        !tutorial && "hidden"
                      )}
                    >
                      <div ref={notAuRef} className="absolute h-full w-full" />
                      <ClubList
                        key={"1"}
                        data={{
                          blocked: false,
                          audition: false,
                          new_count: 0,
                          new_count_limit: 100,
                          title: "คนรักแมว",
                        }}
                        action={setModalState}
                      />
                      {scene === 3 && (
                        <Tooltip
                          type={width > 1024 ? "left" : "top"}
                          className="absolute top-[120px] lg:top-1 lg:right-[-370px]"
                        >
                          <p>
                            <span className="font-semibold">ชมรมที่ไม่มีการออดิชั่น</span> <br />{" "}
                            นักเรียนจะสามารถกดลงทะเบียนชมรมที่ไม่มีการออดิชั่นที่ยังว่างได้{" "}
                            <br className="hidden lg:block" />
                            ตั้งแต่วันที่ 17 พ.ค. เวลา 12.00 - ภายในวันที่ 24 พ.ค. 2565
                            <br className="hidden lg:block" /> เมื่อกดลงทะเบียนชมรมไปแล้วจะไม่สามารถย้ายชมรมได้อีก
                          </p>
                        </Tooltip>
                      )}
                    </div>
                    <div className={classnames("relative", scene === 6 ? "z-[100]" : "z-[1]", !tutorial && "hidden")}>
                      <div ref={fullRef} className="absolute h-full w-full" />
                      <ClubList
                        key={"4"}
                        data={{
                          blocked: false,
                          audition: false,
                          new_count: 100,
                          new_count_limit: 100,
                          title: "คนรักแมวมาก ๆ",
                        }}
                        action={setModalState}
                      />
                    </div>
                    {sortedData[0]?.map((val) => {
                      return <ClubList key={val.clubID} data={val} action={setModalState} />
                    })}
                  </div>
                  <div className="mt-2 space-y-2 md:mt-0 md:w-1/2">
                    <div
                      className={classnames(
                        "relative",
                        scene === 4 || scene === 5 ? "z-[100]" : "z-[1]",
                        !tutorial && "hidden"
                      )}
                    >
                      <div ref={auRef} className="absolute h-full w-full" />
                      <ClubList
                        key={"2"}
                        data={{
                          blocked: false,
                          audition: true,
                          new_count: 0,
                          new_count_limit: 100,
                          title: "คนรักนกพิราบ",
                        }}
                        action={setModalState}
                      />
                      {(scene === 4 || scene === 5) && (
                        <Tooltip type={"top"} className="absolute top-[120px]">
                          <p>
                            <span className="font-semibold">ชมรมที่มีการออดิชั่น</span> <br />{" "}
                            นักเรียนจะสามารถกดเลือกชมรมที่มีการออดิชั่นกี่ชมรมก็ได้
                            <br className="hidden lg:block" />
                            ตั้งแต่วันที่ 17 พ.ค. เวลา 12.00 - ภายในวันที่ 24 พ.ค. 2565
                            <br className="hidden lg:block" />{" "}
                            จากนั้นนักเรียนติดตามข่าวสารการจัดการออดิชั่นจากช่องทางของชมรม
                          </p>
                        </Tooltip>
                      )}
                    </div>
                    {sortedData[1]?.map((val) => {
                      return <ClubList key={val.clubID} data={val} action={setModalState} />
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <CatLoader key="cat" />
          )}
        </AnimatePresence>
      </PageContainer>
    )
  )
}

export default Select