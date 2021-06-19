import {convertMiliseconds} from "@utilities/timers";

export const openTime = 1623043800000
export const editDataTime = 1623690000000
export const announceTime = 1623717000000
export const endRegClubTime = 1623690000000
export const breakUpperBound = 1623889800000
export const breakLowerBound = 1623884400000
export const positionUpdateTime = 1623884400000
export const lastround = 1623949200000
export const endLastRound = 1624035600000


export const getPrevMonday = (time: number) => {
  let prevMonday = new Date(time)
  prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7);
  return prevMonday.getTime()
}