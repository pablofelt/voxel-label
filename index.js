var LabelMaker = require('./Label.js')
var LabelPlugin = require('./LabelPlugin.js')()
var container

module.exports = function(game) {
  game.view.renderer.addPostPlugin(LabelPlugin);
  container = game.container
  return LabelPlugin
}

module.exports.label = function(labelContent, vertOffset, avatar, game, playerID) {
  var THREE = game.THREE
  var createLabel = LabelMaker(THREE, LabelPlugin, container)
  var playerLabel = new createLabel(avatar, playerID, labelContent, vertOffset);
  return playerLabel
}

