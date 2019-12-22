import * as GLUtils from "./GLUtils.js";
import * as MatUtils from "./MatUtils.js";
import * as FetchUtils from "./FetchUtils.js";

(function() {

    let canvas;

    function onLoad(event) {
        console.log("onLoad");
        canvas = document.getElementById("main_canvas");
        canvas.addEventListener("mousedown", onMouse);
        canvas.addEventListener("mouseup", onMouse);
        canvas.addEventListener("mousemove", onMouse);
        initializeGL();
    }

    function onUnload(event) {
        console.log("onUnload");
        terminateGL();
        canvas.removeEventListener("mousedown", onMouse);
        canvas.removeEventListener("mouseup", onMouse);
        canvas.removeEventListener("mousemove", onMouse);
        canvas = null;
    }

    function onMouse(event) {
        switch (event.type) {
            case "mousedown":
                onCursorDownGL(event.offsetX / canvas.width, event.offsetY / canvas.height);
                break;
            case "mouseup":
                onCursorUpGL(event.offsetX / canvas.width, event.offsetY / canvas.height);
                break;
            case "mousemove":
                onCursorMoveGL(event.offsetX / canvas.width, event.offsetY / canvas.height);
                break;
        }
    }

    function onTouch(event) {
        console.log("onTouch");
    }

    addEventListener("load", onLoad);
    addEventListener("unload", onUnload);

    let gl;
    let animationHandle;
    let program;
    let attributes = {
        "position": 0,
        "texCoord": 1,
    };
    let uniforms = {
        "projectionMatrix": null,
        "viewMatrix": null,
        "modelMatrix": null,
        "color": null,
    };
    let vertexBuffer = null;
    let indexBuffer = null;
    let texture = null;
    let rectCorners = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0]
    ];
    let pointSize = 0.05;

    function initializeGL() {
        (async () => {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            program = GLUtils.createShaderProgram(
                gl,
                await FetchUtils.getText("deform-vs.txt"), await FetchUtils.getText("deform-fs.txt"),
                attributes, uniforms);
            vertexBuffer = GLUtils.createArrayBuffer(gl, new Float32Array([
                0, 0, 0, 0, 0,
                0.5, 0, 0, 1, 0,
                0, 0.5, 0, 0, 1,
                0.5, 0.5, 0, 1, 1,
            ]));
            indexBuffer = GLUtils.createElementArrayBuffer(gl, new Uint16Array([
                0, 1, 2, 1, 3, 2,
            ]));
            texture = GLUtils.createTextureFromImage(gl, await FetchUtils.getImage("image.png"));
            gl.clearColor(0.5, 0.5, 0.5, 1);
            onUpdateGL(0);
        })();
    }

    function terminateGL() {
        cancelAnimationFrame(animationHandle);
        gl = null;
    }

    function isInitializeGL() {
        return gl != null;
    }

    function isLostGL() {
        return gl.getError() == gl.CONTEXT_LOST_WEBGL;
    }

    function restoreGLContext() {
        gl.getExtension('WEBGL_lose_context').restoreContext();
    }

    function onCursorDownGL (x, y) {
    }

    function onCursorUpGL(x, y) {
    }

    function onCursorMoveGL(x, y) {
    }

    function onUpdateGL(time) {
        if (isLostGL()) {
            restoreGLContext();
        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

        let projectionMatrix = new Float32Array(16);
        MatUtils.setIdentity(projectionMatrix);
        MatUtils.mulScaling(projectionMatrix, 2.0, -2.0, 1.0);
        MatUtils.mulTranslation(projectionMatrix, -0.5, -0.5, 0.0);
        let viewMatrix = new Float32Array(16);
        MatUtils.setIdentity(viewMatrix);
        let modelMatrix = new Float32Array(16);
        MatUtils.setIdentity(modelMatrix);

        gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix);
        gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);
        gl.uniform4f(uniforms.color, 1, 0, 0, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.enableVertexAttribArray(attributes.position);
        gl.enableVertexAttribArray(attributes.texCoord);
        gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 4 * (3 + 2), 0);
        gl.vertexAttribPointer(attributes.texCoord, 2, gl.FLOAT, false, 4 * (3 + 2), 4 * 3);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.disableVertexAttribArray(attributes.position);
        gl.disableVertexAttribArray(attributes.texCoord);

        gl.finish();
        animationHandle = requestAnimationFrame(onUpdateGL);
    }

})();