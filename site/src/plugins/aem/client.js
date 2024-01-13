module.exports = {
  onRouteUpdate({ location, previousLocation }) {
    if (globalThis.pv && globalThis.pv) {
      globalThis.pv.sendLeave();
    }
  },
  onRouteDidUpdate({ location, previousLocation }) {
    if (globalThis.pv && globalThis.pv) {
      globalThis.pv.sendPV();
    }
  },
};
