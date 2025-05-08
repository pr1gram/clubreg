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
import { GetServerSideProps, GetStaticProps, NextPage } from "next"
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
import { endLastRound, endRegClubTime, lastround, getFullDate, openTime, announceTime } from "@config/time"
import { useToast } from "@components/common/Toast/ToastContext"
import { Tooltip } from "@components/dummy/common/Tooltip"
import Image from "next/image"
import classnames from "classnames"
import initialisedDB from "@server/firebase-admin"
import { ClubDisplay } from "@interfaces/clubDisplay"
import { convertToStaticFileUri } from "@utilities/files";
import { SearchIcon } from "@heroicons/react/outline"

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

export interface IClubListData {
  title: string
  audition: boolean
  clubID: string
  imageURL: string
}

export const getStaticProps: GetStaticProps = async () => {
  // const files = fs.readdirSync("./public/assets/thumbnails/")

  const clubDisplayDocs = await initialisedDB.collection("clubDisplay").get()
  const clubList = clubDisplayDocs.docs.map((club) => {
    const data = club.data() as ClubDisplay

    return {
      title: data.nameTH,
      audition: data.audition,
      clubID: club.id,
      imageURL: data?.images?.mainImage || `/assets/thumbnails/${club.id}.jpg`,
    }
  })

  return {
    props: {
      clubList: clubList,
    },
  }
}

