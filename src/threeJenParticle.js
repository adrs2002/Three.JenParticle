"use strict";

// import THREE from 'three'

/**
 * @author Jey-en  https://github.com/adrs2002
 * 
 * this Three.js Plugin repo -> https://github.com/adrs2002/
 *
 */

/**
 * @constructor
 * @extends THREE.Object3D
 */
class jenParticle extends THREE.Object3D {
    // コンストラクタ
    constructor(Texloader, _option = {}) {
        super();

        const {
            isAlphaAdd = true,
            isTextured = true,
            colors = [new THREE.Color(1.0, 1.0, 0.8), new THREE.Color(1.0, 0.7, 0.0), new THREE.Color(0.5, 0.0, 0.0)],
            // colors = [ new THREE.Color(0.0, 1.0, 1.0),new THREE.Color(0.0, 0.7, 1.0),new THREE.Color(0.0, 0.0, 1.0) ]
            gravity = new THREE.Vector3(0, -0.5, 0)
        } = _option;

        this.particleCount = 7500;	//これがパーティクルの作成最大数。多すぎると死ぬ
        this.clock = new THREE.Clock();

        this.geo = new THREE.InstancedBufferGeometry();
        this.geo.copy(new THREE.CircleBufferGeometry(1, 8));

        //入れ物を初期化していく
        //シェーダに渡すには明確に【型】が決まってる必要があるため、こういうことを行う
        this.translateArray = new Float32Array(this.particleCount * 3);
        this.colArray = new Float32Array(this.particleCount * 3);
        this.vectArray = new Float32Array(this.particleCount * 4);
        this.scaleArray = new Float32Array(this.particleCount * 1);
        this.timeArray = new Float32Array(this.particleCount * 1);
        this.uvEArray = new Float32Array(this.particleCount * 2);
        //カウンタでぶん回してガンガン初期化
        for (let i = 0; i < this.particleCount; i++) {
            //いわば、パーティクルの初期位置に該当。どうせ書き換わるから気にするな
            this.translateArray[i * 3 + 0] = 0.0;
            this.translateArray[i * 3 + 1] = 0.0;
            this.translateArray[i * 3 + 2] = 0.0;

            //パーティクルの大きさをセットする入れ物
            this.scaleArray[i] = 0.0;

            //【色】を管理する入れ物
            this.colArray[i * 3 + 0] = 0.0;
            this.colArray[i * 3 + 1] = 1.0;
            this.colArray[i * 3 + 2] = 0.0;

            //出現してからの時間管理の入れ物
            this.timeArray[i] = 0.0;

            //UVを乱すための配列
            this.uvEArray[i * 2 + 0] = Math.random();
            this.uvEArray[i * 2 + 1] = Math.random();
        }

        let noisetexture = null;
        if (isTextured) {
            // create noize texture
            const n = new noiseX(5, 2, 0.6);
            n.setSeed(new Date().getTime());
            const noiseColor = new Array(128 * 128);
            for (let i = 0; i < 128; i++) {
                for (let j = 0; j < 128; j++) {
                    noiseColor[i * 128 + j] = n.snoise(i, j, 128);
                    noiseColor[i * 128 + j] *= noiseColor[i * 128 + j];
                }
            }
            const noiseCanvas = n.canvasExport(noiseColor, 128);
            noisetexture = new THREE.Texture(noiseCanvas);
        } else {
            const c = new colCanvas();
            const noiseCanvas = c.canvasExport(2);
            noisetexture = new THREE.Texture(noiseCanvas);
        }

        noisetexture.needsUpdate = true;
        noisetexture.wrapS = THREE.MirroredRepeatWrapping;
        noisetexture.wrapT = THREE.MirroredRepeatWrapping;
        noisetexture.repeat.set(2, 2);
        const material = new THREE.RawShaderMaterial({
            uniforms: {
                map: { value: noisetexture },
                time: { value: 0.0 },
                colors: { type: "v3v", value: colors },
                gravity: { type: "v3", value: gravity }
            },
            vertexShader: this.getVshader(),
            fragmentShader: this.getFshader(),
            depthTest: true,
            depthWrite: false,
            transparent: true,
            blending: isAlphaAdd ? THREE.AdditiveBlending : THREE.NormalBlending
        });

        this.geo.addAttribute("translate", new THREE.InstancedBufferAttribute(this.translateArray, 3, 1));
        // this.geo.addAttribute("col", new THREE.InstancedBufferAttribute(this.colArray, 3, 1));
        this.geo.addAttribute("movevect", new THREE.InstancedBufferAttribute(this.vectArray, 4, 1));
        this.geo.addAttribute("scale", new THREE.InstancedBufferAttribute(this.scaleArray, 1, 1));
        this.geo.addAttribute("time", new THREE.InstancedBufferAttribute(this.timeArray, 1, 1));
        this.geo.addAttribute("uve", new THREE.InstancedBufferAttribute(this.uvEArray, 2, 1));

        const mesh = new THREE.Mesh(this.geo, material);
        mesh.scale.set(1, 1, 1);
        this.add(mesh);

        this.updateMatrixWorld = this.updater;

        return this;
    }

