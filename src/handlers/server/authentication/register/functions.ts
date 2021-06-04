import {compareDataPair, createDataPair, isValidEmail, isValidPassword} from "@server/authentication/register/dataChecking";
import {fixGrammar, isNumeric} from "@utilities/texts";
import bcrypt from "bcryptjs"

export const checkCredentials = async (userColl, req, ref) => {
  const ousd = await userColl.where("stdID", "==", req.body.stdID).get()

  if (!ousd.empty) return {status: false, report: "user_exists"}

  const refDB = await ref.where("student_id", "==", req.body.stdID).get()

  if (refDB.empty) return {status: false, report: "invalid_stdID"}

  const dataPair = createDataPair(refDB.docs[0].data(), req.body)

  if (!compareDataPair(dataPair, "firstname") || !compareDataPair(dataPair, "lastname")) return {
    status: false, report: "mismatch_data"
  }

  if (!isValidEmail(req.body.email) || !isNumeric(req.body.phone)) return {
    status: false, report: "invalid_data"
  }

  if (!isValidPassword(req.body.password)) return {
    status: false, report: "invalid_credentials"
  }

  if(req.body.password !== req.body.confirmPassword) return {
    status: false, report: "password_mismatch"
  }

  return {status: true, refDB}
}

export const appendData = async (dataColl, refDB) => {
  return await dataColl.add({
    ...refDB.docs[0].data(),
    ...{
      audition: {}
    },
    ...!("club" in refDB.docs[0].data()) && {club: ""}
  })
}

export const appendUser = async (userColl, req, refDB, dataDoc) => {
  return await userColl.add({
    stdID: refDB.docs[0].get("student_id"),
    email: fixGrammar(req.body.email),
    phone: fixGrammar(req.body.phone),
    dataRefID: dataDoc.id,
    password: await bcrypt.hash(req.body.password, 10),
    safeMode: false,
    authorised: {}
  })
}