"use strict";

// import THREE from 'three'

/**
 * @author Jey-en  https://github.com/adrs2002
 * 
 * this repo -> https://github.com/adrs2002/Three.JenParticle
 *
 */

/**
 * @constructor
 * @extends THREE.Object3D
 */
class jenParticle extends THREE.Object3D {
    // コンストラクタ
    constructor(_option = {}) {
        super();

        const {
            isAlphaAdd = true,
            isTextured = true,
            colors = [new THREE.Color(1.0, 1.0, 0.5), new THREE.Color(0.8, 0.4, 0.0), new THREE.Color(0.2, 0.0, 0.0)],
            gravity = new THREE.Vector3(0.0, 0.01, 0.0),
            blurPower = 1.0
        } = _option;

        this.particleCount = 8191;	//これがパーティクルの作成最大数。多すぎると死ぬ
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

        //↓こいつらはシェーダーにはいかない
        this.SpeedArray = new Float32Array(this.particleCount * 1);
        this.viscosityArray = new Float32Array(this.particleCount * 1);
        this.lifeTimeArray = new Float32Array(this.particleCount * 1);
        //カウンタでぶん回してガンガン初期化
        for (let i = 0; i < this.particleCount; i++) {
            //いわば、パーティクルの初期位置に該当。どうせ書き換わるから気にするな
            this.translateArray[i * 3 + 0] = 0.0;
            this.translateArray[i * 3 + 1] = 0.0;
            this.translateArray[i * 3 + 2] = 0.0;

            //パーティクルの大きさをセットする入れ物。どうせ
            this.scaleArray[i] = 0.0;

            //【色】を管理する入れ物
            this.colArray[i * 3 + 0] = 0.0;
            this.colArray[i * 3 + 1] = 0.0;
            this.colArray[i * 3 + 2] = 0.0;

            //出現してからの時間管理の入れ物
            this.timeArray[i] = 0.0;
            //移動後の値を計算するための値を保持する。
            this.SpeedArray[i] = 1.0;
            this.viscosityArray[i] = 1.0;

            this.lifeTimeArray[i] = 1.0;

            //UVを乱すための配列
            this.uvEArray[i * 2 + 0] = Math.random() * 0.5;
            this.uvEArray[i * 2 + 1] = Math.random() * 0.5;
        }

        //generate Noize
        const noiseSize = 512;
        this.noiseTexture = new THREE.DataTexture(this.createNoizeTexture(4, 10, 0.65, noiseSize), noiseSize, noiseSize, THREE.RGBAFormat);
        this.noiseTexture.wrapS = THREE.MirroredRepeatWrapping;
        this.noiseTexture.wrapT = THREE.MirroredRepeatWrapping;
        this.noiseTexture.repeat.set(2, 2);
        this.noiseTexture.needsUpdate = true;

        this.dummyTexture = new THREE.DataTexture(this.createWhiteTexture(2), 2, 2, THREE.RGBAFormat);
        this.dummyTexture.wrapS = THREE.MirroredRepeatWrapping;
        this.dummyTexture.wrapT = THREE.MirroredRepeatWrapping;
        this.dummyTexture.repeat.set(1, 1);
        this.dummyTexture.needsUpdate = true;

        this.material = new THREE.RawShaderMaterial({
            uniforms: {
                map: { value: isTextured ? this.noiseTexture : this.dummyTexture },
                time: { value: 0.0 },
                colors: { type: "v3v", value: colors },
                gravity: { type: "v3", value: gravity },
                blurPower: { value: blurPower }
            },
            vertexShader: this.getVshader(),
            fragmentShader: this.getFshader(),
            depthTest: true,
            depthWrite: false,
            transparent: true,
            // side: THREE.DoubleSide,
            depthFunc: THREE.NeverDepth,
            blending: isAlphaAdd ? THREE.AdditiveBlending : THREE.NormalBlending
        });

        this.geo.addAttribute("translate", new THREE.InstancedBufferAttribute(this.translateArray, 3, 1));
        this.geo.addAttribute("col", new THREE.InstancedBufferAttribute(this.colArray, 3, 1));
        this.geo.addAttribute("movevect", new THREE.InstancedBufferAttribute(this.vectArray, 4, 1));
        this.geo.addAttribute("scale", new THREE.InstancedBufferAttribute(this.scaleArray, 1, 1));
        this.geo.addAttribute("speed", new THREE.InstancedBufferAttribute(this.SpeedArray, 1, 1));
        this.geo.addAttribute("time", new THREE.InstancedBufferAttribute(this.timeArray, 1, 1));
        this.geo.addAttribute("uve", new THREE.InstancedBufferAttribute(this.uvEArray, 2, 1));

        const mesh = new THREE.Mesh(this.geo, this.material);
        mesh.frustumCulled = false;
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
            scale = 1.0,
            scaleRandom = 0.2,
            vect = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
            col = new THREE.Vector3(1.0, 1.0, 1.0),
            speed = 0.5,
            explose = 0.5,
            viscosity = 0.9,
            lifeTimeFactor = (Math.random() - 0.5) * 0.5 + 1.0
        } = _option;

