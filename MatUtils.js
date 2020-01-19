export const
    M00 = 0, M01 = 4, M02 = 8, M03 = 12,
    M10 = 1, M11 = 5, M12 = 9, M13 = 13,
    M20 = 2, M21 = 6, M22 = 10, M23 = 14,
    M30 = 3, M31 = 7, M32 = 11, M33 = 15;

export function setMatrix(
    dst,
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33) {
    dst[M00] = m00;
    dst[M01] = m01;
    dst[M02] = m02;
    dst[M03] = m03;
    dst[M10] = m10;
    dst[M11] = m11;
    dst[M12] = m12;
    dst[M13] = m13;
    dst[M20] = m20;
    dst[M21] = m21;
    dst[M22] = m22;
    dst[M23] = m23;
    dst[M30] = m30;
    dst[M31] = m31;
    dst[M32] = m32;
    dst[M33] = m33;
}

export function mulMatrix(
    dst,
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33) {
    let a00 = dst[M00], a01 = dst[M01], a02 = dst[M02], a03 = dst[M03],
        a10 = dst[M10], a11 = dst[M11], a12 = dst[M12], a13 = dst[M13],
        a20 = dst[M20], a21 = dst[M21], a22 = dst[M22], a23 = dst[M23],
        a30 = dst[M30], a31 = dst[M31], a32 = dst[M32], a33 = dst[M33];
    setMatrix(
        dst,
        a00 * m00 + a01 * m10 + a02 * m20 + a03 * m30,
        a00 * m01 + a01 * m11 + a02 * m21 + a03 * m31,
        a00 * m02 + a01 * m12 + a02 * m22 + a03 * m32,
        a00 * m03 + a01 * m13 + a02 * m23 + a03 * m33,
        a10 * m00 + a11 * m10 + a12 * m20 + a13 * m30,
        a10 * m01 + a11 * m11 + a12 * m21 + a13 * m31,
        a10 * m02 + a11 * m12 + a12 * m22 + a13 * m32,
        a10 * m03 + a11 * m13 + a12 * m23 + a13 * m33,
        a20 * m00 + a21 * m10 + a22 * m20 + a23 * m30,
        a20 * m01 + a21 * m11 + a22 * m21 + a23 * m31,
        a20 * m02 + a21 * m12 + a22 * m22 + a23 * m32,
        a20 * m03 + a21 * m13 + a22 * m23 + a23 * m33,
        a30 * m00 + a31 * m10 + a32 * m20 + a33 * m30,
        a30 * m01 + a31 * m11 + a32 * m21 + a33 * m31,
        a30 * m02 + a31 * m12 + a32 * m22 + a33 * m32,
        a30 * m03 + a31 * m13 + a32 * m23 + a33 * m33);
}

