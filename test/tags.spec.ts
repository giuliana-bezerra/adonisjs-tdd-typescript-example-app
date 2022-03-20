import Database from '@ioc:Adonis/Lucid/Database'
import { TagsFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Tags', (group) => {
  test('it should list all tags', async (assert) => {
    const TAGS_LENGTH = 5
    const tags = await TagsFactory.createMany(TAGS_LENGTH)

    const { body } = await supertest(BASE_URL).get('/api/tags').expect(200)

    assert.isNotEmpty(body.tags)
    assert.lengthOf(body.tags, TAGS_LENGTH)
    tags.map((tag) => {
      assert.isTrue(body.tags.includes(tag.name))
    })
  })

  test('it should list no tags', async (assert) => {
    const { body } = await supertest(BASE_URL).get('/api/tags').expect(200)

    assert.isEmpty(body.tags)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
