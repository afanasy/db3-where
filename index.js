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
    if (set)
      return _.map(d, function (value, key) {return app.pair(key, value, null, true, true, set)}).join(delimiter)
    return _.map(this.and(d), function (d) {
      if (_.isArray(d.value) && !d.value.length) {
        if (d.operator == '=')
          return 0
        if (d.operator == '!=')
          return 1
      }
      return sqlString.escapeId(String(d.key)) + ' ' + app.queryOperator(d.operator, d.value) + ' ' + app.escape(d.value)
    }).join(' and ')
  },
  queryOperator: function (operator, value) {
    if (operator == '=') {
      if (_.isNull(value))
        return 'is'
      if (_.isArray(value))
        return 'in'
    }
    if (operator == '!=') {
      if (_.isNull(value))
        return 'is not'
      if (_.isArray(value))
        return 'not in'
    }
    return operator
  },
  and: function (d) {
    var and = []
    _.each(d, function (value, key) {
      if (_.isNaN(value) || _.isNull(value) || _.isUndefined(value) || _.isNumber(value) || _.isBoolean(value) || _.isString(value) || _.isArray(value))
        return and.push({key: key, value: value, operator: '='})
      if (_.isObject(value)) {
        if (!_.isUndefined(value.from))
          and.push({key: key, value: value.from, operator: '>='})
        if (!_.isUndefined(value.to))
          and.push({key: key, value: value.to, operator: '<='})
        _.each(['=', '!=', '>', '<', '>=', '<='], function (operator) {
          if (!_.isUndefined(value[operator]))
            and.push({key: key, value: value[operator], operator: operator})
        })
      }
    })
    return and
  },
  pair: function (key, value, operator, escapeKey, escapeValue, set) {
    operator = operator || '='
    if (!set) {
      if ((_.isNaN(value) || _.isNull(value) || _.isUndefined(value)) && (operator == '='))
        operator = 'is'
      if (_.isArray(value))
        operator = 'in'
      if (_.isObject(value)) {
        if (!_.isUndefined(value.equal))
          operator = '='
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
      return !_.find(app.and(d), function (d) {
        if (d.operator == '=') {
          if (!_.isArray(d.value))
            return a[d.key] !== d.value
          else
            return !_.contains(d.value, a[d.key])
        }
        if (d.operator == '!=') {
          if (!_.isArray(d.value))
            return a[d.key] === d.value
          else
            return _.contains(d.value, a[d.key])
        }
        if (d.operator == '>')
          return a[d.key] <= d.value
        if (d.operator == '<')
          return a[d.key] >= d.value
        if (d.operator == '>=')
          return a[d.key] < d.value
        if (d.operator == '<=')
          return a[d.key] > d.value
      })
    }
  }
}
