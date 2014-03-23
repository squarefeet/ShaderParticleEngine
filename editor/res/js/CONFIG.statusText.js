var CONFIG = CONFIG || {};

CONFIG.statusText = {
	menu: {
		'new': 'Create a new effect with one emitter at default settings.',
		'open': 'Open a saved effect or preset.',
		'save': 'Save the current effect.',
		'saveas': 'Save the current effect with a custom name.',
		'revert': 'Revert to last saved version of this effect.',
		'import': 'Import a *.spe file from your local filesystem.',
		'export': 'Export to .spe file format.',
		'exit': 'Close this window.'
	},

	settingsPanel: {
		texture: 'Choose preset texture, or upload your own custom image.',
		maxAge: "The age of this group's particles",
		hasPerspective: "Whether the group's particles should attenuate their size based on distance from the camera.",
		colorize: "Whether colour be applied to this group or not",
		blending: "The group's blending mode. Additive is the usual choice.",
		transparent: "Defines whether this material is transparent. When set to true, the extent to which the material is transparent is controlled by setting opacity.",
		alphaTest: "Sets the alpha value to be used when running an alpha test.",
		depthWrite: "Whether rendering this material has any effect on the depth buffer.",
		depthTest: 'Whether to have depth test enabled when rendering this material.',

		type: 'What "shape" this emitter should have (cube / sphere / disk).',
		particleCount: 'The maximum of particles this emitter should have.',
		alive: 'The percentage of the `particleCount` number of particles that should be shown. Value between 0 and 1.',
		duration: 'The duration of the emitter. Measured in seconds',
		'static': 'Whether this emitter should be animated.',
		position: 'The base position of the emitter.',
		positionSpread: 'The range from the base position that particles should be created within.',
		radius: 'The sphere or disk radius.',
		radiusSpread: 'The range from the `radius` in which particles will be created within.',
		radiusSpreadClamp: 'Clamp the `radiusSpread` to every `n` units.',
		radiusScale: "The 3d scale of the sphere or disk's `radius`",
		acceleration: 'The base acceleration value.',
		accelerationSpread: "The range from the base `acceleration` value that a particle's acceleration value will stray.",
		velocity: 'The base velocity value.',
		velocitySpread: "The range from the base `velocity` value that a particle's velocity value will stray.",
		speed: 'The base speed value.',
		speedSpread: "The range from the base `speed` value that a particle's speed value will stray.",
		size: 'The base size values',
		sizeSpread: "The range from the base `size` value that a particle's size value will stray.",
		color: 'The base colour values.',
		colorSpread: "The range from the base `color` value that a particle's colour value will stray.",
		opacity: 'The base opacity values',
		opacitySpread: "The range from the base `opacity` value that a particle's opacity value will stray.",
		angle: 'The base angles of rotation.',
		angleSpread: "The range from the base `angle` value that a particle's rotation will stray."
	}


};