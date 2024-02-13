import { MATCH_TYPE, TAG_ERROR, TagServiceFactory } from '../src';
import * as assert from 'assert';
import { createLightApp, close } from '@midwayjs/mock';
import { join } from 'path';
describe('mysql.test.ts', () => {
  let tagManager;
  let container;
  let app;
  beforeAll(async () => {
    app = await createLightApp(join(__dirname, './fixtures/mysql'));
    container = app.getApplicationContext();
    tagManager = await container.getAsync(TagServiceFactory);
  })
  afterAll(async () => {
    await close(app);
  })
  it.only('new tag', async () => {
    const tagService = tagManager.get('new-tag');
    const tag1Result = await tagService.new({
      name: 'test1',
      desc: 'desc test 1'
    });
    assert.ok(tag1Result.success && tag1Result.id);

    const tag1ExistsResult = await tagService.new({
      name: 'test1',
      desc: 'desc test 1'
    });
    assert (!tag1ExistsResult.success && tag1ExistsResult.message === TAG_ERROR.EXISTS);
    const tag2Result = await tagService.new({
      name: 'test2',
      desc: 'desc test 2'
    });
    assert (tag2Result.success && tag2Result.id > tag1Result.id);
  });
  it('list tag', async () => {
    const tagService = tagManager.get('list-tag');
    const newItams = await Promise.all(new Array(100).fill(0).map(async (_, i) => {
      return await tagService.new({
        name: 'test-list-' + (i + 1),
        desc: 'desc test ' + (i + 1)
      })
    }));
    // list top 20
    const result = await tagService.list({ count: true });
    assert.ok(result.list.length === 20 && result.total >= 100);
    assert.ok(result.list[0].id && result.list[0].name);
    // list page 2 and pageSize 17
    const result2 = await tagService.list({
      page: 2,
      pageSize: 17,
      count: false
    });
    assert.ok(result2.list.length === 17 && !result2.total);
    assert.ok(result.list[0].id && result.list[0].name);

    // macth/search/list
    const match = await tagService.list({
      tags: [newItams[1].id, newItams[4].id, '%-list-67', 'test-list-78', 'test-list-9%'],
      count: true
    });
    // 2/4/9/67/78/90~99
    assert.ok(match.list.length === 15 && match.total === 15);
    assert.ok(match.list[0].id === newItams[1].id);
    assert.ok(match.list[1].id === newItams[4].id);
    assert.ok(match.list[3].name.endsWith('-67'));
  });
  it('update tag', async () => {
    const tagService = tagManager.get('update-tag');
    const newItams = await Promise.all(new Array(100).fill(0).map(async (_, i) => {
      return await tagService.new({
        name: 'test-update-' + (i + 1),
        desc: 'desc test ' + (i + 1)
      })
    }));
    const {list: [item23]} = await tagService.list({ tags: [newItams[22].id] });
    const updateRes = await tagService.update(item23.id, {
      name: 'xxxx23',
      desc: 'descxxx23',
    });
    assert.ok(updateRes.success && updateRes.id === item23.id);
    const find23 = await tagService.list({ tags: [item23.id] });
    assert.ok(find23.list.length === 1 && find23.list[0].id === item23.id && find23.list[0].name === 'xxxx23' && find23.list[0].desc === 'descxxx23');
    const {list: [item67]} = await tagService.list({ tags: ['test-update-67'] });
    const updateByNameRes = await tagService.update(item67.name, {
      name: 'xxxx67',
      desc: 'descxxx67',
    });
    assert.ok(updateByNameRes.success && updateByNameRes.id === item67.id);
  });
  it('remove tag', async () => {
    const tagService = tagManager.get();
    for(let i = 0; i < 100; i++) {
      await tagService.new({
        name: 'test-remove-' + (i + 1),
        desc: 'desc test ' + (i + 1)
      });
    }
    const {list: [item23]} = await tagService.list({ tags: ['test-remove-23'] });
    const removeRes = await tagService.remove(item23.id);
    assert.ok(removeRes.success && removeRes.id === item23.id);
    const find23 = await tagService.list({ tags: [item23.id], count: true });
    assert.ok(find23.list.length === 0 && find23.total === 0);
    const findAll = await tagService.list({ tags: ['test-remove-%'], count: true });
    assert.ok(findAll.total === 99);
  });
  it('bind tags', async () => {
    const tagService = tagManager.get();
    const newItams = await Promise.all(new Array(100).fill(0).map(async (_, i) => {
      return await tagService.new({
        name: 'test-bind-' + (i + 1),
        desc: 'desc test ' + (i + 1)
      })
    }));
    const bindRes = await tagService.bind({
      objectId: 1,
      tags: [
        newItams[1].id,
        newItams[23].id,
        newItams[45].id,
        newItams[78].id,
      ]
    });
    assert.ok(bindRes.success);

    const bindRes2 = await tagService.bind({
      objectId: 1,
      tags: [
        newItams[1].id,
        newItams[23].id,
        'xxx'
      ]
    });
    assert.ok(!bindRes2.success && bindRes2.message === TAG_ERROR.NOT_EXISTS && bindRes2.id[0] === 'xxx');
    // auto create
    const bindRes3 = await tagService.bind({
      objectId: 1,
      tags: [
        newItams[1].id,
        newItams[23].id,
        'xxx'
      ],
      autoCreateTag: true
    });
    assert.ok(bindRes3.success);
    const tag = await tagService.list({ tags: ['xxx']})
    assert.ok(tag.list[0].name === 'xxx' && tag.list[0].id);
  });

  it('list objectId by tags', async () => {
    const tagDefaultService = tagManager.get('list-tag-default');
    const tagService = tagManager.get('list-tag');
    const defaultItems = await Promise.all(new Array(10).fill(0).map(async (_, i) => {
      return await tagDefaultService.new({
        name: 'test-list-obj-default-' + (i + 1),
        desc: 'desc test ' + (i + 1)
      })
    }));
    for(let i = 0; i < 100; i++) {
      await tagService.new({
        name: 'test-list-obj-' + (i + 1),
        desc: 'desc test ' + (i + 1)
      });
    }

    for(let i = 1; i <  10; i++) {
      for(let j = 1; j < 10; j ++) {
        await tagService.bind({
          objectId: i,
          tags: ['test-list-obj-' + (i * j)]
        });
      }
    }

    const res = await tagService.bind({
      objectId: 1,
      tags: [defaultItems[0].id]
    });
    // differernt service group
    assert.ok(!res.success && (res.id as any).length === 1 && res.id[0] === defaultItems[0].id);
    
    const listRes = await tagService.listObjects({
      tags: ['test-list-obj-16'],
      count: true
    });
    assert.ok(listRes.list.length === 3 && listRes.total === 3);
    assert.ok(listRes.list[0] === 2 && listRes.list[1] === 4 && listRes.list[2] === 8);
 

    // instanceid = 4/8 
    const listRes2 = await tagService.listObjects({
      tags: ['test-list-obj-16', 'test-list-obj-32'],
      count: true,
      type: MATCH_TYPE.And,
    });
    assert.ok(listRes2.list.length === 2 && listRes2.total === 2);
    assert.ok(listRes2.list[0] === 4 && listRes2.list[1] === 8);

    const listRes2Or = await tagService.listObjects({
      tags: ['test-list-obj-16', 'test-list-obj-32'],
      count: true,
      type: MATCH_TYPE.Or,
      pageSize: 2,
    });
    assert.ok(listRes2Or.list.length === 2 && listRes2Or.total === 3);
    assert.ok(listRes2Or.list[0] === 2 && listRes2Or.list[1] === 4);

    let removeDefaultServiceRes = await tagService.remove(defaultItems[1].id);
    assert.ok(!removeDefaultServiceRes.success && removeDefaultServiceRes.message === TAG_ERROR.NOT_EXISTS);
    removeDefaultServiceRes = await tagService.remove('test-list-obj-default-2');
    assert.ok(!removeDefaultServiceRes.success && removeDefaultServiceRes.message === TAG_ERROR.NOT_EXISTS);

    // remove tag 16
    await tagService.remove('test-list-obj-16');
    const listResAfterRemove16 = await tagService.listObjects({
      tags: ['test-list-obj-16'],
      count: true
    });
    assert.ok(listResAfterRemove16.list.length === 0 && listResAfterRemove16.total === 0);
  });

  it('unbind & listInstanTags', async () => {
    const tagService = tagManager.get();
    for(let i = 0; i < 100; i++) {
      await tagService.new({
        name: 'test-unbind-' + (i + 1),
        desc: 'desc test ' + (i + 1)
      });
    }
    await tagService.bind({
      objectId: 123,
      tags: ['test-unbind-1','test-unbind-2','test-unbind-3','test-unbind-4']
    });
    const { list, total  } = await tagService.listObjectTags({
      objectId: 123,
      count: true
    });
    assert.ok(list.length === 4 && total === 4);
    assert.ok(list[0].name === 'test-unbind-1' && list[1].name === 'test-unbind-2' )
    await tagService.unbind({
      objectId: 123,
      tags: ['test-unbind-3', 'test-unbind-1'],
    });
    const afterUnbind = await tagService.listObjectTags({
      objectId: 123,
      count: true
    });
    assert.ok(afterUnbind.list.length === 2 && afterUnbind.total === 2);
    assert.ok(afterUnbind.list[0].name === 'test-unbind-2' && afterUnbind.list[1].name === 'test-unbind-4' )
    // unbind all
    await tagService.unbind({
      objectId: 123,
      tags: []
    });
    const afterUnbindAll = await tagService.listObjectTags({
      objectId: 123,
      count: true
    });
    assert.ok(afterUnbindAll.list.length === 0 && afterUnbindAll.total === 0);
  });
});
