import axios from 'axios'
import consola from 'consola'
import { PayIdUtils } from 'xpring-js'

export class PayStringLib {
  private requestHeaders = {
    'PayID-Version': '1.0',
  }

  async getAddress(payString: string, network: string) {
    const headers = {
      ...this.requestHeaders,
      Accept: `application/${network}+json`,
      'Content-Type': `application/json`,
    }
    consola.info(payString)
    const payStringInfo = PayIdUtils.parsePayId(payString)!
    const { host, path } = payStringInfo
    const result = await axios.get(`https://${host}${path}`, {
      headers,
    })
    return result.data
  }
}
