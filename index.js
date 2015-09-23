var
  _ = require('underscore'),
  sqlString = require('sqlstring')

var app = module.exports = {
  escape: function (value, set) {
    if (_.isNaN(value) || _.isNull(value) || _.isUndefined(value))
      return 'null'
    if (_.isNumber(value))
      return value
    if (_.isBoolean(value))
      return +value
    if (!set) {
      if (_.isArray(value))
        return '(' + _.map(value, function (d) {return app.escape(d, set)}).join(', ') + ')'
      if (_.isObject(value)) {
        if (!_.isUndefined(value.from) && !_.isUndefined(value.to))
          return app.escape(value.from, set) + ' and ' + app.escape(value.to, set)
        if (!_.isUndefined(value.from))
          return app.escape(value.from, set)
        if (!_.isUndefined(value.to))
          return app.escape(value.to, set)
      }
    }
    return sqlString.escape(String(value))
  },
  query: function (d, set) {
    var delimiter = ' and '
    if (set)
      delimiter = ', '
    if (_.isNumber(d) || _.isString(d))
      d = {id: +d}
    var self = this
    return _.map(d, function (value, key) {return app.pair(key, value, null, true, true, set)}).join(delimiter)
  },
  pair: function (key, value, operator, escapeKey, escapeValue, set) {
    operator = operator || '='
    if (!set) {
      if ((_.isNaN(value) || _.isNull(value) || _.isUndefined(value)) && (operator == '='))
        operator = 'is'
      if (_.isArray(value))
        operator = 'in'
      if (_.isObject(value)) {
        if (!_.isUndefined(value.from) && !_.isUndefined(value.to))
          operator = 'between'
        else {
          if (!_.isUndefined(value.from))
            operator = '>='
          if (!_.isUndefined(value.to))
            operator = '<='
        }
      }
    }
    if (escapeKey !== false)
      key = sqlString.escapeId(String(key))
    if (escapeValue !== false)
      value = app.escape(value, set)
    return key + ' ' + operator + ' ' + value
  },
  filter: function (d) {
    return function (a) {
      return !_.find(d, function (value, key) {
        if (_.isNaN(value) || _.isNull(value) || _.isUndefined(value) || _.isNumber(value) || _.isBoolean(value) || _.isString(value))
          return a[key] !== value
        if (_.isArray(value))
          return !_.contains(value, a[key])
        if (_.isObject(value)) {
          if (!_.isUndefined(value.from) && !_.isUndefined(value.to))
            return (a[key] < value.from) || (a[key] > value.to)
          if (!_.isUndefined(value.from))
            return a[key] < value.from
          if (!_.isUndefined(value.to))
            return a[key] > value.to
        }
      })
    }
  }
}