    /** this is Main logic for your Particle ADD.
     * 
     * @param {Number} _cnt - number of adding Particle Count. 追加するパーティクル数
     * @param {Object} [_option = {} ] - optional object
     *          
     *  @param {THREE.Vector3}  _option.basePos - 
     */
    appearsParticle(_cnt, _option = {}) {

        const {
            basePos = new THREE.Vector3(0, 0, 0),
            scale = Math.random() * 0.5 + 0.5, // 大きさのブレを少なくする
            vect = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
            speed = 1.0,
            explose = 0.2,
            viscosity = 0.8
        } = _option;

        let pops = 0;
        for (let i = 0; i < this.particleCount; i++) {
            if (this.timeArray[i] == 0.0) {
                this.timeArray[i] = 1.0;

                this.translateArray[i * 3 + 0] = basePos.x;
                this.translateArray[i * 3 + 1] = basePos.y;
                this.translateArray[i * 3 + 2] = basePos.z;

                //初期サイズと移動方向を決める
                this.scaleArray[i] = scale;
                if (explose > 0.0) {
                    const addV = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
                    vect.lerp(addV, explose);
                }
                this.vectArray[i * 4 + 0] = vect.x * speed;
                this.vectArray[i * 4 + 1] = vect.y * speed;
                this.vectArray[i * 4 + 2] = vect.z * speed;
                this.vectArray[i * 4 + 3] = viscosity;
                /*
                this.colArray[i * 3 + 0] = col[0];
                this.colArray[i * 3 + 1] = col[1];
                this.colArray[i * 3 + 2] = col[2];
                */
                pops++;
                if (_cnt <= pops) { break; }
            }
        }
    }


    /** 
     * this logic is Update Particles. but call from Three.js Scene. you don't need call this.
     */
    updater() {
        // 1粒毎のアップデート
        const delta = this.clock.getDelta();
        let onCount = 0;
        for (let i = 0; i < this.particleCount; i++) {
            if (this.timeArray[i] > 0.0) {
                onCount++;
                this.timeArray[i] += delta;
                if (this.timeArray[i] > 2.0) {
                    //1秒経過していたら、消滅させる。
                    this.timeArray[i] = 0.0;
                    this.scaleArray[i] = 0.0;
                }
            }
        }

        this.geo.attributes.translate.needsUpdate = true;
        // this.geo.attributes.col.needsUpdate = true;
        this.geo.attributes.movevect.needsUpdate = true;
        this.geo.attributes.scale.needsUpdate = true;
        this.geo.attributes.time.needsUpdate = true;
        super.updateMatrixWorld.call(this);

    }


    getVshader() {
        return `

        precision highp float;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec3 gravity;

        attribute vec3 position;
        attribute vec2 uv;
        attribute vec3 translate;
        attribute vec4 movevect;
        // attribute vec3 col;
        attribute float scale;
        attribute float time;
        attribute vec2  uve;

        varying vec2 vUv;
        varying vec2 vUv2;
        varying float vScale;
        // varying vec3 vCol;
        varying float vTime;

        void main() {
            float timeF = floor((time - 1.0) * 0.166);
            vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
            mvPosition.xyz += position * (scale + time * 0.3) + (movevect.xyz * time * 2.0 * pow(movevect.w,timeF)) + (gravity.xyz * timeF);
            
            gl_Position = projectionMatrix * mvPosition;

            vUv = uv * 0.5 + uve;
            vUv2 = uv;
            // vCol = col;
            vScale = scale;
            vTime = time - 1.0;
        }

        `;
    }

