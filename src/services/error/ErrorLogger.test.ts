// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { redactSensitive } from './ErrorLogger'

describe('redactSensitive', () => {
  it('removes keys, bearer tokens and photo data from nested metadata', () => {
    expect(redactSensitive({
      apiKey: 'sk-secret',
      nested: {
        authorization: 'Bearer secret-token',
        text: 'key sk-another and data:image/jpeg;base64,AAAA'
      }
    })).toEqual({
      apiKey: '[REDACTED]',
      nested: {
        authorization: '[REDACTED]',
        text: 'key [REDACTED_API_KEY] and [REDACTED_IMAGE]'
      }
    })
  })
})
