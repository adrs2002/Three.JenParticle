"use strict";

/**
 * @author Jey-en  https://github.com/adrs2002
 * 
 * this Three.js Plugin repo -> https://github.com/adrs2002/
 *
 */


class jenParticle {
    // コンストラクタ
    constructor(Texloader, _option) {
        const obj = new THREE.Object3D();

        obj.updateMatrixWorld = ( function () {
            THREE.Object3D.prototype.updateMatrixWorld.call( this );
            console.log('OK');
        });

        return obj;
    }

}