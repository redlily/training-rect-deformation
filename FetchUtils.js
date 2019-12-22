export async function getText(uri) {
    let result = await fetch(uri);
    if (result.ok) {
        return await result.text();
    }
    throw new Error();
}

export async function getJson(uri) {
    let result = await fetch(uri);
    if (result.ok) {
        return await result.json();
    }
    throw new Error();
}

export async function getBuffer(uri) {
    let result = await fetch(uri);
    if (result.ok) {
        return await result.arrayBuffer();
    }
    throw new Error();
}

export async function getBlob(uri) {
    let result = await fetch(uri);
    if (result.ok) {
        return await result.blob();
    }
    throw new Error();
}

export async function getImage(uri) {
    return getBlob(uri)
        .then((blob) => {
            return new Promise((resolve, reject) => {
                let image = new Image();
                image.src = URL.createObjectURL(blob);
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = function () {
                    reject();
                }
            });
        });
}
