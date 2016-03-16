var variables = require('./core/variables.js');
var Emitter = require('./core/Emitter.js');
var Group = require('./core/Group.js');
var utils = require('./core/utils.js');
var ShaderAttribute = require('./helpers/ShaderAttribute.js');
var TypedArrayHelper = require('./helpers/TypedArrayHelper.js');
var shaderChunks = require('./shaders/shaderChunks.js');
var shaders = require('./shaders/shaders.js');

// Merge variables into the core export for now so they are available as
// SPE.distributions, etc
module.exports = Object.assign(
    {},
    variables,
    {
        Emitter: Emitter,
        Group: Group,
        utils: utils,
        Shader: ShaderAttribute,
        TypedAr: TypedArrayHelper,
        shader: shaderChunks,
        shader: shaders,
    }
);
