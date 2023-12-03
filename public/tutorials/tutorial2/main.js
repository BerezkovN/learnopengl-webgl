import * as THREE from "./../../thirdparty/threejs-math.module.js";
const vsSource = `
  attribute vec3 aPos;
  attribute vec3 aColor;
  varying lowp vec3 ourColor;
  void main() {
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
    ourColor = aColor;
  }
`;

const fsSource = `
  varying lowp vec3 ourColor;
  void main() {
    gl_FragColor = vec4(ourColor, 1.0);
  }
`;

let time = 0;
let vaoExtension;
let shaderProgram;
let VAO;

function initVAOExtension(gl) {
    
    if (vaoExtension !== undefined) {
        return vaoExtension;
    }

    vaoExtension = gl.getExtension("OES_vertex_array_object"); // Vendor prefixes may apply!  
    if(vaoExtension === null)
    {
        alert(
            "OES_vertex_array_object ext is not supported"
          );
    }
    else
    {
        console.log("Successfully loaded OES_vertex_array_object extension")
    }

    return vaoExtension;
}

/** 
 * @param {*} inGL WebGL context
 */
export function init(inGL)
{
    const gl = inGL;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(vertexShader)}`
        );
        gl.deleteShader(vertexShader);
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(fragmentShader)}`
        );
        gl.deleteShader(fragmentShader);
    }

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
        );
    }

    const vertices = [
        // positions         // colors
         0.5, -0.5, 0.0,  1.0, 0.0, 0.0,  // bottom right
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0,  // bottom left
         0.0,  0.5, 0.0,  0.0, 0.0, 1.0   // top 
    ];

    // Get the Vertex Array Object extension and create/bind a VAO  
    vaoExtension = initVAOExtension(inGL);
    VAO = vaoExtension.createVertexArrayOES();

    // Start setting up VAO  
    vaoExtension.bindVertexArrayOES(VAO);  

    const VBO = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // position attribute
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(0);
    // color attribute
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
    gl.enableVertexAttribArray(1);

    // note that this is allowed, the call to gl.vertexAttribPointer registered VBO as the vertex attribute's bound vertex buffer object so afterwards we can safely unbind
    //gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // You can unbind the VAO afterwards so other VAO calls won't accidentally modify this VAO, but this rarely happens. Modifying other
    // VAOs requires a call to glBindVertexArray anyways so we generally don't unbind VAOs (nor VBOs) when it's not directly necessary.
    // Finised setting up VAO  
    //ext.bindVertexArrayOES(null);  

}

/** 
 * @param {*} inGL WebGL context
 * @param {*} deltaTime delta time in ms
 */
export function main(inGL, deltaTime) {
    const gl = inGL;

    // Set clear color to black, fully opaque
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    vaoExtension.bindVertexArrayOES(VAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    vaoExtension.bindVertexArrayOES(null);  
}
