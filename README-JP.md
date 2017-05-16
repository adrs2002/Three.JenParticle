# Three.jenParticle

====

# Overview これは何？
Three.jsで超！楽にパーティクルを表示するためのアドオンクラスです。  
最小で4行をソースに追加するだけで、GPUを利用したパーティクルを表示することができます。  
また、多様なパラメータにより、出現するパーティクルの見た目を自由に変更することができます。

## Demo

* [demo](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleTest.html)
* [demo2](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleTest2.html)

* [demo3　編集GUI](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleEdit.html)

## Requirement　必要なもの
* [THREE.js](https://github.com/mrdoob/three.js/)

--------

## how to use　使い方的な。

### 0. 'three.js(three.min.js)'　と　'threeJenParticle.js' の２つのjsファイルを読み込む文を追加する。  
  ( ･･･この説明は必要ないよね？）

### 1. 後でパーティクルオブジェクトになるものを、前もって定義する。  
　これは、後々アクセスできるようにするため。

	var jenP = null;


### 2. Initialize Particle　パーティクルを初期化し、シーンに追加します

	// after scene =new THREE.Scene...
	
	jenP = new jenParticle();
	scene.add(jenP);


### 3. adding Particle to Scene　シーンに対して、パーティクルを出現させます。

	jenP.appearsParticle(1);


## toEdit.. 編集のために

編集を容易にするため、プレビュー＆コード生成用のデモがあります

* [demo3　編集GUI](http://www001.upp.so-net.ne.jp/adrs2002/JenParticle/particleEdit.html)

気に入った形になったら、画面下の「Generate」を押し、下のテキストボックスから生成されたテキストをコピーし、
適切な場所に張り付けてください。  
以下、各種オプションの説明です。  

---------------------------------


## LICENCE
 MIT.