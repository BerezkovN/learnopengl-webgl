import * as THREE from "./../../thirdparty/threejs-math.module.js";
const vsSource = `
  attribute vec3 aPos;
  attribute vec3 aColor;
  attribute vec2 aTexCoord;

  varying highp vec3 ourColor;
  varying highp vec2 TexCoord;
  void main() {
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
    ourColor = aColor;
    TexCoord = aTexCoord;
  }
`;

const fsSource = `
  varying highp vec3 ourColor;
  varying highp vec2 TexCoord;
  uniform sampler2D uSampler;
  void main() {
    gl_FragColor = texture2D(uSampler, TexCoord);
  }
`;

let time = 0;
let vaoExtension;
let image;
let VAO;
let shaderProgram;
let uSamplerLocation;
let texture;

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
        // positions       // colors        // texture coords
        0.5, 0.5, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, // top right
        0.5, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, // bottom right
        -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, // bottom left
        -0.5, 0.5, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0  // top left 
    ];
    const indices = [
        0, 1, 3, // first triangle
        1, 2, 3  // second triangle
    ];

    // Get the Vertex Array Object extension and create/bind a VAO  
    vaoExtension = initVAOExtension(inGL);
    VAO = vaoExtension.createVertexArrayOES();

    // Start setting up VAO  
    vaoExtension.bindVertexArrayOES(VAO);

    const VBO = gl.createBuffer();
    const EBO = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // position attribute
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(0);
    // color attribute
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(1);
    // texture coord attribute
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.enableVertexAttribArray(2);

    uSamplerLocation = gl.getUniformLocation(shaderProgram, "uSampler");
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGB;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGB;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );

    image = new Image();
    image.setAttribute('crossorigin', 'anonymous');
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            image
        );

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }
    image.src = "https://th.bing.com/th/id/R.0585d3fd1373c0048ba3a54c67138f93?rik=bLQrCK%2bHhnQsfg&pid=ImgRaw&r=0";

}

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
 * @param {*} deltaTime delta time in ms
 */
export function main(inGL, deltaTime) {
    const gl = inGL;

    // Set clear color to black, fully opaque
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shaderProgram);
    gl.bindTexture(gl.TEXTURE_2D, texture)
    vaoExtension.bindVertexArrayOES(VAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    vaoExtension.bindVertexArrayOES(null);  
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }
  
