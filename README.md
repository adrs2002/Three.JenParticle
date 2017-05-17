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


### Definition option ( basicOption )

PropertyName | type | defaultValue |  description  
  --- | --- | --- |  ---  
| **isAlphaAdd** | `boolean` | *true* |  Specify whether addition transparent or alpha synthesis. |  
| **isTextured** | `boolean` | *true* | Specify whether to apply noise texture. |  
| **colors** | `Color[3]` | [  *THREE.Color(1.0, 1.0, 0.5)*,  *THREE.Color(0.8, 0.4, 0.0)*,   *THREE.Color(0.2, 0.0, 0.0)*  ] | Specify the color of the particle. [0] It will be the color of the center. [1] It will be the outermost color. [2] It will be the color after the change over time. For common patterns, it would be better to specify [0] the brightest color, [2] the darkest color, and [1] its intermediate color (or complementary color).  |  
| **gravity** | `Vector3` |  *THREE.Vector3(0.0, 0.17, 0.0)* | Specify the amount of movement required for particles. You should think that it is like gravity or wind. |  
| **blurPower** | `float` |  *0.07* | Specify the shape change amount of the particle by moving amount. If it is zero, it will not change shape due to the movement amount. I will move with the circle. When 1.0 is specified, the origin is displayed in a connected shape after movement. |  
------------- 

#### Appearance option ( appearsOption )

	appearsParticle(addFrameCount,  _option = {} );

 PropertyName | type | defaultValue |  description  
  --- | --- | --- |  ---  
| **addFrameCount** | `int` | ! MUST ! | Specify the amount of [particle] to appear at once. This parameter is mandatory and can not be omitted. |  
| |  |  | Below is the contents of option structure |  
| **basePos** | `Vector3` | *THREE.Vector3(0.0, 0.0, 0.0)* | Specify the appearance position of particles. |  
| **scale** | `float` | *1.0* | Specify the size of one basic particle. |  
| **scaleRandom** | `float` |  *0.2* | Specify the random addition value of the size for each particle. If it is zero, all the particle will be the same size. |  
| **vect** | `Vector3` |  *Random* | Specify the basic movement direction of the particle. If it is zero, "basically" will not move (see below) |  
| **col** | `Color` |  *White(1.0,1.0,1.0)* | If you want to change the color for each particle, use it for the specified color. | 
| **speed** | `float` |  *0.2* | It is the moving speed of particle. 0 will stagnate on the spot. |  
| **explose** | `float` |  *0.5* | Specify the strength to set the movement direction at random with respect to the movement direction (**vect**). If 0, particles move as specified by **vect** and if 1.0 is specified, particles will be moved ignoring the value of **vect**. |  
| **viscosity** | `float` |  *0.9* | For the speed, specify the value that takes over time. If this value is 1.0, the particles will move at the same speed all the time and if you specify a value less than 1.0 the grain will gradually slow down so that the brakes will apply. Conversely, if you specify a value larger than 1.0, the particles will gradually accelerate. |  
| **lifeTimeFactor** | `float` |  *Random*(0.5～1.5) | Specify the life of the particle. If it is normal (1.0), particles will disappear in 1 second. This value works as magnification for 1 second, and you can change the particle display time. If you decrease the value, particles will disappear in a shorter time.|  
------------- 

## LICENCE
 MIT.