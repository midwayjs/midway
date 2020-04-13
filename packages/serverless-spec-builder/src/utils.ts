export interface Ilayer {
  [extName: string]: {
    path: string;
  };
}
export function formatLayers(...multiLayers: Ilayer[]) {
  const layerTypeList = { npm: {} };
  multiLayers.forEach((layer: Ilayer) => {
    Object.keys(layer || {}).forEach((layerName) => {
      const [type, path] = layer[layerName].path.split(':');
      if (!layerTypeList[type]) {
        return;
      }
      layerTypeList[type][layerName] = path;
    });
  });
  return layerTypeList;
}

export function getLayers(...layersList: any) {
  const layerTypeList = formatLayers(...layersList);
  const layerDeps = [];
  const layers = [];

  if (layerTypeList && layerTypeList.npm) {
    Object.keys(layerTypeList.npm).forEach((originName: string) => {
      const name = 'layer_' + originName;
      layerDeps.push({ name, path: layerTypeList.npm[originName] });
      layers.push(name);
    });
  }
  return {
    layerDeps,
    layers,
  };
}

export function uppercaseObjectKey(obj) {
  const json = JSON.stringify(obj);
  const result = json.replace(/"([^"])([^"]*)":/gim, (...value) => {
    return `"${value[1].toUpperCase()}${value[2]}":`;
  });
  return JSON.parse(result);
}
