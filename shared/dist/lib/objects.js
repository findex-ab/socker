function isObject(item) {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
}
export function merge(target, source) {
    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];
        // If both are arrays, merge them index-wise
        if (Array.isArray(srcVal)) {
            if (Array.isArray(tgtVal)) {
                target[key] = srcVal;
                // merge existing entries
                // for (let i = 0; i < srcVal.length; i++) {
                //   const srcItem = srcVal[i];
                //   if (i < tgtVal.length) {
                //     const tgtItem = tgtVal[i];
                //     if (isObject(srcItem) && isObject(tgtItem)) {
                //       // recursive merge for objects in arrays
                //       merge(tgtItem, srcItem);
                //     } else {
                //       // replace primitive or non-object
                //       tgtVal[i] = srcItem;
                //     }
                //   } else {
                //     // extra items: just push
                //     tgtVal.push(srcVal[i]);
                //   }
                // }
            }
            else {
                // target is not an array: overwrite with a shallow copy
                target[key] = srcVal.slice();
            }
            // If both are plain objects, recurse
        }
        else if (isObject(srcVal)) {
            if (isObject(tgtVal)) {
                merge(tgtVal, srcVal);
            }
            else {
                // overwrite non-object target with a new merged object
                target[key] = merge({}, srcVal);
            }
            // Primitives & everything else: overwrite
        }
        else {
            target[key] = srcVal;
        }
    }
    return target;
}
