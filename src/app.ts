import express from 'express'
import { resolvePointer } from './lib/pointers'
import { PayStringLib } from './lib/payString'
require('dotenv').config()

const app = express()
const payStringLib = new PayStringLib()

const payString = process.env.PayString!
const network = 'interledger-mainnet'

app.use(express.json())

app.get('/.well-known/pay', async function (req, res) {
  try {
    const payIdInfo = await payStringLib.getAddress(payString, network)
    const pointer = payIdInfo.addresses[0].addressDetails.address
    const spspUrl = resolvePointer(pointer)
    return res.redirect(302, spspUrl)
  } catch (e) {
    console.error(e)
    return res.status(404).send(e.message)
  }
})

export { app }
