Mem = require("../serialized-property.js")
chai = require 'chai'
sinon = require 'sinon'
expect = chai.expect

chai.use require 'sinon-chai'

describe "test first", ()->
  it "spec spec", ->
    expect ->
      throw "Error"
    .to.throw("Error")