export function setIdentity(dst) {
    setMatrix(
        dst,
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
}

export function setScaling(dst, x, y, z) {
    setMatrix(
        dst,
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1);
}

export function mulScaling(dst, x, y, z) {
    dst[M00] *= x;
    dst[M01] *= y;
    dst[M02] *= z;
    dst[M10] *= x;
    dst[M11] *= y;
    dst[M12] *= z;
    dst[M20] *= x;
    dst[M21] *= y;
    dst[M22] *= z;
    dst[M30] *= x;
    dst[M31] *= y;
    dst[M32] *= z;
}

export function setRotation(dst, x, y, z, rad) {
    let cs = Math.cos(rad);
    let sn = Math.sin(rad);
    let len = x * x + y * y + z * z;
    if (0 < len) {
        len = Math.sqrt(len);
        x /= len;
        y /= len;
        z /= len;
    }

    // 共通項を算出
    let cs1 = 1.0 - cs;
    let xcs1 = x * cs1, ycs1 = y * cs1;
    let xycs1 = y * xcs1, xzcs1 = z * xcs1, yzcs1 = z * ycs1;
    let xsn = x * sn, ysn = y * sn, zsn = z * sn;

    // 行列を設定
    setMatrix(
        dst,
        cs + x * xcs1, xycs1 - zsn, xzcs1 + ysn, 0,
        xycs1 + zsn, cs + y * ycs1, yzcs1 - xsn, 0,
        xzcs1 - ysn, yzcs1 + xsn, cs + z * z * cs1, 0,
        0, 0, 0, 1);
}

export function mulRotation(dst, x, y, z, rad) {
    let cs = Math.cos(rad);
    let sn = Math.sin(rad);
    let len = x * x + y * y + z * z;
    if (0 < len) {
        len = Math.sqrt(len);
        x /= len;
        y /= len;
        z /= len;
    }

    // 共通項を算出
    let cs1 = 1.0 - cs;
    let xcs1 = x * cs1, ycs1 = y * cs1;
    let xycs1 = y * xcs1, xzcs1 = z * xcs1, yzcs1 = z * ycs1;
    let xsn = x * sn, ysn = y * sn, zsn = z * sn;

    // 掛けあわせて、結果の書き出し
    let a00 = dst[M00], a01 = dst[M01], a02 = dst[M02];
    let a10 = dst[M10], a11 = dst[M11], a12 = dst[M12];
    let a20 = dst[M20], a21 = dst[M21], a22 = dst[M22];
    let a30 = dst[M30], a31 = dst[M31], a32 = dst[M32];
    let b00 = cs + x * xcs1, b01 = xycs1 - zsn, b02 = xzcs1 + ysn;
    let b10 = xycs1 + zsn, b11 = cs + y * ycs1, b12 = yzcs1 - xsn;
    let b20 = xzcs1 - ysn, b21 = yzcs1 + xsn, b22 = cs + z * z * cs1;

    dst[M00] = a00 * b00 + a01 * b10 + a02 * b20;
    dst[M01] = a00 * b01 + a01 * b11 + a02 * b21;
    dst[M02] = a00 * b02 + a01 * b12 + a02 * b22;
    dst[M10] = a10 * b00 + a11 * b10 + a12 * b20;
    dst[M11] = a10 * b01 + a11 * b11 + a12 * b21;
    dst[M12] = a10 * b02 + a11 * b12 + a12 * b22;
    dst[M20] = a20 * b00 + a21 * b10 + a22 * b20;
    dst[M21] = a20 * b01 + a21 * b11 + a22 * b21;
    dst[M22] = a20 * b02 + a21 * b12 + a22 * b22;
    dst[M30] = a30 * b00 + a31 * b10 + a32 * b20;
    dst[M31] = a30 * b01 + a31 * b11 + a32 * b21;
    dst[M32] = a30 * b02 + a31 * b12 + a32 * b22;
}

export function setTranslation(dst, x, y, z) {
    setMatrix(
        dst,
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1);
}

export function mulTranslation(dst, x, y, z) {
    dst[M03] += dst[M00] * x + dst[M01] * y + dst[M02] * z;
    dst[M13] += dst[M10] * x + dst[M11] * y + dst[M12] * z;
    dst[M23] += dst[M20] * x + dst[M21] * y + dst[M22] * z;
    dst[M33] += dst[M30] * x + dst[M31] * y + dst[M32] * z;
}

export function setLookAt(
    dst,
    eyeX, eyeY, eyeZ,
    centerX, centerY, centerZ,
    upperX, upperY, upperZ) {
    setIdentity(dst);
    mulLookAt(
        dst,
        eyeX, eyeY, eyeZ,
        centerX, centerY, centerZ,
        upperX, upperY, upperZ);
}

export function mulLookAt(
    dst,
    eyeX, eyeY, eyeZ,
    centerX, centerY, centerZ,
    upperX, upperY, upperZ) {
    // Z軸のベクトルを算出
    // (center - eye) / |center - eye|
    let zx = centerX - eyeX;
    let zy = centerY - eyeY;
    let zz = centerZ - eyeZ;
    let zLen = zx * zx + zy * zy + zz * zz;
    if (0 < zLen) {
        zLen = Math.sqrt(zLen);
        zx /= zLen;
        zy /= zLen;
        zz /= zLen;
    }

    // X軸のベクトルを算出
    // (z_axis × upper) / |z_axis × upper|
    let xx = zy * upperZ - zz * upperY;
    let xy = zz * upperX - zx * upperZ;
    let xz = zx * upperY - zy * upperX;
    let xLen = xx * xx + xy * xy + xz * xz;
    if (0 < xLen) {
        xLen = Math.sqrt(xLen);
        xx /= xLen;
        xy /= xLen;
        xz /= xLen;
    }

    // Y軸のベクトルを算出
    // z_axis × x_axis
    let yx = zy * xz - zz * xy;
    let yy = zz * xx - zx * xz;
    let yz = zx * xy - zy * xx;

    // 平行移動に回転を掛ける
    // | x.x, x.y, x.z |   | eye_x |
    // | y.x, y.y, y.z | * | eye_y | * - 1
    // | z.x, z.y, z.z |   | eye_z |
    let tx = -(xx * eyeX + xy * eyeY + xz * eyeZ);
    let ty = -(yx * eyeX + yy * eyeY + yz * eyeZ);
    let tz = -(zx * eyeX + zy * eyeY + zz * eyeZ);

    // 掛けあわせて、結果の書き出し
    let a00 = dst[M00], a01 = dst[M01], a02 = dst[M02];
    let a10 = dst[M10], a11 = dst[M11], a12 = dst[M12];
    let a20 = dst[M20], a21 = dst[M21], a22 = dst[M22];
    let a30 = dst[M30], a31 = dst[M31], a32 = dst[M32];

    dst[M00] = a00 * xx + a01 * yx + a02 * zx;
    dst[M01] = a00 * xy + a01 * yy + a02 * zy;
    dst[M02] = a00 * xz + a01 * yz + a02 * zz;
    dst[M03] += a00 * tx + a01 * ty + a02 * tz;
    dst[M10] = a10 * xx + a11 * yx + a12 * zx;
    dst[M11] = a10 * xy + a11 * yy + a12 * zy;
    dst[M12] = a10 * xz + a11 * yz + a12 * zz;
    dst[M13] += a10 * tx + a11 * ty + a12 * tz;
    dst[M20] = a20 * xx + a21 * yx + a22 * zx;
    dst[M21] = a20 * xy + a21 * yy + a22 * zy;
    dst[M22] = a20 * xz + a21 * yz + a22 * zz;
    dst[M23] += a20 * tx + a21 * ty + a22 * tz;
    dst[M30] = a30 * xx + a31 * yx + a32 * zx;
    dst[M31] = a30 * xy + a31 * yy + a32 * zy;
    dst[M32] = a30 * xz + a31 * yz + a32 * zz;
    dst[M33] += a30 * tx + a31 * ty + a32 * tz;
}

export function setProjection(dst, width, height, near, far) {
    setIdentity(dst);
    mulProjection(dst, width, height, near, far);
}

export function mulProjection(dst, width, height, near, far) {
    // 共通項を算出
    let rangeView = far - near;
    let scaledFar = far * 2.0;

    // 行列に掛けあわせて、結果の書き出し
    let a02 = dst[M02];
    let a12 = dst[M12];
    let a22 = dst[M22];
    let a32 = dst[M32];
    let b00 = near * 2.0 / width;
    let b11 = near * 2.0 / height;
    let b22 = scaledFar / rangeView - 1.0;
    let b23 = near * scaledFar / -rangeView;

    dst[M00] *= b00;
    dst[M01] *= b11;
    dst[M02] = a02 * b22 + dst[M03];
    dst[M03] = a02 * b23;
    dst[M10] *= b00;
    dst[M11] *= b11;
    dst[M12] = a12 * b22 + dst[M13];
    dst[M13] = a12 * b23;
    dst[M20] *= b00;
    dst[M21] *= b11;
    dst[M22] = a22 * b22 + dst[M23];
    dst[M23] = a22 * b23;
    dst[M30] *= b00;
    dst[M31] *= b11;
    dst[M32] = a32 * b22 + dst[M33];
    dst[M33] = a32 * b23;
}

export function setDeform(dst, sx, sy, xx, xy, yx, yy, ex, ey) {
    setIdentity(dst);

    mulMatrix(
        dst,
        1, 0, 0, sx,
        0, 1, 0, sy,
        0, 0, 0, 0,
        0, 0, 0, 1);

    mulMatrix(
        dst,
        xx - sx, yx - sx, 0, 0,
        xy - sy, yy - sy, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 1);

    let exx = xx - ex; // x - e
    let exy = xy - ey;
    let eyx = yx - ex; // y - e
    let eyy = yy - ey;
    let esx = sx - ex; // s - e
    let esy = sy - ey;

    let det = exx * eyy - exy * eyx; // (x - e) × (y - e) 終点、点X、点Yの三角形の面積
    let dx = (exx * esy - exy * esx) / det; // (x - e) × (s - e) / ((x - e) × (y - e)) 始点、終点、点Xの三角形と終点、点X、点Yの面積比
    let dy = (esx * eyy - esy * eyx) / det; // (s - e) × (y - e) / ((x - e) × (y - e)) 始点、終点、点Yの三角形と終点、点X、点Yの面積比

    mulMatrix(
        dst,
        dy, 0, 0, 0,
        0, dx, 0, 0,
        0, 0, 0, 0,
        dy - 1, dx - 1, 0, 1);
}
