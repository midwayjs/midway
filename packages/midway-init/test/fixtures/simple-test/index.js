
module.exports = {
  name: {
    desc: 'project name',
  },
  description: {
    desc: 'project description',
  },
  author: {
    desc: 'project author',
    default: 'TZ',
  },
  defaultFn: {
    desc: 'test default fn',
    default(vars) {
      return 'default-' + vars.name;
    },
  },
  filterFn: {
    desc: 'test filter fn',
    filter(v) {
      return 'filter-' + v;
    },
  },
};
