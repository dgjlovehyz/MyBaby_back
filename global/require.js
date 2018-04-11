'use strict'

global.require = (path) => {
    
    let full_path = `${__dirname}/../${path}`;

    //console.log(full_path);

    return require(full_path);
}