const Select: NextPage<{ clubList: IClubListData[] }> = ({ clubList }) => {
  const { onReady, tracker } = useAuth()
  const { width, height } = useWindowDimensions()

  const [modalState, setModalState] = useState({ open: false, data: {} })
  const [select, setSelect] = useState(false)
  const [dataModal, setDataModal] = useState(false)
  const [sortedData, setSortedData] = useState([])
  const [sortMode, setSortMode] = useState("ascending")
  const [tutorial, setTutorial] = useState(false)
  const [scene, setScene] = useState(1)
  const [locked, setLocked] = useState(true)
  const [narratText, setNarrateText] = useState(<></>)
  const [isCon, setIsCon] = useState(false)
  const [hideA, setHideA] = useState(false)
  const [completeHide, setCompHide] = useState(false)
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
  const [auditionList, setAuditionList] = useState<string[]>([])
  const [userData, setUserData] = useState<any>({})
  const [loader, setLoader] = useState(false)
  const [initclub, setInitclub] = useState(false)
  const [tab, setTab] = useState("all")
  const [showToast, setShowToast] = useState(true)
  const { addToast } = useToast()

  const auTrigger = useRef(null)
  const noAu = false
  const time = endLastRound

  const reFetch = () => {
    setReload(true)
  }

  useEffect(() => {
    const d = JSON.parse(localStorage.getItem("dummyData") || "{}")
    const aud = JSON.parse(localStorage.getItem("dummyAuditions") || "[]")

    if (!("email" in d)) {
      Router.push("/dummy/auth")
    }

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
    }
  }

  useEffect(() => {
    const load = async () => {
      const value = await fetchClub()
      const filteredValue = Object.keys(value)
        .filter(key => value[key].report !== true)
        .reduce((obj, key) => {
          obj[key] = value[key]
          return obj
        }, {})
      setClubData(filteredValue)
      setInitclub(true)
    }

    userData && Object.keys(userData).length > 2 && load()
  }, [userData])

  useEffect(() => {
    userData &&
      "audition" in userData &&
      Object.keys(clubData).length > 0 &&
      setAuditionList(Object.keys(userData.audition).map((value) => {
        return value
      }))
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
              "สวัสดี เรา น้อนเป็ดคูบัวสุดแสบ วันนี้เราจะมาพาทุกคนมาทัวร์ระบบลงทะเบียนชมรมของเรากัน ถ้าพร้อมแล้ว.. ไปกันเลย !",
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
            text={["โรงเรียนของเรามีชมรมอยู่สองประเภทด้วยกัน ก็คือ ชมรมที่ไม่มีการ Audition และ ชมรมที่มีการ Audition"]}
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
              "ข้อควรระวัง หากลงทะเบียนชมรมที่ไม่มีการ Audition ไปแล้วจะไม่สามารถกลับไปเลือกชมรมอื่นหรือ Audition ชมรมใดได้อีก",
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
        }, 6000)
        setNarrateText(
          <ReactTypingEffect
            key={4}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            typingDelay={0}
            text={["ชมรมที่ไม่มีการ Audition ทุกชมรม หากเต็มแล้วจะไม่สามารถลงทะเบียนเข้าไปได้"]}
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
        }, 7000)
        setNarrateText(
          <ReactTypingEffect
            key={5}
            cursorRenderer={(cursor) => <h1>{""}</h1>}
            speed={superSpeed ? 0 : 70}
            eraseDelay={1000000}
            typingDelay={0}
            text={[
              "นักเรียนสามารถตรวจสอบรายชื่อชมรมที่ได้กด Audition ไปได้ที่ส่วนนี้เลย อย่าลืมไป​​ Audition ด้วยหล่ะ !",
            ]}
          />
        )
        return
      case 8:
        setTimeout(() => {
          setScene((prev) => {
            prev === 8 && setIsCon(true)
            return prev
          })
        }, 6200)
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

  const splitIntoColumns = (arr, columns = 2) => {
    const result = Array.from({ length: columns }, () => []);
    arr.forEach((item, idx) => {
      result[idx % columns].push(item);
    });
    return result;
  };

  useEffect(() => {
    let filtered = rawSorted;
    if (tab === "noAudition") {
      filtered = rawSorted.filter((club) => !club.audition);
    } else if (tab === "hasAudition") {
      filtered = rawSorted.filter((club) => club.audition);
    }

    const searchTerm = searchContext.replace("ชมรม", "").trim();
    if (searchTerm !== "") {
      filtered = searchKeyword(filtered, searchTerm, (obj) => obj.title);
    }

    if (width > 768) {
      setSortedData(splitIntoColumns(filtered, 2));
    } else {
      setSortedData([filtered]);
    }
  }, [tab, searchContext, rawSorted, width]);

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

  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
        setShowToast(false)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (

    <PageContainer hide={!initclub}>
      <div className={classnames("fixed top-10 z-[98] mx-auto flex w-full justify-center", completeHide && "hidden")}>
        <motion.div
          onClick={() => setHideA(true)}
          animate={showToast && !hideA && !completeHide ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
          transition={{ duration: 0.5 }}
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
      {initclub && tutorial && (
        <div
          onClick={() => {
            if (locked) return

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
              setLocked(false)
              setTimeout(() => {
                setScene((prev) => {
                  prev === 1 && setIsCon(true)
                  return prev
                })
              }, 7900)
            }}
            className="fixed bottom-[-220px] right-[10px]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.4 }}
              className="absolute left-[-220px] top-[60px]"
            >
              {scene < 9 && (
                <Tooltip type="right" className="w-[220px] min-w-[220px]">
                  {narratText}
                </Tooltip>
              )}
            </motion.div>
            <Image src={convertToStaticFileUri("/assets/dummy/duck.png")} width={120} height={162} />
          </motion.div>
          <motion.div
            initial={{ rotate: 45, y: 240, x: 0 }}
            animate={exitAnimation && { rotate: 45, y: -height - 220, x: -width }}
            transition={{ duration: 1 }}
            className="fixed bottom-0 right-0"
          >
            {/* <Image src="/assets/dummy/astro-2.png" width={289} height={200} /> */}
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
              {/* <Image src="/assets/dummy/astro-2.png" width={289} height={200} /> */}
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
        clubList={clubList}
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
          <div className="flex flex-col items-center px-4 py-14 md:flex-row md:items-start md:justify-center md:space-x-6">
            <div className="md:max-w-xs">
              <div className="flex flex-col items-center">
                <h1 className="text-4xl font-medium">เลือกชมรม</h1>
                <span className="text-sm tracking-tight">ในระบบลงทะเบียนชมรมจำลอง</span>
              </div>
              <div className="mt-6 w-full min-w-[300px] px-8">
                <SelectSplash />
              </div>
              <div className="px-2 mt-10 space-y-6">
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
                      จากช่องทางประชาสัมพันธ์ของชมรมนั้นโดยตรง และรอการประกาศผลในวันที่ {getFullDate(announceTime)}
                    </p>
                    <div className="relative md:hidden">
                      <a ref={auTrigger} className="tracking-tight cursor-pointer text-TUCMC-pink-500">
                        ดูรายชื่อชมรมที่ลงชื่อ Audition ไว้ →
                      </a>
                      <Modal
                        TriggerRef={auTrigger}
                        CloseID="audiClose"
                        className="absolute z-20 w-full mt-1 rounded-lg shadow-md"
                      >
                        <div className="flex items-start justify-between px-4 py-2 text-sm text-gray-500 rounded-t-lg bg-gray-50">
                          <h1 className="mt-1">รายชื่อชมรมที่ลงชื่อ Audition ไว้</h1>
                          <XIcon id="audiClose" className="cursor-pointer h-7 w-7 text-TUCMC-gray-400" />
                        </div>
                        <div className="bg-white rounded-b-lg">
                          {auditionList.map((clubID) => {
                            if (clubID === "ก40000" || clubID === "ก40001" || clubID === "ก40002") {
                              return (
                                <div
                                  key={clubID}
                                  className="border-t py-4 px-4"
                                >
                                  ชมรม{clubMap[clubID]}
                                </div>
                              )
                            }
                            const _clubData = clubData[clubID]
                            return (
                              <div
                                key={clubID}
                                className="border-t py-4 px-4 cursor-pointer hover:bg-gray-100 transition-colors duration-100"
                              >
                                <div
                                  onClick={() => {
                                    setModalState({
                                      open: true,
                                      data: {
                                        ..._clubData,
                                        clubID
                                      },
                                    })
                                  }}
                                >
                                  ชมรม{_clubData.title}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </Modal>
                    </div>
                  </div>
                )}
                {!noAu && userData && !isEmpty(userData.audition) && (
                  <div className="z-20 hidden mt-1 rounded-lg shadow-md md:block">
                    <div className="flex items-start justify-between px-4 py-2 text-sm text-gray-500 rounded-t-lg bg-gray-50">
                      <h1 className="mt-1">รายชื่อชมรมที่ลงชื่อ Audition ไว้</h1>
                    </div>
                    <div
                      className="bg-white rounded-b-lg"
                    >
                      {auditionList.map((clubID) => {
                        if (clubID === "ก40000" || clubID === "ก40001" || clubID === "ก40002") {
                          return (
                            <div
                              key={clubID}
                              className="border-t py-4 px-4"
                            >
                              ชมรม{clubMap[clubID]}
                            </div>
                          )
                        }
                        const _clubData = clubData[clubID]
                        return (
                          <div
                            key={clubID}
                            className="border-t py-4 px-4 cursor-pointer hover:bg-gray-100 transition-colors duration-100"
                          >
                            <div
                              onClick={() => {
                                setModalState({
                                  open: true,
                                  data: {
                                    ..._clubData,
                                    clubID
                                  },
                                })
                              }}
                            >
                              ชมรม{_clubData.title}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* {!noAu &&
                    (!isEmpty(clubData) &&
                    userData &&
                    "old_club" in userData &&
                    userData.old_club !== "" &&
                    clubData[userData.old_club].old_count < clubData[userData.old_club].old_count_limit ? (
                      <div className="flex flex-col items-start p-4 py-6 space-y-4 bg-white rounded-lg shadow-md">
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
                      <div className="flex flex-col p-4 py-6 space-y-4 bg-white rounded-lg shadow-md">
                        <h1 className="text-lg font-medium tracking-tight">โควตายืนยันสิทธิ์ชมรมเดิม</h1>
                        <p className="tracking-tight text-gray-600">
                          นักเรียนไม่สามารถยืนยันสิทธิ์ได้ (ชมรม{userData && clubMap[userData.old_club]}) เนื่องจากชมรม
                          {userData && clubData[userData.old_club]?.old_count_limit === 0
                            ? "ไม่อนุญาตให้ยืนยันสิทธิ์ชมรมเดิม"
                            : "ไม่มีโควตาสมาชิกเก่าเหลือแล้ว"}
                          หากต้องการอยู่ชมรมเดิม ให้กดลงทะเบียนเข้าชมรมเดิมในฐานะสมาชิกใหม่
                        </p>
                        <div className="relative md:hidden">
                          <a href="/FAQ" target="_blank" className="tracking-tight cursor-pointer text-TUCMC-gray-700">
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
                  กดที่ตัวน้อนเป็ดเพื่อเข้า
                  <br />
                  โหมดฝึกสอนอีกรอบ
                </Tooltip>
              )}
              <motion.div
                initial={{ y: 0, x: 0, scaleX: 1 }}
                animate={tutorial ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.4 }}
                onClick={() => {
                  localStorage.setItem("tutorial", "no")
                  setExit(false)
                  setScene(1)
                  setTutorial(true)
                  setLocked(true)
                }}
                className="absolute top-[-130px] right-2 cursor-pointer"
              >
                <Image src={convertToStaticFileUri("/assets/dummy/duck.png")} width={90} height={122} />
              </motion.div>
              {!isEmpty(userData.audition) && (
                <div
                  onClick={() => {
                    Router.push("/dummy/announce")
                  }}
                  className="flex items-center px-6 py-2 space-x-2 font-semibold text-white rounded-full cursor-pointer bg-TUCMC-pink-400"
                >
                  <h1>จำลองการประกาศผลการ Audition</h1>
                  <ArrowRightIcon className="w-5 h-5" />
                </div>
              )}
            </div>
            <div style={width > 768 ? { width: width - 376, maxWidth: 952 } : {}} className="mt-16 md:mt-0">
              <div className="flex flex-col gap-y-6">
                <div className="grid grid-cols-3 text-center border-b">
                  <div
                    className={classnames(
                      "pb-3 transition-colors duration-200 cursor-pointer",
                      tab === "all" ? "border-b-2 border-b-TUCMC-pink-400 font-semibold text-TUCMC-pink-400" : "text-gray-500"
                    )}
                    onClick={() => setTab("all")}
                  >
                    ทั้งหมด
                  </div>
                  <div
                    className={classnames(
                      "pb-3 transition-colors duration-200 cursor-pointer",
                      tab === "noAudition" ? "border-b-2 border-b-TUCMC-pink-400 font-semibold text-TUCMC-pink-400" : "text-gray-500"
                    )}
                    onClick={() => setTab("noAudition")}
                  >
                    ไม่มีการ Audition
                  </div>
                  <div
                    className={classnames(
                      "pb-3 transition-colors duration-200 cursor-pointer",
                      tab === "hasAudition" ? "border-b-2 border-b-TUCMC-pink-400 font-semibold text-TUCMC-pink-400" : "text-gray-500"
                    )}
                    onClick={() => setTab("hasAudition")}
                  >
                    มีการ Audition
                  </div>
                </div>
                <FilterSearch setSearchContext={setSearchContext} sortMode={sortMode} setSortMode={setSortMode} disableNormal={true} />
              </div>
              <div className="space-y-2 w-full">
                <div className="grid grid-cols-1 mt-6 md:grid-cols-2 md:space-x-4">
                  {[0, 1].map((colIdx) => (
                    <div key={colIdx} className="space-y-2 w-full">
                      {/* Tutorial ClubList: คนรักแมว (scene 3) */}
                      {tutorial && colIdx === 0 && (scene === 3 || scene === 4 || scene === 5) && (
                        <div
                          className={classnames(
                            "relative",
                            scene === 3 || scene === 4 || scene === 5 ? "z-[100]" : "z-[1]"
                          )}
                        >
                          <div ref={notAuRef} className="absolute w-full h-full" />
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
                                <span className="font-semibold">ชมรมที่ไม่มีการ Audition</span> <br />{" "}
                                นักเรียนจะสามารถกดลงทะเบียนชมรมที่ไม่มีการ Audition ที่ยังว่างได้{" "}
                                <br className="hidden lg:block" />
                                ตั้งแต่วันที่ {getFullDate(openTime)} - ภายในวันที่ {getFullDate(endRegClubTime, false)}
                                <br className="hidden lg:block" /> เมื่อกดลงทะเบียนชมรมไปแล้วจะไม่สามารถย้ายชมรมได้อีก
                              </p>
                            </Tooltip>
                          )}
                        </div>
                      )}

                      {/* Tutorial ClubList: คนรักนกพิราบ (scene 4, 5) */}
                      {tutorial && colIdx === 1 && (scene === 4 || scene === 5) && (<div className="relative z-[100]">
                        <div ref={auRef} className="absolute w-full h-full" >
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
                        </div>
                        {(scene === 4 || scene === 5) && (
                          <Tooltip type={"top"} className="absolute top-[120px]">
                            <p>
                              <span className="font-semibold">ชมรมที่มีการ Audition</span> <br />{" "}
                              นักเรียนจะสามารถกดเลือกชมรมที่มีการ Audition กี่ชมรมก็ได้ <br className="hidden lg:block" />
                              ตั้งแต่วันที่ {getFullDate(openTime)} - ภายในวันที่ {getFullDate(endRegClubTime, false)}
                              <br className="hidden lg:block" /> จากนั้นนักเรียนติดตามข่าวสารการจัดการ Audition{" "}
                              ผ่านทางช่องทางของชมรม
                            </p>
                          </Tooltip>
                        )}
                      </div>)}

                      {/* Tutorial ClubList: คนรักแมวมาก ๆ (scene 6) */}
                      {tutorial && colIdx === 0 && scene === 6 && (
                        <div className={classnames("relative", "z-[100]")}>
                          <div ref={fullRef} className="absolute w-full h-full" />
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
                      )}

                      {sortedData[colIdx]?.map((club, idx) => (
                        <ClubList key={club.clubID || idx} data={club} action={setModalState} />
                      ))}
                    </div>
                  ))}
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
}

export default Select
