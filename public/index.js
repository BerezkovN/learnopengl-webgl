import * as tutorial1 from "./tutorials/tutorial1/main.js"
import * as tutorial2 from "./tutorials/tutorial2/main.js"
import * as tutorial3 from "./tutorials/tutorial3/main.js"
import * as THREE from "./thirdparty/threejs-math.module.js";

console.log("Hello");

const canvas = document.querySelector("#glcanvas");
//Initialize the GL context
const gl = canvas.getContext("webgl");

//Only continue if WebGL is available and working
if (gl === null) {
  alert(
    "Unable to initialize WebGL. Your browser or machine may not support it."
  );
}
else
{
  console.log("Successfully initialized WebGL context ");
}

let then = 0;


function drawScene(now) {

  tutorial3.main(gl, now - then);
  window.requestAnimationFrame(drawScene);
  then = now;
}

tutorial3.init(gl);
drawScene(0);

// while (true) {

//     const m = new THREE.Matrix4();
//     const m1 = new THREE.Matrix4();
//     const m2 = new THREE.Matrix4();
//     const m3 = new THREE.Matrix4();
//     const alpha = 0;
//     const beta = Math.PI;
//     const gamma = Math.PI/2;
//     m1.makeRotationX( alpha );
//     m2.makeRotationY( beta );
//     m3.makeRotationZ( gamma );
//     m.multiplyMatrices( m1, m2 );
//     m.multiply( m3 );

//     // This function should have some rendering code.
    
//     //
// }