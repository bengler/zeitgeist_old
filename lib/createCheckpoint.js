import pebblesClient from '@bengler/pebbles-client'
import clientClasses from '@bengler/pebbles-client/clients'

export default function createCheckpoint(baseUrl) {
  const connector = new pebblesClient.Connector({
    baseUrl,
    clientClasses
  })

  connector.use({
    checkpoint: 1
  })

  return connector.checkpoint
}
