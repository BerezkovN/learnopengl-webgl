import * as THREE from "./../../thirdparty/threejs-math.module.js";
const vsSource = `
  attribute vec3 aPos;
  void main() {
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
  }
`;

const fsSource = `
  void main() {
    gl_FragColor = vec4(1.0, 0.5, 0.2, 1.0);
  }
`;

let time = 0;
let vaoExtension;
let shaderProgram;
let VAO;
let VBO;

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
        Math.sin(time / 1000), 0.5, 0.0,  // top right
        0.5, -0.5, 0.0,  // bottom right
        -0.5, -0.5, 0.0,  // bottom left
        -0.5, 0.5, 0.0   // top left 
    ];
    const indices = [  // note that we start from 0!
        0, 1, 3,  // first Triangle
        1, 2, 3   // second Triangle
    ];

    // Get the Vertex Array Object extension and create/bind a VAO  
    vaoExtension = initVAOExtension(inGL);
    VAO = vaoExtension.createVertexArrayOES();

    // Start setting up VAO  
    vaoExtension.bindVertexArrayOES(VAO);  

    VBO = gl.createBuffer();
    const EBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(0);

    // note that this is allowed, the call to gl.vertexAttribPointer registered VBO as the vertex attribute's bound vertex buffer object so afterwards we can safely unbind
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // remember: do NOT unbind the EBO while a VAO is active as the bound element buffer object IS stored in the VAO; keep the EBO bound.
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // You can unbind the VAO afterwards so other VAO calls won't accidentally modify this VAO, but this rarely happens. Modifying other
    // VAOs requires a call to glBindVertexArray anyways so we generally don't unbind VAOs (nor VBOs) when it's not directly necessary.
    // Finised setting up VAO  
    vaoExtension.bindVertexArrayOES(null);  
}

/** 
 * @param {*} inGL WebGL context
 * @param {*} deltaTime delta time in ms
 */
export function main(inGL, deltaTime) {

    time += deltaTime;
    const gl = inGL;
    const vertices = [
        Math.sin(time / 1000), 0.5, 0.0,  // top right
        0.5, -0.5, 0.0,  // bottom right
        -0.5, -0.5, 0.0,  // bottom left
        -0.5, 0.5, 0.0   // top left 
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Set clear color to black, fully opaque
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    vaoExtension.bindVertexArrayOES(VAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    vaoExtension.bindVertexArrayOES(null);  
}
