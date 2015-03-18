/// <reference path="three.d.ts"/>

// Type definitions for ShaderParticles Version 0.7.8
// Project: https://github.com/squarefeet/ShaderParticleEngine

declare module SPE {
    class Group {
        mesh:THREE.Mesh;

        constructor(options:any);
        addEmitter(particleEmitter:Emitter):Group;
        removeEmitter(emitter);
        getFromPool():Emitter;
        releaseIntoPool(emitter:Emitter):Group;
        addPool(numEmitters:number, emitterSettings:any, createNew:boolean):Group;
        triggerPoolEmitter(numEmitters:number, position:THREE.Vector3):Group;
        tick(dt:number);
    }

    class Emitter {
        particleCount:number;
        type:string;
        position:THREE.Vector3;
        positionSpread:THREE.Vector3;

        // These four properties are only used when this.type === 'sphere' or 'disk'
        radius:number;
        radiusSpread:number;
        radiusScale:THREE.Vector3;
        radiusSpreadClamp:number;

        acceleration:THREE.Vector3;
        accelerationSpread:THREE.Vector3;

        velocity:THREE.Vector3;
        velocitySpread:THREE.Vector3;

        // And again here; only used when this.type === 'sphere' or 'disk'
        speed:number;
        speedSpread:number;

        // Sizes
        sizeStart:number;
        sizeStartSpread:number;

        sizeEnd:number;
        sizeEndSpread:number;

        sizeMiddle:number;
        sizeMiddleSpread:number;

        // Angles
        angleStart:number;
        angleStartSpread:number;

        angleEnd:number;
        angleEndSpread:number;

        angleMiddle:number;
        angleMiddleSpread:number;
        angleAlignVelocity:number;

        // Colors
        colorStart:THREE.Vector3;
        colorStartSpread:THREE.Color;

        colorEnd:THREE.Color;
        colorEndSpread:THREE.Color;

        colorMiddle:THREE.Color;
        colorMiddleSpread:THREE.Vector3;

        // Opacities
        opacityStart:number;
        opacityStartSpread:number;

        opacityEnd:number;
        opacityEndSpread:number;

        opacityMiddle:number;
        opacityMiddleSpread:number;

        // Generic
        duration:number;
        alive:number;
        isStatic:number;

        userData:any;

        constructor(options:any);
        reset(force:boolean);
        enable();
        disable();
    }
}