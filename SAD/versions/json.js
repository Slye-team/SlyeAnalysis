/**
 *    _____ __
 *   / ___// /_  _____
 *   \__ \/ / / / / _ \
 *  ___/ / / /_/ /  __/
 * /____/_/\__, /\___/
 *       /____/
 *       Copyright 2017 Slye Development Team. All Rights Reserved.
 *       Licence: MIT License
 */

function encode(report, writableStream){
    writableStream.write(JSON.stringify(report))
}

function decode(resolve, reject){
    return function (readableStream){
        let bufs    = []
        readableStream.on('data', function(d){ bufs.push(d) })
        readableStream.on('end', function(){
            let b = Buffer.concat(bufs).toString()
            try{
                let d = JSON.parse(b)
                resolve(d)
            }catch(e){
                reject()
            }
        })
    }
}

module.exports = {
    encode,
    decode
}
