import { MidwayWebLoader } from './webLoader'


export class AppWorkerLoader extends MidwayWebLoader {

  /**
   * Load all directories in convention
   * @since 1.0.0
   */
  load() {
    // app > plugin > core
    this.loadApplicationExtend()
    this.loadRequestExtend()
    this.loadResponseExtend()
    this.loadContextExtend()
    this.loadHelperExtend()
    this.loadApplicationContext()
    // app > plugin
    this.loadCustomApp()
    // app > plugin
    this.loadService()
    // app > plugin > core
    this.loadMiddleware()
    // app
    this.loadController()
    // app
    this.loadRouter() // Dependent on controllers

    // midway logic
    this.app.beforeStart(async () => {
      await this.refreshContext()
      await this.loadMidwayController()
    })
  }

}

export class AgentWorkerLoader extends MidwayWebLoader {

  load() {
    this.loadAgentExtend()
    this.loadApplicationContext()
    this.loadContextExtend()
    this.loadCustomAgent()
    this.app.beforeStart(async () => {
      await this.refreshContext()
    })
  }

}