    getFshader() {
        return `
        precision highp float;
        uniform sampler2D map;
        uniform vec3 colors[3]; 

        varying vec2 vUv;
        varying vec2 vUv2;
        varying float vScale;
        // varying vec3 vCol;
        varying float vTime;

        void main() {
            vec4 texColor = texture2D( map, vUv );

            float uvDist = length(vec2(vUv2.x - 0.5, vUv2.y - 0.5)) * 2.1;

            float timeAlpha = 1.0 - vTime;
            vec4 diffuseColor = vec4(texColor.xyz * mix(mix(colors[0],colors[1], vTime), colors[2], uvDist).xyz,  (1.0 - uvDist) * timeAlpha * texColor.x);

            gl_FragColor = diffuseColor;
            
        }
        
        `;
    }

}

class colCanvas {
    constructor() {

    }

    canvasExport(width = 2) {
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = width;
        const ctx = cvs.getContext('2d');
        const cci = ctx.createImageData(width, width);
        for (let i = 0; i < width * width; i++) {
            cci.data[i * 4] = cci.data[i * 4 + 1] = cci.data[i * 4 + 2] = 255;
            cci.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(cci, 0, 0);
        return cvs;
    }

}

// ------------------------------------------------------------------------------------------------
// noiseX.js
// version 0.0.1
// Copyright (c) doxas
// ------------------------------------------------------------------------------------------------

class noiseX {
    constructor(oct, ofs, per) {
        this.octave = oct;
        this.offset = ofs;
        this.persistence = per;
        this.seed = 1;
    }

    detail(oct, ofs, per) {
        if (!oct || !ofs || !per) { return false; }
        if (oct > 1) { this.octave = oct; }
        if (ofs > 0) { this.offset = ofs; }
        if (per > 0 && per <= 1) { this.persistence = per; }
        return true;
    }

    setSeed(seed) {
        this.seed = seed;
    }

    interpolate(a, b, t) {
        return a * t + b * (1.0 - t);
    }

    rnd(x, y) {
        const a = 123456789;
        const b = a ^ (a << 11);
        const c = this.seed + x + this.seed * y;
        const d = c ^ (c >> 19) ^ (b ^ (b >> 8));
        let e = d % 0x1000000 / 0x1000000;
        e *= 10000000.0;
        return e - Math.floor(e);
    }

    srnd(x, y) {
        const corners = (this.rnd(x - 1, y - 1)
            + this.rnd(x + 1, y - 1)
            + this.rnd(x - 1, y + 1)
            + this.rnd(x + 1, y + 1)) * 0.03125;
        const sides = (this.rnd(x - 1, y)
            + this.rnd(x + 1, y)
            + this.rnd(x, y - 1)
            + this.rnd(x, y + 1)) * 0.0625;
        const center = this.rnd(x, y) * 0.625;
        return corners + sides + center;
    }

    irnd(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;
        const a = this.srnd(ix, iy);
        const b = this.srnd(ix + 1, iy);
        const c = this.srnd(ix, iy + 1);
        const d = this.srnd(ix + 1, iy + 1);
        const e = this.interpolate(b, a, fx);
        const f = this.interpolate(d, c, fx);
        return this.interpolate(f, e, fy);
    }

    noise(x, y) {
        let t = 0;
        const o = this.octave + this.offset;
        const w = Math.pow(2, o);
        for (let i = this.offset; i < o; i++) {
            const f = Math.pow(2, i);
            const p = Math.pow(this.persistence, i - this.offset + 1);
            const b = w / f;
            t += this.irnd(x / b, y / b) * p;
        }
        return t;
    }

    snoise(x, y, w) {
        const u = x / w;
        const v = y / w;
        return this.noise(x, y) * u * v
            + this.noise(x, y + w) * u * (1.0 - v)
            + this.noise(x + w, y) * (1.0 - u) * v
            + this.noise(x + w, y + w) * (1.0 - u) * (1.0 - v);
    }

    canvasExport(data, width) {
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = width;
        const ctx = cvs.getContext('2d');
        const cci = ctx.createImageData(width, width);
        for (let i = 0; i < width * width; i++) {
            cci.data[i * 4] = cci.data[i * 4 + 1] = cci.data[i * 4 + 2] = data[i] * 255;
            cci.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(cci, 0, 0);
        return cvs;
    }
}