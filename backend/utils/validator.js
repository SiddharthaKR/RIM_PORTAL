
module.exports.isArrayValid = (array)=>{
    if (Array.isArray(array) && array.length) {
        return true;
    }else{
        return false;
    }
}

