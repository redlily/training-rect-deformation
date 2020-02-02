
export function checkError(gl) {
    let error = gl.getError();
    if (error != gl.NO_ERROR) {
        throw new Error(`${error}`);
    }
}

export function createBuffer(gl, type, data, usage = gl.STATIC_DRAW) {
    let buf = gl.createBuffer();
    gl.bindBuffer(type, buf);
    gl.bufferData(type, data, usage);
    gl.bindBuffer(type, null);
    return buf;
}

export function createArrayBuffer(gl, data, usage = gl.STATIC_DRAW) {
    return createBuffer(gl, gl.ARRAY_BUFFER, data, usage);
}

export function setArrayBuffer(gl, buf, off, data) {
    let tmp = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    if (tmp != buf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, off, data);
    if (tmp != buf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, tmp);
    }
}

export function createElementArrayBuffer(gl, data, usage = gl.STATIC_DRAW) {
    return createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, data, usage);
}

export function createTextureFromImage(gl, image) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

export function createShader(gl, type, code) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createProgram(gl, vs, fs, bindAttributes) {
    let pg = gl.createProgram();
    gl.attachShader(pg, vs);
    gl.attachShader(pg, fs);
    if (bindAttributes) {
        Object.keys(bindAttributes).forEach(key => {
            console.log(key, bindAttributes[key]);
            gl.bindAttribLocation(pg, bindAttributes[key], key);
        });
    }
    gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(pg));
        gl.deleteProgram(pg);
        return null;
    }
    return pg;
}

export function createShaderProgram(gl, vsCode, fsCode, bindAttributes = null, outUniforms = null) {
    let vs = createShader(gl, gl.VERTEX_SHADER, vsCode);
    if (vs == null) {
        return null;
    }
    let fs = createShader(gl, gl.FRAGMENT_SHADER, fsCode);
    if (fs == null) {
        gl.deleteShader(vs);
        return null;
    }
    let pg = createProgram(gl, vs, fs, bindAttributes);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (outUniforms) {
        Object.keys(outUniforms).forEach(key => {
            outUniforms[key] = gl.getUniformLocation(pg, key);
        });
    }
    return pg;
}
