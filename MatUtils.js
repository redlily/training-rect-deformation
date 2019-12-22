export const
    M00 = 0, M01 = 4, M02 = 8, M03 = 12,
    M10 = 1, M11 = 5, M12 = 9, M13 = 13,
    M20 = 2, M21 = 6, M22 = 10, M23 = 14,
    M30 = 3, M31 = 7, M32 = 11, M33 = 15;

export function setMatrix(
    mat,
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33) {
    mat[M00] = m00;
    mat[M01] = m01;
    mat[M02] = m02;
    mat[M03] = m03;
    mat[M10] = m10;
    mat[M11] = m11;
    mat[M12] = m12;
    mat[M13] = m13;
    mat[M20] = m20;
    mat[M21] = m21;
    mat[M22] = m22;
    mat[M23] = m23;
    mat[M30] = m30;
    mat[M31] = m31;
    mat[M32] = m32;
    mat[M33] = m33;
}

export function setIdentity(mat) {
    setMatrix(
        mat,
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
}

export function setScaling(mat, x, y, z) {
    setMatrix(
        mat,
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1);
}

export function mulScaling(mat, x, y, z) {
    mat[M00] *= x;
    mat[M01] *= y;
    mat[M02] *= z;
    mat[M10] *= x;
    mat[M11] *= y;
    mat[M12] *= z;
    mat[M20] *= x;
    mat[M21] *= y;
    mat[M22] *= z;
    mat[M30] *= x;
    mat[M31] *= y;
    mat[M32] *= z;
}

export function setRotation(mat, x, y, z, rad) {
    setIdentity(mat);
    mulRotation(mat, x, y, z, rad);
}

export function mulRotation(mat, x, y, z, rad) {
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
    let a00 = mat[M00], a01 = mat[M01], a02 = mat[M02];
    let a10 = mat[M10], a11 = mat[M11], a12 = mat[M12];
    let a20 = mat[M20], a21 = mat[M21], a22 = mat[M22];
    let a30 = mat[M30], a31 = mat[M31], a32 = mat[M32];
    let b00 = cs + x * xcs1, b01 = xycs1 - zsn, b02 = xzcs1 + ysn;
    let b10 = xycs1 + zsn, b11 = cs + y * ycs1, b12 = yzcs1 - xsn;
    let b20 = xzcs1 - ysn, b21 = yzcs1 + xsn, b22 = cs + z * z * cs1;

    mat[M00] = a00 * b00 + a01 * b10 + a02 * b20;
    mat[M01] = a00 * b01 + a01 * b11 + a02 * b21;
    mat[M02] = a00 * b02 + a01 * b12 + a02 * b22;
    mat[M10] = a10 * b00 + a11 * b10 + a12 * b20;
    mat[M11] = a10 * b01 + a11 * b11 + a12 * b21;
    mat[M12] = a10 * b02 + a11 * b12 + a12 * b22;
    mat[M20] = a20 * b00 + a21 * b10 + a22 * b20;
    mat[M21] = a20 * b01 + a21 * b11 + a22 * b21;
    mat[M22] = a20 * b02 + a21 * b12 + a22 * b22;
    mat[M30] = a30 * b00 + a31 * b10 + a32 * b20;
    mat[M31] = a30 * b01 + a31 * b11 + a32 * b21;
    mat[M32] = a30 * b02 + a31 * b12 + a32 * b22;
}

export function setTranslation(mat, x, y, z) {
    setIdentity(mat);
    mulTranslation(mat, x, y, z);
}

export function mulTranslation(mat, x, y, z) {
    mat[M03] += mat[M00] * x + mat[M01] * y + mat[M02] * z;
    mat[M13] += mat[M10] * x + mat[M11] * y + mat[M12] * z;
    mat[M23] += mat[M20] * x + mat[M21] * y + mat[M22] * z;
    mat[M33] += mat[M30] * x + mat[M31] * y + mat[M32] * z;
}

export function setLookAt(
    mat,
    eyeX, eyeY, eyeZ,
    centerX, centerY, centerZ,
    upperX, upperY, upperZ) {
    setIdentity(mat);
    mulLookAt(
        mat,
        eyeX, eyeY, eyeZ,
        centerX, centerY, centerZ,
        upperX, upperY, upperZ);
}

export function mulLookAt(
    mat,
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
    let a00 = mat[M00], a01 = mat[M01], a02 = mat[M02];
    let a10 = mat[M10], a11 = mat[M11], a12 = mat[M12];
    let a20 = mat[M20], a21 = mat[M21], a22 = mat[M22];
    let a30 = mat[M30], a31 = mat[M31], a32 = mat[M32];

    mat[M00] = a00 * xx + a01 * yx + a02 * zx;
    mat[M01] = a00 * xy + a01 * yy + a02 * zy;
    mat[M02] = a00 * xz + a01 * yz + a02 * zz;
    mat[M03] += a00 * tx + a01 * ty + a02 * tz;
    mat[M10] = a10 * xx + a11 * yx + a12 * zx;
    mat[M11] = a10 * xy + a11 * yy + a12 * zy;
    mat[M12] = a10 * xz + a11 * yz + a12 * zz;
    mat[M13] += a10 * tx + a11 * ty + a12 * tz;
    mat[M20] = a20 * xx + a21 * yx + a22 * zx;
    mat[M21] = a20 * xy + a21 * yy + a22 * zy;
    mat[M22] = a20 * xz + a21 * yz + a22 * zz;
    mat[M23] += a20 * tx + a21 * ty + a22 * tz;
    mat[M30] = a30 * xx + a31 * yx + a32 * zx;
    mat[M31] = a30 * xy + a31 * yy + a32 * zy;
    mat[M32] = a30 * xz + a31 * yz + a32 * zz;
    mat[M33] += a30 * tx + a31 * ty + a32 * tz;
}

export function setProjection(mat, width, height, near, far) {
    setIdentity(mat);
    mulProjection(mat, width, height, near, far);
}

export function mulProjection(mat, width, height, near, far) {
    // 共通項を算出
    let rangeView = far - near;
    let scaledFar = far * 2.0;

    // 行列に掛けあわせて、結果の書き出し
    let a02 = mat[M02];
    let a12 = mat[M12];
    let a22 = mat[M22];
    let a32 = mat[M32];
    let b00 = near * 2.0 / width;
    let b11 = near * 2.0 / height;
    let b22 = scaledFar / rangeView - 1.0;
    let b23 = near * scaledFar / -rangeView;

    mat[M00] *= b00;
    mat[M01] *= b11;
    mat[M02] = a02 * b22 + mat[M03];
    mat[M03] = a02 * b23;
    mat[M10] *= b00;
    mat[M11] *= b11;
    mat[M12] = a12 * b22 + mat[M13];
    mat[M13] = a12 * b23;
    mat[M20] *= b00;
    mat[M21] *= b11;
    mat[M22] = a22 * b22 + mat[M23];
    mat[M23] = a22 * b23;
    mat[M30] *= b00;
    mat[M31] *= b11;
    mat[M32] = a32 * b22 + mat[M33];
    mat[M33] = a32 * b23;
}
