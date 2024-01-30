import { build } from '../helper'
const app = build()

describe('type endpoints', () => {
  it('should return all types', async () => {
    const res = await app.inject({
      url: '/types'
    })
    const payload = res.json()
    expect(res.statusCode).toEqual(200)
    expect(payload).toHaveLength(18)
    expect(payload).toMatchSnapshot()
  })
})
