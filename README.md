# Three.jenParticle

====

# Overview 
Very Easy Particle Sysytem for Three.js

## Demo

* [demo](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleTest.html)
* [demo2](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleTest2.html)

* [demo3　Edit GUI](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleEdit.html)

## Requirement
* [THREE.js](https://github.com/mrdoob/three.js/)

--------

## how to use　

### 0. read 2 .js file , 'three.js(three.min.js)', and 'threeJenParticle.js' your HTML file.

### 1. Declaration Objecty for Particle by NULL
  
	var jenP = null;


### 2. Initialize Particle　

	// after scene =new THREE.Scene...
	
	jenP = new jenParticle();
	scene.add(jenP);


### 3. adding Particle to Scene　

	jenP.appearsParticle(1);


## toEdit.. 

There is a demo for preview & code generation to make editing easier

* [demo3　Edit GUI](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleEdit.html)

When you like it, press "Generate" at the bottom of the screen, copy the text from the text box below,
Please stick it to the appropriate place.

WIP:write option details
---------------------------------


## LICENCE
 MIT.