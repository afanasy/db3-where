var
  expect = require('expect.js'),
  where = require('./')

describe('where', function () {
  describe('#query', function () {
    it('translates number', function () {
      expect(where.query(1)).to.be('`id` = 1')
    })
    it('translates object', function () {
      expect(where.query({id: 1, name: 'Adam'})).to.be("`id` = 1 and `name` = 'Adam'")
    })
    it('translates object with array', function () {
      expect(where.query({id: [1, 2]})).to.be('`id` in (1, 2)')
    })
    it('translates object with from/to condition', function () {
      expect(where.query({id: {from: 1, to: 2}})).to.be('`id` between 1 and 2')
    })
  })
  describe('#sort', function () {
    var fruit = [
      {id: 1, name: 'Banana'},
      {id: 2, name: 'Apple'},
      {id: 3, name: 'Apple'}
    ]
    it('filters with number', function () {
      expect(fruit.filter(where.filter(1))[0].id).to.be(1)
    })
    it('filters with object', function () {
      expect(fruit.filter(where.filter({name: 'Apple'}))[0].id).to.be(2)
    })
    it('filters with array', function () {
      expect(fruit.filter(where.filter({id: [1, 2]}))[0].id).to.be(1)
    })
    it('filters with from/to condition', function () {
      expect(fruit.filter(where.filter({id: {from: 2, to: 3}}))[0].id).to.be(2)
    })
  })
})
