interface Ilayer {
  [extName: string]: {
    path: string;
  };
}

export function formatLayers(...multiLayers: Ilayer[]) {
  const layerTypeList = { npm: {} };
  multiLayers.forEach((layer: Ilayer) => {
    Object.keys(layer || {}).forEach(layerName => {
      const [type, path] = layer[layerName].path.split(':');
      if (!layerTypeList[type]) {
        return;
      }
      layerTypeList[type][layerName] = path;
    });
  });
  return layerTypeList;
}
