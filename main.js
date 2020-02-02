import * as GLUtils from "./GLUtils.js";
import * as MatUtils from "./MatUtils.js";
import * as FetchUtils from "./FetchUtils.js";

(function () {

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

    const POINT_SIZE = 0.04;

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
        "texture": null,
    };
    let rectVertexBuffer = null;
    let rectIndexBuffer = null;
    let lineIndexBuffer = null;
    let gridVertexBuffer = null;
    let whiteTexture = null;
    let texture = null;

    let rectCorners= [
        [0.2, 0.1],
        [1.2, -0.1],
        [-0.1, 0.8],
        [0.8, 1.2]
    ];
    let selectedCorner = -1;
    let selectedOffset = [0, 0];
    let selectedRect = false;

    let lastCoord = [0, 0];

    function initializeGL() {
        (async () => {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            program = GLUtils.createShaderProgram(
                gl,
                await FetchUtils.getText("deform-vs.txt"), await FetchUtils.getText("deform-fs.txt"),
                attributes, uniforms);
            rectVertexBuffer = GLUtils.createArrayBuffer(gl, new Float32Array([
                0, 0, 0, 0, 0,
                1, 0, 0, 1, 0,
                0, 1, 0, 0, 1,
                1, 1, 0, 1, 1,
            ]));
            rectIndexBuffer = GLUtils.createElementArrayBuffer(gl, new Uint16Array([
                0, 1, 2, 1, 3, 2,
            ]));
            lineIndexBuffer = GLUtils.createElementArrayBuffer(gl, new Uint16Array([
                0, 1, 1, 2, 2, 0, 1, 3, 3, 2
            ]));
            gridVertexBuffer  = GLUtils.createArrayBuffer(gl, new Float32Array([
                1000, 0, 0,
                -1000, 0, 0,
                0, 1000, 0,
                0, -1000, 0,
            ]));
            whiteTexture = GLUtils.createTextureFromImage(gl, await FetchUtils.getImage("white.png"));
            texture = GLUtils.createTextureFromImage(gl, await FetchUtils.getImage("image.png"));
            gl.viewport(0, 0, canvas.width, canvas.height);
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

    function onCursorDownGL(x, y) {
        x = x * 2 / 1.25 - 0.3;
        y = y * 2 / 1.25 - 0.3;

        for (let i = 0; i < 4; ++i) {
            let corner = rectCorners[i];
            let cx = corner[0];
            let cy = corner[1];
            if (cx - POINT_SIZE <= x && x <= cx + POINT_SIZE &&
                cy - POINT_SIZE <= y && y <= cy + POINT_SIZE) {
                selectedCorner = i;
                selectedOffset[0] = x - cx;
                selectedOffset[1] = y - cy;
                break;
            }
        }

        if (selectedCorner == -1) {
            selectedRect = true;
        }

        lastCoord[0] = x;
        lastCoord[1] = y;
    }

    function onCursorUpGL(x, y) {
        selectedCorner = -1;
        selectedRect = false;
    }

    function onCursorMoveGL(x, y) {
        x = x * 2 / 1.25 - 0.3;
        y = y * 2 / 1.25 - 0.3;

        console.log(x, y);

        if (selectedCorner != -1) {
            let corner = rectCorners[selectedCorner];
            corner[0] = x - selectedOffset[0];
            corner[1] = y - selectedOffset[1];
        }

        if (selectedRect) {
            for (let i = 0; i < 4; ++i) {
                let corner = rectCorners[i];
                corner[0] += x - lastCoord[0];
                corner[1] += y - lastCoord[1];
            }
        }

        lastCoord[0] = x;
        lastCoord[1] = y;
    }

    function onUpdateGL(time) {
        if (isLostGL()) {
            restoreGLContext();
        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

        let projectionMatrix = new Float32Array(16);
        MatUtils.setIdentity(projectionMatrix);
        MatUtils.mulScaling(projectionMatrix, 1.25, -1.25, 1.0);
        MatUtils.mulTranslation(projectionMatrix, -0.5, -0.5, 0.0);
        gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix);

        let viewMatrix = new Float32Array(16);
        MatUtils.setIdentity(viewMatrix);
        gl.uniformMatrix4fv(uniforms.viewMatrix, false, viewMatrix);

        let modelMatrix = new Float32Array(16);

        // グリッド線を描画
        gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexBuffer);
        gl.enableVertexAttribArray(attributes.position);
        gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 4 * 3, 0);

        gl.uniform4f(uniforms.color, 0.6, 0.6, 0.6, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
        gl.uniform1i(uniforms.texture, 0);

        for (let i = 0; i < 25; ++i) {
            MatUtils.setIdentity(modelMatrix);
            MatUtils.mulTranslation(modelMatrix, 0.1 * i - 1, 0.1 * i - 1, 0);
            gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);
            gl.drawArrays(gl.LINES, 0, 4);
        }

        MatUtils.setIdentity(modelMatrix);
        MatUtils.mulTranslation(modelMatrix, 1, 1, 0);
        gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);
        gl.uniform4f(uniforms.color, 0.9, 0.9, 0.9, 1);
        gl.drawArrays(gl.LINES, 0, 4);

        MatUtils.setIdentity(modelMatrix);
        gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);

        gl.uniform4f(uniforms.color, 1, 0.2, 0.2, 1);
        gl.drawArrays(gl.LINES, 0, 2);
        gl.uniform4f(uniforms.color, 0.2, 1, 0.2, 1);
        gl.drawArrays(gl.LINES, 2, 2);

        // 変形画像を描画
        gl.bindBuffer(gl.ARRAY_BUFFER, rectVertexBuffer);
        gl.enableVertexAttribArray(attributes.position);
        gl.enableVertexAttribArray(attributes.texCoord);
        gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 4 * (3 + 2), 0);
        gl.vertexAttribPointer(attributes.texCoord, 2, gl.FLOAT, false, 4 * (3 + 2), 4 * 3);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rectIndexBuffer);

        MatUtils.setIdentity(modelMatrix);
        MatUtils.setDeform(modelMatrix,
            rectCorners[0][0], rectCorners[0][1],
            rectCorners[1][0], rectCorners[1][1],
            rectCorners[2][0], rectCorners[2][1],
            rectCorners[3][0], rectCorners[3][1]);
        gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);

        gl.uniform4f(uniforms.color, 1, 1, 1, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uniforms.texture, 0);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        // ポリゴン描画
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
        gl.uniform4f(uniforms.color, 1, 0, 0, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
        gl.drawElements(gl.LINES, 10, gl.UNSIGNED_SHORT, 0);

        // 変形ガイドを描画
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rectIndexBuffer);
        gl.uniform4f(uniforms.color, 1, 1, 1, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
        gl.uniform1i(uniforms.texture, 0);

        for (let i = 0; i < 4; ++i) {
            let modelMatrix = new Float32Array(16);
            MatUtils.setIdentity(modelMatrix);
            MatUtils.mulTranslation(modelMatrix, rectCorners[i][0], rectCorners[i][1], 0);
            MatUtils.mulScaling(modelMatrix, POINT_SIZE, POINT_SIZE, 1);
            MatUtils.mulTranslation(modelMatrix, -0.5, -0.5, 0);
            gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);
            gl.uniform4f(uniforms.color, 0, 0, 0, 1);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

            MatUtils.setIdentity(modelMatrix);
            MatUtils.mulTranslation(modelMatrix, rectCorners[i][0], rectCorners[i][1], 0);
            MatUtils.mulScaling(modelMatrix, POINT_SIZE * 0.85, POINT_SIZE * 0.85, 1);
            MatUtils.mulTranslation(modelMatrix, -0.5, -0.5, 0);
            gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);
            gl.uniform4f(uniforms.color, 1, 1, 1, 1);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

            MatUtils.setIdentity(modelMatrix);
            MatUtils.mulTranslation(modelMatrix, rectCorners[i][0], rectCorners[i][1], 0);
            MatUtils.mulScaling(modelMatrix, POINT_SIZE * 0.5, POINT_SIZE * 0.5, 1);
            MatUtils.mulTranslation(modelMatrix, -0.5, -0.5, 0);
            gl.uniformMatrix4fv(uniforms.modelMatrix, false, modelMatrix);
            if (i == selectedCorner) {
                gl.uniform4f(uniforms.color, 1, 0, 0, 1);
            } else {
                gl.uniform4f(uniforms.color, 0, 0, 0, 1);
            }
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }

        gl.disableVertexAttribArray(attributes.position);
        gl.disableVertexAttribArray(attributes.texCoord);

        gl.finish();
        animationHandle = requestAnimationFrame(onUpdateGL);
    }

})();