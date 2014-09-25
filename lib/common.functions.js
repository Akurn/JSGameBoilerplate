//common functions
function distance(x1,y1,x2,y2) {
    var x = x1 - x2;
    var y = y1 - y2;
    return Math.sqrt((x * x) + (y * y));
}


function drawWrappedText(ctx, text, lineheight, width) {
    var width = width || 200;
    var lineheight = lineheight || 20;
    var words = text.split(' ');
    var wline = '';
    var startline = 0;
    for (var j = 0; j < words.length; j++) {
        var nline = wline + words[j] + ' ';
        if (ctx.measureText(nline).width > width) { //if the new line is out of bounds, draw the old 1.
            wline = wline.substr(0, wline.length-1); //remove space at the end before writing the line
            ctx.fillText(wline, 0, startline);
            
            wline = words[j] + ' ';
            startline += lineheight;
        } else { //else add it to write line
            wline += words[j] + ' ';
        }
            
        if (j === words.length-1) {
            wline = wline.substr(0, wline.length-1); //remove space at the end before writing the line
            ctx.fillText(wline, 0, startline);
        }
    }
}


//auto create image object
var totalAssets = {
    loading: 0,
    loaded: 0
};

function loadImage(src, definedOnload) {
    totalAssets.loading += 1;
    
    definedOnload = definedOnload || function(){};
    
    var onload = (function(origOnload){
        return function(){
            totalAssets.loaded += 1;
            
            if (debug) { console.log(totalAssets.loaded + ' / ' + totalAssets.loading); }
            
            origOnload(this);
        };
    })(definedOnload);

    var img = new Image();
    img.onload = onload;
    img.src = src;
    
    return img;
}

function loadAudio(ctx, sobj, src, definedOnload) {
    totalAssets.loading++;
    
    definedOnload = definedOnload || function(){};
    
    try {
        var soundReq = new XMLHttpRequest();
        soundReq.open('GET', src, true);
        soundReq.responseType = 'arraybuffer';
        
        var onload = (function(actx, obj, req, origOnload){
            return function(){
                totalAssets.loaded += 1;
                if (debug) { console.log(totalAssets.loaded + ' / ' + totalAssets.loading); }
                
                if (actx) { //load audio buffer
                    //console.log(request);
                    actx.decodeAudioData(req.response, (function(obj){
                        return function(buffer) {
                            //console.log(obj);
                            obj.buffer = buffer;
                        };
                    })(obj), function(er){
                        console.log('Error loading audio: ' + request);
                    });
                }
                
                origOnload(this);
            };
        })(ctx, sobj, soundReq, definedOnload);
        
        soundReq.onload = onload;
        soundReq.send();
            
    } catch(e) {
        totalAssets.loaded += 1;
        console.log('Error loading file. Maybe XHR is not supported? Skipping file...');
    }
        
}


/* SoundObject class - relies on loadAudio function above */
function SoundObject(o, c) {
    
    if (typeof o == "string") {
        var ctx = c || {};
        o = {context: ctx, source: o};
    } else if (typeof o != "object") {
        o = {};
    }
    
    this.ctx = o.context || c || {};
    this.buffer = o.buffer || {};
    this.pitch = o.pitch || 1;
    this.startTime = o.startTime || 0;
    this.volume = o.volume || 1;
    this.source = o.source || '';
    this.callback = o.callback || function(){};
    
    loadAudio(this.ctx, this, this.source, this.callback); //look at making this method internal/private
}

SoundObject.prototype.play = function (p) { //p = optional pitch
    try {
        var source = this.ctx.createBufferSource();
        var gainNode = this.ctx.createGain();
        source.buffer = this.buffer;
        source.playbackRate.value = p || this.pitch;
        gainNode.gain.value = this.volume; 
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(this.startTime);
    } catch(e) {
        console.log('Error playing sound');
    }
};


//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};


/***** START JS2IOS plugin *****/
// from: http://ramkulkarni.com/blog/calling-objective-c-function-from-javascript-in-ios-applications/
// use: calliOSFunction("iosMethod", ["Ram"], "onSuccess", "onError");
function openCustomURLinIFrame(src) {
    var rootElm = document.documentElement;
    var newFrameElm = document.createElement("IFRAME");
    newFrameElm.setAttribute("src",src);
    rootElm.appendChild(newFrameElm);
    //remove the frame now
    newFrameElm.parentNode.removeChild(newFrameElm);
}

function calliOSFunction(functionName, args, successCallback, errorCallback) {
    var url = "js2ios://";

    var callInfo = {};
    callInfo.functionname = functionName;
    if (successCallback) {
        callInfo.success = successCallback;
    }
    if (errorCallback) {
        callInfo.error = errorCallback;
    }
    if (args) {
        callInfo.args = args;
    }

    url += JSON.stringify(callInfo)

    openCustomURLinIFrame(url);
}

function onCIFSuccess (r) {
    if (r) {
        var obj = JSON.parse(r);
        console.log(obj.result);
    }
}

function onCIFError (r) {
    if (r) {
        var obj = JSON.parse(r);
        console.log(obj.error);
    }
}
/***** END JS2IOS plugin *****/