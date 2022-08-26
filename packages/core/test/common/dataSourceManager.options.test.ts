import * as assert from 'assert'
import { relative } from 'path'
import { Client } from 'pg'

import { DataSourceManager } from '../../src';

const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const fakePort = 54321

  class CustomDataSourceFactory extends DataSourceManager<any> {
    getName() {
      return 'test';
    }
    async init(options) {
      return super.initDataSource(options, __dirname);
    }

    protected async createDataSource(config, dataSourceName: string): Promise<any > {
      assert(config)
      config.entitiesLength = 0
      // to skip real connection action
      if (config.port === fakePort) {
        return config
      }
      const client = new Client(config)
      await client.connect()
      return client;
    }

    protected async checkConnected(dataSource: any): Promise<boolean> {
      if (! dataSource || typeof dataSource.query !== 'function') {
        return false
      }
      const ret = await dataSource.query('SELECT CURRENT_TIMESTAMP as time').then(res => res?.rows[0])
      console.log({ ret })
      return ret && ret.time ? true : false
    }

    protected async destroyDataSource(dataSource: any): Promise<void> {
      return dataSource.end()
    }
  }

  const clientName = 'test'
  const configDefault = {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password : 'postgres',
    database: 'db_ci_test',
  }


  describe('should DataSourceInitOptions.validateConnection work', () => {
    it('default (false)', async () => {
      const instance = new CustomDataSourceFactory()
      expect(instance.getName()).toEqual('test')

      const config = {
        ...configDefault,
      }

      await instance.createInstance(config, clientName)
      expect(instance.getDataSourceNames()).toEqual([clientName])
    })

    it('false', async () => {
      const instance = new CustomDataSourceFactory()
      expect(instance.getName()).toEqual('test')

      const config = {
        ...configDefault,
      }

      await instance.createInstance(config, clientName, { validateConnection: false})
      expect(instance.getDataSourceNames()).toEqual([clientName])
    })

    it('true', async () => {
      const instance = new CustomDataSourceFactory()
      expect(instance.getName()).toEqual('test')

      const config = {
        ...configDefault,
      }

      await instance.createInstance(config, clientName, { validateConnection: true})
      expect(instance.getDataSourceNames()).toEqual([clientName])
    })
  })


  describe('should DataSourceInitOptions.validateConnection work with wrong connection config', () => {
    it('default (false)', async () => {
      const instance = new CustomDataSourceFactory()
      expect(instance.getName()).toEqual('test')

      const clientName = 'test'
      const config = {
        ...configDefault,
        port: fakePort
      }

      await instance.createInstance(config, clientName)
      expect(instance.getDataSourceNames()).toEqual([clientName])
    })

    it('false', async () => {
      const instance = new CustomDataSourceFactory()
      expect(instance.getName()).toEqual('test')

      const config = {
        ...configDefault,
        port: fakePort
      }

      await instance.createInstance(config, clientName, { validateConnection: false})
      expect(instance.getDataSourceNames()).toEqual([clientName])
    })

    it('true', async () => {
      const instance = new CustomDataSourceFactory()
      expect(instance.getName()).toEqual('test')

      const config = {
        ...configDefault,
        port: fakePort
      }

      try {
        await instance.createInstance(config, clientName, { validateConnection: true})
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes(clientName))
        assert(ex.message.includes('not connected'))
        return
      }
      assert(false, 'should throw error but not')
    })
  })

})