        let pops = 0;
        for (let i = 0; i < this.particleCount; i++) {
            if (this.timeArray[i] == 0.0) {
                this.timeArray[i] = 1.0;

                this.translateArray[i * 3 + 0] = basePos.x;
                this.translateArray[i * 3 + 1] = basePos.y;
                this.translateArray[i * 3 + 2] = basePos.z;

                //初期サイズと移動方向を決める
                this.scaleArray[i] = scale + (Math.random() - 0.5) * scaleRandom;
                if (explose > 0.0) {
                    const addV = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
                    vect.lerp(addV, explose);
                }
                this.vectArray[i * 4 + 0] = vect.x;
                this.vectArray[i * 4 + 1] = vect.y;
                this.vectArray[i * 4 + 2] = vect.z;
                this.vectArray[i * 4 + 3] = 0;
                this.SpeedArray[i] = speed;
                this.viscosityArray[i] = viscosity;
                this.lifeTimeArray[i] = lifeTimeFactor;

                this.colArray[i * 3 + 0] = col.x;
                this.colArray[i * 3 + 1] = col.y;
                this.colArray[i * 3 + 2] = col.z;

                pops++;
                if (_cnt <= pops) { break; }
            }
        }
    }


    /** 
     * this logic is Update Particles. call from Three.js Scene, auto. you don't need call this.
     */
    updater() {
        // 1粒毎のアップデート
        const delta = this.clock.getDelta();
        let onCount = 0;
        for (let i = 0; i < this.particleCount; i++) {
            if (this.timeArray[i] > 0.0) {
                onCount++;
                this.timeArray[i] += delta * this.lifeTimeArray[i];
                this.SpeedArray[i] *= this.viscosityArray[i];
                this.vectArray[i * 4 + 3] += this.SpeedArray[i];
                if (this.timeArray[i] > 2.0) {
                    //1秒経過していたら、消滅させる。
                    this.timeArray[i] = 0.0;
                    this.scaleArray[i] = 0.0;
                }
            }
        }

        this.geo.attributes.translate.needsUpdate = true;
        this.geo.attributes.col.needsUpdate = true;
        this.geo.attributes.movevect.needsUpdate = true;
        this.geo.attributes.scale.needsUpdate = true;
        this.geo.attributes.time.needsUpdate = true;
        super.updateMatrixWorld.call(this);

    }

    //////////////////////////

    createWhiteTexture(width = 2) {
        const data = new Uint8Array(4 * width * width);
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < width; j++) {
                for (let m = 0; m < 4; m++) {
                    data[i * width * 4 + j * 4 + m] = 255;
                }
                data[i * width * 4 + j * 4 + 3] = 255;
            }
        }
        return data;
    }

    createNoizeTexture(oct, ofs, per, width) {
        const param = {
            octave: oct,
            offset: ofs,
            persistence: per,
            seed: 1
        };

        function setSeed(seed) {
            param.seed = seed;
        }

        function interpolate(a, b, t) {
            return a * t + b * (1.0 - t);
        }

        function rnd(x, y) {
            const a = 123456789;
            const b = a ^ (a << 11);
            const c = param.seed + x + param.seed * y;
            const d = c ^ (c >> 19) ^ (b ^ (b >> 8));
            let e = d % 0x1000000 / 0x1000000;
            e *= 10000000.0;
            return e - Math.floor(e);
        }

        function srnd(x, y) {
            const corners = (rnd(x - 1, y - 1)
                + rnd(x + 1, y - 1)
                + rnd(x - 1, y + 1)
                + rnd(x + 1, y + 1)) * 0.03125;
            const sides = (rnd(x - 1, y)
                + rnd(x + 1, y)
                + rnd(x, y - 1)
                + rnd(x, y + 1)) * 0.0625;
            const center = rnd(x, y) * 0.625;
            return corners + sides + center;
        }


        function irnd(x, y) {
            const ix = Math.floor(x);
            const iy = Math.floor(y);
            const fx = x - ix;
            const fy = y - iy;
            const a = srnd(ix, iy);
            const b = srnd(ix + 1, iy);
            const c = srnd(ix, iy + 1);
            const d = srnd(ix + 1, iy + 1);
            const e = interpolate(b, a, fx);
            const f = interpolate(d, c, fx);
            return interpolate(f, e, fy);
        }

        function noise(x, y) {
            let t = 0;
            const o = param.octave + param.offset;
            const w = Math.pow(2, o);
            for (let i = param.offset; i < o; i++) {
                const f = Math.pow(2, i);
                const p = Math.pow(param.persistence, i - param.offset + 1);
                const b = w / f;
                t += irnd(x / b, y / b) * p;
            }
            return t;
        }

        function snoise(x, y, w) {
            const u = x / w;
            const v = y / w;
            return noise(x, y) * u * v
                + noise(x, y + w) * u * (1.0 - v)
                + noise(x + w, y) * (1.0 - u) * v
                + noise(x + w, y + w) * (1.0 - u) * (1.0 - v);
        }

        // create noize texture
        setSeed(new Date().getTime());
        const noiseColor = new Array(width * width);
        const data = new Uint8Array(4 * width * width);
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < width; j++) {
                noiseColor[i * width + j] = snoise(i, j, width);
                noiseColor[i * width + j] *= noiseColor[i * width + j];
                noiseColor[i * width + j] *= 255;
                for (let m = 0; m < 3; m++) {
                    data[i * width * 4 + j * 4 + m] = noiseColor[i * width + j];
                }
                data[i * width * 4 + j * 4 + 3] = 255;
            }
        }
        return data;
    }

    //////////////////////

    getVshader() {
        return `

        precision highp float;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec3 gravity;
        uniform float blurPower;

        attribute vec3 position;
        attribute vec2 uv;
        attribute vec3 translate;
        attribute vec4 movevect;
        attribute vec3 col;
        attribute float scale;
        attribute float speed;
        attribute float time;
        attribute vec2  uve;

        varying vec2 vUv;
        varying vec2 vUv2;
        varying float vScale;
        varying vec3 vCol;
        varying float vTime;

        void main() {
            float timeF = floor((time - 1.0) * 60.0);

            vec3 movePow =  vec3(movevect.xyz * movevect.w);
            vec4 mvPosition = modelViewMatrix * vec4( translate + movePow + (gravity.xyz * timeF), 1.0 );

            vec3 vertexPos = position * (scale * time );           
            vec4 mvVector = vec4(mvPosition.xyz + vertexPos, 1.0);

            vec4 noVectPos =  modelViewMatrix * vec4( translate + (gravity.xyz * timeF), 1.0 );

            vec4 pass1Pos = projectionMatrix * mvPosition;  // P
            vec4 pass2Pos =  projectionMatrix * mvVector;   // B
            vec4 pass0Pos = projectionMatrix * noVectPos;   // A

            vec3 BA = pass2Pos.xyz - pass0Pos.xyz;
            vec3 PA = pass1Pos.xyz - pass0Pos.xyz;
            vec3 Badd = pass2Pos.xyz - pass1Pos.xyz;
            float f = max(0.0, length(BA) - length(PA));
            f = mix(1.0,f,blurPower);

            gl_Position = vec4(mix(pass0Pos.x,pass2Pos.x + Badd.x, f), mix(pass0Pos.y,pass2Pos.y+ Badd.y, f), mix(pass0Pos.z,pass2Pos.z+ Badd.z, f), mix(pass0Pos.w,pass2Pos.w, f));

            vUv = uv * 0.5 + uve;
            vUv2 = uv;
            vCol = col;
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
        varying vec3 vCol;
        varying float vTime;

        void main() {
            vec4 texColor = texture2D( map, vUv );
            float f = (texColor.x - 0.4) * 1.0 / (1.0 - 0.4 * 2.0);
            texColor = vec4(f,f,f,f);
            
            float uvDist = length(vec2(vUv2.x - 0.5, vUv2.y - 0.5)) * 2.5;

            vec4 diffuseColor = vec4(texColor.xyz * mix( mix(colors[0],colors[2], vTime) , mix(colors[1],colors[2], vTime), uvDist).xyz, max((1.0 - uvDist), 0.0) * ( 1.0 - vTime) * texColor.x);
			diffuseColor.rgb *= vCol.rgb;
            gl_FragColor = diffuseColor;
            
        }
        
        `;
    }

}

