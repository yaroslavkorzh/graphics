    chance = new Chance();

    pixelColor = function(imgData, x, y) {
        var r, g, b, a,
            offset = x * 4 + y * 4 * imgData.width;

        r = imgData.data[offset];
        g = imgData.data[offset + 1];
        b = imgData.data[offset + 2];
        a = imgData.data[offset + 3];
        var col = new THREE.Color(0xffffff);
        col.setRGB(r / 256, g / 256, b / 256);
        return col;
    };

function getRandom(minVal, maxVal) {
    return minVal + (Math.random() * (maxVal - minVal));
}

function Coordinates(imageData) {

    var _width = imageData.width, // image width
        _height = imageData.height, // image height
        _reducer = 1.1, // this controls how many extra pixels to account for scattered around in space, less is tigher, more is looser a value of 1 would try and fill every pixel
        _scale = CONFIG.IMAGE_SCALE, // imported from config
        _particles = CONFIG.PARTICLES, // imported from config
        _spread = 20, // spread amount for z axis?
        _pixels = this.calulateWhitePixels(imageData, _width, _height, _scale, _spread), // the array of positions of white pixels
        _total = _pixels.length, // total white pixels
        _scatterRatio = Math.round(( _total / (_particles / _reducer))), // this is caluated based on the amount of white pixels and particles, it advances the index by a factor of x to account for random and tight particles
        _px = this.randomize(_pixels, _total, _scatterRatio, _scale, _spread, _width, _height, _particles);

    //console.log(_px);

    this.getCoordinate = function() {

        var pixel = _px.splice(chance.integer({min:0, max:_px.length}), 1)[0];  // a bit crude, but what we do here is splice away a pixel from the _pixels array and random and then dump it back into the fill array

        return pixel ? pixel : this.randomPixel();
    }
}

Coordinates.prototype.randomPixel = function() {
    var x = getRandom(-CONFIG.MAX_DISTANCE, CONFIG.MAX_DISTANCE),
        y = getRandom(-CONFIG.MAX_DISTANCE, CONFIG.MAX_DISTANCE),
        z = getRandom(-CONFIG.MAX_DISTANCE, CONFIG.MAX_DISTANCE);

    return {x:x,y:y,z:z,r: true};
};

Coordinates.prototype.randomize = function(pixels, total, ratio, _scale, _spread, _width, _height, _particles) {

    var count = 0,
        px = [],
        fill = Math.round((total / ratio)),
        pixel;

    while(count < (_particles)) {
        pixel = (count < fill) ? pixels.splice(chance.integer({min:0, max:(pixels.length-1)}), 1)[0] : this.randomPixel();
        px.push(pixel);
        count++;
    }

    return px;
};

Coordinates.prototype.pixelX = function(w, width, scale) {
    return (w - (width / 2)) * scale;
};

Coordinates.prototype.pixelY = function(h, height, scale) {
    return (h - (height / 2)) * scale;
};

Coordinates.prototype.pixelZ = function(spread) {
    return Math.random() * spread * 2 - spread
};

Coordinates.prototype.calulateWhitePixels = function(imageData, width, height, scale, spread) {

    var pixels = [],
        w = 0,
        h = 0;

    for(var i=0; i<(width * height); i++) {
        if(pixelColor(imageData, w, h).r > 0) {
            pixels.push({
                x: this.pixelX(w, width, scale ),
                y: this.pixelY(h, height, scale),
                z: this.pixelZ(spread)
            });
        }

        if(w === width) { h++; w=0;} else { w++; };
    };

    return pixels;
};


