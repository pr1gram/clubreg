import classnames from "classnames"
import {DragableList} from "@components/panel/element/DragableEntity";
import {createContext, useContext, useEffect, useRef, useState} from "react";
import LooseTypeObject from "../../../interfaces/LooseTypeObject";
import {submitPending, updatePosition} from "@client/fetcher/panel";
import {useAuth} from "@client/auth";
import {motion, useAnimation} from "framer-motion"
import {detectOuside} from "@utilities/document";

const ItemsContext = createContext<[LooseTypeObject<any>[], (setItems: LooseTypeObject<any>) => void]>([[], (_) => null]);

export const ReservedSection = ({display, refetch, userData, editable, editFunc, callCount}) => {

  const [items, setItems] = useState<LooseTypeObject<any>[]>([]);
  const [updateEvent, setUpdateEvent] = useState(setTimeout(() => {}, 1000))
  const [blockRerender, setBRrender] = useState(false)
  const [dragMode, setDragMode] = useState(false)

  const innerItemRef = useRef(null)

  const {onReady} = useAuth()

  const adminData = onReady((logged, userData) => (userData))

  useEffect(() => {
    !blockRerender && setItems(userData.sort((a,b) => (a.position - b.position)))
    blockRerender && setBRrender(false)
  }, [userData])

  const update = () => {
    let ulist = []
    items.forEach(val => {
      const obj = userData.find(i => i.dataRefID === val.dataRefID)
      if (obj.position !== val.position) return ulist.push({dataRefID: obj.dataRefID, position: val.position})
    })
    if (ulist.length > 0) {
      updatePos(ulist)
    }
  }

  useEffect(() => {
    clearTimeout(updateEvent)
    setUpdateEvent(
      setTimeout(() => {
        update()
      }, 1000)
    )
  },[items])

  const updatePos = async (tasks) => {
    const res = await updatePosition(localStorage.getItem("currentPanel"), tasks)
    if (res.status) {
      setBRrender(true)
      refetch()
    }else{

    }
  }

  detectOuside(innerItemRef, dragMode, () => {
    setDragMode(false)
  })

  return (
    <div ref={innerItemRef} className={classnames("select-none", display ? "block" : "hidden")}>
      <motion.div onClick={() => {setDragMode(false); update()}} className="fixed top-20 px-4 py-1 rounded-full right-6 bg-TUCMC-gray-700 bg-opacity-50 text-white text-sm z-[90] cursor-pointer" animate={dragMode ? {opacity: 1} : {opacity: 0}}>เสร็จสิ้น</motion.div>
      <ItemsContext.Provider value={[items, setItems]}>
          <DragableList editable={editable} editFunc={editFunc} dragable={dragMode} setDragMode={setDragMode} callCount={callCount}/>
      </ItemsContext.Provider>
    </div>
  )
}

export const useItems = () => useContext(ItemsContext);