const formatToString = value => {
  const type = typeof value;
  if (type === 'string' || type === 'number') return value;
  return value && value.toString ? value.toString() : value;
};

export const formatRow = (row, filterColumn) => {
  filterColumn = filterColumn || {};
  const rowData = {};
  row.primaryKey &&
    row.primaryKey.map(pk => {
      if (filterColumn[pk.name]) return;
      rowData[pk.name] = formatToString(pk.value);
    });
  row.attributes &&
    row.attributes.map(item => {
      if (filterColumn[item.columnName]) return;
      rowData[item.columnName] = formatToString(item.columnValue);
    });
  return rowData;
};

export const formatRows = (result, filterColumn) => {
  const list = [];
  let next = null;
  if (result && result.rows && result.rows.length) {
    result.rows.forEach(row => {
      const rowData = formatRow(row, filterColumn);
      list.push(rowData);
    });
  }

  if (result && result.next_start_primary_key) {
    result.next_start_primary_key.forEach(row => {
      if (!next) next = {};
      next[row.name] = formatToString(row.value);
    });
  }
  return {
    list,
    next,
  };
};
