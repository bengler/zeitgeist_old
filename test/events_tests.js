import models from '../models'
import {assert} from 'chai'

/* eslint-disable max-nested-callbacks */

describe('Events count', () => {
  beforeEach(done => {
    models.Event.sync({force: true}) // drops table and re-creates it
    .then(() => {
      return models.Event.bulkCreate([
        {
          uid: 1,
          name: 'streamed',
        },
        {
          uid: 1,
          name: 'streamed',
        },
        {
          uid: 1,
          name: 'streamed',
        },
        {
          uid: 2,
          name: 'streamed',
        },
      ])
    })
    .then(() => done()).catch(error => done(error))
  })

  it('counts', done => {
    models.Event.scope('countByUid').findAll({
      where: {name: 'streamed'},
      order: 'count DESC'
    })
    .then(result => {
      const hits = result.map(item => item.dataValues)
      assert.deepEqual(hits, [
        {uid: '1', count: '3'},
        {uid: '2', count: '1'},
      ])
      done()
    })
    .catch(error => done(error))
  })
})
