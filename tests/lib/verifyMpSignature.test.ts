import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'
import { verifyMpSignature } from '../../lib/verifyMpSignature'

const SECRET = 'test-secret'

function sign(dataId: string, requestId: string, ts: string) {
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  return createHmac('sha256', SECRET).update(manifest).digest('hex')
}

describe('verifyMpSignature', () => {
  it('accepts a correctly signed notification', () => {
    const ts = '1700000000'
    const v1 = sign('123456', 'req-1', ts)
    const result = verifyMpSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId: 'req-1',
      dataId: '123456',
      secret: SECRET,
    })
    expect(result).toBe(true)
  })

  it('rejects a tampered payment id', () => {
    const ts = '1700000000'
    const v1 = sign('123456', 'req-1', ts)
    const result = verifyMpSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId: 'req-1',
      dataId: '999999',
      secret: SECRET,
    })
    expect(result).toBe(false)
  })

  it('rejects when the header is missing', () => {
    expect(verifyMpSignature({ xSignature: null, xRequestId: 'req-1', dataId: '1', secret: SECRET })).toBe(false)
  })

  it('rejects a signature made with the wrong secret', () => {
    const ts = '1700000000'
    const v1 = createHmac('sha256', 'wrong-secret').update(`id:123456;request-id:req-1;ts:${ts};`).digest('hex')
    const result = verifyMpSignature({
      xSignature: `ts=${ts},v1=${v1}`,
      xRequestId: 'req-1',
      dataId: '123456',
      secret: SECRET,
    })
    expect(result).toBe(false)
  })
})
