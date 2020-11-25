/*
* Click'n'Load to Text (v1.0)
* Copyright PANCHO7532 - P7COMUnications LLC 2020
*
* This program comes with a LICENSE file that you must read before redistributing or modifying this code.
*/
const crypto = require('crypto');
const fs = require('fs');
const querystring = require('querystring');
const sv_string = "cnl2text/1.0"
function aesDecrypt(data, key) {
    var aes1 = crypto.createDecipheriv("aes-128-cbc", Buffer.from(key, "hex"), Buffer.from(key, "hex"));
    aes1.setAutoPadding(false);
    var result = aes1.update(data, "base64", "utf-8");
    result += aes1.final("utf-8");
    return result.replace(/\0/g, "");
}
function returnError(resObj, code) {
    switch(code) {
        case 400:
            resObj.writeHead(400, {'Content-Type':'text/plain', 'Server':sv_string});
            resObj.end("Bad Request");
            break;
        case 404:
            resObj.writeHead(404, {'Content-Type':'text/plain', 'Server':sv_string});
            resObj.end("Not Found");
            break;
        case 405:
            resObj.writeHead(405, {'Content-Type':'text/plain', 'Server':sv_string});
            resObj.end("Method Not Allowed");
            break;
        default:
            resObj.writeHead(500, {'Content-Type':'text/plain', 'Server':sv_string});
            resObj.end("Internal Server Error");
            break;
    }
    return;
}
const httpListener = function(req, res) {
    console.log(req.connection.remoteAddress + " - [" + new Date().toUTCString() + "] \"" + req.method + " " + req.url + " HTTP/" + req.httpVersion + "\"");
    switch(req.url) {
        case "/":
            res.writeHead(200, {'Content-Type':'text/plain', 'Server':sv_string});
            res.end("JDownloader");
            break;
        case "/jdcheck.js":
            res.writeHead(200, {'Content-Type':'application/javascript', 'Server':sv_string});
            res.end("jdownloader=true; var version='17461'");
            break;
        case "/crossdomain.xml":
            if(fs.existsSync(__dirname + "/crossdomain.xml")) {
                res.writeHead(200, {'Content-Type':'text/xml', 'Server':sv_string});
                res.end(fs.readFileSync(__dirname + "/crossdomain.xml").toString());
                break;
            } else {
                returnError(res, 404);
                break;
            }
        case "/flash/add":
            var dataObj = "";
            if(req.method == "POST") {
                req.on('data', function(data) {
                    dataObj += data.toString();
                    dataObj = querystring.decode(dataObj);
                    try {
                        dataObj["urls"];
                    } catch(error) {
                        returnError(res, 400);
                        return;
                    }
                    res.writeHead(200, {'Content-Type':'text/plain', 'Server':sv_string});
                    res.end("Decoded data: " + dataObj["urls"]);
                    return;
                });
            } else {
                returnError(res, 405);
                break;
            }
            break;
        case "/flash/addcrypted2":
            var dataObj = "";
            if(req.method == "POST") {
                req.on('data', function(data) {
                    dataObj += data.toString();
                    dataObj = querystring.decode(dataObj);
                    try {
                        dataObj["passwords"];
                        dataObj["jk"];
                        dataObj["crypted"];
                    } catch(error) {
                        returnError(res, 400);
                        return;
                    }
                    try {
                        var key = eval(dataObj["jk"] + " f();");
                        var finalResult = aesDecrypt(dataObj["crypted"], key);
                        res.writeHead(200, {'Content-Type':'text/plain', 'Server':sv_string});
                        res.end("Source: " + dataObj["source"] + "\r\nPasswords: " + dataObj["passwords"] + "\r\nDecoded data: " + finalResult + "\r\n");
                    } catch(error) {
                        console.log(error);
                        returnError(res, 500);
                    }
                });
            } else {
                returnError(res, 405);
                break;
            }
            break;
        default:
            returnError(res, 404);
            break;
    }
    return;
}
const httpServer = require('http').createServer(httpListener);
httpServer.listen(9666, "localhost", function() {
    console.log("[INFO] - Server started!");
});