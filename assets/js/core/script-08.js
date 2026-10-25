
/* QRCode for JavaScript - Copyright (c) 2009 Kazuhiko Arase - MIT license (http://www.opensource.org/licenses/mit-license.php). 'QR Code' is a registered trademark of DENSO WAVE INCORPORATED. */
const QRL=(()=>{const D={},C={};const rq=n=>{n=n.replace(/^\.\//,'');if(!C[n]){const m={exports:{}};C[n]=m;D[n](m,m.exports,rq)}return C[n].exports};
D['QRMode']=function(module,exports,require){module.exports = {
    MODE_NUMBER :       1 << 0,
    MODE_ALPHA_NUM :    1 << 1,
    MODE_8BIT_BYTE :    1 << 2,
    MODE_KANJI :        1 << 3
};
};
D['QRErrorCorrectLevel']=function(module,exports,require){module.exports = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};
};
D['QRMaskPattern']=function(module,exports,require){module.exports = {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};
};
D['QRMath']=function(module,exports,require){var QRMath = {
	glog : function(n) {
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		return QRMath.LOG_TABLE[n];
	},
	gexp : function(n) {
		while (n < 0) {
			n += 255;
		}
		while (n >= 256) {
			n -= 255;
		}
		return QRMath.EXP_TABLE[n];
	},
	EXP_TABLE : new Array(256),
	LOG_TABLE : new Array(256)
};
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}
module.exports = QRMath;
};
D['QRPolynomial']=function(module,exports,require){var QRMath = require('./QRMath');
function QRPolynomial(num, shift) {
	if (num.length === undefined) {
		throw new Error(num.length + "/" + shift);
	}
	var offset = 0;
	while (offset < num.length && num[offset] === 0) {
		offset++;
	}
	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}
QRPolynomial.prototype = {
	get : function(index) {
		return this.num[index];
	},
	getLength : function() {
		return this.num.length;
	},
	multiply : function(e) {
		var num = new Array(this.getLength() + e.getLength() - 1);
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i) ) + QRMath.glog(e.get(j) ) );
			}
		}
		return new QRPolynomial(num, 0);
	},
	mod : function(e) {
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
		var ratio = QRMath.glog(this.get(0) ) - QRMath.glog(e.get(0) );
		var num = new Array(this.getLength() );
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		for (var x = 0; x < e.getLength(); x++) {
			num[x] ^= QRMath.gexp(QRMath.glog(e.get(x) ) + ratio);
		}
		return new QRPolynomial(num, 0).mod(e);
	}
};
module.exports = QRPolynomial;
};
D['QRBitBuffer']=function(module,exports,require){function QRBitBuffer() {
	this.buffer = [];
	this.length = 0;
}
QRBitBuffer.prototype = {
	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	getLengthInBits : function() {
		return this.length;
	},
	putBit : function(bit) {
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
		this.length++;
	}
};
module.exports = QRBitBuffer;
};
D['QR8bitByte']=function(module,exports,require){var QRMode = require('./QRMode');
function QR8bitByte(data) {
	this.mode = QRMode.MODE_8BIT_BYTE;
	this.data = data;
}
QR8bitByte.prototype = {
	getLength : function() {
		return this.data.length;
	},
	write : function(buffer) {
		for (var i = 0; i < this.data.length; i++) {
			buffer.put(this.data.charCodeAt(i), 8);
		}
	}
};
module.exports = QR8bitByte;
};
D['QRRSBlock']=function(module,exports,require){var QRErrorCorrectLevel = require('./QRErrorCorrectLevel');
function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}
QRRSBlock.RS_BLOCK_TABLE = [
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9],
	[1, 134, 108],
	[2, 67, 43],
	[2, 33, 15, 2, 34, 16],
	[2, 33, 11, 2, 34, 12],
	[2, 86, 68],
	[4, 43, 27],
	[4, 43, 19],
	[4, 43, 15],
	[2, 98, 78],
	[4, 49, 31],
	[2, 32, 14, 4, 33, 15],
	[4, 39, 13, 1, 40, 14],
	[2, 121, 97],
	[2, 60, 38, 2, 61, 39],
	[4, 40, 18, 2, 41, 19],
	[4, 40, 14, 2, 41, 15],
	[2, 146, 116],
	[3, 58, 36, 2, 59, 37],
	[4, 36, 16, 4, 37, 17],
	[4, 36, 12, 4, 37, 13],
	[2, 86, 68, 2, 87, 69],
	[4, 69, 43, 1, 70, 44],
	[6, 43, 19, 2, 44, 20],
	[6, 43, 15, 2, 44, 16],
	[4, 101, 81],
	[1, 80, 50, 4, 81, 51],
	[4, 50, 22, 4, 51, 23],
	[3, 36, 12, 8, 37, 13],
	[2, 116, 92, 2, 117, 93],
	[6, 58, 36, 2, 59, 37],
	[4, 46, 20, 6, 47, 21],
	[7, 42, 14, 4, 43, 15],
	[4, 133, 107],
	[8, 59, 37, 1, 60, 38],
	[8, 44, 20, 4, 45, 21],
	[12, 33, 11, 4, 34, 12],
	[3, 145, 115, 1, 146, 116],
	[4, 64, 40, 5, 65, 41],
	[11, 36, 16, 5, 37, 17],
	[11, 36, 12, 5, 37, 13],
	[5, 109, 87, 1, 110, 88],
	[5, 65, 41, 5, 66, 42],
	[5, 54, 24, 7, 55, 25],
	[11, 36, 12],
	[5, 122, 98, 1, 123, 99],
	[7, 73, 45, 3, 74, 46],
	[15, 43, 19, 2, 44, 20],
	[3, 45, 15, 13, 46, 16],
	[1, 135, 107, 5, 136, 108],
	[10, 74, 46, 1, 75, 47],
	[1, 50, 22, 15, 51, 23],
	[2, 42, 14, 17, 43, 15],
	[5, 150, 120, 1, 151, 121],
	[9, 69, 43, 4, 70, 44],
	[17, 50, 22, 1, 51, 23],
	[2, 42, 14, 19, 43, 15],
	[3, 141, 113, 4, 142, 114],
	[3, 70, 44, 11, 71, 45],
	[17, 47, 21, 4, 48, 22],
	[9, 39, 13, 16, 40, 14],
	[3, 135, 107, 5, 136, 108],
	[3, 67, 41, 13, 68, 42],
	[15, 54, 24, 5, 55, 25],
	[15, 43, 15, 10, 44, 16],
	[4, 144, 116, 4, 145, 117],
	[17, 68, 42],
	[17, 50, 22, 6, 51, 23],
	[19, 46, 16, 6, 47, 17],
	[2, 139, 111, 7, 140, 112],
	[17, 74, 46],
	[7, 54, 24, 16, 55, 25],
	[34, 37, 13],
	[4, 151, 121, 5, 152, 122],
	[4, 75, 47, 14, 76, 48],
	[11, 54, 24, 14, 55, 25],
	[16, 45, 15, 14, 46, 16],
	[6, 147, 117, 4, 148, 118],
	[6, 73, 45, 14, 74, 46],
	[11, 54, 24, 16, 55, 25],
	[30, 46, 16, 2, 47, 17],
	[8, 132, 106, 4, 133, 107],
	[8, 75, 47, 13, 76, 48],
	[7, 54, 24, 22, 55, 25],
	[22, 45, 15, 13, 46, 16],
	[10, 142, 114, 2, 143, 115],
	[19, 74, 46, 4, 75, 47],
	[28, 50, 22, 6, 51, 23],
	[33, 46, 16, 4, 47, 17],
	[8, 152, 122, 4, 153, 123],
	[22, 73, 45, 3, 74, 46],
	[8, 53, 23, 26, 54, 24],
	[12, 45, 15, 28, 46, 16],
	[3, 147, 117, 10, 148, 118],
	[3, 73, 45, 23, 74, 46],
	[4, 54, 24, 31, 55, 25],
	[11, 45, 15, 31, 46, 16],
	[7, 146, 116, 7, 147, 117],
	[21, 73, 45, 7, 74, 46],
	[1, 53, 23, 37, 54, 24],
	[19, 45, 15, 26, 46, 16],
	[5, 145, 115, 10, 146, 116],
	[19, 75, 47, 10, 76, 48],
	[15, 54, 24, 25, 55, 25],
	[23, 45, 15, 25, 46, 16],
	[13, 145, 115, 3, 146, 116],
	[2, 74, 46, 29, 75, 47],
	[42, 54, 24, 1, 55, 25],
	[23, 45, 15, 28, 46, 16],
	[17, 145, 115],
	[10, 74, 46, 23, 75, 47],
	[10, 54, 24, 35, 55, 25],
	[19, 45, 15, 35, 46, 16],
	[17, 145, 115, 1, 146, 116],
	[14, 74, 46, 21, 75, 47],
	[29, 54, 24, 19, 55, 25],
	[11, 45, 15, 46, 46, 16],
	[13, 145, 115, 6, 146, 116],
	[14, 74, 46, 23, 75, 47],
	[44, 54, 24, 7, 55, 25],
	[59, 46, 16, 1, 47, 17],
	[12, 151, 121, 7, 152, 122],
	[12, 75, 47, 26, 76, 48],
	[39, 54, 24, 14, 55, 25],
	[22, 45, 15, 41, 46, 16],
	[6, 151, 121, 14, 152, 122],
	[6, 75, 47, 34, 76, 48],
	[46, 54, 24, 10, 55, 25],
	[2, 45, 15, 64, 46, 16],
	[17, 152, 122, 4, 153, 123],
	[29, 74, 46, 14, 75, 47],
	[49, 54, 24, 10, 55, 25],
	[24, 45, 15, 46, 46, 16],
	[4, 152, 122, 18, 153, 123],
	[13, 74, 46, 32, 75, 47],
	[48, 54, 24, 14, 55, 25],
	[42, 45, 15, 32, 46, 16],
	[20, 147, 117, 4, 148, 118],
	[40, 75, 47, 7, 76, 48],
	[43, 54, 24, 22, 55, 25],
	[10, 45, 15, 67, 46, 16],
	[19, 148, 118, 6, 149, 119],
	[18, 75, 47, 31, 76, 48],
	[34, 54, 24, 34, 55, 25],
	[20, 45, 15, 61, 46, 16]
];
QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	if (rsBlock === undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}
	var length = rsBlock.length / 3;
	var list = [];
	for (var i = 0; i < length; i++) {
		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];
		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	return list;
};
QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
	switch(errorCorrectLevel) {
	case QRErrorCorrectLevel.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case QRErrorCorrectLevel.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case QRErrorCorrectLevel.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case QRErrorCorrectLevel.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
};
module.exports = QRRSBlock;
};
D['QRUtil']=function(module,exports,require){var QRMode = require('./QRMode');
var QRPolynomial = require('./QRPolynomial');
var QRMath = require('./QRMath');
var QRMaskPattern = require('./QRMaskPattern');
var QRUtil = {
    PATTERN_POSITION_TABLE : [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],        
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ],
    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)    | (1 << 4) | (1 << 1),
    getBCHTypeInfo : function(data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) );    
        }
        return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },
    getBCHTypeNumber : function(data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) );    
        }
        return (data << 12) | d;
    },
    getBCHDigit : function(data) {
        var digit = 0;
        while (data !== 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    },
    getPatternPosition : function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    getMask : function(maskPattern, i, j) {
        switch (maskPattern) {
        case QRMaskPattern.PATTERN000 : return (i + j) % 2 === 0;
        case QRMaskPattern.PATTERN001 : return i % 2 === 0;
        case QRMaskPattern.PATTERN010 : return j % 3 === 0;
        case QRMaskPattern.PATTERN011 : return (i + j) % 3 === 0;
        case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 === 0;
        case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 === 0;
        case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 === 0;
        case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 === 0;
        default :
            throw new Error("bad maskPattern:" + maskPattern);
        }
    },
    getErrorCorrectPolynomial : function(errorCorrectLength) {
        var a = new QRPolynomial([1], 0);
        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0) );
        }
        return a;
    },
    getLengthInBits : function(mode, type) {
        if (1 <= type && type < 10) {
            switch(mode) {
            case QRMode.MODE_NUMBER     : return 10;
            case QRMode.MODE_ALPHA_NUM  : return 9;
            case QRMode.MODE_8BIT_BYTE  : return 8;
            case QRMode.MODE_KANJI      : return 8;
            default :
                throw new Error("mode:" + mode);
            }
        } else if (type < 27) {
            switch(mode) {
            case QRMode.MODE_NUMBER     : return 12;
            case QRMode.MODE_ALPHA_NUM  : return 11;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 10;
            default :
                throw new Error("mode:" + mode);
            }
        } else if (type < 41) {
            switch(mode) {
            case QRMode.MODE_NUMBER     : return 14;
            case QRMode.MODE_ALPHA_NUM  : return 13;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 12;
            default :
                throw new Error("mode:" + mode);
            }
        } else {
            throw new Error("type:" + type);
        }
    },
    getLostPoint : function(qrCode) {
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        var row = 0; 
        var col = 0;
        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount; col++) {
                var sameCount = 0;
                var dark = qrCode.isDark(row, col);
                for (var r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }
                    for (var c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }
                        if (r === 0 && c === 0) {
                            continue;
                        }
                        if (dark === qrCode.isDark(row + r, col + c) ) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }
        for (row = 0; row < moduleCount - 1; row++) {
            for (col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row,     col    ) ) count++;
                if (qrCode.isDark(row + 1, col    ) ) count++;
                if (qrCode.isDark(row,     col + 1) ) count++;
                if (qrCode.isDark(row + 1, col + 1) ) count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }
        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) && 
                        !qrCode.isDark(row, col + 1) && 
                         qrCode.isDark(row, col + 2) && 
                         qrCode.isDark(row, col + 3) && 
                         qrCode.isDark(row, col + 4) && 
                        !qrCode.isDark(row, col + 5) && 
                         qrCode.isDark(row, col + 6) ) {
                    lostPoint += 40;
                }
            }
        }
        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) &&
                        !qrCode.isDark(row + 1, col) &&
                         qrCode.isDark(row + 2, col) &&
                         qrCode.isDark(row + 3, col) &&
                         qrCode.isDark(row + 4, col) &&
                        !qrCode.isDark(row + 5, col) &&
                         qrCode.isDark(row + 6, col) ) {
                    lostPoint += 40;
                }
            }
        }
        var darkCount = 0;
        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col) ) {
                    darkCount++;
                }
            }
        }
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;
        return lostPoint;       
    }
};
module.exports = QRUtil;
};
D['index']=function(module,exports,require){
var QR8bitByte = require('./QR8bitByte');
var QRUtil = require('./QRUtil');
var QRPolynomial = require('./QRPolynomial');
var QRRSBlock = require('./QRRSBlock');
var QRBitBuffer = require('./QRBitBuffer');
function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = [];
}
QRCode.prototype = {
	addData : function(data) {
		var newData = new QR8bitByte(data);
		this.dataList.push(newData);
		this.dataCache = null;
	},
	isDark : function(row, col) {
		if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
			throw new Error(row + "," + col);
		}
		return this.modules[row][col];
	},
	getModuleCount : function() {
		return this.moduleCount;
	},
	make : function() {
		if (this.typeNumber < 1 ){
			var typeNumber = 1;
			for (typeNumber = 1; typeNumber < 40; typeNumber++) {
				var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);
				var buffer = new QRBitBuffer();
				var totalDataCount = 0;
				for (var i = 0; i < rsBlocks.length; i++) {
					totalDataCount += rsBlocks[i].dataCount;
				}
				for (var x = 0; x < this.dataList.length; x++) {
					var data = this.dataList[x];
					buffer.put(data.mode, 4);
					buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
					data.write(buffer);
				}
				if (buffer.getLengthInBits() <= totalDataCount * 8)
					break;
			}
			this.typeNumber = typeNumber;
		}
		this.makeImpl(false, this.getBestMaskPattern() );
	},
	makeImpl : function(test, maskPattern) {
		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new Array(this.moduleCount);
		for (var row = 0; row < this.moduleCount; row++) {
			this.modules[row] = new Array(this.moduleCount);
			for (var col = 0; col < this.moduleCount; col++) {
				this.modules[row][col] = null;//(col + row) % 3;
			}
		}
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(test, maskPattern);
		if (this.typeNumber >= 7) {
			this.setupTypeNumber(test);
		}
		if (this.dataCache === null) {
			this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
		}
		this.mapData(this.dataCache, maskPattern);
	},
	setupPositionProbePattern : function(row, col)  {
		for (var r = -1; r <= 7; r++) {
			if (row + r <= -1 || this.moduleCount <= row + r) continue;
			for (var c = -1; c <= 7; c++) {
				if (col + c <= -1 || this.moduleCount <= col + c) continue;
				if ( (0 <= r && r <= 6 && (c === 0 || c === 6) ) || 
                     (0 <= c && c <= 6 && (r === 0 || r === 6) ) || 
                     (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}		
		}		
	},
	getBestMaskPattern : function() {
		var minLostPoint = 0;
		var pattern = 0;
		for (var i = 0; i < 8; i++) {
			this.makeImpl(true, i);
			var lostPoint = QRUtil.getLostPoint(this);
			if (i === 0 || minLostPoint >  lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}
		return pattern;
	},
	createMovieClip : function(target_mc, instance_name, depth) {
		var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
		var cs = 1;
		this.make();
		for (var row = 0; row < this.modules.length; row++) {
			var y = row * cs;
			for (var col = 0; col < this.modules[row].length; col++) {
				var x = col * cs;
				var dark = this.modules[row][col];
				if (dark) {
					qr_mc.beginFill(0, 100);
					qr_mc.moveTo(x, y);
					qr_mc.lineTo(x + cs, y);
					qr_mc.lineTo(x + cs, y + cs);
					qr_mc.lineTo(x, y + cs);
					qr_mc.endFill();
				}
			}
		}
		return qr_mc;
	},
	setupTimingPattern : function() {
		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] !== null) {
				continue;
			}
			this.modules[r][6] = (r % 2 === 0);
		}
		for (var c = 8; c < this.moduleCount - 8; c++) {
			if (this.modules[6][c] !== null) {
				continue;
			}
			this.modules[6][c] = (c % 2 === 0);
		}
	},
	setupPositionAdjustPattern : function() {
		var pos = QRUtil.getPatternPosition(this.typeNumber);
		for (var i = 0; i < pos.length; i++) {
			for (var j = 0; j < pos.length; j++) {
				var row = pos[i];
				var col = pos[j];
				if (this.modules[row][col] !== null) {
					continue;
				}
				for (var r = -2; r <= 2; r++) {
					for (var c = -2; c <= 2; c++) {
						if (Math.abs(r) === 2 || 
                            Math.abs(c) === 2 ||
                            (r === 0 && c === 0) ) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	setupTypeNumber : function(test) {
		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        var mod;
		for (var i = 0; i < 18; i++) {
			mod = (!test && ( (bits >> i) & 1) === 1);
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
		}
		for (var x = 0; x < 18; x++) {
			mod = (!test && ( (bits >> x) & 1) === 1);
			this.modules[x % 3 + this.moduleCount - 8 - 3][Math.floor(x / 3)] = mod;
		}
	},
	setupTypeInfo : function(test, maskPattern) {
		var data = (this.errorCorrectLevel << 3) | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);
        var mod;
		for (var v = 0; v < 15; v++) {
			mod = (!test && ( (bits >> v) & 1) === 1);
			if (v < 6) {
				this.modules[v][8] = mod;
			} else if (v < 8) {
				this.modules[v + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + v][8] = mod;
			}
		}
		for (var h = 0; h < 15; h++) {
			mod = (!test && ( (bits >> h) & 1) === 1);
			if (h < 8) {
				this.modules[8][this.moduleCount - h - 1] = mod;
			} else if (h < 9) {
				this.modules[8][15 - h - 1 + 1] = mod;
			} else {
				this.modules[8][15 - h - 1] = mod;
			}
		}
		this.modules[this.moduleCount - 8][8] = (!test);
	},
	mapData : function(data, maskPattern) {
		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		for (var col = this.moduleCount - 1; col > 0; col -= 2) {
			if (col === 6) col--;
			while (true) {
				for (var c = 0; c < 2; c++) {
					if (this.modules[row][col - c] === null) {
						var dark = false;
						if (byteIndex < data.length) {
							dark = ( ( (data[byteIndex] >>> bitIndex) & 1) === 1);
						}
						var mask = QRUtil.getMask(maskPattern, row, col - c);
						if (mask) {
							dark = !dark;
						}
						this.modules[row][col - c] = dark;
						bitIndex--;
						if (bitIndex === -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}
				row += inc;
				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
	}
};
QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;
QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	var buffer = new QRBitBuffer();
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}
	var totalDataCount = 0;
	for (var x = 0; x < rsBlocks.length; x++) {
		totalDataCount += rsBlocks[x].dataCount;
	}
	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. (" + 
            buffer.getLengthInBits() + 
            ">" +  
            totalDataCount * 8 + 
            ")");
	}
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}
	while (buffer.getLengthInBits() % 8 !== 0) {
		buffer.putBit(false);
	}
	while (true) {
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}
	return QRCode.createBytes(buffer, rsBlocks);
};
QRCode.createBytes = function(buffer, rsBlocks) {
	var offset = 0;
	var maxDcCount = 0;
	var maxEcCount = 0;
	var dcdata = new Array(rsBlocks.length);
	var ecdata = new Array(rsBlocks.length);
	for (var r = 0; r < rsBlocks.length; r++) {
		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;
		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		dcdata[r] = new Array(dcCount);
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new Array(rsPoly.getLength() - 1);
		for (var x = 0; x < ecdata[r].length; x++) {
            var modIndex = x + modPoly.getLength() - ecdata[r].length;
			ecdata[r][x] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}
	}
	var totalCodeCount = 0;
	for (var y = 0; y < rsBlocks.length; y++) {
		totalCodeCount += rsBlocks[y].totalCount;
	}
	var data = new Array(totalCodeCount);
	var index = 0;
	for (var z = 0; z < maxDcCount; z++) {
		for (var s = 0; s < rsBlocks.length; s++) {
			if (z < dcdata[s].length) {
				data[index++] = dcdata[s][z];
			}
		}
	}
	for (var xx = 0; xx < maxEcCount; xx++) {
		for (var t = 0; t < rsBlocks.length; t++) {
			if (xx < ecdata[t].length) {
				data[index++] = ecdata[t][xx];
			}
		}
	}
	return data;
};
module.exports = QRCode;
};
const QRCode=rq('index');return{matrix(text,lvl){const bin=unescape(encodeURIComponent(String(text)));const q=new QRCode(-1,lvl==null?0:lvl);q.addData(bin);q.make();const n=q.getModuleCount();return{n,dark:(r,c)=>q.isDark(r,c)}}}})();
const $=id=>document.getElementById(id);
let _tt;const toast=(m,k)=>{const t=$('toast'),c=k||(/^(Đã|Lưu)/.test(m)?'ok':/^(Không|Lỗi)/.test(m)?'er':'wn');t.className='toast '+c;t.innerHTML=`<span class="ti">${c=='ok'?'✓':c=='er'?'✕':'!'}</span><span>${esc(m)}</span>`;clearTimeout(_tt);_tt=setTimeout(()=>t.classList.add('hide'),5500)};window.alert=m=>toast(String(m));
const ask=(m,o={})=>new Promise(res=>{const d=$('cfd');$('cft').textContent=o.title||'Xác nhận';$('cfm').textContent=m;const y=$('cfy');y.textContent=o.ok||'Đồng ý';y.className='btn '+(o.cls==null?'r':o.cls);y.onclick=()=>{d.close();res(true)};$('cfn').onclick=()=>{d.close();res(false)};d.oncancel=()=>res(false);d.showModal()});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sa=s=>String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const num=(a,b)=>String(a).localeCompare(String(b),'vi',{numeric:true});
const F=[['name','Họ và tên'],['mnv','Mã NV'],['gt','Giới tính'],['dob','Ngày sinh'],['unit','Đơn vị'],['td','Tiểu đoàn'],['ktx','KTX'],['day','Dãy'],['room','Phòng'],['bed','Giường'],['sdt','SĐT'],['cccd','CCCD'],['thon','Thôn/Xóm'],['xa','Xã/Phường'],['tinh','Tỉnh/TP'],['leader','Tổ trưởng'],['lsdt','SĐT tổ trưởng'],['date','Ngày vào'],['out','Ngày ra KTX']];
const MAP=[['name',/^(ho va ten|ho ten|ten)$/],['mnv',/^(ma nv|mnv|ma nhan vien)$/],['sdt',/^(sdt|so dien thoai)$/],['cccd',/cccd|can cuoc/],['gt',/^gioi tinh/],['unit',/^(don vi|nha thau)/],['td',/^(td|tieu doan)$/],['ktx',/^ktx$/],['day',/^day/],['room',/^(phong|so phong)$/],['bed',/^giuong/],['tinh',/^(tinh|ho khau|dia chi|que quan)/],['thon',/^(thon|xom|ap)/],['xa',/^(xa|phuong)/],['lsdt',/^(sdt|so dien thoai) to truong/],['leader',/^to truong/],['dob',/^(ngay sinh|nam sinh)$/],['date',/^ngay vao/],['out',/^ngay ra/],['tt',/^trang thai tam tru/]];
let W=[],LOG=[],ARC=[],ATT=[],REG=[],CAP=20,pg=1,PS=50,sel=new Set(),SO=false,page='home';
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
let ROOMMETA=ld('ktx_room_meta',{}),CURRENT_ROOM_KEY='';
const saveRoomMeta=()=>{try{localStorage.setItem('ktx_room_meta',JSON.stringify(ROOMMETA))}catch(e){}if(window.KTX_SUPA_SYNC&&!window.KTX_SUPA_SYNC.applying)window.KTX_SUPA_SYNC.schedulePush()};
const roomKeyPart=v=>String(v==null?'':v).trim().replace(/\s+/g,' ');
const roomKeyNorm=(v,kind)=>{let x=roomKeyPart(v);if(kind=='room'&&/^0*\d+$/.test(x))return String(parseInt(x,10)||0);return sa(x).replace(/\s+/g,'')||'?'};
const rk=(k,d,r)=>`${roomKeyNorm(k,'ktx')}|${roomKeyNorm(d,'day')}|${roomKeyNorm(r||'?','room')}`;
(()=>{const next={};Object.entries(ROOMMETA||{}).forEach(([key,val])=>{const a=String(key).split('|'),nk=a.length>=3?rk(a[0],a[1],a.slice(2).join('|')):key;next[nk]=Object.assign({},next[nk]||{},val||{})});ROOMMETA=next;try{localStorage.setItem('ktx_room_meta',JSON.stringify(ROOMMETA))}catch(e){}})();
const rmeta=(k,d,r)=>ROOMMETA[rk(k,d,r)]||{};
const SD={db:null,U:null,on:false,last:{},rev:{},loaded:{},timer:0,ACC:{},REQ:[],gate:'',ready:false,sub:false,cid:'c'+Math.random().toString(36).slice(2,8)};
let WORK_SEARCH_CACHE=new WeakMap();
const resetWorkSearchCache=()=>{WORK_SEARCH_CACHE=new WeakMap()};
const workSearchText=w=>{if(!w||typeof w!=='object')return '';let v=WORK_SEARCH_CACHE.get(w);if(v!==undefined)return v;v=sa([w.name,w.mnv,w.leader,w.cccd,w.sdt,R(w),K(w),D(w),w.unit,w.td,w.tinh,w.xa,w.thon].join(' '));WORK_SEARCH_CACHE.set(w,v);return v};
const sv=()=>{resetWorkSearchCache();if(W.length&&window.KTX143_BACKUP)window.KTX143_BACKUP.save().catch(console.warn);try{localStorage.setItem('ktx_w',JSON.stringify(W));localStorage.setItem('ktx_l',JSON.stringify(LOG.slice(0,5000)));localStorage.setItem('ktx_arc',JSON.stringify(ARC));localStorage.setItem('ktx_att',JSON.stringify(ATT.slice(0,5000)));localStorage.setItem('ktx_reg',JSON.stringify(REG));localStorage.setItem('ktx_room_meta',JSON.stringify(ROOMMETA))}catch(e){}if(SD.on)schedFlush();if(window.KTX_SUPA_SYNC&&!window.KTX_SUPA_SYNC.applying)window.KTX_SUPA_SYNC.schedulePush()};
W=ld('ktx_w',[]);LOG=ld('ktx_l',[]);ARC=ld('ktx_arc',[]);ATT=ld('ktx_att',[]);REG=ld('ktx_reg',[]);CAP=20;
const isNam=g=>{const k=sa(g);return k.startsWith('nam')||k=='m'}; const isNu=g=>{const k=sa(g);return k.startsWith('nu')||k=='f'};
const iso=v=>{if(v==null||v==='')return '';if(v instanceof Date){if(isNaN(v))return '';return v.getFullYear()+'-'+String(v.getMonth()+1).padStart(2,'0')+'-'+String(v.getDate()).padStart(2,'0')}if(typeof v==='number')return new Date(Math.round((v-25569)*864e5)).toISOString().slice(0,10);
 const m=String(v).trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;return /^\d{4}-\d{2}-\d{2}/.test(String(v))?String(v).slice(0,10):''};
const since=w=>{if(!w.date)return null;const a=String(w.date).slice(0,10).split('-').map(Number);if(a.length<3||!a[0]||!a[1]||!a[2])return null;const start=new Date(a[0],a[1]-1,a[2],12),now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12),n=Math.floor((today-start)/864e5);return n>=0?n:null};
const K=w=>String(w.ktx||'').trim()||'Chưa phân',D=w=>String(w.day||'').trim()||'Chưa phân',R=w=>w.room||'';
const add=(a,t,k)=>{LOG.unshift({t:new Date().toLocaleString('vi-VN'),a,d:t,k,day:ldy(),actor:(typeof ME!='undefined'&&(ME.name||ME.id))||(localStorage.getItem('ktx_actor')||'Người dùng'),role:(typeof ME!='undefined'&&ME.role)||'local',at:Date.now()});sv()};
const vis=()=>{const k=$('gk').value,L=W.filter(w=>can('view',w));return k?L.filter(w=>K(w)==k):L};
const miss=w=>!w.cccd||!w.sdt;

function pill(){$('np').textContent=W.length.toLocaleString('vi-VN');const ks=[...new Set(W.map(K))].sort(num),c=$('gk').value;$('gk').innerHTML='<option value="">Tất cả KTX</option>'+ks.map(k=>`<option ${k==c?'selected':''}>${esc(k)}</option>`).join('')}
function rooms(L,withUnassigned){const t={};L.forEach(w=>{if((!R(w)||K(w)==='Chưa phân'||D(w)==='Chưa phân')&&!withUnassigned)return;const k=K(w)+'|'+D(w)+'|'+(R(w)||'?');(t[k]=t[k]||{ktx:K(w),day:D(w),room:R(w)||'?',n:0,m:0,f:0,u:0,l:[]});const r=t[k];r.n++;r.l.push(w);if(isNu(w.gt))r.f++;else if(isNam(w.gt))r.m++;else r.u++});return Object.values(t)}

const KR={'KTX 1':60,'KTX 2':69,'KTX 3':49},nRoom=(k,rs)=>KR[k]||rs.length;/* số phòng mặc định mỗi KTX (x20 chỗ): 1.200 / 1.380 / 980 */
const COLL=new Set();let SELK='',HOMEDAY='';
function home(){const L=vis(),RS=rooms(L),tot=L.length;if(!W.length){$('home').innerHTML=`<div class="card"><h3>Chưa có dữ liệu</h3><p class="mut">Bấm <b>Import Excel</b> để nạp danh sách công nhân (cần cột Họ và tên, Phòng, Dãy, KTX...). Dữ liệu lưu trong trình duyệt này.</p><button class="btn s" id="demo">Tạo dữ liệu mẫu để xem thử</button></div>`;$('demo').onclick=demo;return}
 // STEP237: PC dùng cùng trang Tổng quan đầy đủ cho Admin và tài khoản con.
 // Quyền ghi dữ liệu vẫn kiểm tra riêng theo vai trò và KTX/Dãy được phân công.
 const fm=n=>n.toLocaleString('vi-VN'),pc=(a,b)=>(b?a/b*100:0).toLocaleString('vi-VN',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
 const RN=(()=>{const g={};L.forEach(w=>{(g[K(w)]=g[K(w)]||[]).push(w)});return Object.keys(g).reduce((t,k)=>t+nRoom(k,rooms(g[k])),0)})(),capT=RN*CAP,rate=capT?Math.round(tot/capT*100):0,free=(()=>{const g={};L.forEach(w=>{(g[K(w)]=g[K(w)]||[]).push(w)});return Object.keys(g).reduce((sum,k)=>{const rs=rooms(g[k]),missing=Math.max(0,nRoom(k,rs)-rs.length);return sum+rs.reduce((x,r)=>x+Math.max(0,CAP-r.n),0)+missing*CAP},0)})(),over=RS.filter(r=>r.n>CAP).length,nam=L.filter(w=>isNam(w.gt)).length,nu=L.filter(w=>isNu(w.gt)).length;
 const today=ldy(),inT=L.filter(w=>String(w.date||'').slice(0,10)==today).length,days=new Set(L.map(w=>K(w)+'|'+D(w))).size;
 const byK={};L.forEach(w=>{(byK[K(w)]=byK[K(w)]||[]).push(w)});const ks=Object.keys(byK).sort(num);
 const recAll=L.filter(w=>{const s=since(w);return s!=null&&s<=10}).sort((a,b)=>b.date>a.date?1:-1);
 const unitCount=list=>{const o={};list.forEach(w=>{const u=(w.unit||'Chưa rõ').trim()||'Chưa rõ';o[u]=(o[u]||0)+1});return Object.entries(o).sort((a,b)=>b[1]-a[1]||num(a[0],b[0]))};
 const topUnits=unitCount(L).slice(0,6);
 const roomStats=list=>{const rr=rooms(list);let male=0,female=0,mix=0;rr.forEach(r=>{const md=roomMode(r.ktx,r.day,r.room,r.l);if(md=='female')female++;else if(md=='mix')mix++;else male++});return {all:rr.length,male,female,mix}};
 const sk=byK[SELK]?SELK:'';
 const bedOrder=sk?[sk,...ks.filter(x=>x!=sk)]:ks;
 const bedSummary=bedOrder.map(k=>{const allrs=rooms(byK[k]||[]),rs=HOMEDAY?allrs.filter(r=>r.day==HOMEDAY):allrs;let freeBeds=rs.reduce((sum,r)=>sum+Math.max(0,CAP-r.n),0),roomCount=rs.length,occupied=rs.reduce((sum,r)=>sum+r.n,0);if(!HOMEDAY){const nr=nRoom(k,allrs),missing=Math.max(0,nr-allrs.length);freeBeds+=missing*CAP;roomCount=nr}return {k,free:freeBeds,rooms:roomCount,occupied}});
 const bedTotal=bedSummary.reduce((sum,x)=>sum+x.free,0);
 const bedRoomGroups=bedOrder.map(k=>{const rs=rooms(byK[k]||[]).filter(r=>!HOMEDAY||r.day==HOMEDAY).sort((a,b)=>num(a.day,b.day)||num(a.room,b.room));const gs={};rs.forEach(r=>{(gs[r.day]=gs[r.day]||[]).push({room:r.room,n:r.n,free:Math.max(0,CAP-r.n)})});return {k,groups:Object.keys(gs).sort(num).map(d=>({d,rooms:gs[d]}))}}).filter(x=>x.groups.length);
 let SD='';
 if(sk){const l=byK[sk],rs=rooms(l),nr=nRoom(sk,rs),c=nr*CAP,a=l.filter(w=>isNam(w.gt)).length,b=l.filter(w=>isNu(w.gt)).length,ov=rs.filter(r=>r.n>CAP).length,dn=new Set(l.map(w=>D(w))).size,freeK=rs.reduce((x,r)=>x+Math.max(0,CAP-r.n),0)+Math.max(0,nr-rs.length)*CAP;
  SD=`<div class="kdt"><div class="krh"><b>${esc(sk)} · chi tiết</b><button class="btn s sm" id="ksx">Bỏ chọn</button></div><div class="kst"><div><span>Tổng công nhân</span><b>${fm(l.length)}</b><em>${dn} dãy · ${nr} phòng</em></div><div><span>Nam</span><b class="nam">${fm(a)}</b><em>${pc(a,l.length)}</em></div><div><span>Nữ</span><b class="nu">${fm(b)}</b><em>${pc(b,l.length)}</em></div><div><span>Tỷ lệ lấp đầy</span><b class="am">${pc(l.length,c)}</b><em>${fm(l.length)}/${fm(c)} chỗ</em></div><div><span>Chỗ trống</span><b class="gr">${fm(freeK)}</b><em>${pc(freeK,c)} số chỗ</em></div><div><span>Phòng quá tải</span><b class="${ov?'rd':'gr'}">${ov}</b><em>${pc(ov,nr)} số phòng</em></div></div><div class="two"><i style="width:${a/(a+b||1)*100}%"></i><i style="width:${b/(a+b||1)*100}%"></i></div></div>`}
 $('home').innerHTML=`<div class="g4">
  <div class="card"><div class="lbl">TỔNG CÔNG NHÂN</div><div class="kpi">${fm(tot)}</div><div class="sub"><span class="nam">Nam ${fm(nam)} (${pc(nam,tot)})</span> · <span class="nu">Nữ ${fm(nu)} (${pc(nu,tot)})</span></div></div>
  <div class="card"><div class="lbl">TỶ LỆ LẤP ĐẦY</div><div class="kpi ${rate>100?'rd':'gr'}">${pc(tot,capT)}</div><div class="bar"><i style="width:${Math.min(100,rate)}%"></i></div><div class="sub">${fm(tot)}/${fm(capT)} chỗ · trống ${fm(free)}</div></div>
  <div class="card"><div class="lbl">PHÒNG QUÁ TẢI (&gt; ${CAP})</div><div class="kpi ${over?'rd':'gr'}">${over} phòng</div><div class="sub">Định mức cố định 20 người/phòng</div></div>
  <div class="card"><div class="lbl">VÀO HÔM NAY</div><div class="kpi">+${inT}</div><div class="sub">${fm(recAll.length)} người vào trong 10 ngày qua</div></div></div>
 <div class="home-analytics">
  <div class="card"><div class="an-head"><div class="an-title"><span class="an-ico">⚥</span><div><h3>Thống kê Giới tính & Công năng Phòng</h3><div class="mut">Tự động quét toàn bộ dữ liệu đang hiển thị</div></div></div><span class="mut">Tổng: ${fm(tot)}</span></div>
   <div class="gender-kpis"><div class="gender-box male"><span class="cap">NAM</span><b>${fm(nam)}</b><small>${pc(nam,tot)} tổng quân số</small></div><div class="gender-box female"><span class="cap">NỮ</span><b>${fm(nu)}</b><small>${pc(nu,tot)} tổng quân số</small></div></div>
   <div class="an-subtitle">Chi tiết theo từng khu vực KTX</div>
   ${ks.map(k=>{const l=byK[k],a=l.filter(w=>isNam(w.gt)).length,b=l.filter(w=>isNu(w.gt)).length,st=roomStats(l);return `<div class="ktx-gender-row" data-ktx-summary="${esc(k)}" role="button" tabindex="0" aria-label="Lọc xem ${esc(k)}"><div class="ktx-gender-top"><b>${esc(k)}</b><span class="nam">Nam: ${fm(a)}</span><span class="nu">Nữ: ${fm(b)}</span><span class="mut">(${fm(l.length)} người)</span></div><div class="splitbar"><i style="width:${a/(a+b||1)*100}%"></i><i style="width:${b/(a+b||1)*100}%"></i></div><div class="room-badges"><span class="rbadge m">♂ ${st.male} P.Nam</span><span class="rbadge f">♀ ${st.female} P.Nữ</span><span class="rbadge mix">↔ ${st.mix} Hỗn hợp</span><span class="rbadge">${st.all} phòng có dữ liệu</span></div></div>`}).join('')}
  </div>
  <div class="card bedroom-card"><div class="an-head"><div class="an-title"><span class="an-ico">▤</span><div><h3>Giường trống theo từng phòng</h3><div class="mut">Giường trống = 20 − số người hiện có · không hiển thị số âm</div></div></div><div class="bedroom-head-total"><span>Tổng trống</span><b>${fm(bedTotal)}</b></div></div>
   <div class="bedroom-scroll">${bedRoomGroups.map(x=>x.groups.map(g=>`<div class="bedroom-group"><div class="bedroom-group-head"><b>${esc(x.k)} · ${esc(g.d)}</b><span>${g.rooms.length} phòng</span></div><div class="bedroom-grid">${g.rooms.map(r=>`<div class="bedroom-item ${r.free>0?'available ':''}${r.free===0?'zero':r.free<=3?'low':''}" title="${esc(x.k)} · ${esc(g.d)} · Phòng ${esc(r.room)} · ${r.n}/${CAP} người · Trống ${r.free} giường"><span class="rp">P.${esc(r.room)}</span><strong>${r.free}</strong></div>`).join('')}</div></div>`).join('')).join('')||'<div class="mut" style="padding:10px 0">Chưa có dữ liệu phòng.</div>'}</div>
  </div>
 </div>
 <div class="card roommap-card"><div class="roommap-head"><div><h3 style="margin:0">Sơ đồ phòng <span class="mut">· ${days} dãy · ${RN} phòng</span></h3><div class="roommap-legend"><span><i class="lg-dot free"></i>Còn trống</span><span><i class="lg-dot full"></i>Đầy 100%</span><span><i class="lg-dot over"></i>Quá tải</span><span><i class="lg-ring female"></i>Phòng nữ</span><span><i class="lg-ring mix"></i>Hỗn hợp</span></div></div><div class="day-filter">${['',...[...new Set(L.map(w=>D(w)))].sort(num)].map(d=>`<button class="day-chip ${HOMEDAY==d?'on':''}" data-hday="${esc(d)}">${d||'Tất cả dãy'}</button>`).join('')}</div></div>
  ${(sk?[sk,...ks.filter(x=>x!=sk)]:ks).map(k=>{const l=byK[k],byD={};const rsK=rooms(l,true);rsK.forEach(r=>{(byD[r.day]=byD[r.day]||[]).push(r)});const shown=Object.keys(byD).sort(num).filter(d=>!HOMEDAY||d==HOMEDAY);return `<details class="kd" data-k="${esc(k)}" ${COLL.has(k)&&k!=sk?'':'open'}><summary><svg class="i"><use href="#i-ch"/></svg><b>${esc(k)}</b><span class="mut">${fm(l.length)} công nhân · ${nRoom(k,rsK)} phòng</span></summary><div class="dg">${shown.map(d=>{const rs=byD[d].sort((a,b)=>num(a.room,b.room)),n=rs.reduce((s,r)=>s+r.n,0),cap=rs.length*CAP,p=Math.round(n/(cap||1)*100),freeN=rs.reduce((x,r)=>x+Math.max(0,CAP-r.n),0),fullN=rs.filter(r=>r.n==CAP).length,overN=rs.filter(r=>r.n>CAP).length;return `<div class="dy room-day"><div class="room-day-head"><div><b>${esc(d)}</b><span class="mut"> · ${rs.length} phòng</span></div><div class="room-day-kpis"><span>${n}/${cap}</span><b class="${p>100?'rd':p==100?'am':'gr'}">${p}%</b></div></div><div class="ktx-day-owner" data-owner-ktx="${esc(k)}" data-owner-day="${esc(d)}">Phụ trách: <b class="ktx-owner-name">Chưa phân công</b></div><div class="bar"><i style="width:${Math.min(100,p)}%;background:${p>100?'var(--rd)':p==100?'var(--am)':'var(--gr)'}"></i></div><div class="room-mini-stats"><span class="tag g">Trống ${freeN}</span><span class="tag a">Đầy ${fullN}</span>${overN?`<span class="tag r">Quá tải ${overN}</span>`:''}</div><div class="rm">${rs.map(r=>{const rp=Math.round(r.n/CAP*100),md=roomMode(k,d,r.room,r.l),sexCls=md=='female'?'f':md=='mix'?'m':'',sexIcon=md=='female'?'<em class="sex f">♀</em>':md=='mix'?'<em class="sex mix">↔</em>':'<em class="sex m">♂</em>',typeLabel=roomTypeText(md);return `<button class="r room-cell ${sexCls} ${r.n>CAP?'over':r.n==CAP?'full':'ok'}" data-k="${esc(k)}" data-d="${esc(d)}" data-r="${esc(r.room)}" title="${esc(k)} · ${esc(d)} · Phòng ${esc(r.room)} · ${esc(typeLabel)} · ${r.n}/${CAP} (${rp}%)"><span class="room-no"><b>P.${esc(r.room)}</b>${sexIcon}</span><span class="room-occ"><b>${r.n}/${CAP}</b><small>${rp}%</small></span></button>`}).join('')}</div></div>`}).join('')||'<div class="mut" style="padding:12px">Không có phòng thuộc dãy đã chọn.</div>'}</div></details>`}).join('')}</div
`;
 document.querySelectorAll('#home [data-ktx-summary]').forEach(e=>{const pick=()=>{const sel=document.getElementById('gk'),k=e.dataset.ktxSummary;if(!sel)return;sel.value=sel.value===k?'':k;SELK=sel.value;all();};e.addEventListener('click',pick);e.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();pick()}})});
 document.querySelectorAll('#home .kr[data-ks]').forEach(e=>{const t=()=>{const k=e.dataset.ks, sel=document.getElementById('gk');if(!sel)return;sel.value=sel.value===k?'':k;SELK=sel.value;all()};e.onclick=t;e.onkeydown=ev=>{if(ev.key=='Enter'||ev.key==' '){ev.preventDefault();t()}}});
 const kx=$('ksx');if(kx)kx.onclick=()=>{SELK='';home()};
 document.querySelectorAll('#home details.kd').forEach(d=>d.ontoggle=()=>{d.open?COLL.delete(d.dataset.k):COLL.add(d.dataset.k)});
 document.querySelectorAll('#home [data-hday]').forEach(b=>b.onclick=()=>{HOMEDAY=b.dataset.hday||'';home()});
}
function roomTypeAuto(list){const m=list.filter(w=>isNam(w.gt)).length,f=list.filter(w=>isNu(w.gt)).length;return f&&m?'mix':f?'female':'male'}
function roomMode(k,d,r,list){const meta=rmeta(k,d,r);return meta.mode&&meta.mode!='auto'?meta.mode:roomTypeAuto(list||[])}
function roomTypeText(mode){return mode=='female'?'Phòng Nữ':mode=='mix'?'Hỗn hợp':'Phòng Nam'}
function roomTypeClass(mode){return mode=='female'?'f':mode=='mix'?'mix':'m'}
function roomSummary(list){const m=list.filter(w=>isNam(w.gt)).length,f=list.filter(w=>isNu(w.gt)).length,fn=n=>Number(n||0).toLocaleString('vi-VN');return `${fn(list.length)} công nhân đang lưu trú (${fn(m)} Nam · ${fn(f)} Nữ)`}
function openRoomDrawer(k,d,r,list){CURRENT_ROOM_KEY=rk(k,d,r);const meta=rmeta(k,d,r);const auto=roomTypeAuto(list);const mode=meta.mode&&meta.mode!='auto'?meta.mode:auto;const missing=list.filter(w=>miss(w)).length,noTd=list.filter(w=>!String(w.td||'').trim()).length;$('rt').textContent=`${d} — Phòng ${r}`;$('rsub').textContent=roomSummary(list);$('rchips').innerHTML=`<span class="roomd-chip ok">${list.length} người</span><span class="roomd-chip ${roomTypeClass(mode)}">${roomTypeText(mode)}</span><span class="roomd-chip a">${esc(k)}</span>`;$('rtype').innerHTML=`<button class="roomd-type ${!meta.mode||meta.mode=='auto'?'on':''} auto" data-rtype="auto" title="Tự động xác định theo giới tính người đang ở trong phòng">Tự động</button><button class="roomd-type ${meta.mode=='male'?'on':''} m" data-rtype="male">Phòng Nam</button><button class="roomd-type ${meta.mode=='female'?'on':''} f" data-rtype="female">Phòng Nữ</button><button class="roomd-type ${meta.mode=='mix'?'on':''} mix" data-rtype="mix">Hỗn hợp</button>`;$('rnote').value=meta.note||'';$('rleg').innerHTML=`<span><i class="rdot ok"></i>Đủ hồ sơ ${list.length-missing}</span><span><i class="rdot miss"></i>Thiếu CCCD/SĐT ${missing}</span><span><i class="rdot empty"></i>Chưa phân tiểu đoàn ${noTd}</span>`;$('rb').innerHTML=list.map((w,i)=>{const gt=isNu(w.gt)?'f':'m',stay=stayN(w),tg=gt=='f'?'Nữ':'Nam',status=miss(w)?'<span class="warn">Thiếu CCCD/SĐT</span>':'<span class="stay">Đủ hồ sơ</span>';return `<div class="roomd-person" data-room-worker="${esc(w.id)}" role="button" tabindex="0" title="Xem thông tin công nhân"><div class="roomd-row1"><div class="roomd-index">${i+1}</div><div class="roomd-avatar">${esc((w.name||'?').trim().charAt(0).toUpperCase())}</div><div class="roomd-main"><div class="roomd-topline"><span class="roomd-name">${esc(w.name||'')}</span><span class="roomd-mini ${gt}">${tg}</span>${w.td?`<span class="roomd-mini td">TĐ ${esc(w.td)}</span>`:''}</div><div class="roomd-lines"><div>${w.mnv?`# ${esc(w.mnv)}`:'—'} ${w.sdt?`&nbsp;&nbsp;•&nbsp;&nbsp; ${esc(w.sdt)}`:''} ${w.cccd?`&nbsp;&nbsp;•&nbsp;&nbsp; ${esc(w.cccd.slice(0,4)+'****'+w.cccd.slice(-3))}`:''}</div><div>${esc((w.tinh||'').trim()||'Chưa cập nhật địa chỉ')}</div><div>${stay==='—'?status:`<span class="stay">${stay} ngày</span>`} <span class="mut">· Tổ trưởng: ${esc(w.leader||'Chưa cập nhật')}</span></div></div></div></div></div>`}).join('')||'<div class="mut" style="padding:16px 0">Chưa có công nhân trong phòng này.</div>';document.querySelectorAll('#rtype [data-rtype]').forEach(b=>b.onclick=()=>{const key=rk(k,d,r);ROOMMETA[key]=Object.assign({},ROOMMETA[key]||{},{mode:b.dataset.rtype});CURRENT_ROOM_KEY=key;saveRoomMeta();home();const fresh=W.filter(w=>K(w)==k&&D(w)==d&&(R(w)||'?')==r);openRoomDrawer(k,d,r,fresh)});$('rsn').onclick=()=>{ROOMMETA[CURRENT_ROOM_KEY]=Object.assign({},ROOMMETA[CURRENT_ROOM_KEY]||{},{note:$('rnote').value.trim()});saveRoomMeta();alert('Đã lưu ghi chú phòng.');};document.querySelectorAll('#rb [data-room-worker]').forEach(el=>{const openPerson=()=>{const w=W.find(x=>x.id==el.dataset.roomWorker);if(!w)return;const rd=$('rdl');if(rd&&rd.open)rd.close();view(w)};el.onclick=e=>{e.stopPropagation();openPerson()};el.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();openPerson()}}});const dlg=$('rdl');if(dlg&&!dlg.open){try{dlg.showModal()}catch(e){dlg.setAttribute('open','');dlg.style.display='flex'}}}
if(!window.__ktxRoomClickBound){window.__ktxRoomClickBound=true;document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#home .r[data-r]');if(!b)return;e.preventDefault();e.stopPropagation();const l=W.filter(w=>K(w)==b.dataset.k&&D(w)==b.dataset.d&&(R(w)||'?')==b.dataset.r);openRoomDrawer(b.dataset.k,b.dataset.d,b.dataset.r,l)},true)}
{const _rx=$('rx');if(_rx)_rx.onclick=()=>$('rdl').close();const _rx2=$('rx2');if(_rx2)_rx2.onclick=()=>$('rdl').close();}

function move(){const L=vis(),map={};L.forEach(w=>{if(w.date)map[w.date]=(map[w.date]||0)+1});const ds=[];for(let i=13;i>=0;i--){const x=new Date();x.setHours(12,0,0,0);x.setDate(x.getDate()-i);const d=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');ds.push([d,map[d]||0])}const mx=Math.max(1,...ds.map(x=>x[1])),out=delCount();
 const U={};L.forEach(w=>{const u=w.unit||'Chưa rõ';U[u]=(U[u]||0)+1});const us=Object.entries(U).sort((a,b)=>b[1]-a[1]).slice(0,6);
 const bins=[['1–7',1,7],['8–14',8,14],['15–21',15,21],['22–30',22,30],['31–40',31,40],['41+',41,1e9]].map(([l,a,b])=>[l,L.filter(w=>{const s=since(w);return s!=null&&Math.max(s,1)>=a&&Math.max(s,1)<=b}).length]),mb=Math.max(1,...bins.map(b=>b[1]));
 const rec=L.filter(w=>{const s=since(w);return s!=null&&s<=10}).sort((a,b)=>b.date>a.date?1:-1).slice(0,8);
 const TD={};L.forEach(w=>{if(w.td)TD[w.td]=(TD[w.td]||0)+1});const tds=Object.entries(TD).sort((a,b)=>b[1]-a[1]).slice(0,8),mt=Math.max(1,...tds.map(x=>x[1]));
 $('move').innerHTML=`<div class="g4"><div class="card"><div class="lbl">VÀO 14 NGÀY QUA</div><div class="kpi gr">+${ds.reduce((s,x)=>s+x[1],0)}</div></div><div class="card"><div class="lbl">VÀO HÔM NAY</div><div class="kpi">+${ds[13][1]}</div></div><div class="card"><div class="lbl">RA (ĐIỀU CHUYỂN / NGHỈ VIỆC)</div><div class="kpi am">${out}</div></div></div>
 <div class="card"><h3>Công nhân vào theo ngày</h3><div class="hist">${ds.map(([d,n])=>`<div><span>${n}</span><i style="height:${n/mx*110}px;background:var(--bl)"></i><span class="mut">${d.slice(8)}/${d.slice(5,7)}</span></div>`).join('')}</div></div>
 <div class="g2"><div class="card"><h3>Đơn vị & nhà thầu <span class="mut">(top 6)</span></h3><div class="g2" style="grid-template-columns:1fr 1fr;gap:8px">${us.map(([u,n])=>`<div class="dy row" style="justify-content:space-between;padding:8px"><span>${esc(u)}</span><b class="am">${n}</b></div>`).join('')}</div></div>
  <div class="card"><h3>Phân bổ theo tiểu đoàn</h3>${tds.map(([t,n])=>`<div class="row" style="flex-wrap:nowrap;margin:5px 0"><span style="width:90px;overflow:hidden;text-overflow:ellipsis">${esc(t)}</span><div class="bar" style="flex:1"><i style="width:${n/mt*100}%;background:var(--bl)"></i></div><b>${n}</b></div>`).join('')||'<span class="mut">Chưa có cột Tiểu đoàn</span>'}</div></div>
 <div class="g2"><div class="card"><h3>Số ngày lưu trú</h3><div class="hist">${bins.map(([l,n])=>`<div><span>${n}</span><i style="height:${n/mb*110}px"></i><span class="mut">${l}</span></div>`).join('')}</div></div>
  <div class="card"><h3>Mới vào gần đây <span class="mut">(10 ngày)</span></h3>${rec.map(w=>`<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--ln);padding:6px 0"><span><b>${esc(w.name)}</b><br><span class="mut">${esc(D(w))} · Phòng ${esc(R(w))}</span></span><span class="tag g">${since(w)} ngày</span></div>`).join('')||'<span class="mut">Không có ai mới vào</span>'}</div></div>`}

const canonTD=v=>{const x=sa(v).replace(/\s+/g,'');if(!x)return '';if(x=='113')return '113';if(x=='111')return '111';if(x=='112')return '112';if(x=='8'||x=='08')return '8';if(x=='me')return 'ME';if(x=='vinalpha'||x=='vinalpha')return 'Vinalpha';return String(v||'').trim()};
const TD_FILTERS=['113','111','112','8','ME','Vinalpha'];
const FL=[['fk','KTX',K],['fd','Dãy',D],['fr','Phòng',w=>R(w)||'—'],['fu','Đơn vị',w=>w.unit||'—']];
function work(){if(!$('work').dataset.init){$('work').dataset.init=1;$('work').innerHTML=`<div class="card worker-panel">
 <div class="worker-filters">
  ${FL.map(([id,l])=>`<select id="${id}" aria-label="${l}" title="Lọc theo ${l}"><option value="">${l}: tất cả</option></select>`).join('')}
  <select id="fh"><option value="">Trạng thái: tất cả</option><option value="ok">Đủ hồ sơ</option><option value="no">Thiếu CCCD/SĐT</option><option value="np">Chưa phân bổ</option></select>
 </div>
 <div class="worker-primary worker-primary-clean worker-search-row">
  <div class="worker-search"><svg class="i"><use href="#i-users"/></svg><input id="q" placeholder="Tìm theo tên, mã NV, CCCD, SĐT, phòng, tổ trưởng..."></div>
  <button class="btn s worker-iconbtn" id="wrf" title="Làm mới tìm kiếm và bộ lọc"><svg class="i"><use href="#i-copy"/></svg></button>
 </div>
 <div class="qs hide" aria-hidden="true"><select id="sm"><option value="all">Tất cả công nhân</option><option value="ktx">Theo KTX</option><option value="day">Theo dãy</option><option value="room">Theo phòng</option></select><select id="sx" class="hide"></select><button id="sg"></button><button id="su"></button><button id="sc"></button><input type="checkbox" id="so" hidden><b id="sn"></b></div>
 </div><div id="wl"></div>`;
  let workerFilterTimer=0;const runWorkerFilter=()=>{pg=1;wl()};
  ['fk','fd','fr','fu','fh'].forEach(i=>$(i).oninput=runWorkerFilter);
  $('q').oninput=()=>{clearTimeout(workerFilterTimer);workerFilterTimer=setTimeout(runWorkerFilter,180)};
  $('aw').onclick=()=>edit();$('xw').onclick=()=>xlsForm(sel.size?W.filter(w=>sel.has(w.id)):flt());$('bn').onclick=normAll;$('wd').onclick=()=>go('t2');$('mnfile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)mnvFile(f)};
  $('wrf').onclick=()=>{['q','fk','fd','fr','fu','fh'].forEach(i=>{$(i).value=''});pg=1;work()};
  $('sm').onchange=fillSv;$('sg').onclick=()=>{sgrp().forEach(w=>sel.add(w.id));SO=sel.size>0;pg=1;wl()};$('so').onchange=e=>{SO=e.target.checked&&sel.size>0;pg=1;wl()};$('su').onclick=()=>{sgrp().forEach(w=>sel.delete(w.id));wl()};$('sc').onclick=()=>{sel.clear();wl()};
  $('ds2').onclick=async()=>{if(!sel.size){alert('Hãy tick chọn công nhân cần xóa.');return}const L=W.filter(w=>sel.has(w.id)),nm=L.slice(0,5).map(w=>'• '+w.name).join('\n')+(L.length>5?`\n… và ${L.length-5} người khác`:'');const inf=await askLeave(L);if(!inf)return;delWorkers(L,inf)};
  $('dsall').onclick=async()=>{if(!W.length){alert('Danh sách công nhân đang trống.');return}if(!can('del')){alert('Bạn không có quyền xóa công nhân.');return}const L=W.slice(),inf=await askLeave(L,{reason:'Khác',note:'Thao tác Xóa tất cả từ Quản lý công nhân'});if(!inf)return;sel.clear();delWorkers(L,inf)}}
 const cur={};FL.forEach(([id])=>cur[id]=$(id).value);FL.forEach(([id,l,fn])=>{const vals=W.map(fn).filter(v=>v&&v!='—'),uniq=[...new Set(vals)].sort(num);$(id).innerHTML=`<option value="">${l}: tất cả</option>`+uniq.map(v=>`<option value="${esc(v)}" ${v==cur[id]?'selected':''}>${esc(v)}</option>`).join('')});fillSv();wl()}
const selUi=()=>{{const m2=$('mnn');if(m2){const n=W.filter(noCode).length;m2.textContent=n;m2.style.display=n?'':'none'}}{const w2=$('wdn');if(w2){w2.textContent=window.DUP_N||'';w2.style.display=window.DUP_N?'':'none'}}$('sn').textContent=`Đã chọn ${sel.size.toLocaleString('vi-VN')} / ${W.length.toLocaleString('vi-VN')}`;$('sn').classList.toggle('on',sel.size>0);$('dst').textContent=sel.size?`Xóa mục đã chọn (${sel.size})`:'Xóa mục đã chọn';$('xwt').textContent=sel.size?`Xuất Excel (${sel.size} đã chọn)`:'Xuất Excel'};
const gkey=(w,m)=>m=='ktx'?K(w):m=='day'?K(w)+'|'+D(w):K(w)+'|'+D(w)+'|'+(R(w)||'—');
function sgrp(){const m=$('sm').value,v=$('sx').value;return m=='all'?W:W.filter(w=>gkey(w,m)==v)}
function fillSv(){const m=$('sm').value,x=$('sx'),c={};if(m=='all')x.classList.add('hide');else{x.classList.remove('hide');W.forEach(w=>{const k=gkey(w,m);c[k]=(c[k]||0)+1});const cur=x.value;x.innerHTML=Object.keys(c).sort(num).map(k=>`<option value="${esc(k)}" ${k==cur?'selected':''}>${esc(k.replace(/\|/g,' · '))} (${c[k]})</option>`).join('')}selUi()}
function delWorkers(list,inf){if(!list.length)return;const qrFlow=!!(inf&&inf.source==='qr');if(!can('del')&&!(qrFlow&&can('qrApprove'))){alert('Bạn không có quyền chuyển công nhân ra khỏi danh sách.');return}if(list.some(w=>!inScope(w))){alert('Danh sách chứa công nhân ngoài KTX/Dãy được phân quyền. Không có dữ liệu nào bị xóa.');return}inf=inf||{mode:'archive',reason:'Khác',date:ldy(),note:''};
 if(inf.mode==='purge'){const ids=new Set(list.map(w=>w.id)),now=new Date().toLocaleString('vi-VN');W=W.filter(w=>!ids.has(w.id));ids.forEach(i=>sel.delete(i));LOG.unshift({t:now,a:'PURGE',d:list.length==1?`Xóa hẳn công nhân: ${list[0].name}${list[0].mnv?' (Mã NV: '+list[0].mnv+')':''}`:`Xóa hẳn ${list.length} công nhân khỏi danh sách chính`,n:list.length,day:ldy()});sv();all();alert(`Đã xóa hẳn ${list.length.toLocaleString('vi-VN')} công nhân. Dữ liệu không được chuyển sang “Điều chuyển · Nghỉ việc”.`);return}
 const now=new Date().toLocaleString('vi-VN'),day=inf.date||ldy(),at=Date.now(),by={};
 list.forEach(w=>{const k=K(w);(by[k]=by[k]||[]).push(w);ARC.unshift({id:w.id,w:JSON.parse(JSON.stringify(w)),reason:inf.reason,date:day,note:inf.note||'',at})});
 Object.keys(by).forEach(k=>{const l=by[k];LOG.unshift({t:now,a:'DELETE',d:l.length==1?`Chuyển ra khỏi danh sách (${inf.reason}): ${l[0].name}${l[0].mnv?' (Mã NV: '+l[0].mnv+')':''}`:`Chuyển ${l.length} công nhân ra khỏi danh sách (${inf.reason}, ${k})`,k,n:l.length,day,reason:inf.reason})});
 const ids=new Set(list.map(w=>w.id));W=W.filter(w=>!ids.has(w.id));ids.forEach(i=>sel.delete(i));sv();all();
 alert(`Đã chuyển ${list.length.toLocaleString('vi-VN')} công nhân sang danh sách theo dõi "Điều chuyển · Nghỉ việc" (${inf.reason}). Có thể khôi phục lại bất cứ lúc nào.`)}
function flt(){const q=sa($('q').value),g=Object.fromEntries(FL.map(([id,,fn])=>[id,[$(id).value,fn]])),h=$('fh').value;
 return W.filter(w=>can('view',w)&&(!SO||sel.has(w.id))&&(!q||workSearchText(w).includes(q))&&FL.every(([id,,fn])=>!g[id][0]||fn(w)==g[id][0])&&(!h||(h=='ok'?!miss(w)&&R(w):h=='no'?miss(w):!R(w))))}
const kc=k=>'k'+(((parseInt(String(k).replace(/\D/g,''))||1)-1)%4+1),gp=g=>`<span class="pl ${isNu(g)?'g-f':'g-m'}">${esc(gtN(g))}</span>`;
const stayN=w=>{const n=w.out&&w.date?Math.max(0,Math.floor((new Date(w.out)-new Date(w.date))/864e5)):since(w);return n==null?'—':n};
const stTag=w=>{const t=ttSt(w);return `<span class="tag ${t=='Chưa đăng ký'?'a':t.includes('chưa')?'r':'g'}">${t}</span>`};
function wl(){if(SO&&!sel.size)SO=false;const L=flt(),pgs=Math.max(1,Math.ceil(L.length/PS));pg=Math.min(pg,pgs);const S=L.slice((pg-1)*PS,pg*PS);
 $('wl').innerHTML=`<div class="row ktx108-selectbar" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px"><button type="button" class="btn s" id="ktx108SelectFiltered">${L.length&&L.every(w=>sel.has(w.id))?'☐ Bỏ chọn tất cả':'☑ Chọn tất cả'} (${L.length.toLocaleString('vi-VN')})</button><span class="mut" style="font-size:11px">Áp dụng cho kết quả đang lọc, kể cả các trang khác; không chọn hồ sơ ngoài quyền.</span></div><div class="wrap ktx250-worker-table-scroll"><table class="cmp2"><tr><th><input type="checkbox" id="wa" title="Chọn tất cả dòng đang hiển thị" aria-label="Chọn tất cả dòng đang hiển thị"></th><th>STT</th><th>Họ và Tên</th><th>Mã NV</th><th>Tiểu Đoàn</th><th>Đơn vị</th><th>KTX</th><th>Dãy</th><th>Phòng</th><th>Giới tính</th><th>SĐT</th><th>CCCD</th><th>Ngày sinh</th><th>Địa chỉ</th><th>Tiểu đội trưởng</th><th>Trạng thái tạm trú, Tạm vắng</th></tr>${S.map((w,i)=>`<tr class="${isNu(w.gt)?'fm':''} wkrow" data-row="${w.id}"><td><input type="checkbox" class="ck" data-i="${w.id}" ${sel.has(w.id)?'checked':''}></td><td>${(pg-1)*PS+i+1}</td><td class="wr nm"><b class="lk" data-v="${w.id}" tabindex="0" role="button" title="Xem chi tiết">${esc(w.name)}</b><br>${!R(w)?'<span class="tag a">Chưa phân bổ</span>':miss(w)?'<span class="tag r">Thiếu CCCD/SĐT</span>':'<span class="tag g">Đủ hồ sơ</span>'}</td><td>${w.mnv?esc(w.mnv):'<span class="tag a">Chờ mã</span>'}</td><td class="wr">${esc(w.td||'—')}</td><td class="wr">${esc(w.unit||'—')}</td><td><span class="pl ${kc(K(w))}">${esc(K(w))}</span></td><td><span class="pl dy2">${esc(D(w))}</span></td><td><span class="pl ro">${esc(R(w)||'—')}</span></td><td>${gp(w.gt)}</td><td>${esc(w.sdt)}</td><td>${w.cccd?esc(w.cccd.slice(0,3)+'****'+w.cccd.slice(-3)):''}</td><td>${vn(w.dob)||'—'}</td><td class="wr ad">${esc(w.tinh||'—')}</td><td class="wr">${esc(w.leader||'—')}</td><td class="wr">${stTag(w)}</td></tr>`).join('')}</table></div>
 <div class="row ktx250-worker-footer" style="margin-top:10px;justify-content:space-between;gap:10px;flex-wrap:wrap"><span class="mut">Tổng: ${L.length.toLocaleString('vi-VN')} bản ghi</span><span class="row"><label class="mut" style="display:flex;align-items:center;gap:6px">Hiển thị <select id="psz" style="height:34px;padding:4px 28px 4px 8px;width:auto">${[50,100,200].map(n=>`<option value="${n}" ${PS==n?'selected':''}>${n}</option>`).join('')}</select></label><button class="btn s" id="pp" ${pg<2?'disabled':''}>Trước</button><span>${pg}/${pgs}</span><button class="btn s" id="pgn" ${pg>=pgs?'disabled':''}>Sau</button></span></div>`;
 $('ktx108SelectFiltered').onclick=()=>{const selectNow=!L.length||!L.every(w=>sel.has(w.id));L.forEach(w=>selectNow?sel.add(w.id):sel.delete(w.id));if(!selectNow&&SO)SO=false;wl()};
 $('pp').onclick=()=>{pg--;wl()};$('pgn').onclick=()=>{pg++;wl()};$('psz').onchange=e=>{PS=parseInt(e.target.value)||50;pg=1;wl()};
 document.querySelectorAll('.ck').forEach(c=>c.onchange=()=>{c.checked?sel.add(c.dataset.i):sel.delete(c.dataset.i);selUi();if(SO&&!c.checked){wl();return}$('wa').checked=S.every(w=>sel.has(w.id))});
 $('wa').checked=S.length>0&&S.every(w=>sel.has(w.id));$('wa').onchange=e=>{S.forEach(w=>e.target.checked?sel.add(w.id):sel.delete(w.id));document.querySelectorAll('.ck').forEach(c=>c.checked=e.target.checked);selUi();if(SO&&!e.target.checked)wl()};$('so').checked=SO;selUi();
 document.querySelectorAll('[data-row]').forEach(r=>r.onclick=e=>{if(e.target.closest('input,button,a,label,select,textarea,[data-v],[data-e]'))return;const selTxt=window.getSelection?String(window.getSelection()):'';if(selTxt&&selTxt.trim())return;view(W.find(w=>w.id==r.dataset.row))});
 document.querySelectorAll('[data-v]').forEach(b=>{b.onclick=()=>view(W.find(w=>w.id==b.dataset.v));b.onkeydown=e=>{if(e.key=='Enter')b.click()}});
 document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>edit(W.find(w=>w.id==b.dataset.e)));
 }
const ico=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
function view(w){if(!w)return;if(!can('view',w)){alert('Bạn không có quyền xem hồ sơ ngoài phạm vi được phân công.');return;}const f=(l,v,x)=>`<div class="df ${x||''}"><span>${l}</span>${v?`<b>${esc(v)}</b>`:'<b class="mut" style="font-weight:400">—</b>'}</div>`,sn=since(w),cd=(t,ic,body)=>`<div class="vcd"><div class="vs">${ico(ic)}${t}</div><div class="sg">${body}</div></div>`;
 $('vav').textContent=(w.name||'?').trim().charAt(0).toUpperCase();$('vnm').textContent=w.name;
 $('vmt').innerHTML=(!R(w)?'<span class="tag a">Chưa phân bổ</span>':miss(w)?'<span class="tag r">Thiếu CCCD/SĐT</span>':'<span class="tag g">Đủ hồ sơ</span>')+`<span class="pl ${kc(K(w))}">${esc(K(w))}</span><span class="pl dy2">${esc(D(w))}</span><span class="pl ro">Phòng ${esc(R(w)||'—')}</span>${gp(w.gt)}`;
 $('vb').innerHTML=cd('Thông tin cá nhân','users',f('Mã nhân viên',w.mnv||'Chờ mã')+f('Giới tính',gtN(w.gt))+f('Ngày sinh',vn(w.dob))+f('Số điện thoại',w.sdt)+f('CCCD',w.cccd,'w2')+f('Hộ khẩu / Địa chỉ',w.tinh,'w2'))
  +cd('Thông tin KTX','bld',f('KTX',K(w))+f('Đơn vị',w.unit)+f('Tiểu đoàn',w.td||'Chưa phân')+f('Dãy nhà',D(w))+f('Phòng số',R(w))+f('Số giường',w.bed)+f('Ngày vào KTX',vn(w.date))+f('Ngày ra KTX',w.out?vn(w.out):(w.tv?'Tạm vắng từ '+vn(w.tv.from):'Đang ở'))+f('Số ngày lưu trú',sn==null?'':sn+' ngày','w2'))
  +cd('Tổ trưởng','users',f('Họ tên tổ trưởng',w.leader||'')+f('SĐT tổ trưởng',w.lsdt))
  +cd('Tạm trú · Tạm vắng','id',f('Trạng thái',ttSt(w),'w2')+f('Ngày khai báo tạm trú',w.tt?vn(w.tt):'')+f('Tạm vắng',w.tv?`Từ ${vn(w.tv.from)}${w.tv.to?' đến '+vn(w.tv.to):''}`:'')+(w.tv&&w.tv.why?f('Lý do tạm vắng',w.tv.why,'w2'):''));
 const cl=()=>$('vdl').close(),ed=()=>{cl();edit(w)};
 $('vc').onclick=$('vc2').onclick=cl;$('ve2').onclick=ed;
 $('vx').onclick=async()=>{const inf=await askLeave([w]);if(!inf)return;cl();delWorkers([w],inf)};
 $('ve2').classList.toggle('hide',!can('editw',w));$('vx').classList.toggle('hide',!can('del',w));$('vdl').showModal()}
let EW=null;
const FLB={name:'Họ và tên',mnv:'Mã NV',gt:'Giới tính',dob:'Ngày sinh',sdt:'Số điện thoại',cccd:'CCCD',thon:'Thôn/Xóm',xa:'Xã/Phường',tinh:'Tỉnh/TP (hoặc địa chỉ hộ khẩu đầy đủ)',ktx:'KTX',day:'Dãy',room:'Phòng',bed:'Giường',unit:'Đơn vị',td:'Tiểu đoàn',date:'Ngày vào KTX',out:'Ngày ra KTX',leader:'Họ tên tổ trưởng',lsdt:'SĐT tổ trưởng'};
const SEC=[['Thông tin cá nhân','users',[['name','s2'],['mnv'],['gt'],['dob'],['sdt'],['cccd'],['thon'],['xa'],['tinh','s2']]],['Thông tin KTX','bld',[['ktx'],['day'],['room'],['bed'],['unit'],['td'],['date'],['out']]],['Tổ trưởng','id',[['leader'],['lsdt']]]];
function edit(w){if(w&&!can('editw',w)){alert('Bạn không có quyền sửa hồ sơ ngoài phạm vi được phân công.');return}if(!w&&!can('add')){alert('Bạn không có quyền thêm công nhân.');return}EW=w||null;$('dt').textContent=w?'Sửa công nhân':'Thêm công nhân';$('dsub').textContent=w?w.name:'Điền thông tin rồi bấm Lưu';
 const fld=([f,c])=>{const v=w?(w[f]||''):(f=='date'?ldy():''),t=(f=='date'||f=='dob'||f=='out')?'type="date"':'';
  if(f=='gt'){const g=gtN(v);return `<label class="${c||''}">${FLB[f]}<select id="f_gt">${['','Nam','Nữ'].map(o=>`<option value="${o}" ${o==g?'selected':''}>${o||'— chọn —'}</option>`).join('')}</select></label>`}
  return `<label class="${c||''}">${FLB[f]}<input id="f_${f}" value="${esc(v)}" ${t} ${f=='sdt'?'placeholder="0xxxxxxxxx" inputmode="tel"':f=='cccd'?'placeholder="12 chữ số" inputmode="numeric"':''}></label>`};
 $('df').innerHTML=SEC.map(([t,ic,fs])=>`<div class="eb2"><div class="es">${ico(ic)}${t}</div><div class="eg">${fs.map(fld).join('')}</div></div>`).join('');$('dlg').showModal()}
$('dx').onclick=()=>$('dlg').close();
$('dc').onclick=()=>$('dlg').close();
$('ds').onclick=async()=>{const o={};F.forEach(([f])=>o[f]=$('f_'+f).value.trim());if(!o.name){alert('Hãy nhập họ và tên công nhân.');$('f_name').focus();return}o.sdt=o.sdt.replace(/\D/g,'');o.cccd=o.cccd.replace(/\D/g,'');if(!EW||!(EW.thon||EW.xa))autoSplit(o);normW(o);
 if(ME.role!=='admin'&&(!inScope(o)||(EW&&!inScope(EW)))){alert('Không được thêm/sửa công nhân ngoài KTX/Dãy được phân quyền.');return}
 if(EW){const dv=F.filter(([f])=>(EW[f]||'')!==o[f]);if(!dv.length){$('dlg').close();alert('Không có thay đổi nào để lưu.');return}
  const fm=(f,v)=>(f=='dob'||f=='date'||f=='out')?(vn(v)||'trống'):(v||'trống'),ln=dv.slice(0,8).map(([f])=>`• ${FLB[f]}: ${fm(f,EW[f]||'')} → ${fm(f,o[f])}`).join('\n')+(dv.length>8?`\n… và ${dv.length-8} thay đổi khác`:'');
  if(!await ask(`Bạn có chắc muốn lưu thay đổi cho "${EW.name}"?\n${ln}`,{title:'Xác nhận sửa',ok:'Lưu thay đổi',cls:''}))return;
  Object.assign(EW,o);add('UPDATE','Cập nhật công nhân: '+o.name);sv();$('dlg').close();all();alert(`Đã cập nhật thông tin công nhân "${o.name}".`)}
 else{o.id='w'+Date.now()+Math.random().toString(36).slice(2,6);W.unshift(o);add('CREATE','Thêm công nhân: '+o.name);sv();$('dlg').close();all();alert(`Đã thêm công nhân "${o.name}".`)}};

function logp(){$('log').innerHTML=`<div class="card"><div class="mut">${LOG.length} bản ghi gần nhất (lưu trên trình duyệt này)</div><div class="wrap"><table><tr><th>Thời gian</th><th>Hành động</th><th>Chi tiết</th></tr>${LOG.slice(0,200).map(l=>`<tr><td>${esc(l.t)}</td><td><span class="tag">${l.a}</span></td><td>${esc(l.d)}</td></tr>`).join('')}</table></div></div>`}

$('fx').onchange=async e=>{if(!can('import')){alert('Bạn không có quyền Import Excel.');e.target.value='';return}const f=e.target.files[0];if(!f)return;ASN=0;try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true}),out=[];
 wb.SheetNames.forEach(sn=>{if(/so do|csvc|dieu khien/.test(sa(sn)))return;const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:''});let h=-1,m={};
  for(let i=0;i<Math.min(8,rows.length);i++){const t={};rows[i].forEach((c,j)=>{const k=sa(c);MAP.forEach(([x,re])=>{if(!(x in t)&&k&&re.test(k))t[x]=j})});if('name' in t&&Object.keys(t).length>=3){h=i;m=t;break}}
  if(h<0)return;rows.slice(h+1).forEach((r,i)=>{const o={id:'w'+Date.now()+'_'+out.length};MAP.forEach(([x])=>{let v=x in m?r[m[x]]:'';o[x]=(x=='date'||x=='dob'||x=='out')?iso(v):String(v==null?'':v).trim()});if(!o.name)return;
   o.mnv=o.mnv.replace(/\.0$/,'');if(/^cho ma$/.test(sa(o.mnv)))o.mnv='';{const g=sa(o.gt);o.gt=/^nu/.test(g)?'Nữ':/^nam/.test(g)?'Nam':o.gt}{const st=('tt' in m)?sa(o.tt):'';o.tt='';if(/tam vang/.test(st)){o.tv={from:ldy(),to:'',why:'',reg:/da dang ky/.test(st)&&!/chua dang ky/.test(st)?ldy():''}}else if(/^da dang ky/.test(st))o.tt=ldy()}o.room=o.room.replace(/\.0$/,'');o.sdt=o.sdt.replace(/\D/g,'');o.cccd=o.cccd.replace(/\D/g,'');if(!('day' in m)||!o.day){o.day=sn;o._nd=1}if(o.day&&/^\d+$/.test(o.day))o.day='Dãy '+o.day;if(o.ktx&&/^\d+$/.test(o.ktx))o.ktx='KTX '+o.ktx;autoSplit(o);normW(o);out.push(o)})});
 if(!out.length){alert('Không nhận ra tiêu đề. Cần dòng tiêu đề có cột Họ và tên cùng ít nhất hai cột khác.');return}
 const mode=$('imode').value;
 if(!W.length||mode=='replace'){if(W.length&&!await ask(`Thay thế toàn bộ ${W.length} công nhân hiện có bằng ${out.length} dòng từ file?`,{title:'Thay thế danh sách',ok:'Thay thế'})){e.target.value='';return}
  out.forEach(o=>delete o._nd);W=out;add('IMPORT','Import (thay thế) '+out.length+' công nhân từ '+f.name);alert(`Đã nạp ${out.length} công nhân.`)}
 else{const ix={c:{},m:{}},ok7=v=>/^\d{7}$/.test(String(v||''));W.forEach(w=>{if(w.cccd)ix.c[w.cccd]=w;if(ok7(w.mnv))ix.m[w.mnv]=w});let up=0,nw=0;
  out.forEach(o=>{const w=(o.cccd&&ix.c[o.cccd])||(ok7(o.mnv)&&ix.m[o.mnv]);
   if(w){Object.keys(o).forEach(k=>{if(k=='id'||k=='tt'||k=='tv'||k[0]=='_'||(k=='day'&&o._nd))return;if(o[k]!==''&&o[k]!==undefined)w[k]=o[k]});if(o.tt&&!w.tt)w.tt=o.tt;if(o.tv&&!w.tv)w.tv=o.tv;up++}
   else{delete o._nd;W.push(o);if(o.cccd)ix.c[o.cccd]=o;if(ok7(o.mnv))ix.m[o.mnv]=o;nw++}});
  add('IMPORT',`Import (cập nhật) từ ${f.name}: ${up} người cập nhật, ${nw} người thêm mới`);alert(`Đã cập nhật ${up} công nhân và thêm mới ${nw} công nhân.`)}
 sel.clear();sv();all();if(ASN)alert('Đã tự động tách địa chỉ cho '+ASN+' công nhân thành Thôn/Xóm, Xã/Phường, Tỉnh/TP.')}catch(x){alert('Không đọc được file: '+x.message)}e.target.value=''};

function dlBrowser(name,data,type){
 try{
 const blob=data instanceof Blob?data:new Blob([data],{type:type||'application/octet-stream'});
 const ordinary=()=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)};
 if(typeof window.showSaveFilePicker==='function' && window.isSecureContext){
   const ext=(name.match(/\.[a-z0-9]+$/i)||[''])[0].toLowerCase();
   const mime=type||({'xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.pdf':'application/pdf'}[ext]||'application/octet-stream');
   // Hien dialog ngay trong thao tac nhan nut. Ghi file bat dong bo, khong cham vao du lieu cu.
   window.showSaveFilePicker({suggestedName:name}).then(async handle=>{try{const writable=await handle.createWritable();await writable.write(blob);await writable.close()}catch(err){alert('Khong luu duoc file: '+(err.message||err))}}).catch(err=>{if(err&&err.name==='AbortError')return;ordinary()});
 }else ordinary();
 return true;
 }catch(e){alert('Khong the tai file: '+(e.message||e));return false}
}
async function save(aoa,name,sheet){try{const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),sheet);const data=XLSX.write(wb,{type:'array',bookType:'xlsx'});let ok=false;if(window.claude&&claude.use)try{const dl=await claude.use('downloads');if(dl){await dl.save({filename:name,data});ok=true}}catch(e){if(e&&e.code=='declined')return}if(!ok&&!dlBrowser(name,data,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))throw new Error('Trình duyệt không cho phép tải file.')}catch(e){alert('Không lưu được: '+(e&&e.message||e))}}
const gtN=g=>isNu(g)?'Nữ':isNam(g)?'Nam':(g||'');
const ttSt=w=>w.tv?(w.tv.reg?'Đã đăng ký tạm vắng':'Tạm vắng (chưa đăng ký)'):(w.tt?'Đã đăng ký tạm trú':'Chưa đăng ký');
async function xlsForm(L,tpl){try{if(!L.length&&!tpl){alert('Không có công nhân nào để xuất.');return}
 if(!window.ExcelJS){alert('Không tải được thư viện tạo Excel (cần kết nối mạng).');return}
 const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Danh sách');
 ws.addRow(['STT','Họ và Tên','Mã NV','Tiểu Đoàn','Đơn vị','KTX','Dãy','Phòng','Giới tính','SĐT','CCCD','Ngày sinh','Thôn/Xóm','Xã/Phường','Tỉnh/TP','Ngày Vào KTX','Ngày Ra KTX','Số Ngày Lưu Trú','Tổ Trưởng','SĐT Tổ Trưởng','Trạng thái tạm trú, Tạm vắng']);
 L.forEach((w,i)=>{const n=w.out&&w.date?Math.max(0,Math.floor((new Date(w.out)-new Date(w.date))/864e5)):since(w);ws.addRow([i+1,w.name,w.mnv||'Chờ mã',w.td||'',w.unit||'',K(w),D(w),R(w)||'',gtN(w.gt),w.sdt||'',w.cccd||'',vn(w.dob),...addr3(w),vn(w.date),vn(w.out),n==null?'':n,w.leader||'',w.lsdt||'',ttSt(w)])});
 [5,22.8,9,12.1,14.9,5.9,5.6,6.7,7.4,12,14.1,18.4,20,18,16,14.4,12.3,15.7,21,14.1,25.6].forEach((x,i)=>ws.getColumn(i+1).width=x);
 ws.getRow(1).height=15.75;ws.eachRow((r,ri)=>r.eachCell(c=>{c.font={name:'Arial',size:ri==1?12:11,bold:ri==1};if(ri==1)c.alignment={horizontal:'center',vertical:'middle'}}));
 const filename=tpl?'Mau_Danh_Sach_KTX.xlsx':`KTX_CongNhan_${ldy().split('-').reverse().join('-')}.xlsx`,data=await wb.xlsx.writeBuffer();let ok=false;
 if(window.claude&&claude.use)try{const dl=await claude.use('downloads');if(dl){await dl.save({filename,data});ok=true}}catch(e){if(e&&e.code=='declined')return}
 if(!ok&&!dlBrowser(filename,data,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))throw new Error('Trình duyệt không cho phép tải file.');}
 catch(e){if(!e||e.code!='declined')alert('Không lưu được: '+(e&&e.message||e))}}
const currentExportList=()=>{if(sel.size)return W.filter(w=>sel.has(w.id));if(page=='home')return vis();if(page=='work'&&document.getElementById('q'))return flt();return W.filter(w=>can('view',w))};
if($('xw'))$('xw').onclick=()=>xlsForm(currentExportList());
if($('xt'))$('xt').onclick=()=>xlsForm([],true);
const xlsRooms=()=>{const rs=rooms(vis()).sort((a,b)=>num(a.ktx+a.day+a.room,b.ktx+b.day+b.room));save([['KTX','Dãy','Phòng','Sĩ số','Nam','Nữ','Định mức','Còn trống'],...rs.map(r=>[r.ktx,r.day,r.room,r.n,r.m,r.f,CAP,Math.max(0,CAP-r.n)])],'bao-cao-ngay-'+ldy()+'.xlsx','Sĩ số phòng')};
function demo(){const ns='Nguyễn,Trần,Lê,Phạm,Võ,Huỳnh,Đặng,Bùi'.split(','),mid='Văn,Minh,Hoàng,Thị,Ngọc,Quốc'.split(','),fn='Hùng,Nghĩa,Tuấn,Lan,Sơn,Phúc,Hạnh,Dũng'.split(','),us=['XD','XD','XD','ME','Vin Alpha','Trắc đạc'],tds=['TD 8','TD 11.1','TD 06.5','TD 111','TD ME 01'];
 W=[];for(let k=1;k<=2;k++)for(let d=1;d<=3;d++)for(let r=1;r<=8;r++){const f=(k==1&&d==3&&r<=2)||(k==2&&d==2&&r==1),n=r==3?22:r==5?15:20;for(let i=0;i<n;i++){const j=W.length;W.push({id:'d'+j,name:`${ns[j%8]} ${mid[(j*3)%6]} ${fn[(j*5)%8]}`,mnv:j%9?String(4200000+j):'',gt:f?'Nữ':'Nam',unit:us[j%6],td:tds[j%5],ktx:'KTX '+k,day:'Dãy '+d,room:String(r),bed:String(i+1),sdt:j%11?'03'+String(10000000+j*37).slice(0,8):'',cccd:j%13?'079'+String(100000000+j*91).slice(0,9):'',tinh:['Hà Tĩnh','Cần Thơ','Lâm Đồng','Tây Ninh'][j%4],leader:'',date:new Date(Date.now()-((j*7)%60)*864e5).toISOString().slice(0,10)})}}sv();all()}

// ---- Tạm trú tạm vắng
let TS={tab:'tt',q:'',f:'',sel:new Set()};
const tdy=()=>ldy(),vn=d=>d?String(d).slice(0,10).split('-').reverse().join('/'):'';
const isAwayOn=(w,day=tdy())=>{const v=w&&w.tv;if(!v||!v.from)return false;const a=String(v.from).slice(0,10),b=String(v.to||'').slice(0,10);return a<=day&&(!b||b>=day)};
function tttv(){const dk=W.filter(w=>w.tt).length,aw=W.filter(w=>isAwayOn(w)).length,tab=TS.tab;
 const fo=tab=='tt'?[['','Tất cả'],['chua','Chưa khai báo'],['co','Đã khai báo']]:[['','Tất cả'],['away','Đang tạm vắng'],['home','Không tạm vắng']];
 $('t6').innerHTML=`<div class="g4"><div class="card"><div class="lbl">TỔNG CÔNG NHÂN</div><div class="kpi">${W.length.toLocaleString('vi-VN')}</div></div><div class="card"><div class="lbl">ĐÃ KHAI BÁO TẠM TRÚ</div><div class="kpi gr">${dk.toLocaleString('vi-VN')}</div></div><div class="card"><div class="lbl">CHƯA KHAI BÁO</div><div class="kpi ${W.length-dk?'am':'gr'}">${(W.length-dk).toLocaleString('vi-VN')}</div></div><div class="card"><div class="lbl">ĐANG TẠM VẮNG</div><div class="kpi">${aw}</div></div></div>
 <div class="card"><div class="row" style="margin-bottom:12px"><button class="btn ${tab=='tt'?'':'s'}" data-tb="tt">Tạm trú</button><button class="btn ${tab=='tv'?'':'s'}" data-tb="tv">Tạm vắng</button><span class="mut" id="tn" style="margin-left:auto"></span></div>
 <div class="row"><input id="tq" placeholder="Tìm tên, mã NV, CCCD, SĐT..." value="${esc(TS.q)}" style="flex:1;min-width:200px"><select id="tf">${fo.map(([v,l])=>`<option value="${v}" ${v==TS.f?'selected':''}>${l}</option>`).join('')}</select></div>
 <div class="row" style="margin-top:10px">${tab=='tt'?'<button class="btn g" id="tA">Đánh dấu đã khai báo</button><button class="btn s" id="tB">Bỏ đánh dấu</button>':`<label class="mut">Từ ngày <input type="date" id="v1" value="${tdy()}"></label><label class="mut">Đến ngày <input type="date" id="v2"></label><input id="v3" placeholder="Lý do / nơi đến" style="min-width:180px"><button class="btn g" id="tC">Ghi nhận tạm vắng</button><button class="btn s" id="tD">Đã quay lại</button>`}<button class="btn" id="tN">${tab=='tt'?'Xuất DS chưa khai báo tạm trú':'Xuất DS tạm vắng chưa đăng ký'}</button><button class="btn s" id="tX">Xuất người đã chọn</button><label class="btn s" style="cursor:pointer;margin:0">Cập nhật từ file đã đăng ký<input type="file" id="tU" accept=".xlsx,.xls,.csv" multiple hidden></label></div><div id="tr" style="margin-top:10px"></div><div id="tl"></div></div>`;
 document.querySelectorAll('[data-tb]').forEach(b=>b.onclick=()=>{TS.tab=b.dataset.tb;TS.f='';TS.sel.clear();tttv()});
 $('tq').oninput=e=>{TS.q=e.target.value;tl()};$('tf').onchange=e=>{TS.f=e.target.value;tl()};
 const done=m=>{TS.sel.clear();sv();tttv()},ids=()=>W.filter(w=>TS.sel.has(w.id));
 const need=()=>{if(!TS.sel.size){alert('Hãy tick chọn ít nhất một công nhân.');return false}return true};
 if(tab=='tt'){$('tA').onclick=()=>{if(!need())return;ids().forEach(w=>w.tt=tdy());add('UPDATE','Khai báo tạm trú cho '+TS.sel.size+' công nhân');alert(`Đã đánh dấu ${TS.sel.size} công nhân đã khai báo tạm trú.`);done()};
  $('tB').onclick=()=>{if(!need())return;ids().forEach(w=>w.tt='');add('UPDATE','Bỏ đánh dấu tạm trú '+TS.sel.size+' công nhân');alert(`Đã bỏ đánh dấu tạm trú cho ${TS.sel.size} công nhân.`);done()}}
 else{$('tC').onclick=()=>{if(!need())return;const a=$('v1').value,b=$('v2').value;if(!a){alert('Hãy chọn ngày bắt đầu tạm vắng.');return}if(b&&b<a){alert('Ngày kết thúc phải sau ngày bắt đầu.');return}ids().forEach(w=>w.tv={from:a,to:b,why:$('v3').value.trim()});add('UPDATE','Ghi nhận tạm vắng '+TS.sel.size+' công nhân từ '+vn(a));alert(`Đã ghi nhận tạm vắng cho ${TS.sel.size} công nhân.`);done()};
  $('tD').onclick=()=>{if(!need())return;ids().forEach(w=>w.tv=null);add('UPDATE','Công nhân quay lại KTX: '+TS.sel.size+' người');alert(`Đã cập nhật ${TS.sel.size} công nhân quay lại KTX.`);done()}}
 $('tN').onclick=async()=>{const L=tab=='tt'?W.filter(w=>!w.tt):W.filter(w=>isAwayOn(w)&&w.tv&&!w.tv.reg);if(!L.length){alert(tab=='tt'?'Không còn công nhân nào chưa khai báo tạm trú.':'Không có công nhân tạm vắng nào đang chờ đăng ký.');return}await exportTTTV(L,tab,ldy())};
 $('tX').onclick=async()=>{if(!TS.sel.size){alert('Bạn chưa chọn công nhân nào. Hãy tick chọn ít nhất 1 người cần xuất.');return}const L=W.filter(w=>TS.sel.has(w.id));if(!L.length){alert('Không tìm thấy công nhân đã chọn để xuất.');return}await exportTTTV(L,tab,ldy())};
 $('tU').onchange=async e=>{const fs=[...e.target.files];e.target.value='';if(fs.length)await importTTTV(fs,tab)};
 tl()}
let ASN=0;
// Tự động tách địa chỉ (Thôn/Xóm, Xã/Phường, Huyện, Tỉnh/TP) khi dữ liệu chưa được tách; giữ địa chỉ gốc ở trường dc
function lev1(a,b){if(Math.abs(a.length-b.length)>1)return false;let i=0;while(i<a.length&&i<b.length&&a[i]==b[i])i++;if(a.length==b.length)return a.slice(i+1)==b.slice(i+1);return a.length>b.length?a.slice(i+1)==b.slice(i):b.slice(i+1)==a.slice(i)}
function fz(s,PK){const k=sa(s).replace(/^(thanh pho|tinh|tp) /,'');if(k.length<6)return null;for(const x in PK)if(x.length>=6&&lev1(k,x))return PK[x];return null}
function autoSplit(o){try{return autoSplit0(o)}catch(e){return false}}
function autoSplit0(o){const A=window.ADDR;if(!A)return false;const{split,HAM,PK}=A,prov=s=>A.prov(s)||fz(s,PK);const raw=String(o.tinh||'').trim();if(!raw||o.thon||o.xa)return false;let r=null;
 if(raw.includes(',')){let p=raw.split(',').map(s=>s.trim()).filter(Boolean);if(p.length<2)return false;if(!prov(p[p.length-1])){const w=p[p.length-1].split(/\s+/);let f=null;for(let n=Math.min(3,w.length-1);n>=1;n--){const pv=prov(w.slice(-n).join(' '));if(pv){f=[w.slice(0,-n).join(' '),pv];break}}if(!f)return false;p=[...p.slice(0,-1),f[0],f[1]]}{const lp=prov(p[p.length-1]);if(lp)p[p.length-1]=lp}r=split(p.join(', '))}
 else if(!prov(raw)&&/\s/.test(raw)){const w=raw.split(/\s+/);for(let n=Math.min(3,w.length-1);n>=1;n--){const p=prov(w.slice(-n).join(' '));if(p){const rest=w.slice(0,-n).join(' ');r={tinh:p,thon:'',xa:'',huyen:''};if(HAM.test(sa(rest)))r.thon=rest;else r.xa=rest;break}}}
 if(r){if(r.huyen&&/^(xa|phuong|thi tran|tt) /.test(sa(r.huyen))){r.thon=[r.thon,r.xa].filter(Boolean).join(', ');r.xa=r.huyen;r.huyen=''}if(r.xa&&/^(\d|duong |so |hem |ngo |kp |khu |to )/.test(sa(r.xa))){r.thon=[r.thon,r.xa].filter(Boolean).join(', ');r.xa=r.huyen;r.huyen=''}}
 if(!r||!(r.thon||r.xa||r.huyen))return false;
 o.dc=raw;o.thon=r.thon||'';o.xa=r.xa||'';o.huyen=r.huyen||'';o.tinh=r.tinh||raw;ASN++;return true}
// ---- Chuẩn hóa dữ liệu: viết hoa chữ đầu, KTX/Dãy/Phòng về dạng mặc định, SĐT/CCCD tự thêm số 0
const VNW={khong:0,mot:1,hai:2,ba:3,bon:4,tu:4,nam:5,lam:5,sau:6,bay:7,tam:8,chin:9,muoi:10};
function vnNum(s){const w=String(s).split(' ').filter(Boolean),u=x=>(x in VNW&&VNW[x]<10)?VNW[x]:null;if(!w.length||w.length>3)return null;
 if(w.length==1)return w[0] in VNW?VNW[w[0]]:null;
 if(w[0]=='muoi'&&w.length==2){const b=u(w[1]);return b==null?null:10+b}
 if(w[1]=='muoi'){const a=u(w[0]);if(a==null||a<2)return null;if(w.length==2)return a*10;const b=u(w[2]);return b==null?null:a*10+b}
 return null}
const numOf=r=>/^\d+$/.test(r)?parseInt(r,10):vnNum(r);
const capS=s=>String(s).replace(/(^|[.!?]\s+)(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase('vi'));
const nameFix=s=>{s=String(s).replace(/\s+/g,' ').trim();if(s==s.toUpperCase()||s==s.toLowerCase())s=s.toLocaleLowerCase('vi');return s.split(' ').map(x=>x.charAt(0).toLocaleUpperCase('vi')+x.slice(1)).join(' ')};
const addrFix=s=>String(s).split(',').map(x=>{x=x.replace(/\s+/g,' ').trim();if(x&&x==x.toLowerCase())x=x.split(' ').map(t=>t.charAt(0).toLocaleUpperCase('vi')+t.slice(1)).join(' ');return capS(x)}).filter(Boolean).join(', ');
function normKtx(v){const m=sa(v).match(/^(?:ktx|ky tuc xa|khu)?\s*(.+)$/),n=m?numOf(m[1]):null;return n>0?'KTX '+n:v}
function normDay(v){const m=sa(v).match(/^(?:day|d)?\s*(.+)$/),n=m?numOf(m[1]):null;return n>0?'Dãy '+n:v}
function normRoom(v){const m=sa(v).match(/^(?:phong|p)?\s*(.+)$/);if(!m)return v;const r=m[1].replace(/\s+/g,'');if(/^\d+$/.test(r))return parseInt(r,10)>0?String(parseInt(r,10)):v;const n=vnNum(m[1]);if(n>0)return String(n);return /^\d+[a-z]+$/.test(r)?r.replace(/^0+(?=\d)/,'').toUpperCase():v}
const normPhone=v=>{let s=String(v==null?'':v).replace(/\D/g,'');if(s.startsWith('84')&&s.length==11)s='0'+s.slice(2);else if(s.length==9)s='0'+s;return s};
const normCccd=v=>{const s=String(v==null?'':v).replace(/\D/g,'');return s.length==11?'0'+s:s};
function normW(w){let n=0;const g=k=>w[k]==null?'':String(w[k]).trim(),set=(k,v)=>{if(v!==w[k]){w[k]=v;n++}};
 if(g('name'))set('name',nameFix(g('name')));if(g('leader'))set('leader',nameFix(g('leader')));
 ['unit','td'].forEach(k=>{if(g(k))set(k,capS(g(k).replace(/\s+/g,' ')))});
 ['thon','xa','huyen','tinh'].forEach(k=>{if(g(k))set(k,addrFix(g(k)))});
 if(g('ktx'))set('ktx',normKtx(g('ktx')));if(g('day'))set('day',normDay(g('day')));if(g('room'))set('room',normRoom(g('room')));
 if(g('sdt'))set('sdt',normPhone(g('sdt')));if(g('lsdt'))set('lsdt',normPhone(g('lsdt')));if(g('cccd'))set('cccd',normCccd(g('cccd')));
 if(g('gt')){const x=sa(g('gt'));set('gt',/^nu/.test(x)?'Nữ':/^nam/.test(x)?'Nam':capS(g('gt')))}
 return n}
async function normAll(){const L=sel.size?W.filter(w=>sel.has(w.id)):W;const c=L.filter(w=>normW({...w})>0);
 if(!c.length){alert('Dữ liệu đã đúng chuẩn, không có gì cần sửa.');return}
 if(!await ask(`Chuẩn hóa ${c.length.toLocaleString('vi-VN')} công nhân${sel.size?' đã chọn':''}?\nViết hoa chữ cái đầu, KTX/Dãy/Phòng về dạng mặc định, SĐT và CCCD tự thêm số 0.`,{title:'Chuẩn hóa dữ liệu',ok:'Chuẩn hóa',cls:''}))return;
 let n=0;c.forEach(w=>{if(normW(w)>0)n++});add('UPDATE','Chuẩn hóa dữ liệu cho '+n+' công nhân');sv();all();alert(`Đã chuẩn hóa ${n} công nhân.`)}
// Tách địa chỉ hàng loạt cho toàn bộ dữ liệu đang lưu (hoặc các công nhân đang tick chọn)
async function bulkSplit(){const L=sel.size?W.filter(w=>sel.has(w.id)):W;
 const c=L.filter(w=>{const t={tinh:w.tinh,thon:w.thon,xa:w.xa};const ok=autoSplit(t);ASN=0;return ok});
 if(!c.length){alert('Không có địa chỉ nào cần tách (tất cả đã được tách hoặc chỉ có tên tỉnh).');return}
 if(!await ask(`Tách địa chỉ cho ${c.length.toLocaleString('vi-VN')} công nhân${sel.size?' đã chọn':''} thành Thôn/Xóm, Xã/Phường, Tỉnh/TP?\nĐịa chỉ gốc vẫn được giữ lại.`,{title:'Tách địa chỉ hàng loạt',ok:'Tách địa chỉ',cls:''}))return;
 ASN=0;c.forEach(w=>autoSplit(w));const n=ASN;ASN=0;add('UPDATE','Tách địa chỉ hàng loạt cho '+n+' công nhân');sv();all();alert(`Đã tách địa chỉ cho ${n} công nhân.`)}
const addr3=w=>{if(w.thon||w.xa)return [w.thon||'',w.xa||'',w.tinh2||w.tinh||''];const c={tinh:w.tinh};if(autoSplit(c)){ASN--;return [c.thon,c.xa,c.tinh]}
 const g=(w.tinh||'').split(',').map(x=>x.trim()).filter(Boolean),[xa,tinh]=addrXT(w);return [g.length>=4?g.slice(0,g.length-3).join(', '):'',xa,tinh]};
const addrXT=w=>{const g=(w.tinh||'').split(',').map(x=>x.trim()).filter(Boolean);return [w.xa||(g.length>=3?g[g.length-3]:g.length==2?g[0]:''),w.tinh2||(g.length?g[g.length-1]:'')]};
async function exportTTTV(L,kind,day){try{
 if(!window.ExcelJS){alert('Không tải được thư viện tạo Excel (cần kết nối mạng).');return}
 const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Sheet1'),mo=+day.slice(5,7)||new Date().getMonth()+1,bd={style:'thin'},bs={top:bd,left:bd,bottom:bd,right:bd};
 [6.5,7.875,22,7.25,10.625,11.625,23,15.5,12.25,14.875].forEach((w,i)=>ws.getColumn(i+1).width=w);
 ws.mergeCells('A1:J3');const t=ws.getCell('A1');t.value=`DANH SÁCH CN ĐĂNG KÝ ${kind=='tt'?'TẠM TRÚ':'TẠM VẮNG'} THÁNG ${mo} TẠI KTX HÓC MÔN`;t.font={name:'Arial',size:14,bold:true};t.alignment={horizontal:'center',vertical:'middle'};
 ['STT','MNV','Họ và tên','Giới tính','Năm sinh','Số điện thoại','Xã','Tỉnh/TP','Số CCCD','Ngày đăng ký'].forEach((h,i)=>{ws.mergeCells(4,i+1,5,i+1);const c=ws.getCell(4,i+1);c.value=h;c.font={name:'Arial',size:11,bold:true};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFECECEC'}};c.border=bs;ws.getCell(5,i+1).border=bs});
 L.forEach((w,i)=>{const [xa,tinh]=addrXT(w),d=day.split('-').map(Number),r=ws.getRow(6+i);
  [i+1,w.mnv||'',w.name,isNu(w.gt)?'Nữ':isNam(w.gt)?'Nam':(w.gt||''),vn(w.dob),w.sdt||'',xa,tinh,w.cccd||'',new Date(Date.UTC(d[0],d[1]-1,d[2]))].forEach((v,j)=>{const c=r.getCell(j+1);c.value=v;c.font={name:'Arial',size:10};c.alignment={horizontal:'left',vertical:'middle'};c.border=bs;if(j==1||j==5||j==8)c.numFmt='@';if(j==9)c.numFmt='dd/mm/yyyy'})});
 const data=await wb.xlsx.writeBuffer(),filename=`${kind=='tt'?'dang-ky-tam-tru':'dang-ky-tam-vang'}-${day}.xlsx`;
 let ok=false;
 if(window.claude&&claude.use)try{const dl=await claude.use('downloads');if(dl){await dl.save({filename,data});ok=true}}catch(e){if(e&&e.code=='declined')return}
 if(!ok&&!dlBrowser(filename,data,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))throw new Error('Trình duyệt không cho phép tải file.');
}catch(e){alert('Không lưu được: '+(e&&e.message||e))}}
const dloc=v=>{if(v instanceof Date){if(isNaN(v))return '';const d=new Date(v.getTime()+12*36e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}return iso(v)};
async function importTTTV(files,kind){const found=[],bad=[],S=v=>String(v==null?'':v).trim();
 for(const f of files){try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true});let n0=found.length;
  wb.SheetNames.forEach(sn=>{const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:''});let h=-1,m={};
   for(let i=0;i<Math.min(15,rows.length);i++){const t={};rows[i].forEach((c,j)=>{const k=sa(c);if(!('name' in t)&&/^(ho va ten|ho ten)$/.test(k))t.name=j;else if(/^(mnv|ma nv|ma nhan vien)$/.test(k))t.mnv=j;else if(/^(so dien thoai|sdt)$/.test(k))t.sdt=j;else if(/cccd|can cuoc/.test(k))t.cccd=j;else if(/^ngay dang ky/.test(k))t.date=j});if('name' in t&&(t.cccd!=null||t.mnv!=null)){h=i;m=t;break}}
   if(h<0)return;rows.slice(h+1).forEach(r=>{const g=x=>x in m?r[m[x]]:'',name=S(g('name'));if(!name)return;found.push({name,mnv:S(g('mnv')).replace(/\.0$/,''),cccd:S(g('cccd')).replace(/\D/g,''),sdt:S(g('sdt')).replace(/\D/g,''),date:dloc(g('date'))})})});
  if(found.length==n0)bad.push(f.name)}catch(e){bad.push(f.name)}}
 if(!found.length){alert('Không nhận ra dữ liệu trong file. Cần dòng tiêu đề có cột "Họ và tên" và "Số CCCD" hoặc "MNV".'+(bad.length?'\nFile lỗi: '+bad.join(', '):''));return}
 const ix={c:{},m:{},p:{},n:{}},put=(o,k,w)=>{if(k)(o[k]=o[k]||[]).push(w)},pad=(v,n)=>v.length==n-1?'0'+v:v;
 W.forEach(w=>{put(ix.c,pad(w.cccd||'',12),w);if(/^\d{7}$/.test(S(w.mnv)))put(ix.m,S(w.mnv),w);put(ix.p,pad(w.sdt||'',10),w);put(ix.n,sa(w.name),w)});
 const hit=[],miss=[],seen=new Set();
 found.forEach(r=>{let w=(ix.c[pad(r.cccd,12)]||[])[0]||(/^\d{7}$/.test(r.mnv)&&(ix.m[r.mnv]||[])[0])||(r.sdt&&(ix.p[pad(r.sdt,10)]||[])[0]);if(!w){const a=ix.n[sa(r.name)];if(a&&a.length==1)w=a[0]}
  if(w&&!seen.has(w.id)){seen.add(w.id);hit.push([w,r])}else if(!w)miss.push(r)});
 const lb=kind=='tt'?'đã khai báo tạm trú':'đã đăng ký tạm vắng';
 if(!await ask(`File có ${found.length} dòng: ${hit.length} người khớp với danh sách, ${miss.length} dòng không khớp.\nCập nhật ${hit.length} công nhân sang trạng thái "${lb}"?`,{title:'Cập nhật từ file',ok:'Cập nhật',cls:''}))return;
 hit.forEach(([w,r])=>{if(kind=='tt')w.tt=r.date||tdy();else{const o=w.tv||{};w.tv={from:o.from||r.date||tdy(),to:o.to||'',why:o.why||'Đã đăng ký với công an',reg:r.date||tdy()}}});
 add('UPDATE',`Cập nhật ${kind=='tt'?'tạm trú':'tạm vắng'} từ file công an (${files.map(f=>f.name).join(', ')}): ${hit.length} khớp, ${miss.length} không khớp`);sv();TS.sel.clear();tttv();
 $('tr').innerHTML=`<div class="card" style="margin:0 0 10px"><b class="ok">Đã cập nhật ${hit.length} công nhân (${lb}).</b>${bad.length?` <span class="warn">File không đọc được: ${bad.map(esc).join(', ')}.</span>`:''}${miss.length?`<div class="warn" style="margin-top:8px">${miss.length} dòng không khớp công nhân nào trong danh sách (kiểm tra CCCD/MNV):</div><div class="wrap" style="max-height:200px"><table><tr><th>Họ và tên</th><th>MNV</th><th>CCCD</th></tr>${miss.slice(0,100).map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.mnv)}</td><td>${esc(r.cccd)}</td></tr>`).join('')}</table></div>`:''}</div>`}
function tfl(){const q=sa(TS.q),f=TS.f;return W.filter(w=>can('view',w)&&(!q||sa([w.name,w.mnv,w.cccd,w.sdt].join(' ')).includes(q))&&(!f||(f=='co'?!!w.tt:f=='chua'?!w.tt:f=='away'?isAwayOn(w):!isAwayOn(w))))}
let __resSort29={key:'name',asc:true};
function residenceSort29(key){if(__resSort29.key===key)__resSort29.asc=!__resSort29.asc;else __resSort29={key,asc:true};tl()}
function tl(){const L=tfl().sort((a,b)=>{let key=__resSort29.key,va=key==='reg'?(a.tt||a.tv?.reg||a.tv?.from||''):key==='xa'?addrXT(a)[0]:key==='tinh'?addrXT(a)[1]:a[key]||'',vb=key==='reg'?(b.tt||b.tv?.reg||b.tv?.from||''):key==='xa'?addrXT(b)[0]:key==='tinh'?addrXT(b)[1]:b[key]||'';return (String(va).localeCompare(String(vb),'vi',{numeric:true})||String(a.name).localeCompare(String(b.name),'vi'))*(__resSort29.asc?1:-1)}),sh=L.slice(0,200),tab=TS.tab;
 $('tl').innerHTML=`<div class="wrap"><table class="cmp"><colgroup><col style="width:3%"><col style="width:4%"><col style="width:7%"><col style="width:15%"><col style="width:6%"><col style="width:9%"><col style="width:10%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:9%"></colgroup><tr><th><input type="checkbox" id="ta" aria-label="Chọn tất cả"></th><th>STT</th><th class="res-sort29" data-rsort="mnv" title="Nhấn để sắp xếp">MNV ↕</th><th class="res-sort29" data-rsort="name" title="Nhấn để sắp xếp">Họ và tên ↕</th><th class="res-sort29" data-rsort="gt" title="Nhấn để sắp xếp">Giới tính ↕</th><th class="res-sort29" data-rsort="dob" title="Nhấn để sắp xếp">Năm sinh ↕</th><th class="res-sort29" data-rsort="sdt" title="Nhấn để sắp xếp">Số điện thoại ↕</th><th class="res-sort29" data-rsort="xa" title="Nhấn để sắp xếp">Xã ↕</th><th class="res-sort29" data-rsort="tinh" title="Nhấn để sắp xếp">Tỉnh/TP ↕</th><th class="res-sort29" data-rsort="cccd" title="Nhấn để sắp xếp">Số CCCD ↕</th><th class="res-sort29" data-rsort="reg" title="Nhấn để sắp xếp">Ngày đăng ký ↕</th></tr>${sh.map((w,i)=>{const [xa,tinh]=addrXT(w),d=String(tab=='tv'?(w.tv&&(w.tv.reg||w.tv.from)||''):(w.tt||'')).slice(0,10),tip=tab=='tv'&&w.tv?` title="${esc('Tạm vắng từ '+vn(w.tv.from)+(w.tv.to?' đến '+vn(w.tv.to):'')+(w.tv.why?': '+w.tv.why:''))}"`:'';return `<tr class="${isNu(w.gt)?'fm':''}"><td><input type="checkbox" class="tk" data-i="${w.id}" ${TS.sel.has(w.id)?'checked':''}></td><td>${i+1}</td><td>${esc(w.mnv)}</td><td><b>${esc(w.name)}</b></td><td>${gp(w.gt)}</td><td>${vn(w.dob)}</td><td>${esc(w.sdt)}</td><td>${esc(xa)}</td><td>${esc(tinh)}</td><td>${esc(w.cccd)}</td><td${tip}>${d?`<span class="pl ro">${vn(d)}</span>`:''}</td></tr>`}).join('')||'<tr><td colspan="11" class="mut">Không có dữ liệu. Hãy import danh sách công nhân trước.</td></tr>'}</table></div><div class="mut" style="margin-top:8px">${L.length.toLocaleString('vi-VN')} kết quả${L.length>200?' (hiển thị 200 dòng đầu, hãy lọc để thu hẹp)':''}</div>`;
 $('tl').querySelectorAll('[data-rsort]').forEach(h=>h.onclick=()=>residenceSort29(h.dataset.rsort));
 const un=()=>{$('tn').textContent=TS.sel.size?'Đã chọn '+TS.sel.size+' người':''};un();
 document.querySelectorAll('.tk').forEach(c=>c.onchange=()=>{c.checked?TS.sel.add(c.dataset.i):TS.sel.delete(c.dataset.i);un()});
 $('ta').onchange=e=>{L.forEach(w=>e.target.checked?TS.sel.add(w.id):TS.sel.delete(w.id));document.querySelectorAll('.tk').forEach(c=>c.checked=e.target.checked);un()}}
// ---- Báo cáo quân số ngày (Word)
const ldy=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const logDay=l=>{const m=(l.t||'').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);return l.day||(m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:'')};
const delCount=(k,day)=>{const isMove=x=>x&&((x.a=='DELETE'&&(x.k||x.reason||/^Chuyển .*khỏi danh sách/i.test(String(x.d||''))))||x.a=='RESTORE');const sm=a=>LOG.filter(x=>x.a==a&&isMove(x)&&(!k||x.k==k)&&(!day||logDay(x)==day)).reduce((t,x)=>t+(Number(x.n)||1),0);return Math.max(0,sm('DELETE')-sm('RESTORE'))};
const arcWhy=(k,day)=>{const c={};ARC.filter(a=>a.date==day&&(!k||K(a.w)==k)).forEach(a=>c[a.reason]=(c[a.reason]||0)+1);const t=Object.entries(c).map(([r,n])=>`${r} ${n}`).join(', ');return t};
function rpCalc(day){const g={};W.forEach(w=>(g[K(w)]=g[K(w)]||[]).push(w));
 return Object.keys(g).sort(num).map(k=>{const l=g[k],rs=rooms(l),nu=l.filter(w=>isNu(w.gt)).length;return{k,tot:l.length,nu,nam:l.length-nu,days:new Set(l.map(D)).size,rooms:nRoom(k,rs),cap:nRoom(k,rs)*CAP,inc:l.filter(w=>String(w.date||'').slice(0,10)==day).length,dec:delCount(k,day)}})}
function rpUnits(){const c={xd:0,cm:0,me:0,vin:0,td:0,kh:0};W.forEach(w=>{const m=sa(w.mnv);if(!m||/^cho ma/.test(m))c.cm++;else{const u=sa(w.unit);if(/^xd/.test(u))c.xd++;else if(/^me( |$)/.test(u))c.me++;else if(/vin/.test(u))c.vin++;else if(/trac/.test(u))c.td++;else c.kh++}});return c}
function openRp(){if(!W.length){alert('Chưa có dữ liệu công nhân.');return}
 const day=ldy(),ks=rpCalc(day);
 $('rpb').innerHTML=`<label class="fl">Ngày báo cáo <input type="date" id="rd0" value="${day}"></label>`+ks.map((x,i)=>`<div class="dy" style="margin:12px 0 0"><b>${esc(x.k)}</b> <span class="mut">· ${x.tot.toLocaleString('vi-VN')} CNCH · ${x.days} dãy · ${x.rooms} phòng</span><div class="fg" style="margin-top:8px"><label>Tổng tăng <input type="number" min="0" id="ri${i}" value="${x.inc}"></label><label>Tổng giảm <input type="number" min="0" id="rx${i}" value="${x.dec}"></label></div><label class="fl">Lý do giảm (${esc(x.k)}) <input id="rr${i}" value="${esc(arcWhy(x.k,day))}"></label></div>`).join('')+
 `<label class="fl">Lý do giảm (tổng) <input id="rrt" value="${esc(arcWhy('',day))}"></label><label class="fl">Tình hình ANTT <input id="ra" value="ANTT đảm bảo."></label><label class="fl">Tình hình điện nước <input id="re" value="Điện nước đảm bảo, hoạt động bình thường"></label>`;
 $('rd0').onchange=()=>{const d2=$('rd0').value||day;rpCalc(d2).forEach((x,i)=>{$('ri'+i).value=x.inc;$('rx'+i).value=x.dec;$('rr'+i).value=arcWhy(x.k,d2)});$('rrt').value=arcWhy('',d2)};
 $('rpd').showModal()}
async function saveDocx(lines,name){try{
 const x=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),NS='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"',H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',RL='http://schemas.openxmlformats.org/officeDocument/2006/relationships',PR='http://schemas.openxmlformats.org/package/2006/relationships',z=new JSZip();
 z.file('[Content_Types].xml',H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
 z.file('_rels/.rels',H+`<Relationships xmlns="${PR}"><Relationship Id="rId1" Type="${RL}/officeDocument" Target="word/document.xml"/></Relationships>`);
 z.file('word/_rels/document.xml.rels',H+`<Relationships xmlns="${PR}"><Relationship Id="rId1" Type="${RL}/styles" Target="styles.xml"/></Relationships>`);
 z.file('word/styles.xml',H+`<w:styles ${NS}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="278" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>`);
 z.file('word/document.xml',H+`<w:document ${NS}><w:body>${lines.map(t=>`<w:p><w:r><w:t xml:space="preserve">${x(t)}</w:t></w:r></w:p>`).join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`);
 const blob=await z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});let ok=false;if(window.claude&&claude.use)try{const dl=await claude.use('downloads');if(dl){await dl.save({filename:name,data:blob});ok=true}}catch(e){if(e&&e.code=='declined')return}if(!ok&&!dlBrowser(name,blob,'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))throw new Error('Trình duyệt không cho phép tải file.')}
 catch(e){alert('Không lưu được: '+(e&&e.message||e))}}
$('rpg').onclick=async()=>{const day=$('rd0').value||ldy(),ks=rpCalc(day).map((x,i)=>({...x,inc:Math.max(0,+$('ri'+i).value||0),dec:Math.max(0,+$('rx'+i).value||0),why:$('rr'+i).value.trim()})),u=rpUnits(),nf=n=>n.toLocaleString('vi-VN'),p2=n=>String(n).padStart(2,'0'),dmy=day.split('-').reverse().join('/'),inc=ks.reduce((t,x)=>t+x.inc,0),dec=ks.reduce((t,x)=>t+x.dec,0),why=$('rrt').value.trim(),L=[];
 L.push(`Báo Cáo quân số ${dmy}`,'Quân số Lán Trại Hóc Môn:',`Tổng: ${nf(W.length)} CNCH (${nf(u.xd)} CNCH XD, ${nf(u.cm)} chờ mã, ${nf(u.me)} CNCH ME, ${nf(u.vin)} Vinalpha, ${nf(u.td)} Trắc đạc, ${nf(u.kh)} BP Khác).`,`Tổng tăng ${p2(ks.length)} KTX : ${p2(inc)} CNCH.`,`Tổng giảm ${p2(ks.length)} KTX : ${p2(dec)} CNCH${why?` (${why})`:''}`);
 ks.forEach((x,i)=>L.push(`${i+1}/ ${x.k} (${x.days} Dãy = ${x.rooms} phòng = ${nf(x.cap)} chỗ):`,`- Tổng : ${nf(x.tot)} CNCH`,`• Nam : ${nf(x.nam)}`,`• Nữ : ${nf(x.nu)}`,`• Công suất: ${nf(x.cap)}`,`• Hiệu suất: ${(x.cap?x.tot/x.cap*100:0).toFixed(2).replace('.',',')}%`,`- Tổng tăng: ${p2(x.inc)} CNCH`,`- Tổng giảm: ${p2(x.dec)} CNCH${x.why?` (${x.why})`:''}`));
 L.push(`- Tình hình ANTT: ${$('ra').value.trim()}`,`- Tình hình điện nước: ${$('re').value.trim()}`);
 await saveDocx(L,`bao-cao-quan-so-${day}.docx`)};
async function exportDailyReportDirect(){
 if(!W.length){alert('Chưa có dữ liệu công nhân.');return}
 const day=ldy(),ks=rpCalc(day).map(x=>({...x,why:arcWhy(x.k,day)})),u=rpUnits(),nf=n=>n.toLocaleString('vi-VN'),p2=n=>String(n).padStart(2,'0'),dmy=day.split('-').reverse().join('/'),inc=ks.reduce((t,x)=>t+x.inc,0),dec=ks.reduce((t,x)=>t+x.dec,0),why=arcWhy('',day),L=[];
 L.push(`Báo Cáo quân số ${dmy}`,'Quân số Lán Trại Hóc Môn:',`Tổng: ${nf(W.length)} CNCH (${nf(u.xd)} CNCH XD, ${nf(u.cm)} chờ mã, ${nf(u.me)} CNCH ME, ${nf(u.vin)} Vinalpha, ${nf(u.td)} Trắc đạc, ${nf(u.kh)} BP Khác).`,`Tổng tăng ${p2(ks.length)} KTX : ${p2(inc)} CNCH.`,`Tổng giảm ${p2(ks.length)} KTX : ${p2(dec)} CNCH${why?` (${why})`:''}`);
 ks.forEach((x,i)=>L.push(`${i+1}/ ${x.k} (${x.days} Dãy = ${x.rooms} phòng = ${nf(x.cap)} chỗ):`,`- Tổng : ${nf(x.tot)} CNCH`,`• Nam : ${nf(x.nam)}`,`• Nữ : ${nf(x.nu)}`,`• Công suất: ${nf(x.cap)}`,`• Hiệu suất: ${(x.cap?x.tot/x.cap*100:0).toFixed(2).replace('.',',')}%`,`- Tổng tăng: ${p2(x.inc)} CNCH`,`- Tổng giảm: ${p2(x.dec)} CNCH${x.why?` (${x.why})`:''}`));
 L.push('- Tình hình ANTT: ANTT đảm bảo.','- Tình hình điện nước: Điện nước đảm bảo, hoạt động bình thường');
 await saveDocx(L,`bao-cao-quan-so-${day}.docx`)
}
$('xr').onclick=()=>page=='home'?exportDailyReportDirect():openRp;$('xt').onclick=()=>xlsForm([],true);$('rpc').onclick=()=>$('rpd').close();$('rpx').onclick=xlsRooms;
// ---- Lưu trữ tài liệu
const DOC={ready:false,cloud:[],local:[],assets:null,db:null,built:false,fcloud:[],floc:ld('ktx_folders',[]),cur:'all'};
DOC.fl=()=>(DOC.db&&DOC.assets)?DOC.fcloud:DOC.floc;
const CLOUDT={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',mp4:'video/mp4',webm:'video/webm',txt:'text/plain',csv:'text/csv',md:'text/markdown',json:'application/json'};
const IDB=(()=>{let pr;const open=()=>pr||(pr=new Promise((res,rej)=>{const r=indexedDB.open('ktx_docs',1);r.onupgradeneeded=()=>{r.result.createObjectStore('m',{keyPath:'id'});r.result.createObjectStore('b')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
 const run=async(st,mode,fn)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction(st,mode);let q;try{q=fn(...st.map(n=>t.objectStore(n)))}catch(e){rej(e);return}t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})};
 return{all:()=>run(['m'],'readonly',m=>m.getAll()),get:id=>run(['b'],'readonly',b=>b.get(id)),put:(meta,blob)=>run(['m','b'],'readwrite',(m,b)=>{m.put(meta);b.put(blob,meta.id)}),upd:meta=>run(['m'],'readwrite',m=>m.put(meta)),del:id=>run(['m','b'],'readwrite',(m,b)=>{m.delete(id);b.delete(id)})}})();
const fsz=b=>b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
const dext=n=>((String(n).split('.').pop()||'').toLowerCase()).slice(0,4)||'file';
async function docsLoad(){try{DOC.local=(await IDB.all()).map(d=>({...d,store:'local'}))}catch(e){DOC.local=[]}}
async function docsInit(){if(DOC.ready)return;DOC.ready=true;
 try{if(window.claude&&claude.use){DOC.assets=await claude.use('assets');DOC.db=await claude.use('db');
  if(DOC.db&&DOC.assets)DOC.db.collection('folders').onSnapshot(sn=>{DOC.fcloud=sn.docs.map(d=>({...d.data(),id:d.id}));if(page=='t7')docsRender()},()=>{});
  if(DOC.db&&DOC.assets)DOC.db.collection('docs').onSnapshot(sn=>{DOC.cloud=sn.docs.map(d=>({...d.data(),id:d.id,store:'cloud'}));if(page=='t7')docsRender()},()=>{});
  claude.use('mcp').then(m=>{DOC.mcp=m;if(m&&page=='t7')docsRender()}).catch(()=>{})}}catch(e){}
 await docsLoad();docsRender()}
const allDocs=()=>[...DOC.cloud,...DOC.local],cloudOK=()=>!!(DOC.db&&DOC.assets),fsave=()=>{try{localStorage.setItem('ktx_folders',JSON.stringify(DOC.floc))}catch(e){}};
const fname=id=>{const f=DOC.fl().find(x=>x.id==id);return f?f.name:''};
async function folderCreate(n){n=(n||'').trim();if(!n){alert('Hãy nhập tên thư mục.');return null}
 if(DOC.fl().some(x=>x.name.toLowerCase()==n.toLowerCase())){alert(`Đã có thư mục tên "${n}". Hãy chọn tên khác.`);return null}
 const id='f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),rec={id,name:n,at:Date.now()};
 try{if(cloudOK()){await DOC.db.collection('folders').doc(id).set({name:n,at:rec.at});DOC.fcloud.push(rec)}else{DOC.floc.push(rec);fsave()}}catch(e){alert('Không tạo được thư mục: '+(e&&e.message||e));return null}
 add('CREATE','Tạo thư mục tài liệu: '+n);DOC.cur=id;docsRender();alert(`Đã tạo thư mục "${n}".`);return id}
function folderDlg(f){$('dkf_t').textContent=f?'Đổi tên thư mục':'Thư mục mới';$('dkf_n').value=f?f.name:'';$('dkf_x').onclick=()=>$('dkf').close();
 const save=async()=>{const n=$('dkf_n').value.trim();if(!f){if(await folderCreate(n))$('dkf').close();return}
  if(!n){alert('Hãy nhập tên thư mục.');return}if(n==f.name){$('dkf').close();return}
  if(DOC.fl().some(x=>x.id!=f.id&&x.name.toLowerCase()==n.toLowerCase())){alert(`Đã có thư mục tên "${n}". Hãy chọn tên khác.`);return}
  if(!await ask(`Đổi tên thư mục "${f.name}" thành "${n}"?`,{title:'Xác nhận sửa',ok:'Đổi tên',cls:''}))return;const old=f.name;
  try{if(cloudOK())await DOC.db.collection('folders').doc(f.id).update({name:n});f.name=n;if(!cloudOK())fsave();add('UPDATE',`Đổi tên thư mục: ${old} → ${n}`);$('dkf').close();docsRender();alert(`Đã đổi tên thư mục thành "${n}".`)}catch(e){alert('Không đổi tên được: '+(e&&e.message||e))}};
 $('dkf_s').onclick=save;$('dkf_n').onkeydown=e=>{if(e.key=='Enter')save()};$('dkf').showModal();setTimeout(()=>$('dkf_n').focus(),50)}
async function folderDel(f){const ds=allDocs().filter(d=>d.fid==f.id);
 if(!await ask(`Bạn có chắc muốn xóa thư mục "${f.name}"?\n${ds.length?`${ds.length} tài liệu trong thư mục sẽ được chuyển về "Chưa phân loại" (không bị xóa).\n`:''}Thao tác này không hoàn tác được.`,{title:'Xác nhận xóa thư mục',ok:'Xóa thư mục'}))return;
 try{for(const d of ds){if(d.store=='cloud')await DOC.db.collection('docs').doc(d.id).update({fid:''});else{const{store,...m}=d;await IDB.upd({...m,fid:''})}}
  if(cloudOK()){await DOC.db.collection('folders').doc(f.id).delete();DOC.fcloud=DOC.fcloud.filter(x=>x.id!=f.id)}else{DOC.floc=DOC.floc.filter(x=>x.id!=f.id);fsave()}
  await docsLoad();if(DOC.cur==f.id)DOC.cur='all';add('DELETE','Xóa thư mục tài liệu: '+f.name);docsRender();alert(`Đã xóa thư mục "${f.name}".`)}catch(e){alert('Không xóa được: '+(e&&e.message||e))}}
function docsPage(){if(!DOC.built){DOC.built=true;
 $('t7').innerHTML=`<div class="dkl"><div class="card dkside"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">Thư mục</h3><button class="btn sm" id="dk_nf">${ico('plus')}Thư mục mới</button></div><div id="dk_fl"></div></div>
 <div><div class="card"><h3>Tải tài liệu lên</h3><div class="dkz" id="dk_zone"><b>Kéo thả file vào đây</b><label class="btn" style="cursor:pointer">${ico('ul')}Chọn file<input type="file" id="dk_file" multiple hidden></label></div>
 <div class="row" style="margin-top:12px;align-items:flex-end"><label class="fl" style="min-width:200px">Lưu vào thư mục<select id="dk_tf"></select></label><label class="fl" style="flex:1;min-width:200px">Ghi chú (áp dụng cho các file vừa chọn)<input id="dk_note" placeholder="Không bắt buộc"></label>
 <label class="tgl" style="margin-bottom:2px"><input type="checkbox" id="dk_loc"> Chỉ lưu trên máy này (riêng tư)</label></div><div class="mut" id="dk_info" style="margin-top:10px;font-size:12.5px"></div></div>
 <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:4px"><h3 style="margin:0" id="dk_ct"></h3><b class="cnt" id="dk_n"></b></div><input id="dk_q" placeholder="Tìm theo tên, ghi chú..." style="width:100%;margin-top:6px"><div id="dk_list"></div></div></div></div>`;
 const up=fs=>docsUpload([...fs]);$('dk_file').onchange=e=>{up(e.target.files);e.target.value=''};
 const z=$('dk_zone');['dragover','dragleave','drop'].forEach(ev=>z.addEventListener(ev,e=>{e.preventDefault();z.classList.toggle('over',ev=='dragover');if(ev=='drop'&&e.dataTransfer.files.length)up(e.dataTransfer.files)}));
 $('dk_q').oninput=docsRender;$('dk_nf').onclick=()=>folderDlg(null)}
 docsInit();docsRender()}
function docsRender(){if(!$('dk_list'))return;const F=DOC.fl().slice().sort((a,b)=>num(a.name,b.name)),ok=id=>F.some(f=>f.id==id),fid=d=>ok(d.fid)?d.fid:'',docs=allDocs().sort((a,b)=>(b.at||0)-(a.at||0));
 if(DOC.cur!='all'&&DOC.cur!='none'&&!ok(DOC.cur))DOC.cur='all';
 const cnt=id=>docs.filter(d=>fid(d)==id).length,item=(id,label,n,ic,f)=>`<div class="fi ${DOC.cur==id?'on':''}" data-fi="${esc(id)}" tabindex="0" role="button"><span class="fn">${ico(ic)}<span>${esc(label)}</span></span><span class="fc">${n}</span>${f?`<span class="fa"><button data-fr="${esc(f.id)}" title="Đổi tên">${ico('edit')}</button><button data-fd="${esc(f.id)}" title="Xóa thư mục">${ico('trash')}</button></span>`:''}</div>`;
 $('dk_fl').innerHTML=item('all','Tất cả tài liệu',docs.length,'layers')+item('none','Chưa phân loại',cnt(''),'log')+F.map(f=>item(f.id,f.name,cnt(f.id),'folder',f)).join('')+(F.length?'':`<div class="mut" style="font-size:12px;margin:12px 0 6px">Chưa có thư mục nào. Tạo nhanh:</div><div class="row" style="gap:6px">${['Hợp đồng','Công văn','Biên bản','Báo cáo'].map(n=>`<button class="btn s sm" data-fq="${n}">+ ${n}</button>`).join('')}</div>`);
 $('dk_fl').querySelectorAll('[data-fi]').forEach(e=>{const go=ev=>{if(ev.target.closest&&ev.target.closest('[data-fr],[data-fd]'))return;DOC.cur=e.dataset.fi;docsRender()};e.onclick=go;e.onkeydown=ev=>{if(ev.key=='Enter')go(ev)}});
 $('dk_fl').querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>folderDlg(F.find(f=>f.id==b.dataset.fr)));$('dk_fl').querySelectorAll('[data-fd]').forEach(b=>b.onclick=()=>folderDel(F.find(f=>f.id==b.dataset.fd)));
 $('dk_fl').querySelectorAll('[data-fq]').forEach(b=>b.onclick=()=>folderCreate(b.dataset.fq));
 const tf=$('dk_tf'),tv=ok(DOC.cur)?DOC.cur:(tf.value&&ok(tf.value)?tf.value:'');tf.innerHTML='<option value="">Chưa phân loại</option>'+F.map(f=>`<option value="${esc(f.id)}" ${f.id==tv?'selected':''}>${esc(f.name)}</option>`).join('');
 const q=sa($('dk_q').value),L=docs.filter(d=>(DOC.cur=='all'||fid(d)==(DOC.cur=='none'?'':DOC.cur))&&(!q||sa([d.name,d.note,fname(d.fid)].join(' ')).includes(q)));
 $('dk_ct').innerHTML=`${ico('folder')} ${esc(DOC.cur=='all'?'Tất cả tài liệu':DOC.cur=='none'?'Chưa phân loại':fname(DOC.cur))}`;$('dk_ct').style.cssText='display:flex;gap:8px;align-items:center';
 $('dk_n').textContent=`${L.length} tài liệu · ${fsz(L.reduce((t,d)=>t+(d.size||0),0))}`;
 $('dk_info').textContent=cloudOK()?'PDF, ảnh, video, txt, csv, md, json (tối đa 20 MB) lưu trên claude.ai, những ai được chia sẻ trang này đều xem được. Word, Excel, ZIP và các loại khác (hoặc khi bật "Chỉ lưu trên máy này") chỉ lưu trong trình duyệt này.':'Chưa dùng được lưu trữ chung nên mọi tài liệu và thư mục được lưu trong trình duyệt này (chỉ có trên máy này).';
 $('dk_list').innerHTML=L.length?`<div class="dkg">${L.map(d=>`<div class="dkc"><div class="row" style="flex-wrap:nowrap;gap:10px"><div class="ft">${esc(dext(d.name).toUpperCase())}</div><h4>${esc(d.name)}</h4></div><div class="row" style="gap:6px">${DOC.cur=='all'&&fid(d)?`<span class="pl dy2">${esc(fname(d.fid))}</span>`:''}<span class="pl ${d.store=='cloud'?'k1':'k2'}">${d.store=='cloud'?'claude.ai':'Máy này'}</span></div>${d.note?`<div class="mut" style="font-size:12.5px">${esc(d.note)}</div>`:''}<div class="mut" style="font-size:12px">${fsz(d.size||0)} · ${d.at?new Date(d.at).toLocaleDateString('vi-VN'):''}</div>
 <div class="ac"><button class="btn s sm" data-dv="${esc(d.id)}">${ico('eye')}Xem</button><button class="btn s sm" data-dd="${esc(d.id)}">${ico('dl')}Tải về</button>${DOC.mcp?`<button class="btn s sm" data-dg="${esc(d.id)}">${ico('ul')}Gửi lên Drive</button>`:''}<button class="btn s sm" data-de2="${esc(d.id)}">${ico('edit')}Sửa</button><button class="btn r sm" data-dx2="${esc(d.id)}">${ico('trash')}Xóa</button></div></div>`).join('')}</div>`:`<p class="mut" style="margin:14px 0 0">${docs.length?(q?'Không có tài liệu phù hợp.':'Thư mục này chưa có tài liệu. Hãy kéo thả hoặc chọn file ở phía trên.'):'Chưa có tài liệu nào. Hãy kéo thả hoặc chọn file ở phía trên.'}</p>`;
 const get=id=>allDocs().find(d=>d.id==id),on=(a,f)=>$('dk_list').querySelectorAll('['+a+']').forEach(b=>b.onclick=()=>{const d=get(b.getAttribute(a));if(d)f(d)});
 on('data-dv',docView);on('data-dd',docDl);on('data-dg',docDrive);on('data-de2',docEdit);on('data-dx2',docDel)}
async function docsUpload(files){if(!files.length)return;const fid=$('dk_tf').value||'',note=$('dk_note').value.trim(),lo=$('dk_loc').checked;let ok=0,cl=0;const bad=[];
 alert(`Đang tải lên ${files.length} file...`);
 for(const f of files){const ct=CLOUDT[dext(f.name)];try{
  if(!lo&&ct&&DOC.assets&&DOC.db&&f.size<=20*1048576){const r=await DOC.assets.upload(f,{type:ct});await DOC.db.collection('docs').doc(r.id).set({name:f.name,fid,note,size:f.size,type:ct,at:Date.now()});cl++}
  else await IDB.put({id:'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:f.name,fid,note,size:f.size,type:f.type||'',at:Date.now()},f);ok++}catch(e){bad.push(f.name)}}
 await docsLoad();if(DOC.cur!='all')DOC.cur=fid||'none';docsRender();if(ok)add('CREATE',`Lưu trữ tài liệu: tải lên ${ok} file${fid?' vào thư mục '+fname(fid):''}`);
 alert(ok?`Đã tải lên ${ok} tài liệu${cl?` (${cl} lưu trên claude.ai, ${ok-cl} lưu trên máy này)`:' (lưu trên máy này)'}.${bad.length?`\nKhông tải được: ${bad.join(', ')}.`:''}`:`Không tải lên được: ${bad.join(', ')}.`)}
async function docBlob(d){if(d.store=='cloud'){const r=await fetch('/_blob/'+d.id);if(!r.ok)throw new Error('HTTP '+r.status);return await r.blob()}return await IDB.get(d.id)}
const MIMEX={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',txt:'text/plain',csv:'text/csv',md:'text/markdown',json:'application/json',mp4:'video/mp4',webm:'video/webm',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',doc:'application/msword',xls:'application/vnd.ms-excel',zip:'application/zip'};
const blobB64=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=()=>rej(r.error);r.readAsDataURL(b)});
async function docDrive(d){const mcp=DOC.mcp;if(!mcp){alert('Môi trường này chưa cho phép kết nối Google Drive.');return}
 try{alert(`Đang gửi "${d.name}" lên Google Drive...`);
  const blob=await docBlob(d);if(!blob)throw new Error('Không đọc được nội dung file');
  const mime=MIMEX[dext(d.name)]||d.type||blob.type||'application/octet-stream',lt=await mcp.listTools().catch(()=>null),canFile=!!(lt&&lt.fileArgs===true);
  const send=b64=>mcp.callTool('Google Drive','create_file',{title:d.name,contentMimeType:mime,disableConversionToGoogleType:true,base64Content:b64});
  const small=blob.size<=700*1024;
  if(!canFile&&!small)throw Object.assign(new Error('File lớn hơn 700 KB, chưa gửi thẳng được trong môi trường này. Hãy bấm "Tải về" rồi kéo file vào Drive.'),{code:'too_big'});
  try{await send(canFile?{$file:{data:blob,name:d.name,type:mime}}:await blobB64(blob))}
  catch(e){if(canFile&&small&&e&&e.code=='bad_request')await send(await blobB64(blob));else throw e}
  add('CREATE','Gửi tài liệu lên Google Drive: '+d.name);
  alert(`Đã gửi "${d.name}" lên Google Drive (thư mục gốc "Drive của tôi").`)
 }catch(e){const c=e&&e.code,m=e&&e.message||e;
  alert(c=='needs_reauth'||c=='server_not_connected'||c=='selection_required'?'Chưa kết nối được Google Drive. Hãy kết nối lại Google Drive trong Cài đặt → Connectors của claude.ai.'
   :c=='not_in_manifest'||c=='consent_required'||c=='approval_required'||c=='cancelled'?'Bạn chưa cho phép trang này dùng Google Drive. Bấm "Gửi lên Drive" lần nữa và chọn Cho phép.'
   :c=='blocked_by_policy'?'Tổ chức của bạn đang chặn việc ghi file lên Google Drive.'
   :c=='server_unavailable'||c=='upstream_error'?'Google Drive chưa phản hồi. Hãy kiểm tra trong Drive xem file đã có chưa trước khi gửi lại để tránh bị trùng.'
   :c=='too_big'?m:'Không gửi được lên Google Drive: '+m)}}
async function docDl(d){try{const dl=await(window.claude&&claude.use?claude.use('downloads'):null);if(!dl){alert('Môi trường này chưa cho phép tải file.');return}await dl.save({filename:d.name,data:await docBlob(d)})}catch(e){if(!e||e.code!='declined')alert('Không tải được tài liệu: '+(e&&e.message||e))}}
async function docView(d){$('dkvn').textContent=d.name;$('dkvm').innerHTML=`${fname(d.fid)?`<span class="pl dy2">${esc(fname(d.fid))}</span>`:''}<span class="pl ${d.store=='cloud'?'k1':'k2'}">${d.store=='cloud'?'claude.ai':'Máy này'}</span><span class="mut">${fsz(d.size||0)}</span>`;
 const B=$('dkvb');B.innerHTML='<div class="mut">Đang mở...</div>';$('dkvd').onclick=()=>docDl(d);{const g=$('dkvg');g.style.display=DOC.mcp?'':'none';g.onclick=()=>docDrive(d)}$('dkv').showModal();
 const t=(d.type||CLOUDT[dext(d.name)]||'').toLowerCase(),note=d.note?`<div class="mut" style="margin-bottom:10px">${esc(d.note)}</div>`:'',nop='<p class="mut">Không xem trước được loại file này. Hãy bấm "Tải về" để mở bằng ứng dụng trên máy.</p>';
 try{if(/^image\//.test(t)){let src='/_blob/'+d.id;if(d.store=='local'){const b=await IDB.get(d.id);if(b.size>8*1048576){B.innerHTML=note+nop;return}src=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)})}B.innerHTML=note+`<div class="dkprev"><img src="${src}" alt="${esc(d.name)}"></div>`}
  else if(t=='application/pdf'&&d.store=='cloud')B.innerHTML=note+`<iframe title="${esc(d.name)}" src="/_blob/${esc(d.id)}" style="width:100%;height:66vh;border:1px solid var(--ln);border-radius:10px;background:#fff"></iframe><p class="mut" style="font-size:12px">Nếu khung trống, hãy bấm "Tải về" để mở file.</p>`;
  else if(/^video\//.test(t)&&d.store=='cloud')B.innerHTML=note+`<div class="dkprev"><video controls src="/_blob/${esc(d.id)}"></video></div>`;
  else if(/^text\/|json$/.test(t)){const x=await(await docBlob(d)).text();B.innerHTML=note+`<div class="dkprev"><pre>${esc(x.slice(0,20000))}${x.length>20000?'\n… (đã cắt bớt)':''}</pre></div>`}
  else B.innerHTML=note+nop}catch(e){B.innerHTML=note+nop}}
function docEdit(d){const F=DOC.fl().slice().sort((a,b)=>num(a.name,b.name)),cf=F.some(f=>f.id==d.fid)?d.fid:'';$('dke_n').value=d.name;$('dke_o').value=d.note||'';
 $('dke_c').innerHTML='<option value="">Chưa phân loại</option>'+F.map(f=>`<option value="${esc(f.id)}" ${f.id==cf?'selected':''}>${esc(f.name)}</option>`).join('');$('dke_x').onclick=()=>$('dke').close();
 $('dke_s').onclick=async()=>{const n=$('dke_n').value.trim(),c=$('dke_c').value,o=$('dke_o').value.trim();if(!n){alert('Hãy nhập tên tài liệu.');return}
  if(n==d.name&&c==cf&&o==(d.note||'')){$('dke').close();alert('Không có thay đổi nào để lưu.');return}
  if(!await ask(`Bạn có chắc muốn lưu thay đổi cho tài liệu "${d.name}"?${c!=cf?`\n• Thư mục: ${fname(cf)||'Chưa phân loại'} → ${fname(c)||'Chưa phân loại'}`:''}`,{title:'Xác nhận sửa',ok:'Lưu thay đổi',cls:''}))return;
  try{if(d.store=='cloud')await DOC.db.collection('docs').doc(d.id).update({name:n,fid:c,note:o});else{const{store,...m}=d;await IDB.upd({...m,name:n,fid:c,note:o});await docsLoad()}
   add('UPDATE','Sửa thông tin tài liệu: '+n);$('dke').close();docsRender();alert(c!=cf?`Đã chuyển tài liệu "${n}" sang thư mục "${fname(c)||'Chưa phân loại'}".`:`Đã cập nhật tài liệu "${n}".`)}catch(e){alert('Không lưu được: '+(e&&e.message||e))}};$('dke').showModal()}
async function docDel(d){if(!await ask(`Bạn có chắc muốn xóa tài liệu "${d.name}"?\n${d.store=='cloud'?'File sẽ bị xóa khỏi claude.ai và mọi người dùng chung trang không còn xem được.\n':''}Thao tác này không hoàn tác được.`,{title:'Xác nhận xóa',ok:'Xóa'}))return;
 try{if(d.store=='cloud'){await DOC.db.collection('docs').doc(d.id).delete();try{await DOC.assets.delete(d.id)}catch(e){}}else{await IDB.del(d.id);await docsLoad()}
  add('DELETE','Xóa tài liệu: '+d.name);docsRender();alert(`Đã xóa tài liệu "${d.name}".`)}catch(e){alert('Không xóa được: '+(e&&e.message||e))}}
$('dkvx').onclick=$('dkvc').onclick=()=>$('dkv').close();
/* ===== Báo cáo suất ăn (theo buổi) ===== */
const NCCS=['Vina Story','Tám Phương','Thiên Hồng Phúc','Lim Dương','Hương Ngọc Phát','Nguyên Sài Gòn','Minh Long Food'],SES=[['sang','Sáng','sáng'],['trua','Trưa','trưa'],['chieu','Chiều','chiều']],TDS=[['TĐ 8','td8'],['TĐ 11.1','td111'],['TĐ 11.3','td113']];
const MENU_SEED={"Vina Story":{"man":{"2026-10-12":{"sang":["Bún thịt khìa"],"trua":["Cơm trắng","Thịt kho trứng cút","Cá bạc má chiên mắm tỏi","Chả lụa kho tiêu","Su su xào cà rốt","Canh cải xanh nấu gừng","Chuối"],"chieu":["Cơm trắng","Thịt xáo măng","Tôm rim lá chanh","Đậu phộng rim tốp mỡ","Rau muống xào","Canh rong biển","Táo xanh"]},"2026-10-13":{"sang":["Bánh mì chả cá","Sữa nuti"],"trua":["Cơm trắng","Cá basa kho sả nghệ","Thịt xào mắm ruốc + dưa leo","Đậu hủ kho tiêu","Dưa leo xào","Canh cải ngọt","Nhãn"],"chieu":["Cơm trắng","Gà kho sả ớt","Thịt kho củ cải","Cá cơm chiên giòn sốt mặn ngọt","Bắp cải xào","Canh cải thảo","Thạch"]},"2026-10-14":{"sang":["Xôi chả lụa +trứng kho tàu","Sữa"],"trua":["Cơm trắng","Cốt lết ram mỡ hành","Chả lụa kho trứng cút","Chả giò","Rau muống xào","Canh mồng tơi","Chuối"],"chieu":["Cơm trắng","Thịt kho tiêu","Trứng hấp thịt","Khô lưỡi trau sốt mắm me","Cà tím xào","Canh rau ngót","Táo xanh"]},"2026-10-15":{"sang":["Bún gạo xào tôm thịt"],"trua":["Cơm trắng","Thịt xào sả ớt dưa leo","Cá chim kho tiêu","Cá cơm rim đậu","Cải ngọt xào","Canh rau muống","Nhãn"],"chieu":["Cơm trắng","Vịt kho gừng","Chả cá rim","Cá cơm rim đậu","Củ quả luộc","Canh rau má","Quýt"]},"2026-10-16":{"sang":["Bánh mì bò kho"],"trua":["Cơm trắng","Cốt lết rim","Cá trê kho gừng","Nem rim sả ớt","Cải thảo xào cà rốt","Canh mướp mồng tơi","Táo xanh"],"chieu":["Cơm trắng","Gà kho gừng","Thịt xào su su","Bò viên xào cay","Bắp cải xào","Canh cải xanh","Chuối"]},"2026-10-17":{"sang":["Bánh ướt giò lụa lá + chả giò"],"trua":["Cơm trắng","Thịt heo nấu lagu","Tôm rim đậu hủ","Cà tím bung đậu","Rau muống xào","Canh rong biển","Chuối"],"chieu":["Cơm trắng","Cá tráo kho tiêu","Thịt ram sả + dưa leo","Chả cá xào cay","Cải thảo xào","Canh mồng tơi","Chôm chôm"]},"2026-10-18":{"sang":["Mì xào tôm thịt"],"trua":["Cơm trắng","Thịt kho tàu","Cá basa chiên","Dưa mắm trộn rau răm","Cải ngọt xào","Canh đu đủ","Chuối"],"chieu":["Cơm trắng","Gà rô ti","Chả trứng đúc thịt","Khô lưỡi trâu sốt tỏi ớt","Bắp cải xào","Canh rau ngót","Quýt"]}},"chay":{"2026-10-12":{"sang":["Bún sườn nướng chay","Sữa đậu nành"],"trua":["Cơm trắng","Nấm bào ngư xào sả ớt","Đậu hủ kho thơm","Đậu phộng rim","Su su xào cà rốt","Canh cải xanh nấu gừng","Chuối"],"chieu":["Cơm trắng","Mít non kho rau răm","Chả lụa xào thập cẩm","Chả giò","Rau muống xào","Canh rong biển","Táo xanh"]},"2026-10-13":{"sang":["Bánh mì chả lụa chay","Sữa đậu nành"],"trua":["Cơm trắng","Đùi gà chay rô ti","Củ quả kho tương hột","Đậu hủ xào bắp non","Dưa leo xào","Canh cải ngọt","Nhãn"],"chieu":["Cơm trắng","Nấm đùi gà kho cà rốt","Bò kho đậu hủ","Sườn non rim","Bắp cải xào","Canh cải thảo","Thạch"]},"2026-10-14":{"sang":["Bánh mì sườn chay + chả cá","Sữa"],"trua":["Cơm trắng","Sườn dừa chay kho thơm","Chả cá chay kho nấm","Nấm bào ngư xào mướp","Rau muống xào","Canh mồng tơi","Chuối"],"chieu":["Cơm trắng","Bò xào sa tế","Bắp non xào thập cẩm","Chả lụa rim củ cải","Cà tím xào","Canh rau ngót","Táo xanh"]},"2026-10-15":{"sang":["Xôi cải sa pấu + xúc xích rán","Sữa"],"trua":["Cơm trắng","Đậu hũ xào rau củ","Thịt kho tiêu chay","Nấm kim châm xào cải thìa","Cải ngọt xào","Canh rau muống","Nhãn"],"chieu":["Cơm trắng","Heo lát xáo măng","Nấm rơm kho củ quả","Cá kèo chay rim mặn","Củ quả luộc","Canh rau má","Quýt"]},"2026-10-16":{"sang":["Bánh mì bò kho chay","Sữa"],"trua":["Cơm trắng","Bò nấu lagu chay","Nấm đùi gà kho cà rốt","Đậu phộng om bí","Cải thảo xào cà rốt","Canh mướp mồng tơi","Táo xanh"],"chieu":["Cơm trắng","Gà xào dưa leo","Heo quay kho cải chua","Nấm bào ngư xào mướp","Su su xào","Canh cải xanh","Chuối"]},"2026-10-17":{"sang":["Bánh ướt chả giò + xúc xích chay","Sữa 1 bịch"],"trua":["Cơm trắng","Cá thu chay kho thơm","Mì căn rim sả ớt","Heo lát rim sả","Rau muống xào","Canh rong biển","Chuối"],"chieu":["Cơm trắng","Đậu hũ xào thập cẩm","Cá cơm rim đậu phộng chay","Chả giò","Cải thảo xào","Canh mồng tơi","Chôm chôm"]},"2026-10-18":{"sang":["Mì xào chay","Sữa nuti"],"trua":["Cơm trắng","Chạo chay rô ti","Đậu hủ kho thơm","Sữa nuti","Cải ngọt xào","Canh đu đủ","Chuối"],"chieu":["Cơm trắng","Gà nấu đậu chay","Nấm đông cô xào cải thìa","Sữa nuti","Bắp cải xào","Canh rau ngót","Quýt"]}}}};
let MENU=(()=>{const m=JSON.parse(JSON.stringify(MENU_SEED)),u=ld('ktx_menu',{});for(const n in u)for(const k in u[n]){(m[n]=m[n]||{})[k]=Object.assign(m[n][k]||{},u[n][k])}return m})();
/* Đọc một sheet thực đơn (mảng 2 chiều) -> {kind:'man'|'chay', days:{'YYYY-MM-DD':{sang:[],trua:[],chieu:[]}}} */
function menuParse(rows,sheetName){
 const clean=s=>String(s==null?'':s).replace(/\s+/g,' ').trim(),cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
 const kind=/chay/i.test(sa(sheetName))?'chay':'man';
 let hr=-1;const cols={};
 // Tìm dòng tiêu đề: ô chứa chữ Sáng / Trưa / Tối (Chiều), cho phép "BỮA SÁNG", "Sáng (6h30)"...
 for(let i=0;i<Math.min(25,rows.length)&&hr<0;i++){const f={};(rows[i]||[]).forEach((c,j)=>{const t=sa(clean(c));if(!t||t.length>24)return;
   if(/^(bua |buoi )?sang\b/.test(t)&&f.sang==null)f.sang=j;else if(/^(bua |buoi )?trua\b/.test(t)&&f.trua==null)f.trua=j;else if(/^(bua |buoi )?(toi|chieu)\b/.test(t)&&f.chieu==null)f.chieu=j});
  if(Object.keys(f).length>=2){Object.assign(cols,f);hr=i}}
 if(hr<0)for(let i=0;i<Math.min(25,rows.length)&&hr<0;i++){(rows[i]||[]).forEach((c,j)=>{const t=sa(clean(c));if(/^sang$/.test(t))cols.sang=j;else if(/^trua$/.test(t))cols.trua=j;else if(/^(toi|chieu)$/.test(t))cols.chieu=j});if(cols.sang!=null||cols.trua!=null||cols.chieu!=null)hr=i}
 if(hr<0)return null;
 const dc={sang:cols.sang??2,trua:cols.trua??5,chieu:cols.chieu??8};
 // Cột chứa ngày: cột (trong 4 cột đầu) có nhiều ô dạng dd/mm nhất
 const DRE=/(\d{1,2})\s*[\/.\-]\s*(\d{1,2})(?:\s*[\/.\-]\s*(\d{2,4}))?/,dcnt=[0,0,0,0];
 for(let r=hr+1;r<rows.length;r++)for(let c=0;c<4;c++){const m=clean((rows[r]||[])[c]).match(DRE);if(m&&+m[1]>=1&&+m[1]<=31&&+m[2]>=1&&+m[2]<=12)dcnt[c]++}
 const dcol=dcnt.indexOf(Math.max(...dcnt));
 if(!Math.max(...dcnt))return{kind,days:{}};
 let y1=new Date().getFullYear(),y2=y1,m1=1;
 for(let i=0;i<hr;i++){for(const c of (rows[i]||[])){const t=clean(c),m=t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m){m1=+m[2];y1=+m[3];y2=+m[6];i=hr;break}}}
 const stop=r=>(rows[r]||[]).some(c=>/NHÀ CUNG CẤP|ĐẠI DIỆN|PHÒNG HÀNH CHÍNH/i.test(clean(c)));
 const starts=[];
 for(let r=hr+1;r<rows.length;r++){if(stop(r))break;const m=clean((rows[r]||[])[dcol]).match(DRE);if(m&&+m[1]>=1&&+m[1]<=31&&+m[2]>=1&&+m[2]<=12)starts.push([r,+m[1],+m[2],m[3]?(m[3].length==2?2000+ +m[3]:+m[3]):0])}
 const days={};
 starts.forEach(([r,d,mo,yy],k)=>{let e=k+1<starts.length?starts[k+1][0]:rows.length;for(let q=r;q<e;q++)if(stop(q)){e=q;break}
  const y=yy||(mo>=m1?y1:y2),iso=`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,o={sang:[],trua:[],chieu:[]};
  for(const s of ['sang','trua','chieu']){const c=dc[s];const L=[];
   for(let q=r;q<e;q++){const t=clean((rows[q]||[])[c]);if(t)L.push(cap(t));
    if(s=='sang'){const w=clean((rows[q]||[])[c+1]);if(/^sữa/i.test(w))L.push(cap(w.split(':')[0].trim()))}}
   const seen=new Set(),U=L.filter(x=>{const k=x.toLowerCase();if(seen.has(k))return false;seen.add(k);return true});
   const rice=U.filter(x=>/^cơm\b/i.test(x)),rest=U.filter(x=>!/^cơm\b/i.test(x));o[s]=[...rice,...rest]}
  days[iso]=o});
 return{kind,days}}
function menuDiag(wb){try{return wb.SheetNames.slice(0,4).map(sn=>{const rs=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:false,defval:''}).slice(0,6).map(r=>r.map(x=>String(x).replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,5).join(' | ')).filter(Boolean);return `[${sn}] ${rs.join(' // ')}`}).join(' ; ').slice(0,420)}catch(e){return ''}}

const RP={date:ldy(),ses:(h=>h<10?'sang':h<16?'trua':'chieu')(new Date().getHours()),ktx:'KTX1',price:'',on:new Set(NCCS),f:{},A:{}};
const mealDefaultPrice=s=>s=='sang'?'20.000đ':'40.000đ';
RP.price=mealDefaultPrice(RP.ses);
const NCC_KEY={'Vina Story':['vina'],'Tám Phương':['tam phuong'],'Thiên Hồng Phúc':['thien hong phuc'],'Lim Dương':['lim duong'],'Hương Ngọc Phát':['huong ngoc phat'],'Nguyên Sài Gòn':['nguyen sai gon'],'Minh Long Food':['minh long']};
const mealDetect=txt=>{const s=sa(txt),h=NCCS.filter(n=>NCC_KEY[n].some(k=>s.includes(k)));return h.length==1?h[0]:null};
const mkey=()=>RP.date+'|'+RP.ses;
function mealSwitch(){RP.f=RP.A[mkey()]=RP.A[mkey()]||{};mealFill();mealCards()}
const isoL=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addD=(iso,k)=>{const [y,m,d]=iso.split('-').map(Number);return isoL(new Date(y,m-1,d+k))};
const weekOf=iso=>{const [y,m,d]=iso.split('-').map(Number),w=new Date(y,m-1,d).getDay(),mon=addD(iso,-((w+6)%7));return Array.from({length:7},(_,i)=>addD(mon,i))};
const mealHas=(n,iso)=>{const m=MENU[n];return !!(m&&((m.man&&m.man[iso])||(m.chay&&m.chay[iso])))};
function mealWeek(){const el=$('mp_wk');if(!el)return;const D7=weekOf(RP.date),nm=['T2','T3','T4','T5','T6','T7','CN'],cov=D7.map(d=>NCCS.filter(n=>mealHas(n,d)).length),wk=NCCS.map(n=>[n,D7.some(d=>mealHas(n,d))]);
 el.innerHTML=`<div class="row" style="flex-wrap:nowrap;gap:6px"><button type="button" class="btn s sm ib" data-wk="-7" title="Tuần trước" aria-label="Tuần trước">‹</button><div class="wkd">${D7.map((d,i)=>`<button type="button" class="${d==RP.date?'on':''}" data-d="${d}"><b>${nm[i]} ${d.slice(8)}/${d.slice(5,7)}</b><small>${cov[i]?cov[i]+'/'+NCCS.length+' NCC có thực đơn':'chưa có thực đơn'}</small></button>`).join('')}</div><button type="button" class="btn s sm ib" data-wk="7" title="Tuần sau" aria-label="Tuần sau">›</button><button type="button" class="btn s sm" data-wk="today">Hôm nay</button></div>
 <div class="mut" style="font-size:12.5px;margin-top:8px">Thực đơn tuần này: ${wk.map(([n,h])=>`<span class="${h?'gr':'am'}">${esc(n)} ${h?'✓':'✗'}</span>`).join(' · ')}</div>`;
 const go=d=>{RP.date=d;$('mp_d').value=d;mealSwitch()};
 el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>go(b.dataset.d));
 el.querySelectorAll('[data-wk]').forEach(b=>b.onclick=()=>go(b.dataset.wk=='today'?ldy():addD(RP.date,+b.dataset.wk)))}
const menuOf=(n,iso,k,s)=>{const g=x=>{const d=MENU[x]&&MENU[x][k]&&MENU[x][k][iso];return d&&d[s]&&d[s].length?d[s]:null};return (g(n)||(RP.fb&&g('Vina Story'))||[]).join(', ')};
function mealFill(){NCCS.forEach(n=>{const f=RP.f[n]=RP.f[n]||{};if(!f.cd)f.cd='Đạt';for(const k of ['man','chay']){const v=menuOf(n,RP.date,k,RP.ses);if(!f[k]||f[k]===f['a'+k])f[k]=v;f['a'+k]=v}})}
const mealN=v=>{const x=String(v==null?'':v).trim();return x===''||isNaN(+x)?null:Math.max(0,Math.round(+x))};
const mealTot=n=>{const f=RP.f[n]||{},a=TDS.map(([,k])=>mealN(f[k])).filter(x=>x!=null);return a.length?a.reduce((s,x)=>s+x,0):null};
function mealText(){const on=NCCS.filter(n=>RP.on.has(n)),sn=SES.find(s=>s[0]==RP.ses)[2],dmy=RP.date.split('-').reverse().join('/'),T=on.map(mealTot).filter(x=>x!=null),tot=T.length?T.reduce((s,x)=>s+x,0):'';
 const L=[`Báo cáo Anh/Chị: Lán trại Hóc Môn ${RP.ktx} phục vụ suất ăn ${sn} ngày ${dmy}`,`• Tổng cộng: ${tot} suất`,`• Đơn giá: ${RP.price}`];
 on.forEach((n,i)=>{const f=RP.f[n]||{},t=mealTot(n);L.push('',`${i+1}. NCC: ${n}`,`• Tổng suất ăn: ${t==null?'':t} suất`);
  TDS.forEach(([l,k])=>{const v=mealN(f[k]);L.push(`- ${l}: ${v==null?'':v} suất`)});
  L.push(`• Suất ăn mặn: ${f.man||''}`,`• Suất ăn chay: ${f.chay||''}`,`Cân định lượng: ${f.cd||''}`)});
 return L.join('\n')}
const mealPrev=()=>{const o=$('mp_o');if(o)o.textContent=mealText()};
function mealCards(){mealWeek();const on=NCCS.filter(n=>RP.on.has(n));
 $('mp_cards').innerHTML=on.map((n,i)=>{const f=RP.f[n]||{},has=!!(f.aman||f.achay),t=mealTot(n);return `<div class="card" data-n="${esc(n)}"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><h3 style="margin:0">${i+1}. ${esc(n)}</h3><span class="tag ${has?'g':'a'}">${has?'Món lấy từ thực đơn':'Chưa có thực đơn ngày này'}</span></div>
 <div class="mp-td">${TDS.map(([l,k])=>`<label class="fl">${l}<input type="number" min="0" inputmode="numeric" data-f="${k}" value="${esc(f[k]||'')}"></label>`).join('')}<div class="fl">Tổng<b data-tot>${t==null?'—':t}</b></div></div>
 <label class="fl">Suất ăn mặn<textarea rows="2" data-f="man">${esc(f.man||'')}</textarea></label>
 <label class="fl">Suất ăn chay<textarea rows="2" data-f="chay">${esc(f.chay||'')}</textarea></label>
 <label class="fl">Cân định lượng<select data-f="cd">${['','Đạt','Không đạt'].map(o=>`<option value="${o}" ${f.cd==o?'selected':''}>${o||'(để trống)'}</option>`).join('')}</select></label></div>`}).join('')||'<div class="card mut">Hãy chọn ít nhất một nhà cung cấp.</div>';
 $('mp_cards').querySelectorAll('[data-f]').forEach(el=>{const c=el.closest('[data-n]'),n=c.dataset.n,k=el.dataset.f;el.oninput=el.onchange=()=>{RP.f[n][k]=el.value;if(k.startsWith('td')){const t=mealTot(n);c.querySelector('[data-tot]').textContent=t==null?'—':t}mealPrev()}});
 mealPrev()}
async function mealCopy(){const t=mealText();try{await navigator.clipboard.writeText(t);alert('Đã sao chép báo cáo.');return}catch(e){}
 try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();if(ok){alert('Đã sao chép báo cáo.');return}}catch(e){}
 alert('Không sao chép tự động được. Hãy bôi đen nội dung báo cáo rồi bấm Ctrl+C, hoặc dùng nút Xuất báo cáo.')}
/* STEP186 - publish approved Excel weekly menu to Cloud for PC/mobile shared viewing. */
function mealStandard186(name){
 const s=String(name||'');
 // Only extract an explicit weight/volume printed in the source; never invent grams.
 const found=s.match(/(?:\d+(?:[.,]\d+)?\s*(?:[-–~]\s*\d+(?:[.,]\d+)?)?\s*(?:g|gram|kg|ml|lít|lit)\b)/ig);
 return found?found.join('; '):'Chưa có định lượng trong file Excel';
}
async function mealCloudPublish186(records){
 const client=typeof syncClient==='function'?syncClient():null;
 if(!client)throw Error('Không kết nối được Supabase. Thực đơn mới chỉ lưu trên máy này.');
 const userResult=await client.auth.getUser();const user=userResult?.data?.user;
 if(userResult?.error||!user)throw Error('Phiên đăng nhập chưa hợp lệ. Hãy đăng nhập rồi Import Excel lại.');
 if(typeof ME==='undefined'||!['admin','manager'].includes(ME.role))throw Error('Tài khoản cần quyền Quản trị hoặc Quản lý để đưa thực đơn lên Cloud.');
 const today=new Date().toISOString();let uploaded=0;const failures=[];
 for(const r of records){
  const dishes=(r.dishes||[]).map(v=>({name:String(v),standard:mealStandard186(v)}));
  if(!dishes.length)continue;
  const payload={meal_date:r.date,meal_period:r.period,vendor:r.vendor,menu_type:r.kind,dishes,updated_at:today,updated_by:user.id};
  try{
   // Preserve previously curated quantities where the Excel sheet only provides dish names.
   const old=await client.from('ktx_meal_menus').select('dishes').eq('meal_date',r.date).eq('meal_period',r.period).eq('vendor',r.vendor).eq('menu_type',r.kind).maybeSingle();
   if(old.error)throw old.error;
   const standards=new Map((old.data?.dishes||[]).filter(x=>x?.name).map(x=>[String(x.name).trim().toLowerCase(),String(x.standard||'')]));
   for(const x of dishes)if(x.standard==='Chưa có định lượng trong file Excel'){
    const v=standards.get(x.name.trim().toLowerCase());if(v&&v!=='Chưa có định lượng trong file Excel')x.standard=v;
   }
   const res=await client.from('ktx_meal_menus').upsert(payload,{onConflict:'meal_date,meal_period,vendor,menu_type'});
   if(res.error)throw res.error;
   uploaded++;
  }catch(e){failures.push(`${r.vendor} · ${r.date} · ${r.period} · ${r.kind}: ${e.message||e}`);}
 }
 return{uploaded,failures};
}
async function mealImport(files){const pick=$('mp_ni').value,out=[],bad=[],cloudRecords=[];let any=false;
 try{if(!window.XLSX)throw new Error('Chưa tải được thư viện đọc Excel (cần kết nối mạng tới cdnjs).');
  for(const file of files){try{const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
    const head=(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:false,defval:''})||[]).slice(0,4).flat().join(' ');
    const ncc=pick||mealDetect(file.name+' '+head);if(!ncc){bad.push(`${file.name}: không nhận ra nhà cung cấp, hãy chọn tên nhà cung cấp ở ô bên cạnh rồi nhập lại`);continue}
    let nm=0,nc=0,lo='9999',hi='0000';
    for(const sn of wb.SheetNames){const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:false,defval:''}),r=menuParse(rows,sn);if(!r)continue;
     const dst=((MENU[ncc]=MENU[ncc]||{})[r.kind]=MENU[ncc][r.kind]||{});for(const iso in r.days){dst[iso]=r.days[iso];for(const period of ['sang','trua','chieu']){const dishes=r.days[iso][period]||[];if(dishes.length)cloudRecords.push({date:iso,period,vendor:ncc,kind:r.kind,dishes})}r.kind=='man'?nm++:nc++;if(iso<lo)lo=iso;if(iso>hi)hi=iso}}
    if(!nm&&!nc){bad.push(`${file.name}: không thấy bảng thực đơn đúng mẫu (cột SÁNG / TRƯA / TỐI theo từng ngày). Phần đầu file: ${menuDiag(wb)}`);continue}
    const f=i=>i.slice(8)+'/'+i.slice(5,7);out.push(`${ncc}: ${nm} ngày mặn, ${nc} ngày chay (${f(lo)} – ${f(hi)})`);any=true;add('UPDATE',`Nhập thực đơn ${ncc}: ${nm} ngày mặn, ${nc} ngày chay`)}
   catch(e){bad.push(`${file.name}: ${e&&e.message||e}`)}}
  if(any){try{localStorage.setItem('ktx_menu',JSON.stringify(MENU))}catch(e){}mealFill();mealCards()}
  let cloudNote='';if(cloudRecords.length){
   const im=$('mp_im');if(im)im.textContent='Đã đọc Excel. Đang đồng bộ '+cloudRecords.length+' bảng thực đơn lên Supabase…';
   try{const result=await mealCloudPublish186(cloudRecords);cloudNote=`\nCloud: đã cập nhật ${result.uploaded}/${cloudRecords.length} bảng.`+(result.failures.length?'\nLỗi Cloud ('+result.failures.length+'): '+result.failures.slice(0,8).join(' | '):'\nMở ứng dụng bằng điện thoại để xem cùng thực đơn.');}
   catch(e){cloudNote='\nCHƯA ĐỒNG BỘ CLOUD: '+(e.message||e)+'\nThực đơn vẫn có trên trình duyệt PC hiện tại.';}
  }
  const msg=(out.length?'Đã nhập thực đơn:\n'+out.join('\n'):'Không nhập được thực đơn.')+(bad.length?'\nBỏ qua:\n'+bad.join('\n'):'')+cloudNote;
  const im=$('mp_im');if(im)im.textContent=msg;alert(msg)}
 catch(e){alert('Không nhập được thực đơn: '+(e&&e.message||e))}}
function mealPage(){const el=$('meal');
 if(!el.dataset.init){el.dataset.init=1;mealFill();
  el.innerHTML=`<div class="card"><div class="ctl"><label class="fl">Ngày<input type="date" id="mp_d" value="${RP.date}"></label>
   <div class="fl">Buổi<div class="seg" id="mp_s">${SES.map(([k,l])=>`<button type="button" data-s="${k}" class="${k==RP.ses?'on':''}">${l}</button>`).join('')}</div></div>
   <label class="fl">KTX<select id="mp_k">${['KTX1','KTX2','KTX3'].map(k=>`<option>${k}</option>`).join('')}</select></label>
   <label class="fl">Đơn giá<input id="mp_p" value="${esc(RP.price)}" placeholder="VD: 40.000đ" style="width:140px"></label><span class="row" style="margin-left:auto"><button class="btn meal-report-btn" id="mp_w">${ico('dl')}Xuất báo cáo</button><button class="btn meal-copy-btn" id="mp_c">${ico('copy')}Sao chép báo cáo</button></span></div>
   <div id="mp_wk" style="margin-top:14px"></div>
   <div class="meal-suppliers"><div class="meal-supplier-label">Nhà cung cấp</div><div class="meal-supplier-list">${NCCS.map(n=>`<label class="meal-supplier"><input type="checkbox" data-c="${esc(n)}" checked><span class="meal-check">✓</span><span>${esc(n)}</span></label>`).join('')}</div></div>
   <div class="row" style="margin-top:12px;justify-content:flex-end"><span class="row"><span class="mut">Nhập thực đơn tuần của</span><select id="mp_ni"><option value="">Tự nhận diện nhà cung cấp</option>${NCCS.map(n=>`<option>${esc(n)}</option>`).join('')}</select><label class="btn sm meal-import-btn" style="cursor:pointer">${ico('ul')}Chọn file Excel<input type="file" id="mp_f" accept=".xlsx,.xls" multiple hidden></label></span></div><div class="mut" id="mp_im" style="white-space:pre-line;font-size:12.5px;margin-top:8px"></div></div>
  <div class="g2" id="mp_cards"></div>
  <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0">Nội dung báo cáo</h3><span class="mut" style="font-size:12px">Xem trước, cập nhật ngay khi bạn nhập</span></div><pre id="mp_o"></pre></div>`;
  RP.f=RP.A[mkey()]=RP.A[mkey()]||{};const redo=mealSwitch;
  $('mp_d').onchange=e=>{RP.date=e.target.value||ldy();redo()};
  $('mp_s').querySelectorAll('button').forEach(b=>b.onclick=()=>{RP.ses=b.dataset.s;RP.price=mealDefaultPrice(RP.ses);$('mp_p').value=RP.price;$('mp_s').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));redo()});
  $('mp_k').onchange=e=>{RP.ktx=e.target.value;mealPrev()};$('mp_p').oninput=e=>{RP.price=e.target.value;mealPrev()};
  el.querySelectorAll('[data-c]').forEach(c=>c.onchange=()=>{c.checked?RP.on.add(c.dataset.c):RP.on.delete(c.dataset.c);mealCards()});
  $('mp_f').onchange=async e=>{const fs=[...e.target.files];e.target.value='';if(fs.length)await mealImport(fs)};
  $('mp_c').onclick=mealCopy;$('mp_w').onclick=()=>saveDocx(mealText().split('\n'),`bao-cao-suat-an-${RP.ses}-${RP.date}.docx`)}
 mealCards()}
// ---- Cập nhật mã nhân viên từ file Excel
const noCode=w=>!String(w.mnv||'').trim()||/^cho ma/.test(sa(w.mnv)),pad0=(v,n)=>v&&v.length==n-1?'0'+v:v;
async function mnvFile(f){try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true}),rows=[],S=v=>String(v==null?'':v).trim();
 wb.SheetNames.forEach(sn=>{const R2=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:''});let h=-1,m={};
  for(let i=0;i<Math.min(15,R2.length);i++){const t={};R2[i].forEach((c,j)=>{const k=sa(c);
   if(!('mnv' in t)&&/^(ma nv|mnv|ma nhan vien|ma so nhan vien|ma so nv)$/.test(k))t.mnv=j;else if(!('name' in t)&&/^(ho va ten|ho ten|ten)$/.test(k))t.name=j;
   else if(!('cccd' in t)&&/cccd|can cuoc/.test(k))t.cccd=j;else if(!('sdt' in t)&&/^(sdt|so dien thoai|dien thoai)$/.test(k))t.sdt=j;else if(!('dob' in t)&&/^(ngay sinh|nam sinh)$/.test(k))t.dob=j});
   if('mnv' in t&&('name' in t||'cccd' in t||'sdt' in t)){h=i;m=t;break}}
  if(h<0)return;R2.slice(h+1).forEach(r=>{const mnv=S(r[m.mnv]).replace(/\.0$/,'');if(!mnv||/^cho ma/.test(sa(mnv)))return;const d=m.dob!=null?r[m.dob]:'',dy=/^\d{4}$/.test(S(d))?S(d):'';
   rows.push({mnv,name:m.name!=null?S(r[m.name]):'',cccd:m.cccd!=null?S(r[m.cccd]).replace(/\D/g,''):'',sdt:m.sdt!=null?S(r[m.sdt]).replace(/\D/g,''):'',dob:dy?'':dloc(d),dy})})});
 if(!rows.length){alert('Không nhận ra dữ liệu trong file. Cần dòng tiêu đề có cột "Mã NV" cùng ít nhất một cột Họ tên, CCCD hoặc SĐT, và các dòng đã có mã nhân viên.');return}
 mnvPreview(rows,f.name)}catch(e){alert('Không đọc được file: '+(e&&e.message||e))}}
function mnvPreview(rows,fname){const cand=W.filter(noCode);if(!cand.length){alert('Hiện tất cả công nhân đã có mã nhân viên.');return}
 const ix={c:{},p:{},n:{},d:{}},put=(o,k,w)=>{if(k)(o[k]=o[k]||[]).push(w)};
 cand.forEach(w=>{put(ix.c,pad0(w.cccd||'',12),w);put(ix.p,pad0(w.sdt||'',10),w);put(ix.n,sa(w.name),w);put(ix.d,w.dob||'',w)});
 const used=new Set(W.filter(w=>!noCode(w)).map(w=>String(w.mnv).trim())),prop={},miss=[],amb=[];
 rows.forEach(r=>{const sc=new Map(),a2=(w,c)=>{const o=sc.get(w.id)||{w,c:new Set()};o.c.add(c);sc.set(w.id,o)};
  (ix.c[pad0(r.cccd,12)]||[]).forEach(w=>a2(w,'CCCD'));(ix.p[pad0(r.sdt,10)]||[]).forEach(w=>a2(w,'SĐT'));(ix.n[sa(r.name)]||[]).forEach(w=>a2(w,'Họ tên'));
  if(r.dob)(ix.d[r.dob]||[]).forEach(w=>a2(w,'Ngày sinh'));if(r.dy)(ix.n[sa(r.name)]||[]).forEach(w=>{if((w.dob||'').slice(0,4)==r.dy)a2(w,'Ngày sinh')});
  const L=[...sc.values()].filter(o=>o.c.has('CCCD')||o.c.size>=2);if(!L.length){miss.push(r);return}
  L.sort((a,b)=>b.c.size-a.c.size);const top=L.filter(o=>o.c.size==L[0].c.size);if(top.length>1){amb.push({r,n:top.length});return}
  (prop[top[0].w.id]=prop[top[0].w.id]||{w:top[0].w,list:[]}).list.push({r,c:[...top[0].c]})});
 const items=[],conf=[],cnt={};Object.values(prop).forEach(p=>{const mn=[...new Set(p.list.map(x=>x.r.mnv))];if(mn.length>1){conf.push({w:p.w,mn});return}items.push({w:p.w,mnv:mn[0],c:[...new Set(p.list.flatMap(x=>x.c))]});cnt[mn[0]]=(cnt[mn[0]]||0)+1});
 items.forEach(i=>i.dup=used.has(i.mnv)||cnt[i.mnv]>1);items.sort((a,b)=>num(a.w.name,b.w.name));
 if(!items.length&&!conf.length&&!amb.length){alert(`Không có công nhân nào khớp để cập nhật. File có ${rows.length} dòng có mã nhân viên, trong khi ${cand.length} công nhân đang chưa có mã.`);return}
 $('mns').textContent=`${fname} · ${rows.length} dòng có mã · ${cand.length} công nhân chưa có mã`;
 const ok=items.filter(i=>!i.dup).length,upd=()=>{const n=items.filter((_,i)=>$('mnk'+i)&&$('mnk'+i).checked).length;$('mny').lastChild.textContent=`Có, cập nhật (${n})`;$('mny').disabled=!n;$('mnc').textContent=`Đã chọn ${n} / ${items.length}`};
 $('mnbody').innerHTML=`<div class="vchips" style="margin-bottom:10px"><span class="tag g">${items.length} người khớp</span>${miss.length?`<span class="tag a">${miss.length} dòng không khớp (bỏ qua)</span>`:''}${amb.length?`<span class="tag a">${amb.length} dòng khớp nhiều người (bỏ qua)</span>`:''}${conf.length?`<span class="tag r">${conf.length} người có nhiều mã khác nhau (bỏ qua)</span>`:''}</div>
 <p class="mut" style="margin:0 0 8px">Chỉ cập nhật những người đang chưa có mã nhân viên và khớp ít nhất 2 thông tin (Họ tên, Ngày sinh, CCCD, SĐT) hoặc trùng CCCD. Bỏ tick người nào bạn không muốn cập nhật.</p>
 ${items.length?`<div class="wrap" style="max-height:48vh"><table class="cmp3"><tr><th><input type="checkbox" id="mna" checked aria-label="Chọn tất cả"></th><th>STT</th><th>Họ tên</th><th>KTX</th><th>Dãy</th><th>Phòng</th><th>Ngày sinh</th><th>CCCD</th><th>Mã NV mới</th><th>Khớp theo</th></tr>${items.map((i,k)=>`<tr><td><input type="checkbox" id="mnk${k}" ${i.dup?'':'checked'}></td><td>${k+1}</td><td class="wr"><b>${esc(i.w.name)}</b></td><td>${esc(K(i.w))}</td><td>${esc(D(i.w))}</td><td>${esc(R(i.w)||'—')}</td><td>${vn(i.w.dob)||'—'}</td><td>${esc(i.w.cccd||'')}</td><td><b>${esc(i.mnv)}</b>${i.dup?'<br><span class="tag r">Mã đã có người dùng</span>':''}</td><td class="wr">${i.c.join(' + ')}</td></tr>`).join('')}</table></div>`:'<p class="mut">Không có ai đủ điều kiện để cập nhật.</p>'}
 ${miss.length?`<details style="margin-top:10px"><summary class="mut" style="cursor:pointer">Xem ${Math.min(miss.length,100)} dòng không khớp</summary><div class="wrap" style="max-height:200px"><table class="cmp3"><tr><th>Họ tên</th><th>CCCD</th><th>SĐT</th><th>Mã NV trong file</th></tr>${miss.slice(0,100).map(r=>`<tr><td class="wr">${esc(r.name)}</td><td>${esc(r.cccd)}</td><td>${esc(r.sdt)}</td><td>${esc(r.mnv)}</td></tr>`).join('')}</table></div></details>`:''}`;
 items.forEach((_,i)=>$('mnk'+i).onchange=upd);const all2=$('mna');if(all2){all2.checked=ok==items.length;all2.onchange=()=>{items.forEach((_,i)=>$('mnk'+i).checked=all2.checked);upd()}}
 $('mno').onclick=$('mnx').onclick=()=>$('mnd').close();
 $('mny').onclick=()=>{const sel=items.filter((_,i)=>$('mnk'+i).checked);if(!sel.length){alert('Chưa chọn ai để cập nhật.');return}
  sel.forEach(x=>{x.w.mnv=x.mnv});add('UPDATE',`Cập nhật mã nhân viên từ file ${fname}: ${sel.length} công nhân`);sv();$('mnd').close();all();alert(`Đã cập nhật mã nhân viên cho ${sel.length} công nhân.`)};
 upd();$('mnd').showModal()}
// ---- Điều chuyển · Nghỉ việc (danh sách theo dõi riêng, không xóa hẳn)
const LEAVE=['Điều chuyển','Nghỉ việc','Chuyển ra ngoài ở','Trùng dữ liệu','Khác'],RC={'Điều chuyển':'k1','Nghỉ việc':'k2','Chuyển ra ngoài ở':'k3','Trùng dữ liệu':'k4','Khác':'dy2'};
function askLeave(list,o={}){return new Promise(res=>{const d=$('dld');$('dlt').textContent=list.length==1?'Xóa công nhân':`Xóa ${list.length.toLocaleString('vi-VN')} công nhân`;
 $('dlnames').textContent=list.slice(0,5).map(w=>`• ${w.name} (${K(w)} · ${D(w)} · P.${R(w)||'—'})`).join('\n')+(list.length>5?`\n… và ${list.length-5} người khác`:'' );
 $('dlr').value=o.reason||'Nghỉ việc';$('dlda').value=ldy();$('dln').value=o.note||'';
 $('dly').onclick=()=>{d.close();res({mode:'archive',reason:$('dlr').value,date:$('dlda').value||ldy(),note:$('dln').value.trim()})};
 $('dlp').onclick=async()=>{d.close();const ok=await ask(`Xóa hẳn ${list.length.toLocaleString('vi-VN')} công nhân?\n\nThao tác này sẽ KHÔNG đưa dữ liệu sang “Điều chuyển · Nghỉ việc” và không thể khôi phục từ mục đó.`,{title:'Xác nhận xóa hẳn',ok:'Xóa hẳn'});res(ok?{mode:'purge',reason:'Xóa hẳn',date:ldy(),note:$('dln').value.trim()}:null)};
 $('dlx').onclick=()=>{d.close();res(null)};d.oncancel=()=>res(null);d.showModal()})}
let AS=new Set(),ARCB=false;
function arcFlt(){const q=sa($('ar_q').value),r=$('ar_r').value,a=$('ar_a').value,b=$('ar_b').value;return ARC.filter(x=>(!r||x.reason==r)&&(!a||x.date>=a)&&(!b||x.date<=b)&&(!q||sa([x.w.name,x.w.mnv,x.w.cccd,x.w.sdt,x.note,x.reason].join(' ')).includes(q)))}
function arcPage(){if(!ARCB){ARCB=true;$('arc').innerHTML=`<div class="g4" id="ar_k"></div><div class="card"><div class="row"><input id="ar_q" placeholder="Tìm tên, mã NV, CCCD, ghi chú..." style="flex:1;min-width:220px"><select id="ar_r" aria-label="Lọc theo lý do"><option value="">Tất cả lý do</option>${LEAVE.map(r=>`<option>${r}</option>`).join('')}</select><label class="mut">Từ <input type="date" id="ar_a"></label><label class="mut">Đến <input type="date" id="ar_b"></label></div>
 <div class="row" style="margin-top:10px"><button class="btn g" id="ar_re">${ico('check')}Khôi phục đã chọn</button><button class="btn r" id="ar_pd">${ico('trash')}Xóa hẳn đã chọn</button><button class="btn s" id="ar_x">${ico('dl')}Xuất Excel</button><b class="cnt" id="ar_n" style="margin-left:auto"></b></div><div id="ar_t"></div></div>`;
 ['ar_q','ar_r','ar_a','ar_b'].forEach(i=>$(i).oninput=arcRender);
 $('ar_re').onclick=()=>{const L=ARC.filter(a=>AS.has(a.id));if(!L.length){alert('Hãy tick chọn công nhân cần khôi phục.');return}arcRestore(L)};
 $('ar_pd').onclick=()=>{const L=ARC.filter(a=>AS.has(a.id));if(!L.length){alert('Hãy tick chọn công nhân cần xóa hẳn.');return}arcPurge(L)};
 $('ar_x').onclick=()=>xlsArc(AS.size?ARC.filter(a=>AS.has(a.id)):arcFlt())}
 arcRender()}
function arcRender(){if(!$('ar_t'))return;const L=arcFlt(),cn=r=>ARC.filter(a=>a.reason==r).length;
 $('ar_k').innerHTML=`<div class="card"><div class="lbl">TỔNG ĐÃ CHUYỂN RA</div><div class="kpi">${ARC.length.toLocaleString('vi-VN')}</div></div><div class="card"><div class="lbl">ĐIỀU CHUYỂN</div><div class="kpi">${cn('Điều chuyển')}</div></div><div class="card"><div class="lbl">NGHỈ VIỆC</div><div class="kpi">${cn('Nghỉ việc')}</div></div><div class="card"><div class="lbl">CHUYỂN RA NGOÀI Ở</div><div class="kpi">${cn('Chuyển ra ngoài ở')}</div></div>`;
 $('ar_n').textContent=`${L.length.toLocaleString('vi-VN')} / ${ARC.length.toLocaleString('vi-VN')} người · đã chọn ${AS.size}`;$('ar_n').classList.toggle('on',AS.size>0);
 const sh=L.slice(0,300);
 $('ar_t').innerHTML=ARC.length?`<div class="wrap"><table class="cmp3"><tr><th><input type="checkbox" id="ar_a2" aria-label="Chọn tất cả"></th><th>STT</th><th>Họ và tên</th><th>Mã NV</th><th>KTX</th><th>Dãy</th><th>Phòng</th><th>CCCD</th><th>Lý do</th><th>Ngày</th><th>Thao tác</th></tr>${sh.map((a,i)=>`<tr><td><input type="checkbox" class="ak" data-i="${esc(a.id)}" ${AS.has(a.id)?'checked':''}></td><td>${i+1}</td><td class="wr"><b>${esc(a.w.name)}</b></td><td>${esc(a.w.mnv||'—')}</td><td><span class="pl ${kc(K(a.w))}">${esc(K(a.w))}</span></td><td>${esc(D(a.w))}</td><td>${esc(R(a.w)||'—')}</td><td>${esc(a.w.cccd||'')}</td><td><span class="pl ${RC[a.reason]||'dy2'}">${esc(a.reason)}</span></td><td>${vn(a.date)}</td><td>${can('restore')?`<button class="btn s sm" data-ar="${esc(a.id)}">${ico('check')}Sửa & khôi phục</button>`:''} ${can('purge')?`<button class="btn r sm" data-ap="${esc(a.id)}">${ico('trash')}Xóa hẳn</button>`:''}${!can('restore')&&!can('purge')?'<span class="mut">Chỉ xem</span>':''}</td></tr>`).join('')}</table></div>${L.length>300?`<div class="mut" style="margin-top:8px">Hiển thị 300 dòng đầu, hãy lọc để thu hẹp.</div>`:''}`:'<p class="mut" style="margin:14px 0 0">Chưa có ai trong danh sách này. Khi bạn xóa công nhân ở các mục khác, họ sẽ được chuyển vào đây thay vì bị xóa hẳn.</p>';
 const T2=$('ar_t');T2.querySelectorAll('.ak').forEach(c=>c.onchange=()=>{c.checked?AS.add(c.dataset.i):AS.delete(c.dataset.i);$('ar_n').textContent=`${L.length.toLocaleString('vi-VN')} / ${ARC.length.toLocaleString('vi-VN')} người · đã chọn ${AS.size}`;$('ar_n').classList.toggle('on',AS.size>0)});
 const ca=$('ar_a2');if(ca){ca.checked=L.length>0&&L.every(a=>AS.has(a.id));ca.onchange=()=>{L.forEach(a=>ca.checked?AS.add(a.id):AS.delete(a.id));arcRender()}}
 T2.querySelectorAll('[data-ar]').forEach(b=>b.onclick=()=>arcRestoreEdit29(b.dataset.ar));T2.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>arcPurge(ARC.filter(a=>a.id==b.dataset.ap)))}
async function arcRestoreEdit29(id){
 if(!can('restore'))return alert('Bạn không có quyền khôi phục.');
 const a=ARC.find(x=>String(x.id)===String(id));if(!a)return;
 const w=a.w,old={ktx:K(w),day:D(w),room:String(R(w)||'')};
 const dlg=document.createElement('dialog');dlg.className='dv';dlg.style.cssText='max-width:470px;width:calc(100% - 28px);border-radius:18px';
 dlg.innerHTML='<form method="dialog" style="padding:18px;display:grid;gap:12px"><h3 style="margin:0">Sắp xếp chỗ ở khi quay lại</h3><p class="mut" style="margin:0">Vị trí cũ: '+esc(old.ktx)+' · '+esc(old.day)+' · Phòng '+esc(old.room||'—')+'</p><label>KTX mới<input id="arc29k" required value="'+esc(old.ktx)+'"></label><label>Dãy mới<input id="arc29d" required value="'+esc(old.day)+'"></label><label>Phòng mới<input id="arc29r" required value="'+esc(old.room)+'"></label><div class="row" style="justify-content:flex-end"><button class="btn s" value="cancel">Hủy</button><button class="btn g" value="confirm">Xác nhận khôi phục</button></div></form>';
 document.body.appendChild(dlg);dlg.showModal();
 dlg.addEventListener('close',async()=>{const ok=dlg.returnValue==='confirm',k=dlg.querySelector('#arc29k').value.trim(),d=dlg.querySelector('#arc29d').value.trim(),r=dlg.querySelector('#arc29r').value.trim();dlg.remove();if(!ok)return;if(!k||!d||!r){alert('Cần nhập đủ KTX, Dãy, Phòng mới.');return}if(W.some(z=>String(z.id)===String(id))){alert('Công nhân đã có trong danh sách tổng, không thể khôi phục trùng.');return}
 const msg='Xác nhận khôi phục '+w.name+' vào '+k+' · '+d+' · Phòng '+r+'?\nVị trí cũ vẫn được ghi trong lịch sử.';
 if(!await ask(msg,{title:'Xác nhận vị trí mới',ok:'Khôi phục',cls:'g'}))return;
 w.ktx=k;w.day=d;w.room=r;
 const history={at:new Date().toISOString(),action:'RETURN_NEW_ROOM',old,newLocation:{ktx:k,day:d,room:r}};
 w.residenceMoves=Array.isArray(w.residenceMoves)?w.residenceMoves:[];w.residenceMoves.push(history);
 LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'RESTORE',d:'Công nhân quay lại: '+w.name+'; chỗ ở cũ '+old.ktx+'/'+old.day+'/'+old.room+' → '+k+'/'+d+'/'+r,day:ldy()});
 W.unshift(w);ARC=ARC.filter(x=>String(x.id)!==String(id));AS.delete(id);sv();all();alert('Đã khôi phục với vị trí mới. Hãy kiểm tra trạng thái lưu Supabase trước khi tải lại trang.');
 });
}
async function arcRestore(L){if(!can('restore')){alert('Bạn không có quyền khôi phục.');return}if(!await ask(`Khôi phục ${L.length.toLocaleString('vi-VN')} công nhân về danh sách chính?\n${L.slice(0,5).map(a=>'• '+a.w.name).join('\n')}${L.length>5?`\n… và ${L.length-5} người khác`:''}`,{title:'Xác nhận khôi phục',ok:'Khôi phục',cls:'g'}))return;
 const by={};L.forEach(a=>{if(!W.some(w=>w.id==a.id))W.unshift(a.w);const k=K(a.w)+'|'+a.date;(by[k]=by[k]||{k:K(a.w),day:a.date,n:0}).n++});
 Object.values(by).forEach(g=>LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'RESTORE',d:`Khôi phục ${g.n} công nhân về danh sách chính (${g.k})`,k:g.k,n:g.n,day:g.day}));
 const ids=new Set(L.map(a=>a.id));ARC=ARC.filter(a=>!ids.has(a.id));ids.forEach(i=>AS.delete(i));sv();all();alert(`Đã khôi phục ${L.length.toLocaleString('vi-VN')} công nhân về danh sách chính.`)}
async function arcPurge(L){if(!can('purge')){alert('Chỉ tài khoản được cấp quyền Xóa hẳn mới thực hiện được.');return}if(!await ask(`Xóa hẳn ${L.length.toLocaleString('vi-VN')} công nhân khỏi danh sách theo dõi?\n${L.slice(0,5).map(a=>'• '+a.w.name).join('\n')}${L.length>5?`\n… và ${L.length-5} người khác`:''}\n\nSau khi xóa hẳn sẽ không thể khôi phục.`,{title:'Xác nhận xóa hẳn',ok:'Xóa hẳn'}))return;
 const ids=new Set(L.map(a=>a.id));ARC=ARC.filter(a=>!ids.has(a.id));ids.forEach(i=>AS.delete(i));LOG.unshift({t:new Date().toLocaleString('vi-VN'),a:'PURGE',d:`Xóa hẳn ${L.length} công nhân khỏi danh sách điều chuyển/nghỉ việc`,day:ldy()});sv();all();alert(`Đã xóa hẳn ${L.length.toLocaleString('vi-VN')} công nhân khỏi danh sách theo dõi.`)}
async function xlsArc(L){try{if(!L.length){alert('Không có dữ liệu để xuất.');return}const dl=await(window.claude&&claude.use?claude.use('downloads'):null);if(!dl){alert('Môi trường này chưa cho phép tải file.');return}if(!window.ExcelJS){alert('Không tải được thư viện tạo Excel (cần kết nối mạng).');return}
 const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Điều chuyển - Nghỉ việc');ws.addRow(['STT','Họ và Tên','Mã NV','Tiểu Đoàn','Đơn vị','KTX','Dãy','Phòng','Giới tính','SĐT','CCCD','Ngày sinh','Tỉnh/TP','Lý do','Ngày','Ghi chú']);
 L.forEach((a,i)=>{const w=a.w;ws.addRow([i+1,w.name,w.mnv||'Chờ mã',w.td||'',w.unit||'',K(w),D(w),R(w)||'',gtN(w.gt),w.sdt||'',w.cccd||'',vn(w.dob),w.tinh||'',a.reason,vn(a.date),a.note||''])});
 [5,22.8,9,12,14.9,6,6,7,8,12,14,12,40,18,12,30].forEach((x,i)=>ws.getColumn(i+1).width=x);ws.eachRow((r,ri)=>r.eachCell(c=>{c.font={name:'Arial',size:12,bold:ri==1};if(ri==1)c.alignment={horizontal:'center',vertical:'middle'}}));
 await dl.save({filename:`Dieu_chuyen_Nghi_viec_${ldy().split('-').reverse().join('-')}.xlsx`,data:await wb.xlsx.writeBuffer()})}catch(e){if(!e||e.code!='declined')alert('Không lưu được: '+(e&&e.message||e))}}
// ---- Đăng nhập · phân quyền · dữ liệu dùng chung
const ROLES={admin:'Quản trị',manager:'Quản lý',staff:'Nhập liệu',guard:'Bảo vệ',viewer:'Chỉ xem'},ME={id:null,name:'',owner:false,role:'admin',acct:null};
const ROLE_PERMS={
 admin:{view:1,add:1,edit:1,editw:1,transfer:1,residence:1,attendance:1,del:1,restore:1,purge:1,backup:1,acct:1,qrApprove:1,import:1,bulk:1,report:1},
 manager:{view:1,add:1,edit:1,editw:1,transfer:1,residence:1,attendance:1,del:0,restore:1,purge:0,backup:0,acct:0,qrApprove:1,import:0,bulk:1,report:1},
 staff:{view:1,add:1,edit:1,editw:1,transfer:0,residence:1,attendance:0,del:0,restore:0,purge:0,backup:0,acct:0,qrApprove:0,import:0,bulk:0,report:1},
 guard:{view:1,add:0,edit:0,editw:0,transfer:0,residence:0,attendance:1,del:0,restore:0,purge:0,backup:0,acct:0,qrApprove:0,import:0,bulk:0,report:0},
 viewer:{view:1,add:0,edit:0,editw:0,transfer:0,residence:0,attendance:0,del:0,restore:0,purge:0,backup:0,acct:0,qrApprove:0,import:0,bulk:0,report:0}
};
const SENSITIVE_PERMS=['purge','backup','acct','qrApprove','import'];
const inScope=w=>{if(!w)return true;const r=ME.role||'viewer';if(r==='admin')return true;const a=ME.acct;if(!a)return true;const k=Array.isArray(a.ktx)?a.ktx:[],d=Array.isArray(a.days)?a.days:[];return(!k.length||k.includes(K(w)))&&(!d.length||d.includes(D(w)))};
const ktxDesktopView=()=>window.matchMedia('(min-width: 861px)').matches;
const can=(a,w)=>{const r=ME.role||'viewer',P=ROLE_PERMS[r]||ROLE_PERMS.viewer;let ok=!!P[a];
 // STEP236: PC được xem toàn bộ, mobile giữ quyền xem theo dãy; quyền ghi luôn theo dãy.
 if(a==='view'&&ktxDesktopView())return ok;
 if(w&&['manager','staff','guard','viewer'].includes(r)&&['view','editw','edit','add','del','transfer','residence','attendance'].includes(a))ok=ok&&inScope(w);
 return ok};
function applyPerms(){document.documentElement.classList.toggle('ktx-subaccount',Boolean(ME.id)&&ME.role!=='admin');const e=can('edit'),d=can('del'),sh=(q,on)=>document.querySelectorAll(q).forEach(x=>x.classList.toggle('hide',!on)),id=(i,on)=>{const x=$(i);if(x)x.classList.toggle('hide',!on)};
 sh('nav button[data-p=acc]',can('acct'));sh('nav button[data-p=activity]',can('acct'));sh('nav button[data-p=adminboard]',can('acct'));sh('nav button[data-p=access]',can('acct'));['incidents','security','maintenance','qa','release'].forEach(p=>sh(`nav button[data-p=${p}]`,can('acct')));['opsboard','reportauto','standards'].forEach(p=>sh(`nav button[data-p=${p}]`,can('report')));sh('nav button[data-p=backup]',can('backup'));
 ['aw'].forEach(i=>id(i,can('add')));['tA','tB','tC','tD','dk_nf'].forEach(i=>id(i,can('residence')||e));['bs','bn','mnb2','imode'].forEach(i=>id(i,can('bulk')));id('ds2',d);id('dsall',d);id('xr',can('report'));
 const fx=$('fx');if(fx)fx.parentElement.classList.toggle('hide',!can('import'));const tu=$('tU');if(tu)tu.parentElement.classList.toggle('hide',!can('residence'));const z=$('dk_zone');if(z)z.closest('.card').classList.toggle('hide',!e);
 sh('[data-de],[data-de2],[data-fr]',e);sh('[data-dx],[data-dx2],[data-fd]',d);
 id('ar_re',can('restore'));id('ar_pd',can('purge'));
 const f=$('ft');if(f)f.textContent=ME.id?`${ME.name||'Người dùng'} · ${ROLES[ME.role]||ME.role}${SD.on?' · Dữ liệu dùng chung':''}`:'Dữ liệu lưu trên trình duyệt này';
 if(page=='acc'&&!can('acct'))go('home');if(page=='backup'&&!can('backup'))go('home')}
// -- đồng bộ dùng chung (db): dữ liệu chia thành 64 mảnh theo mã công nhân, chỉ ghi mảnh có thay đổi
const hsh=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h},cln=o=>JSON.parse(JSON.stringify(o));
const chunk=arr=>{const m={};arr.forEach(x=>{const k='c'+String(hsh(x.id)%64).padStart(2,'0');(m[k]=m[k]||[]).push(x)});return m};
function ordW(){const has=W.filter(w=>w.o!=null);let mn=has.length?Math.min(...has.map(w=>w.o)):0;const ms=W.filter(w=>w.o==null);if(has.length)ms.slice().reverse().forEach(w=>{w.o=--mn});else ms.forEach((w,i)=>{w.o=i})}
async function syncPart(col,arr){const m=chunk(arr),L=SD.last[col]=SD.last[col]||{},R=SD.rev[col]=SD.rev[col]||{},ids=new Set([...Object.keys(m),...Object.keys(L)]),jobs=[];
 ids.forEach(id=>{const js=m[id]?JSON.stringify(m[id]):'';if(js===L[id])return;L[id]=js;const r=SD.db.collection(col).doc(id);if(m[id]){const rev=Date.now()+Math.random();R[id]=rev;jobs.push(r.set({items:m[id],by:SD.cid,rev}))}else{R[id]=null;jobs.push(r.delete())}});await Promise.all(jobs)}
async function flushShared(){if(!SD.on||!SD.db)return;try{ordW();await syncPart('workers',W);await syncPart('arc',ARC);await syncPart('reg',REG);
 const nl=LOG.filter(l=>!l._s);nl.forEach(l=>{l.at=l.at||Date.now();l._s=1});await Promise.all(nl.map(l=>{const{_s,...x}=l;return SD.db.collection('logs').add(x)}));const na=ATT.filter(l=>!l._s);na.forEach(l=>{l._s=1});await Promise.all(na.map(l=>{const{_s,...x}=l;return SD.db.collection('att').add(x)}))}
 catch(e){SD.last={};alert('Không lưu được lên hệ thống dùng chung: '+(e&&e.message||e)+'. Có thể tài khoản của bạn chỉ có quyền xem.')}}
function schedFlush(){clearTimeout(SD.timer);SD.timer=setTimeout(flushShared,500)}
function partSnap(col,sn,apply){const R=SD.rev[col]=SD.rev[col]||{},L=SD.last[col]=SD.last[col]||{};let ch=!SD.loaded[col];const seen=new Set();
 sn.docs.forEach(d=>{seen.add(d.id);const v=d.data()||{};if(v.rev!==R[d.id]||!(d.id in R)){ch=true;R[d.id]=v.rev}});
 Object.keys(R).forEach(id=>{if(!seen.has(id)&&R[id]!=null){ch=true;R[id]=null}});if(!ch)return;SD.loaded[col]=true;
 const items=sn.docs.flatMap(d=>cln((d.data()||{}).items||[]));apply(items);Object.keys(L).forEach(k=>delete L[k]);Object.entries(chunk(items)).forEach(([k,v])=>L[k]=JSON.stringify(v))}
function subShared(){if(SD.sub||!SD.db)return;SD.sub=true;const db=SD.db,er=()=>{};
 db.collection('workers').onSnapshot(sn=>partSnap('workers',sn,it=>{if(!it.length&&W.length)return;if(W.length)try{if(!localStorage.getItem('ktx_backup_truoc_dung_chung'))localStorage.setItem('ktx_backup_truoc_dung_chung',JSON.stringify({W,ARC,LOG:LOG.slice(0,500),at:Date.now()}))}catch(e){}W=it.sort((a,b)=>(a.o||0)-(b.o||0));all()}),er);
 db.collection('arc').onSnapshot(sn=>partSnap('arc',sn,it=>{ARC=it.sort((a,b)=>(b.at||0)-(a.at||0));if(page=='arc')arcRender()}),er);
 db.collection('reg').onSnapshot(sn=>partSnap('reg',sn,it=>{REG=it.sort((a,b)=>(b.at||0)-(a.at||0));if(page=='qr'&&QT=='reg')qrPage()}),er);
 db.collection('att').orderBy('at','desc').limit(3000).onSnapshot(sn=>{const un=ATT.filter(l=>!l._s);ATT=[...un,...sn.docs.map(d=>({...cln(d.data()),_s:1}))];if(page=='qr'&&QT=='scan')qsRefresh()},er);
 db.collection('logs').orderBy('at','desc').limit(500).onSnapshot(sn=>{const un=LOG.filter(l=>!l._s);LOG=[...un,...sn.docs.map(d=>({...cln(d.data()),_s:1}))];if(page=='log')logp()},er)}
// -- đăng nhập bằng tài khoản claude.ai + vai trò
function roleCalc(){const a=ME.id?SD.ACC[ME.id]:null;ME.acct=a||null;
 if(!SD.ready)SD.gate='loading';else if(!SD.on||ME.owner){ME.role='admin';SD.gate=''}else if(a&&ROLES[a.role]){ME.role=a.role;SD.gate=''}else{ME.role='viewer';SD.gate=SD.gate=='sent'?'sent':'noacct'}
 showGate();applyPerms();if(!SD.gate&&typeof activityLoginOnce==='function')activityLoginOnce();if(page=='acc')accPage()}
function showGate(){const g=$('gate'),k=SD.gate;g.classList.toggle('hide',!k);if(!k)return;
 
function systemFunctionsPage(){
 const el=$('sysfunc');if(!el)return;
 const items=[
  {g:'Quản trị & truy cập',p:'adminboard',t:'Dashboard quản trị',d:'Tổng hợp tình trạng hệ thống và các chỉ số quản trị.',i:'home',perm:'acct',c:'purple'},
  {g:'Quản trị & truy cập',p:'acc',t:'Quản lý tài khoản',d:'Tài khoản, vai trò và phạm vi phụ trách.',i:'key',perm:'acct'},
  {g:'Quản trị & truy cập',p:'access',t:'Phân quyền & truy cập',d:'Kiểm tra ma trận quyền và cấu hình truy cập.',i:'key',perm:'acct'},
  {g:'Quản trị & truy cập',p:'activity',t:'Hoạt động người dùng',d:'Theo dõi thao tác quan trọng theo từng tài khoản.',i:'users',perm:'acct'},
  {g:'Quản trị & truy cập',p:'security',t:'Phiên đăng nhập & bảo mật',d:'Theo dõi phiên hiện tại và dấu hiệu cần rà soát.',i:'key',perm:'acct'},
  {g:'Dữ liệu & đồng bộ',p:'sync',t:'Đồng bộ Supabase',d:'Đồng bộ dữ liệu giữa nhiều máy và xử lý hàng đợi.',i:'ul',c:'green'},
  {g:'Dữ liệu & đồng bộ',p:'backup',t:'Sao lưu dữ liệu',d:'Backup thủ công, tự động và khôi phục dữ liệu.',i:'dl',perm:'backup',c:'green'},
  {g:'Dữ liệu & đồng bộ',p:'dataaudit',t:'Kiểm tra toàn bộ dữ liệu',d:'Quét chất lượng, trùng lặp, phòng và cư trú.',i:'check',c:'green'},
  {g:'Dữ liệu & đồng bộ',p:'standards',t:'Chuẩn hóa dữ liệu',d:'Chuẩn hóa định dạng CCCD, SĐT, MNV, KTX, Dãy, Phòng.',i:'check',perm:'report'},
  {g:'Dữ liệu & đồng bộ',p:'safety',t:'An toàn dữ liệu',d:'Điểm khôi phục và bảo vệ trước thao tác lớn.',i:'key'},
  {g:'Giám sát & vận hành',p:'health',t:'Sức khỏe hệ thống',d:'Kiểm tra Internet, Supabase, backup, PWA và dung lượng.',i:'check',c:'green'},
  {g:'Giám sát & vận hành',p:'incidents',t:'Trung tâm sự cố',d:'Lỗi ứng dụng, đồng bộ, import và lịch sử xử lý.',i:'log',perm:'acct',c:'danger'},
  {g:'Giám sát & vận hành',p:'alerts',t:'Trung tâm cảnh báo',d:'Các vấn đề dữ liệu và công việc cần xử lý.',i:'log',c:'warn'},
  {g:'Giám sát & vận hành',p:'opsboard',t:'Dashboard vận hành',d:'Tình hình KTX trong ngày và đầu việc cần xử lý.',i:'home',perm:'report'},
  {g:'Giám sát & vận hành',p:'log',t:'Nhật ký hệ thống',d:'Lịch sử thao tác và thay đổi dữ liệu.',i:'log'},
  {g:'Báo cáo & vòng đời hệ thống',p:'reportauto',t:'Báo cáo định kỳ',d:'Lưu chốt số liệu ngày, tuần và tháng.',i:'chart',perm:'report'},
  {g:'Báo cáo & vòng đời hệ thống',p:'maintenance',t:'Bảo trì & lưu trữ',d:'Dọn dữ liệu cũ và giữ ứng dụng hoạt động nhẹ.',i:'tool',perm:'acct'},
  {g:'Báo cáo & vòng đời hệ thống',p:'qa',t:'Nghiệm thu Production',d:'Checklist kiểm thử trước khi phát hành.',i:'check',perm:'acct'},
  {g:'Báo cáo & vòng đời hệ thống',p:'release',t:'Phát hành v1.0',d:'Thông tin phiên bản và trạng thái phát hành.',i:'bld',perm:'acct'},
  {g:'Báo cáo & vòng đời hệ thống',p:'pwa',t:'Cài ứng dụng',d:'Cài KTX Hóc Môn như ứng dụng trên máy tính/điện thoại.',i:'dl',c:'purple'}
 ];
 const allowed=x=>!x.perm||can(x.perm);
 const groups=[...new Set(items.map(x=>x.g))];
 const icon=x=>`<svg class="i"><use href="#i-${x}"/></svg>`;
 const cls=x=>x.c?` sf-${x.c}`:'';
 el.innerHTML=`<div class="sysfunc-wrap"><div class="sysfunc-intro"><div class="sf-ico">${icon('cog')}</div><div><h3>Chức năng hệ thống</h3><p>Tất cả công cụ quản trị được gom tại đây. Bấm vào từng chức năng để mở trang tương ứng.</p></div></div>${groups.map(g=>{const rows=items.filter(x=>x.g===g&&allowed(x));if(!rows.length)return'';return `<div class="sysfunc-group"><h3>${esc(g)}</h3><div class="sysfunc-grid">${rows.map(x=>`<button class="sysfunc-btn${cls(x)}" type="button" data-sys-go="${esc(x.p)}"><span class="sficon">${icon(x.i)}</span><span><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span></button>`).join('')}</div></div>`}).join('')}<div class="sysfunc-footer">Các nút được hiển thị theo quyền của tài khoản hiện tại. Chức năng không có quyền sẽ tự động ẩn.</div></div>`;
 el.querySelectorAll('[data-sys-go]').forEach(b=>b.onclick=()=>{const p=b.dataset.sysGo;if(p==='pwa'){if(typeof pwaOpenInstall==='function')pwaOpenInstall();else if($('pwaInstallDlg'))$('pwaInstallDlg').showModal();return}go(p)});
}

const T={loading:['Đang đăng nhập...','Đang xác minh tài khoản claude.ai của bạn.',''],noacct:['Xin chào'+(ME.name?', '+ME.name:''),'Tài khoản này chưa được cấp quyền sử dụng hệ thống quản lý KTX. Bạn có thể gửi yêu cầu để quản trị viên duyệt.','rq'],sent:['Đã gửi yêu cầu','Quản trị viên sẽ duyệt và cấp quyền cho bạn. Được duyệt xong, bấm "Tải lại" để vào hệ thống.','re']}[k];
 $('gt1').textContent=T[0];$('gt2').textContent=T[1];$('gb').innerHTML=(T[2]=='rq'?'<button class="btn" id="g_rq">Gửi yêu cầu cấp quyền</button>':'')+(T[2]?'<button class="btn s" id="g_re">Tải lại</button>':'');
 if($('g_rq'))$('g_rq').onclick=async()=>{try{await SD.db.collection('requests').doc(ME.id||'anon').set({at:Date.now()});SD.gate='sent';showGate()}catch(e){alert('Không gửi được yêu cầu. Hãy liên hệ quản trị viên để được cấp quyền truy cập trang này.')}};
 if($('g_re'))$('g_re').onclick=()=>location.reload()}

// STEP123 — global renderer for centralized System Functions hub
window.systemFunctionsPage=function(){
 const el=$('sysfunc');if(!el)return;
 const items=[
  {g:'Quản trị & truy cập',p:'adminboard',t:'Dashboard quản trị',d:'Tổng hợp tình trạng hệ thống và các chỉ số quản trị.',i:'home',perm:'acct',c:'purple'},
  {g:'Quản trị & truy cập',p:'acc',t:'Quản lý tài khoản',d:'Tài khoản, vai trò và phạm vi phụ trách.',i:'key',perm:'acct'},
  {g:'Quản trị & truy cập',p:'access',t:'Phân quyền & truy cập',d:'Kiểm tra ma trận quyền và cấu hình truy cập.',i:'key',perm:'acct'},
  {g:'Quản trị & truy cập',p:'activity',t:'Hoạt động người dùng',d:'Theo dõi thao tác quan trọng theo từng tài khoản.',i:'users',perm:'acct'},
  {g:'Quản trị & truy cập',p:'security',t:'Phiên đăng nhập & bảo mật',d:'Theo dõi phiên hiện tại và dấu hiệu cần rà soát.',i:'key',perm:'acct'},
  {g:'Dữ liệu & đồng bộ',p:'sync',t:'Đồng bộ Supabase',d:'Đồng bộ dữ liệu giữa nhiều máy và xử lý hàng đợi.',i:'ul',c:'green'},
  {g:'Dữ liệu & đồng bộ',p:'backup',t:'Sao lưu dữ liệu',d:'Backup thủ công, tự động và khôi phục dữ liệu.',i:'dl',perm:'backup',c:'green'},
  {g:'Dữ liệu & đồng bộ',p:'dataaudit',t:'Kiểm tra toàn bộ dữ liệu',d:'Quét chất lượng, trùng lặp, phòng và cư trú.',i:'check',c:'green'},
  {g:'Dữ liệu & đồng bộ',p:'standards',t:'Chuẩn hóa dữ liệu',d:'Chuẩn hóa định dạng CCCD, SĐT, MNV, KTX, Dãy, Phòng.',i:'check',perm:'report'},
  {g:'Dữ liệu & đồng bộ',p:'safety',t:'An toàn dữ liệu',d:'Điểm khôi phục và bảo vệ trước thao tác lớn.',i:'key'},
  {g:'Giám sát & vận hành',p:'health',t:'Sức khỏe hệ thống',d:'Kiểm tra Internet, Supabase, backup, PWA và dung lượng.',i:'check',c:'green'},
  {g:'Giám sát & vận hành',p:'incidents',t:'Trung tâm sự cố',d:'Lỗi ứng dụng, đồng bộ, import và lịch sử xử lý.',i:'log',perm:'acct',c:'danger'},
  {g:'Giám sát & vận hành',p:'alerts',t:'Trung tâm cảnh báo',d:'Các vấn đề dữ liệu và công việc cần xử lý.',i:'log',c:'warn'},
  {g:'Giám sát & vận hành',p:'opsboard',t:'Dashboard vận hành',d:'Tình hình KTX trong ngày và đầu việc cần xử lý.',i:'home',perm:'report'},
  {g:'Giám sát & vận hành',p:'log',t:'Nhật ký hệ thống',d:'Lịch sử thao tác và thay đổi dữ liệu.',i:'log'},
  {g:'Báo cáo & vòng đời hệ thống',p:'reportauto',t:'Báo cáo định kỳ',d:'Lưu chốt số liệu ngày, tuần và tháng.',i:'chart',perm:'report'},
  {g:'Báo cáo & vòng đời hệ thống',p:'maintenance',t:'Bảo trì & lưu trữ',d:'Dọn dữ liệu cũ và giữ ứng dụng hoạt động nhẹ.',i:'tool',perm:'acct'},
  {g:'Báo cáo & vòng đời hệ thống',p:'qa',t:'Nghiệm thu Production',d:'Checklist kiểm thử trước khi phát hành.',i:'check',perm:'acct'},
  {g:'Báo cáo & vòng đời hệ thống',p:'release',t:'Phát hành v1.0',d:'Thông tin phiên bản và trạng thái phát hành.',i:'bld',perm:'acct'},
  {g:'Báo cáo & vòng đời hệ thống',p:'pwa',t:'Cài ứng dụng',d:'Cài KTX Hóc Môn như ứng dụng trên máy tính/điện thoại.',i:'dl',c:'purple'}
 ];
 const allowed=x=>!x.perm||can(x.perm);
 const groups=[...new Set(items.map(x=>x.g))];
 const icon=x=>`<svg class="i"><use href="#i-${x}"/></svg>`;
 const cls=x=>x.c?` sf-${x.c}`:'';
 el.innerHTML=`<div class="sysfunc-wrap"><div class="sysfunc-intro"><div class="sf-ico">${icon('cog')}</div><div><h3>Chức năng hệ thống</h3><p>Tất cả công cụ quản trị được gom tại đây. Bấm vào từng chức năng để mở trang tương ứng.</p></div></div>${groups.map(g=>{const rows=items.filter(x=>x.g===g&&allowed(x));if(!rows.length)return'';return `<div class="sysfunc-group"><h3>${esc(g)}</h3><div class="sysfunc-grid">${rows.map(x=>`<button class="sysfunc-btn${cls(x)}" type="button" data-sys-go="${esc(x.p)}"><span class="sficon">${icon(x.i)}</span><span><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span></button>`).join('')}</div></div>`}).join('')}<div class="sysfunc-footer">Các nút được hiển thị theo quyền của tài khoản hiện tại. Chức năng không có quyền sẽ tự động ẩn.</div></div>`;
 el.querySelectorAll('[data-sys-go]').forEach(b=>b.onclick=()=>{const p=b.dataset.sysGo;if(p==='pwa'){if(typeof pwaOpenInstall==='function')pwaOpenInstall();else if($('pwaInstallDlg'))$('pwaInstallDlg').showModal();return}go(p)});
};

async function authInit(){if(!(window.claude&&claude.use))return;let U=null,db=null;try{U=await claude.use('user')}catch(e){}try{db=await claude.use('db')}catch(e){}
 SD.U=U;SD.db=db;if(!U||!db)return;
 try{const m=await U.me();ME.id=m.id;ME.name=m.name||'';ME.owner=!!m.isOwner}catch(e){try{ME.owner=await U.isOwner()}catch(x){}}
 SD.ready=false;roleCalc();let n=0;const done=()=>{if(++n>=2&&!SD.ready){SD.ready=true;roleCalc()}};setTimeout(()=>{if(!SD.ready){SD.ready=true;roleCalc()}},6000);
 db.collection('settings').onSnapshot(sn=>{const d=sn.docs.find(x=>x.id=='shared'),on=!!(d&&(d.data()||{}).on);const ch=on!==SD.on;SD.on=on;if(on)subShared();if(ch&&SD.ready)roleCalc();done()},()=>done());
 db.collection('accounts').onSnapshot(sn=>{SD.ACC=Object.fromEntries(sn.docs.map(d=>[d.id,cln(d.data()||{})]));if(SD.ready)roleCalc();done()},()=>done());
 db.collection('requests').onSnapshot(sn=>{SD.REQ=sn.docs.map(d=>({id:d.id,at:(d.data()||{}).at}));if(page=='acc')accPage()},()=>{})}
// -- trang Quản lý tài khoản (Quản trị)
const sc=v=>String(v||'').split(',').map(x=>x.trim()).filter(Boolean);
async function accSet(id,patch){await SD.db.collection('accounts').doc(id).set({...(SD.ACC[id]||{}),...patch,at:Date.now()});try{add('ACCOUNT',`Cập nhật tài khoản ${id}${patch&&patch.role?' · vai trò '+(ROLES[patch.role]||patch.role):''}`)}catch(e){}}
async function enableShared(){if(!can('acct'))return;
 if(!await ask(`Bật dữ liệu dùng chung?\nTrang sẽ đưa ${W.length.toLocaleString('vi-VN')} công nhân hiện có trên máy này lên hệ thống để mọi nhân viên được cấp quyền cùng dùng. Bản sao lưu được giữ trên máy này.\n\nTừ lúc này, nhân viên phải được cấp tài khoản mới vào được.`,{title:'Bật dữ liệu dùng chung',ok:'Bật',cls:''}))return;
 try{localStorage.setItem('ktx_backup_truoc_dung_chung',JSON.stringify({W,ARC,LOG:LOG.slice(0,500),at:Date.now()}))}catch(e){}
 try{SD.on=true;SD.last={};SD.rev={};await flushShared();await SD.db.collection('settings').doc('shared').set({on:true,at:Date.now()});subShared();roleCalc();alert('Đã bật dữ liệu dùng chung. Nhân viên mở trang bằng tài khoản claude.ai được cấp quyền sẽ thấy cùng dữ liệu.')}catch(e){SD.on=false;alert('Không bật được: '+(e&&e.message||e))}}
async function accPage(){const el=$('acc');if(!el)return;
 if(!SD.db||!SD.U){el.innerHTML='<div class="card"><h3>Chưa dùng được tài khoản</h3><p class="mut">Trang này đang chạy ở chế độ chỉ trên máy bạn (không kết nối được nơi lưu dùng chung). Hãy mở trang từ claude.ai bằng tài khoản có quyền chỉnh sửa để tạo tài khoản nhân viên.</p></div>';return}
 if(!can('acct')){el.innerHTML='<div class="card"><p class="mut">Chỉ Quản trị mới xem được mục này.</p></div>';return}
 const ids=[...new Set([...Object.keys(SD.ACC),...SD.REQ.map(r=>r.id)])],P=ids.length?await SD.U.profiles(ids):{},nm=i=>(P[i]&&P[i].name)||'Người dùng (chưa rõ tên)',ro=(v,i)=>`<select id="${i}">${Object.entries(ROLES).map(([k,l])=>`<option value="${k}" ${k==v?'selected':''}>${l}</option>`).join('')}</select>`;
 const A=Object.entries(SD.ACC);
 el.innerHTML=`<div class="g2"><div class="card"><h3>Phiên đăng nhập hiện tại</h3><div class="row" style="gap:12px"><div class="av">${esc((ME.name||'?').charAt(0).toUpperCase())}</div><div><b>${esc(ME.name||'Người dùng')}</b><div><span class="rb">${ROLES[ME.role]}</span> <span class="mut" style="font-size:12px">${ME.owner?'Chủ sở hữu trang':'Tài khoản claude.ai được cấp quyền'}</span></div></div></div></div>
 <div class="card"><h3>Dữ liệu dùng chung</h3>${SD.on?'<p class="ok" style="margin:0"><b>Đang bật.</b> Công nhân, danh sách điều chuyển/nghỉ việc và nhật ký được lưu chung, mọi tài khoản cùng thấy dữ liệu mới nhất.</p>':`<p class="mut" style="margin:0 0 10px">Đang tắt: dữ liệu chỉ nằm trên máy này và chưa cần đăng nhập. Bật để nhiều nhân viên cùng dùng và áp dụng phân quyền.</p><button class="btn" id="ac_on">${ico('ul')}Bật dữ liệu dùng chung</button>`}</div></div>
 <div class="card"><h3>Tài khoản nhân viên (${A.length})</h3>${A.length?`<div class="wrap"><table class="cmp3"><tr><th>Họ tên</th><th>Vai trò</th><th>KTX phụ trách</th><th>Dãy phụ trách</th><th>Thao tác</th></tr>${A.map(([id,a],i)=>`<tr><td class="wr" style="text-align:left"><b>${esc(nm(id))}</b></td><td>${ro(a.role,'ar'+i)}</td><td><input id="ak${i}" value="${esc((a.ktx||[]).join(', '))}" placeholder="Tất cả" style="width:110px"></td><td><input id="ad${i}" value="${esc((a.days||[]).join(', '))}" placeholder="Tất cả" style="width:110px"></td><td><button class="btn sm" data-as="${esc(id)}|${i}">Lưu</button> <button class="btn r sm" data-ax="${esc(id)}">Xóa</button></td></tr>`).join('')}</table></div>`:'<p class="mut">Chưa có tài khoản nào. Thêm nhân viên ở bên dưới.</p>'}</div>
 <div class="card"><h3>Thêm tài khoản</h3><div class="row"><input id="ac_q" placeholder="Gõ tên nhân viên để tìm (cùng tổ chức claude.ai)..." style="flex:1;min-width:240px"></div><div id="ac_r" style="margin-top:10px"></div></div>
 <div class="card"><h3>Yêu cầu truy cập (${SD.REQ.length})</h3>${SD.REQ.length?SD.REQ.map((r,i)=>`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--ln)"><b style="min-width:160px">${esc(nm(r.id))}</b>${ro('staff','rr'+i)}<button class="btn g sm" data-aa="${esc(r.id)}|${i}">Duyệt</button><button class="btn s sm" data-ar="${esc(r.id)}">Từ chối</button></div>`).join(''):'<p class="mut" style="margin:0">Không có yêu cầu nào đang chờ.</p>'}</div>
 <div class="card"><h3>Cách tạo tài khoản cho nhân viên</h3><ol class="mut" style="margin:0;padding-left:20px;line-height:1.7"><li>Bấm <b>Chia sẻ</b> của trang, mời nhân viên bằng email claude.ai: <b>Contributor</b> nếu họ cần nhập/sửa dữ liệu, <b>Viewer</b> nếu chỉ xem, <b>Editor</b> nếu là quản trị.</li><li>Quay lại đây, tìm tên nhân viên ở mục <b>Thêm tài khoản</b> và chọn vai trò, phạm vi KTX/Dãy.</li><li>Nhân viên mở trang bằng tài khoản của mình, không cần mật khẩu riêng. Chưa được thêm thì chỉ thấy màn hình xin quyền.</li></ol>
 <p class="mut" style="margin:10px 0 0;font-size:12.5px"><b>Vai trò:</b> Quản trị (toàn quyền) · Quản lý (thêm/sửa/chuyển phòng/duyệt QR) · Nhập liệu (thêm/sửa, không xóa) · Bảo vệ (chỉ xem, xác nhận vào/ra theo nghiệp vụ được cấp) · Chỉ xem.</p></div><div class="card"><h3>Ma trận phân quyền</h3><div class="wrap"><table class="cmp3 perm-matrix"><tr><th>Vai trò</th><th>Thêm</th><th>Sửa</th><th>Chuyển phòng</th><th>Xác nhận vào/ra</th><th>Xóa</th><th>Xóa hẳn</th><th>Duyệt QR</th><th>Import</th><th>Backup</th><th>Tài khoản</th></tr>${Object.entries(ROLES).map(([k,l])=>{const p=ROLE_PERMS[k];const y=v=>v?'✓':'—';return `<tr><td><b>${esc(l)}</b></td><td>${y(p.add)}</td><td>${y(p.editw)}</td><td>${y(p.transfer)}</td><td>${y(p.attendance)}</td><td>${y(p.del)}</td><td>${y(p.purge)}</td><td>${y(p.qrApprove)}</td><td>${y(p.import)}</td><td>${y(p.backup)}</td><td>${y(p.acct)}</td></tr>`}).join('')}</table></div><p class="mut" style="margin:10px 0 0">Các quyền nhạy cảm <b>Xóa hẳn · Backup · Tài khoản · Duyệt QR · Import</b> được kiểm tra độc lập, không dùng chung một quyền tổng.</p></div>`;
 const g=(q,f)=>el.querySelectorAll(q).forEach(b=>b.onclick=()=>f(b));
 if($('ac_on'))$('ac_on').onclick=enableShared;
 g('[data-as]',async b=>{const[id,i]=b.dataset.as.split('|');await accSet(id,{role:$('ar'+i).value,ktx:sc($('ak'+i).value).map(x=>/^\d+$/.test(x)?'KTX '+x:x),days:sc($('ad'+i).value).map(x=>/^\d+$/.test(x)?'Dãy '+x:x)}).then(()=>alert('Đã lưu tài khoản.')).catch(e=>alert('Không lưu được: '+(e&&e.message||e)))});
 g('[data-ax]',async b=>{if(!await ask(`Xóa tài khoản "${nm(b.dataset.ax)}"?\nNgười này sẽ không vào được hệ thống nữa (trừ khi bạn thêm lại).`,{title:'Xác nhận xóa tài khoản',ok:'Xóa'}))return;try{await SD.db.collection('accounts').doc(b.dataset.ax).delete();alert('Đã xóa tài khoản.')}catch(e){alert('Không xóa được: '+(e&&e.message||e))}});
 g('[data-aa]',async b=>{const[id,i]=b.dataset.aa.split('|');try{await accSet(id,{role:$('rr'+i).value,ktx:[],days:[]});await SD.db.collection('requests').doc(id).delete();alert('Đã duyệt và tạo tài khoản.')}catch(e){alert('Không duyệt được: '+(e&&e.message||e))}});
 g('[data-ar]',async b=>{try{await SD.db.collection('requests').doc(b.dataset.ar).delete();alert('Đã từ chối yêu cầu.')}catch(e){alert('Không xử lý được: '+(e&&e.message||e))}});
 $('ac_q').oninput=async e=>{const q=e.target.value.trim(),R=$('ac_r');if(q.length<2){R.innerHTML='';return}const hits=(await SD.U.search(q)).filter(h=>h.id&&!SD.ACC[h.id]);
  R.innerHTML=hits.length?hits.map((h,i)=>`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--ln)"><b style="min-width:180px">${esc(h.name)}</b>${ro('staff','as_r'+i)}<button class="btn sm" data-an="${esc(h.id)}|${i}">Thêm</button></div>`).join(''):'<p class="mut" style="margin:0">Không tìm thấy (hoặc đã có tài khoản). Người cần thuộc cùng tổ chức claude.ai với bạn.</p>';
  R.querySelectorAll('[data-an]').forEach(b=>b.onclick=async()=>{const[id,i]=b.dataset.an.split('|');try{await accSet(id,{role:$('as_r'+i).value,ktx:[],days:[]});alert('Đã thêm tài khoản. Nhớ mời người này vào trang bằng nút Chia sẻ nếu chưa mời.')}catch(e){alert('Không thêm được: '+(e&&e.message||e))}})}}
authInit();
{const _ds=$('ds').onclick;$('ds').onclick=function(){if(EW?!can('editw',EW):!can('edit')){alert('Bạn chỉ được sửa công nhân thuộc KTX/Dãy được giao cho tài khoản của bạn.');return}return _ds.apply(this,arguments)}}
// ---- QR Online · Đăng ký vào / Đăng ký ra KTX (chỉ chỉnh riêng module QR)
let QT='make',QM={t:'',s:'',c:''},QRREQ=[],QRCH=null,QCAM=null;
const ico2=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
function qrDraw(cv,text,size,quiet){const m=QRL.matrix(text,0),q=quiet==null?4:quiet,t=m.n+2*q,sc=Math.max(1,Math.floor(size/t)),px=sc*t;cv.width=cv.height=px;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,px,px);x.fillStyle='#000';for(let r=0;r<m.n;r++)for(let c=0;c<m.n;c++)if(m.dark(r,c))x.fillRect((c+q)*sc,(r+q)*sc,sc,sc);return px}
const qWrap=(x,t,cx,y,mw,lh,al)=>{const w=String(t).split(/\s+/),ls=[];let l='';w.forEach(s=>{const tt=l?l+' '+s:s;if(x.measureText(tt).width>mw&&l){ls.push(l);l=s}else l=tt});if(l)ls.push(l);x.textAlign=al||'center';ls.forEach((s,i)=>x.fillText(s,cx,y+i*lh));return ls.length};
function qrPoster(t,sub,text){const cv=document.createElement('canvas');cv.width=900;cv.height=1200;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,900,1200);const g=x.createLinearGradient(0,0,900,0);g.addColorStop(0,'#2f6fe8');g.addColorStop(1,'#6d4bf0');x.fillStyle=g;x.fillRect(0,0,900,210);x.fillStyle='#fff';x.font='bold 48px "Be Vietnam Pro",Arial,sans-serif';qWrap(x,t||'MÃ QR',450,100,800,58);x.fillStyle='#14213a';x.font='30px "Be Vietnam Pro",Arial,sans-serif';qWrap(x,sub||'',450,270,800,40);const q=document.createElement('canvas');if(text){const px=qrDraw(q,text,660,3);x.drawImage(q,(900-px)/2,330,px,px);x.strokeStyle='#d9e1ec';x.lineWidth=3;x.strokeRect((900-px)/2-6,324,px+12,px+12)}x.fillStyle='#5b6c8a';x.font='22px Arial';x.textAlign='center';const f=String(text||'');qWrap(x,f.length>90?f.slice(0,87)+'…':f,450,1080,820,30);x.font='bold 26px Arial';x.fillStyle='#2f6fe8';x.fillText('KÝ TÚC XÁ HÓC MÔN',450,1160);return cv}
function qrSave(cv,name){return new Promise((resolve,reject)=>cv.toBlob(b=>{if(!b)return reject(new Error('Không tạo được ảnh QR'));dlBrowser(name,b,'image/png');resolve()},'image/png'))}
const slug=t=>sa(t).replace(/\s+/g,'-').slice(0,40)||'qr';
function qrCfg(){const c=(typeof syncCfg==='function'?syncCfg():null)||window.KTX_QR_CONFIG||{};return{url:String(c.url||''),key:String(c.key||'')}}
function qrSb(){const c=qrCfg();if(typeof syncClient==='function'){const s=syncClient();if(s)return s}if(!window.supabase||!/^https:\/\//.test(c.url)||!c.key||/PASTE_|YOUR_/i.test(c.key))return null;if(!window.__KTX_QR_SB)window.__KTX_QR_SB=window.supabase.createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});return window.__KTX_QR_SB}
function qrFormUrl(mode){const base=location.origin+(location.pathname.endsWith('/')?location.pathname:location.pathname.replace(/\/[^/]*$/,'/'));return new URL('qr-form.html?mode='+mode,base).href}
function qrPage(){const el=$('qr');const tabs=[['make','Tạo mã QR'],...(can('view')?[['attendance','Điểm danh bằng QR · Xuất Excel']]:[]),,...(can('qrApprove')?[['regin','Duyệt đăng ký vào'],['regout','Duyệt đăng ký ra']]:[])];if(!tabs.some(t=>t[0]==QT))QT='make';el.innerHTML=`<div class="row" style="margin-bottom:14px">${tabs.map(t=>`<button class="btn ${QT==t[0]?'':'s'}" data-qt="${t[0]}">${t[1]}${t[0]=='regin'&&QRREQ.filter(x=>x.request_type=='in'&&x.status=='pending').length?` <span class="pill">${QRREQ.filter(x=>x.request_type=='in'&&x.status=='pending').length}</span>`:''}${t[0]=='regout'&&QRREQ.filter(x=>x.request_type=='out'&&x.status=='pending').length?` <span class="pill" style="background:linear-gradient(135deg,#d99019,#f0ab2b)">${QRREQ.filter(x=>x.request_type=='out'&&x.status=='pending').length}</span>`:''}</button>`).join('')}</div><div id="qb"></div>`;el.querySelectorAll('[data-qt]').forEach(b=>b.onclick=()=>{QT=b.dataset.qt;qrPage()});({make:qrMake,attendance:()=>window.ktxAttendancePage(),scan:qrAttendancePage,regin:()=>qrApprovePage('in'),regout:()=>qrApprovePage('out')})[QT]()}
function qrMake(){const lin=qrFormUrl('in'),lout=qrFormUrl('out');$('qb').innerHTML=`<div class="g2"><div class="card"><h3>Đăng ký vào KTX</h3><p class="mut" style="font-size:12.5px">Công nhân quét mã → điền biểu mẫu → hồ sơ chuyển vào <b>Duyệt đăng ký vào</b>. Chỉ sau khi quản lý duyệt mới thêm vào danh sách tổng.</p><canvas id="qrin" style="width:100%;max-width:330px;display:block;margin:10px auto;border:2px solid #2f6fe8;border-radius:12px;box-shadow:0 0 0 4px rgba(47,111,232,.08)"></canvas><div class="row" style="justify-content:center"><button class="btn g" id="qrinp">${ico2('dl')}Tải áp phích</button><button class="btn s" id="qrinq">${ico2('dl')}Tải mã QR</button></div><label class="fl">Link biểu mẫu<input value="${esc(lin)}" readonly onclick="this.select()"></label></div><div class="card"><h3>Đăng ký ra khỏi KTX</h3><p class="mut" style="font-size:12.5px">Công nhân nhập <b>Họ tên · CCCD · Dãy · Phòng</b>; Mã nhân viên và SĐT không bắt buộc. Yêu cầu chuyển vào <b>Duyệt đăng ký ra</b>; sau khi duyệt người đó được chuyển khỏi danh sách tổng.</p><canvas id="qrout" style="width:100%;max-width:330px;display:block;margin:10px auto;border:2px solid #ef4444;border-radius:12px;box-shadow:0 0 0 4px rgba(239,68,68,.08)"></canvas><div class="row" style="justify-content:center"><button class="btn" id="qroutp">${ico2('dl')}Tải áp phích</button><button class="btn s" id="qroutq">${ico2('dl')}Tải mã QR</button></div><label class="fl">Link biểu mẫu<input value="${esc(lout)}" readonly onclick="this.select()"></label></div></div><div class="card"><h3>Trạng thái kết nối</h3><div id="qrcfg"></div></div>`;
 const render=(id,url)=>{const c=$(id);qrDraw(c,url,850,4)};render('qrin',lin);render('qrout',lout);
 $('qrinp').onclick=()=>qrSave(qrPoster('ĐĂNG KÝ VÀO KTX HÓC MÔN','Quét mã để khai báo thông tin vào ở',lin),'QR-Dang-ky-vao-KTX.png');$('qroutp').onclick=()=>qrSave(qrPoster('ĐĂNG KÝ RA KHỎI KTX','Quét mã để gửi yêu cầu trả phòng',lout),'QR-Dang-ky-ra-KTX.png');
 $('qrinq').onclick=()=>{const c=document.createElement('canvas');qrDraw(c,lin,1000,4);qrSave(c,'QR-Dang-ky-vao.png')};$('qroutq').onclick=()=>{const c=document.createElement('canvas');qrDraw(c,lout,1000,4);qrSave(c,'QR-Dang-ky-ra.png')};
 const c=qrCfg(),ok=qrSb();$('qrcfg').innerHTML=ok?'<p class="ok" style="margin:0"><b>✓ Supabase đã cấu hình.</b> Biểu mẫu QR có thể gửi hồ sơ trực tuyến.</p>':`<div class="bkWarn"><b>Chưa cấu hình Supabase cho QR.</b><br>Mở file <code>qr-config.js</code> và điền Project URL + Publishable key. Chỉ module QR dùng cấu hình này.</div>`;
}
async function qrEnsureLogin(){const sb=(typeof syncClient==='function'&&syncClient())||qrSb();if(!sb){$('qb').innerHTML='<div class="card"><h3>Chưa cấu hình Supabase</h3><p class="mut">Hãy cấu hình Project URL và Publishable key trong Chức năng hệ thống → Đồng bộ Supabase.</p></div>';return null}const {data:{session}}=await sb.auth.getSession();if(session)return session;$('qb').innerHTML=`<div class="card" style="max-width:560px"><h3>Cần đăng nhập ứng dụng</h3><p class="mut">QR dùng chung phiên đăng nhập của toàn ứng dụng, không có đăng nhập QR riêng.</p><button class="btn" id="qrOpenLogin">Đăng nhập ứng dụng</button></div>`;const b=$('qrOpenLogin');if(b)b.onclick=()=>window.authHubShow&&window.authHubShow('login');return null}
async function qrLoadRequests(){const sb=qrSb();if(!sb)return[];const {data,error}=await sb.from('residency_requests').select('*').order('created_at',{ascending:false}).limit(500);if(error)throw error;QRREQ=data||[];return QRREQ}
async function qrApprovePage(type){if(!can('qrApprove')){alert('Bạn không có quyền duyệt hồ sơ QR.');QT='make';qrPage();return}const s=await qrEnsureLogin();if(!s)return;try{await qrLoadRequests()}catch(e){$('qb').innerHTML=`<div class="card"><h3>Không đọc được hồ sơ</h3><p class="rd">${esc(e.message||e)}</p><p class="mut">Hãy chạy file SQL thiết lập bảng residency_requests và kiểm tra RLS.</p></div>`;return}const L=QRREQ.filter(r=>r.request_type==type&&r.status=='pending');if(type=='in')qrRenderIn(L);else qrRenderOut(L);qrSubscribeRequests()}

function attLast(workerId){return ATT.filter(a=>a.workerId===workerId).sort((a,b)=>(b.at||0)-(a.at||0))[0]||null}
function qsRefresh(){if(QT==='scan'&&page==='qr')qrAttendancePage()}
function qrAttendancePage(){if(!can('attendance')){$('qb').innerHTML='<div class="card"><p class="mut">Bạn không có quyền xác nhận vào/ra.</p></div>';return}const old=$('qa_q'),q=old?old.value:'';const key=sa(q);const base=W.filter(w=>can('view',w)),L=(key?base.filter(w=>sa([w.name,w.mnv,w.cccd,w.sdt,K(w),D(w),R(w)].join(' ')).includes(key)):base).slice(0,30);$('qb').innerHTML=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><div><h3 style="margin:0">Xác nhận công nhân vào / ra</h3><div class="mut" style="font-size:11px">Dành cho Bảo vệ/Quản lý. Mỗi thao tác được ghi vào nhật ký điểm danh.</div></div><span class="tag g">${ROLES[ME.role]||ME.role}</span></div><input id="qa_q" placeholder="Tìm tên, Mã NV, CCCD, SĐT, phòng..." value="${esc(q)}" style="width:100%;margin-top:10px"></div><div class="card"><div class="wrap"><table class="cmp3"><tr><th>Họ tên</th><th>Mã NV</th><th>KTX</th><th>Dãy</th><th>Phòng</th><th>Trạng thái gần nhất</th><th>Thao tác</th></tr>${L.map(w=>{const a=attLast(w.id),st=a?(a.type==='in'?'<span class="tag g">Đã vào</span>':'<span class="tag a">Đã ra</span>'):'<span class="mut">Chưa ghi nhận</span>';return `<tr><td class="wr"><b>${esc(w.name)}</b></td><td>${esc(w.mnv||'—')}</td><td>${esc(K(w))}</td><td>${esc(D(w))}</td><td>${esc(R(w)||'—')}</td><td>${st}${a?`<div class="mut" style="font-size:9px">${esc(new Date(a.at).toLocaleString('vi-VN'))}</div>`:''}</td><td><button class="btn g sm" data-att-in="${esc(w.id)}">Vào</button> <button class="btn a sm" data-att-out="${esc(w.id)}">Ra</button></td></tr>`}).join('')||'<tr><td colspan="7" class="mut">Không tìm thấy công nhân.</td></tr>'}</table></div><div class="mut" style="margin-top:8px">Hiển thị tối đa 30 kết quả. Hãy tìm kiếm để thu hẹp.</div></div>`;const qel=$('qa_q');qel.oninput=()=>{clearTimeout(window.__qaTimer);window.__qaTimer=setTimeout(qrAttendancePage,180)};document.querySelectorAll('[data-att-in],[data-att-out]').forEach(b=>b.onclick=()=>{const id=b.dataset.attIn||b.dataset.attOut,w=W.find(x=>x.id===id);if(!w)return;const type=b.dataset.attIn?'in':'out',rec={id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),workerId:w.id,name:w.name,mnv:w.mnv||'',type,at:Date.now(),day:ldy(),actor:(ME.name||ME.id||'Người dùng'),role:ME.role};ATT.unshift(rec);if(typeof audit81==='function')audit81(type==='in'?'ATT_IN':'ATT_OUT',`Xác nhận ${type==='in'?'vào':'ra'}: ${w.name}`,{workerId:w.id,workerName:w.name,persist:false});else add('ATT',`Xác nhận ${type==='in'?'vào':'ra'}: ${w.name}`);sv();qrAttendancePage()})}
function qrFmtDate(s){if(!s)return'—';try{return new Date(s).toLocaleString('vi-VN')}catch(e){return s}}
function qrRenderIn(L){const dup=r=>(r.cccd&&W.some(w=>String(w.cccd||'')==String(r.cccd)))||(r.worker_code&&W.some(w=>String(w.mnv||'').trim()==String(r.worker_code).trim()));$('qb').innerHTML=`<div class="card"><div class="row" style="justify-content:space-between"><div><h3 style="margin:0">Đăng ký vào chờ duyệt (${L.length})</h3><div class="mut" style="font-size:12px">Duyệt xong hồ sơ mới được thêm vào danh sách tổng.</div></div><div class="row"><button class="btn s sm" id="qrrf">Tải lại</button><button class="btn s sm" id="qrlo">Đăng xuất QR</button></div></div></div><div class="card">${L.length?`<div class="wrap qr-review-cards qr-review-in"><table class="cmp3"><tr><th>Ngày gửi</th><th>Họ tên</th><th>Mã NV</th><th>CCCD</th><th>SĐT</th><th>KTX</th><th>Dãy</th><th>Phòng</th><th>Ngày vào</th><th>SĐT tổ trưởng</th><th>Trạng thái</th><th>Thao tác</th></tr>${L.map(r=>`<tr><td>${esc(qrFmtDate(r.created_at))}</td><td class="wr" style="text-align:left"><b>${esc(r.name)}</b></td><td>${esc(r.worker_code||'—')}</td><td>${esc(r.cccd||'—')}</td><td>${esc(r.phone||'—')}</td><td>${esc(r.ktx||'—')}</td><td>${esc(r.day||'—')}</td><td>${esc(r.room||'—')}</td><td>${esc(r.check_in_date||'—')}</td><td>${esc(r.leader_phone||'—')}</td><td>${dup(r)?'<span class="tag r">Có thể đã tồn tại</span>':'<span class="tag g">Mới</span>'}</td><td><button class="btn g sm" data-qi="${r.id}">Duyệt</button> <button class="btn s sm" data-qx="${r.id}">Từ chối</button></td></tr>`).join('')}</table></div>`:'<p class="mut" style="margin:0">Không có hồ sơ đăng ký vào đang chờ.</p>'}</div>`;qrBindCommon();document.querySelectorAll('[data-qi]').forEach(b=>b.onclick=()=>qrApproveIn(b.dataset.qi));document.querySelectorAll('[data-qx]').forEach(b=>b.onclick=()=>qrReject(b.dataset.qx))}
function qrRenderOut(L){const find=r=>W.find(w=>r.cccd&&String(w.cccd||'').replace(/\D/g,'')==String(r.cccd||'').replace(/\D/g,''))||W.find(w=>r.worker_code&&String(w.mnv||'').trim()==String(r.worker_code).trim())||W.find(w=>sa(w.name)==sa(r.name)&&sa(D(w))==sa(r.day)&&String(R(w)||'').trim()==String(r.room||'').trim());$('qb').innerHTML=`<div class="card"><div class="row" style="justify-content:space-between"><div><h3 style="margin:0">Đăng ký ra chờ duyệt (${L.length})</h3><div class="mut" style="font-size:12px">Đối chiếu ưu tiên theo CCCD; nếu có Mã NV thì kiểm tra thêm. Duyệt xong công nhân được chuyển khỏi danh sách tổng.</div></div><div class="row"><button class="btn s sm" id="qrrf">Tải lại</button><button class="btn s sm" id="qrlo">Đăng xuất QR</button></div></div></div><div class="card">${L.length?`<div class="wrap qr-review-cards qr-review-out"><table class="cmp3"><tr><th>Ngày gửi</th><th>Họ tên</th><th>Mã NV</th><th>CCCD</th><th>SĐT</th><th>Dãy</th><th>Phòng</th><th>Lý do</th><th>Đối chiếu</th><th>Thao tác</th></tr>${L.map(r=>{const w=find(r);return`<tr><td>${esc(qrFmtDate(r.created_at))}</td><td class="wr" style="text-align:left"><b>${esc(r.name)}</b></td><td>${esc(r.worker_code||'—')}</td><td>${esc(r.cccd||'—')}</td><td>${esc(r.phone||'—')}</td><td>${esc(r.day||'—')}</td><td>${esc(r.room||'—')}</td><td>${esc(r.reason||'—')}</td><td>${w?`<span class="tag g">Khớp: ${esc(K(w))} · ${esc(D(w))} · P.${esc(R(w)||'—')}</span>`:'<span class="tag r">Không tìm thấy trong danh sách tổng</span>'}</td><td>${w?`<button class="btn r sm" data-qo="${r.id}">Duyệt ra</button> `:''}<button class="btn s sm" data-qx="${r.id}">Từ chối</button></td></tr>`}).join('')}</table></div>`:'<p class="mut" style="margin:0">Không có hồ sơ đăng ký ra đang chờ.</p>'}</div>`;qrBindCommon();document.querySelectorAll('[data-qo]').forEach(b=>b.onclick=()=>qrApproveOut(b.dataset.qo));document.querySelectorAll('[data-qx]').forEach(b=>b.onclick=()=>qrReject(b.dataset.qx))}
function qrBindCommon(){if($('qrrf'))$('qrrf').onclick=()=>qrPage();if($('qrlo')){$('qrlo').textContent='Đăng xuất ứng dụng';$('qrlo').onclick=async()=>{if(window.authHubLogout)await window.authHubLogout('local')}}}
async function qrSetStatus(id,status){const sb=qrSb();const {data:{user}}=await sb.auth.getUser();const {error}=await sb.from('residency_requests').update({status,reviewed_at:new Date().toISOString(),reviewed_by:user&&user.id||null}).eq('id',id);if(error)throw error}
async function qrApproveIn(id){if(!can('qrApprove'))return alert('Bạn không có quyền duyệt hồ sơ QR.');const r=QRREQ.find(x=>x.id==id);if(!r)return;if((r.cccd&&W.some(w=>String(w.cccd||'')==String(r.cccd)))||(r.worker_code&&W.some(w=>String(w.mnv||'').trim()==String(r.worker_code).trim()))){if(!await ask('Hồ sơ này có thể trùng công nhân đang có. Vẫn duyệt và thêm vào danh sách tổng?',{title:'Xác nhận duyệt',ok:'Vẫn duyệt',cls:''}))return}try{await qrSetStatus(id,'approved');W.unshift({id:'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:r.name||'',mnv:r.worker_code||'',gt:r.gender||'',dob:r.dob||'',sdt:r.phone||'',cccd:r.cccd||'',tinh:r.address||'',unit:r.unit||'',td:r.td||'',leader:r.leader||'',lsdt:r.leader_phone||'',ktx:r.ktx||'KTX 1',day:r.day||'',room:r.room||'',date:r.check_in_date||ldy()});add('CREATE',`Duyệt đăng ký vào KTX qua QR: ${r.name}${r.worker_code?' ('+r.worker_code+')':''}`);sv();alert('Đã duyệt và thêm công nhân vào danh sách tổng.');qrPage()}catch(e){alert('Không duyệt được: '+(e.message||e))}}
async function qrApproveOut(id){if(!can('qrApprove'))return alert('Bạn không có quyền duyệt hồ sơ QR.');const r=QRREQ.find(x=>x.id==id);if(!r)return;const w=W.find(w=>r.cccd&&String(w.cccd||'').replace(/\D/g,'')==String(r.cccd||'').replace(/\D/g,''))||W.find(w=>r.worker_code&&String(w.mnv||'').trim()==String(r.worker_code).trim())||W.find(w=>sa(w.name)==sa(r.name)&&sa(D(w))==sa(r.day)&&String(R(w)||'').trim()==String(r.room||'').trim());if(!w)return alert('Không tìm thấy công nhân tương ứng trong danh sách tổng. Hãy kiểm tra CCCD, Mã NV, Dãy và Phòng.');if(!await ask(`Duyệt cho ${w.name} ra khỏi KTX?\n${K(w)} · ${D(w)} · Phòng ${R(w)||'—'}\nCCCD: ${w.cccd||'—'}\nLý do: ${r.reason||'Khác'}\n\nSau khi duyệt, công nhân sẽ không còn trong danh sách tổng.`,{title:'Duyệt đăng ký ra',ok:'Duyệt ra'}))return;try{await qrSetStatus(id,'approved');delWorkers([w],{reason:r.reason||'Khác',date:ldy(),note:'Duyệt đăng ký ra KTX qua mã QR',source:'qr'});qrPage()}catch(e){alert('Không duyệt được: '+(e.message||e))}}
async function qrReject(id){if(!can('qrApprove'))return alert('Bạn không có quyền xử lý hồ sơ QR.');if(!await ask('Từ chối hồ sơ này?',{title:'Từ chối đăng ký',ok:'Từ chối'}))return;try{await qrSetStatus(id,'rejected');qrPage()}catch(e){alert('Không xử lý được: '+(e.message||e))}}
function qrSubscribeRequests(){const sb=qrSb();if(!sb||QRCH)return;QRCH=sb.channel('ktx-qr-requests').on('postgres_changes',{event:'*',schema:'public',table:'residency_requests'},()=>{if(page=='qr'&&(QT=='regin'||QT=='regout'))qrPage()}).subscribe()}

// ---- Sao lưu dữ liệu: thủ công + tự động hàng ngày (lưu trên trình duyệt)
const BK_AUTO_KEY='ktx_auto_backups',BK_CFG_KEY='ktx_backup_cfg';
const bkCfg=()=>{const d={auto:false,keep:7,scope:{workers:true,archive:true,logs:true,attendance:true,registrations:true,settings:true}};try{return Object.assign(d,JSON.parse(localStorage.getItem(BK_CFG_KEY)||'{}'))}catch(e){return d}};
function bkSettings(){const x={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||!k.startsWith('ktx_'))continue;if(['ktx_w','ktx_arc','ktx_l','ktx_att','ktx_reg',BK_AUTO_KEY,BK_CFG_KEY].includes(k))continue;try{x[k]=localStorage.getItem(k)}catch(e){}}return x}
function bkMake(scope){scope=scope||bkCfg().scope;return{format:'KTX_HOC_MON_BACKUP_V1',createdAt:new Date().toISOString(),createdLocal:new Date().toLocaleString('vi-VN'),scope:{...scope},data:{workers:scope.workers?JSON.parse(JSON.stringify(W)):null,archive:scope.archive?JSON.parse(JSON.stringify(ARC)):null,logs:scope.logs?JSON.parse(JSON.stringify(LOG)):null,attendance:scope.attendance?JSON.parse(JSON.stringify(ATT)):null,registrations:scope.registrations?JSON.parse(JSON.stringify(REG)):null,settings:scope.settings?bkSettings():null}}}
function bkDownload(obj,name){return dlBrowser(name,new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'}),'application/json')}
const bkDay=()=>ldy();
function bkAutos(){try{return JSON.parse(localStorage.getItem(BK_AUTO_KEY)||'[]')}catch(e){return[]}}
function bkSaveAutos(a){localStorage.setItem(BK_AUTO_KEY,JSON.stringify(a))}
function bkAutoRun(force=false){const c=bkCfg();if(!c.auto&&!force)return false;let a=bkAutos(),today=bkDay();if(!force&&a.some(x=>x.day==today))return false;const snap={day:today,at:Date.now(),backup:bkMake(c.scope)};a.unshift(snap);a=a.slice(0,Math.max(1,+c.keep||7));try{bkSaveAutos(a);return true}catch(e){try{bkSaveAutos(a.slice(0,3));return true}catch(x){console.warn('Không lưu được bản sao tự động',x);return false}}}
function bkSummary(o){const d=o&&o.data||{},n=x=>Array.isArray(x)?x.length:0;return`Công nhân: ${n(d.workers)} · Điều chuyển/nghỉ việc: ${n(d.archive)} · Nhật ký: ${n(d.logs)} · Điểm danh: ${n(d.attendance)} · Đăng ký chờ: ${n(d.registrations)}`}
function backupPage(){const el=$('backup');if(!el)return;if(!can('backup')){el.innerHTML='<div class="card"><h3>Không có quyền truy cập</h3><p class="mut">Chỉ Quản trị được phép sao lưu và khôi phục dữ liệu.</p></div>';return}const c=bkCfg(),a=bkAutos();const ck=(k,l)=>`<label><input type="checkbox" data-bks="${k}" ${c.scope&&c.scope[k]!==false?'checked':''}> ${l}</label>`;
 el.innerHTML=`<div class="bkgrid"><div><div class="card"><h3>Sao lưu dữ liệu</h3><div class="bkstatus ${c.auto?'ok':'wn'}"><b>${c.auto?'Đang bật sao lưu tự động hàng ngày':'Sao lưu tự động đang tắt'}</b><div class="mut" style="margin-top:3px">Bản tự động được lưu trên trình duyệt hiện tại. Nên tải file JSON định kỳ để có bản dự phòng bên ngoài máy.</div></div><div class="row" style="margin-top:12px"><label class="tgl"><input type="checkbox" id="bk_auto" ${c.auto?'checked':''}> Sao lưu tự động hàng ngày</label><label class="fl" style="margin:0">Giữ số ngày<select id="bk_keep"><option value="7" ${c.keep==7?'selected':''}>7 ngày</option><option value="14" ${c.keep==14?'selected':''}>14 ngày</option><option value="30" ${c.keep==30?'selected':''}>30 ngày</option></select></label></div><h3 style="margin-top:16px">Tùy chọn dữ liệu sao lưu</h3><div class="bkopt">${ck('workers','Danh sách công nhân')}${ck('archive','Điều chuyển · Nghỉ việc')}${ck('logs','Nhật ký hệ thống')}${ck('attendance','Điểm danh')}${ck('registrations','Đăng ký chờ duyệt')}${ck('settings','Cài đặt & cấu hình')}</div><div class="row" style="margin-top:14px"><button class="btn g" id="bk_now">${ico2('dl')}Sao lưu ngay (JSON)</button><button class="btn s" id="bk_snap">Tạo bản tự động ngay</button></div></div><div class="card"><h3>Khôi phục từ file</h3><p class="mut" style="margin-top:0">Chọn file JSON đã sao lưu. Hệ thống sẽ cho xem tóm tắt trước khi thay thế dữ liệu.</p><label class="btn s" style="cursor:pointer;margin:0">${ico2('ul')}Chọn file sao lưu<input id="bk_file" type="file" accept=".json,application/json" hidden></label><div id="bk_restore_info" style="margin-top:10px"></div></div></div><div><div class="card"><h3>Bản sao tự động trên máy (${a.length})</h3><div class="bklist">${a.length?a.map((x,i)=>`<div class="bkitem"><div><b>${esc(x.day.split('-').reverse().join('/'))}</b><small>${esc(new Date(x.at).toLocaleString('vi-VN'))}<br>${esc(bkSummary(x.backup))}</small></div><div class="row"><button class="btn s sm" data-bkd="${i}">Tải</button><button class="btn r sm" data-bkx="${i}">Xóa</button></div></div>`).join(''):'<p class="mut" style="margin:0">Chưa có bản sao tự động.</p>'}</div></div></div></div>`;
 const saveCfg=()=>{const scope={};el.querySelectorAll('[data-bks]').forEach(x=>scope[x.dataset.bks]=x.checked);const n={auto:$('bk_auto').checked,keep:+$('bk_keep').value,scope};localStorage.setItem(BK_CFG_KEY,JSON.stringify(n));return n};
 $('bk_auto').onchange=()=>{const n=saveCfg();if(n.auto)bkAutoRun(false);backupPage()};$('bk_keep').onchange=()=>{saveCfg();let z=bkAutos().slice(0,+$('bk_keep').value);bkSaveAutos(z);backupPage()};el.querySelectorAll('[data-bks]').forEach(x=>x.onchange=saveCfg);
 $('bk_now').onclick=()=>{const n=saveCfg(),o=bkMake(n.scope);bkDownload(o,`KTX_Hoc_Mon_Backup_${bkDay()}.json`);add('BACKUP','Sao lưu dữ liệu thủ công');};
 $('bk_snap').onclick=()=>{saveCfg();bkAutoRun(true);backupPage();alert('Đã tạo bản sao trên trình duyệt.')};
 el.querySelectorAll('[data-bkd]').forEach(b=>b.onclick=()=>{const x=bkAutos()[+b.dataset.bkd];if(x)bkDownload(x.backup,`KTX_Hoc_Mon_AutoBackup_${x.day}.json`)});
 el.querySelectorAll('[data-bkx]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.bkx;if(!await ask('Xóa bản sao tự động này?',{title:'Xóa bản sao',ok:'Xóa'}))return;const z=bkAutos();z.splice(i,1);bkSaveAutos(z);backupPage()});
 $('bk_file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;let o;try{o=JSON.parse(await f.text())}catch(x){return alert('File sao lưu không hợp lệ.')}if(!o||o.format!='KTX_HOC_MON_BACKUP_V1'||!o.data)return alert('Không đúng định dạng sao lưu KTX Hóc Môn.');$('bk_restore_info').innerHTML=`<div class="bkstatus wn"><b>${esc(f.name)}</b><div style="margin-top:4px">${esc(bkSummary(o))}</div><div class="mut" style="margin-top:3px">Tạo lúc: ${esc(o.createdLocal||o.createdAt||'')}</div><button class="btn r sm" id="bk_restore" style="margin-top:10px">Khôi phục dữ liệu này</button></div>`;$('bk_restore').onclick=async()=>{if(!await ask('Khôi phục sẽ thay thế các nhóm dữ liệu có trong file sao lưu. Bạn có chắc chắn?',{title:'Xác nhận khôi phục',ok:'Khôi phục'}))return;const d=o.data;if(Array.isArray(d.workers))W=d.workers;if(Array.isArray(d.archive))ARC=d.archive;if(Array.isArray(d.logs))LOG=d.logs;if(Array.isArray(d.attendance))ATT=d.attendance;if(Array.isArray(d.registrations))REG=d.registrations;if(d.settings&&typeof d.settings=='object')Object.entries(d.settings).forEach(([k,v])=>{try{localStorage.setItem(k,v)}catch(e){}});sv();add('RESTORE','Khôi phục dữ liệu từ file sao lưu');alert('Đã khôi phục dữ liệu. Trang sẽ tải lại.');location.reload()}}}
// chạy sao lưu tự động tối đa 1 lần/ngày khi mở ứng dụng
setTimeout(()=>{if(can('backup')&&bkAutoRun(false)&&page=='backup')backupPage()},1200);


const SYSTEM_HUB_PAGES=new Set(['acc','log','activity','adminboard','access','incidents','security','opsboard','reportauto','standards','maintenance','qa','release','backup','sync','health','dataaudit','safety','alerts']);
function enforceSystemHubSidebar(){
  try{
    const nav=document.querySelector('nav'); if(!nav)return;
    nav.querySelectorAll('button[data-p]').forEach(b=>{if(SYSTEM_HUB_PAGES.has(b.dataset.p))b.remove()});
    nav.querySelectorAll('.grp').forEach(g=>{const h=g.querySelector(':scope > .gh'); if(h&&/^(Hệ thống|System)$/i.test((h.textContent||'').trim()))g.remove()});
    let hub=nav.querySelector('button[data-p="sysfunc"]');
    if(!hub){
      hub=document.createElement('button');hub.className='system-hub-nav';hub.dataset.p='sysfunc';hub.innerHTML='<svg class="i"><use href="#i-cog"></use></svg>Chức năng hệ thống <span class="pill" id="sysIssueCount" style="display:none;background:linear-gradient(135deg,#d93a4d,#f26a78)"></span>';
      const foot=nav.querySelector('.foot');nav.insertBefore(hub,foot||null);
    }
    hub.classList.add('system-hub-nav');
  }catch(e){console.warn('System hub sidebar cleanup:',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enforceSystemHubSidebar,{once:true});else enforceSystemHubSidebar();
setTimeout(enforceSystemHubSidebar,300);
const T={sysfunc:['Chức năng hệ thống','Tất cả công cụ quản trị, đồng bộ, giám sát và bảo trì trong một trang'],alerts:['Trung tâm cảnh báo','Các vấn đề cần xử lý trong dữ liệu KTX'],reports:['Trung tâm báo cáo','Báo cáo ngày, tuần, tháng và các báo cáo quản trị KTX'],home:['Tổng quan','Trung tâm dữ liệu và vận hành ký túc xá'],meal:['Báo cáo suất ăn','Tạo báo cáo suất ăn theo buổi sáng, trưa, chiều từ thực đơn nhà cung cấp'],work:['Quản lý công nhân','Tìm kiếm, lọc, thêm, sửa, xóa, import/export'],log:['Nhật ký hệ thống','Lịch sử thao tác'],activity:['Hoạt động người dùng','Theo dõi thao tác quan trọng theo từng tài khoản và thời gian'],adminboard:['Dashboard quản trị','Tổng hợp sức khỏe hệ thống, đồng bộ, backup, cảnh báo dữ liệu và hoạt động người dùng'],access:['Phân quyền & truy cập','Ma trận quyền, phạm vi phụ trách và cảnh báo cấu hình truy cập'],incidents:['Trung tâm sự cố','Lỗi đồng bộ, import, PWA và lỗi ứng dụng theo thời gian'],security:['Phiên đăng nhập & bảo mật','Theo dõi phiên hiện tại, hoạt động tài khoản và các dấu hiệu cần rà soát'],opsboard:['Dashboard vận hành','Tình hình KTX trong ngày và các đầu việc cần xử lý'],reportauto:['Báo cáo định kỳ','Lưu chốt số liệu ngày, tuần và tháng khi ứng dụng hoạt động'],standards:['Chuẩn hóa dữ liệu','Rà soát và chuẩn hóa định dạng dữ liệu an toàn'],maintenance:['Bảo trì & lưu trữ','Dọn dữ liệu cũ và giữ ứng dụng nhẹ theo thời gian'],qa:['Nghiệm thu Production','Checklist kiểm thử và trạng thái sẵn sàng vận hành'],release:['Phát hành v1.0','Thông tin bản phát hành chính thức và hướng dẫn vận hành'],t2:['Lọc trùng','Tự động quét trùng trong danh sách công nhân hiện tại, có thể thêm file khác để so sánh'],t3:['Tách địa chỉ','Tách cột Tỉnh/TP thành Thôn, Xã, Huyện, Tỉnh'],t4:['Gộp địa chỉ','Gộp các phần thành một địa chỉ'],t5:['PDF → ảnh','Chuyển file PDF thành ảnh PNG/JPG'],t6:['Đăng ký tạm trú','Theo dõi tình trạng và ngày đăng ký tạm trú của công nhân'],attendance:['Điểm danh công nhân','Ghi nhận vào / ra theo công nhân, ngày và phạm vi KTX được giao'],qr:['QR code','Đăng ký vào/ra, quét QR điểm danh và xuất báo cáo Excel'],acc:['Quản lý tài khoản','Tài khoản nhân viên, vai trò, phạm vi phụ trách và dữ liệu dùng chung'],backup:['Sao lưu dữ liệu','Sao lưu thủ công, tự động hàng ngày và khôi phục dữ liệu'],sync:['Đồng bộ Supabase','Đồng bộ dữ liệu thật giữa nhiều máy qua Supabase'],health:['Sức khỏe hệ thống','Kiểm tra nhanh kết nối, đồng bộ, backup, PWA và dung lượng trình duyệt'],dataaudit:['Kiểm tra toàn bộ dữ liệu','Quét chất lượng dữ liệu, trùng lặp, phòng và trạng thái cư trú'],safety:['An toàn dữ liệu','Chống xóa nhầm, tạo điểm khôi phục trước thao tác lớn'],arc:['Điều chuyển · Nghỉ việc','Danh sách theo dõi công nhân đã điều chuyển, nghỉ việc hoặc chuyển ra ngoài ở (đã chuyển khỏi danh sách chính)'],t7:['Lưu trữ tài liệu','Lưu và quản lý hợp đồng, công văn, biên bản và các tài liệu khác']};
function syncTopActions(){const ids=['xt','fxb','undoImport','xw','aw','xr','bs','bn','mnb2','wd','ds2','dsall','gk','imode'];if(page=='home'){ids.forEach(id=>{const e=$(id);if(e)e.classList.toggle('hide',!['fxb','xw','xr','gk'].includes(id))});if($('gk')){$('gk').classList.add('home-ktx-select')}}else if(page=='work'){ids.forEach(id=>{const e=$(id);if(e)e.classList.toggle('hide',['gk'].includes(id))});if($('gk'))$('gk').classList.remove('home-ktx-select')}}
function all(){pill();const fnName={home:'home',sysfunc:null,alerts:'alertCenterPage',reports:'managementReportsPage',meal:'mealPage',work:'work',log:'logp',activity:'userActivityPage',adminboard:'adminDashboardPage',access:'accessControlPage',incidents:'incidentCenterPage',security:'securityPage',opsboard:'opsBoardPage',reportauto:'reportAutoPage',standards:'standardsPage',maintenance:'maintenancePage',qa:'qaPage',release:'releasePage',t6:'tttv',t7:'docsPage',arc:'arcPage',acc:'accPage',backup:'backupPage',sync:'syncPage',health:'systemHealthPage',dataaudit:'dataAuditPage',safety:'safetyPage',qr:'qrPage',attendance:'ktxAttendancePage'}[page];const f=fnName&&window[fnName];if(typeof f==='function')f();if(window.DEDUP_ON&&$('go')&&$('go').onclick)$('go').onclick();if(typeof applyPerms==='function')applyPerms();if(typeof syncTopActions==='function')syncTopActions();if(typeof updateAlertBadges==='function')updateAlertBadges();if(page!='qr'&&typeof QCAM!=='undefined'&&QCAM&&typeof camStop==='function')camStop()}
const GN={sysfunc:'Hệ thống',alerts:'Hệ thống',reports:'Ký túc xá',home:'Ký túc xá',meal:'Ký túc xá',work:'Ký túc xá',t6:'Ký túc xá',t2:'Tiện ích',t3:'Tiện ích',t4:'Tiện ích',t5:'Tiện ích',log:'Hệ thống',activity:'Hệ thống',adminboard:'Hệ thống',access:'Hệ thống',incidents:'Hệ thống',security:'Hệ thống',opsboard:'Hệ thống',reportauto:'Hệ thống',standards:'Hệ thống',maintenance:'Hệ thống',qa:'Hệ thống',release:'Hệ thống',acc:'Hệ thống',backup:'Hệ thống',sync:'Hệ thống',health:'Hệ thống',dataaudit:'Hệ thống',safety:'Hệ thống',qr:'Ký túc xá',attendance:'Ký túc xá',arc:'Ký túc xá',t7:'Tiện ích'};
function go(p){if(p==='reports')p='home';if(p==='attendance'){QT='attendance';p='qr'}if(p=='t3'||p=='t4')p='home';if(p==='acc'&&!can('acct')){alert('Bạn không có quyền Quản lý tài khoản.');p='home'}if(p==='activity'&&!can('acct')){alert('Chỉ Quản trị mới xem được Hoạt động người dùng.');p='home'}if(p==='adminboard'&&!can('acct')){alert('Chỉ Quản trị mới xem được Dashboard quản trị.');p='home'}if(p==='access'&&!can('acct')){alert('Chỉ Quản trị mới xem được Phân quyền & truy cập.');p='home'}if(['incidents','security','maintenance','qa','release'].includes(p)&&!can('acct')){alert('Chức năng này dành cho Quản trị.');p='home'}if(['opsboard','reportauto','standards'].includes(p)&&!can('report')){alert('Bạn không có quyền xem chức năng này.');p='home'}if(p==='backup'&&!can('backup')){alert('Bạn không có quyền Sao lưu dữ liệu.');p='home'}document.body.dataset.page=p;page=p;document.querySelectorAll('nav button[data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p==p));Object.keys(T).forEach(k=>$(k).classList.toggle('hide',k!=p));$('ttl').textContent=T[p][0];$('sub').textContent=T[p][1];$('eb').textContent=GN[p]||'Ký túc xá';
 const hiddenPages=['sysfunc','alerts','reports','t2','t3','t4','t5','t6','t7','arc','acc','activity','adminboard','access','incidents','security','opsboard','reportauto','standards','maintenance','qa','release','backup','sync','health','dataaudit','safety','qr','log','meal'];$('tools').classList.toggle('hide',p!=='work');
 window.scrollTo(0,0);if(p=='t2')window.DEDUP_ON=true;applyPerms();syncTopActions();all();if(p==='sysfunc'&&typeof window.forceSystemHub==='function')setTimeout(window.forceSystemHub,0)}
document.querySelectorAll('nav button[data-p]').forEach(b=>b.onclick=()=>go(b.dataset.p));document.querySelectorAll('.gh').forEach(h=>h.onclick=()=>h.parentElement.classList.toggle('open'));
$('gk').onchange=all;pill();go(page);
// ---- Tiện ích: lọc trùng, địa chỉ, PDF
(function(){
const D={A:[],B:[]};
const FD=[['name','Họ và tên',/^(ho va ten|ho ten|ten)$/],['mnv','Mã NV',/^(ma nv|mnv|ma nhan vien)$/],['sdt','SĐT',/^(sdt|so dien thoai)$/],['cccd','CCCD',/cccd|can cuoc/],['dob','Ngày sinh',/ngay sinh|nam sinh/],['td','Tiểu đoàn',/^tieu doan$/],['ktx','KTX',/^ktx$/],['day','Dãy',/^day$/],['gt','Giới tính',/^gioi tinh$/],['dv','Đơn vị',/^don vi$/],['tinh','Tỉnh/TP',/^(tinh|tinh tp|dia chi|que quan)/],['tinh2','Tỉnh (đã tách)',/^tinh.*da tach/],['thon','Thôn/Ấp',/^(thon|ap|khom)/],['xa','Xã/Phường',/^(xa|phuong)/],['huyen','Huyện/Quận',/^(huyen|quan)/]];
function iso(v){if(v==null||v==='')return null;let d=v instanceof Date?v:null;if(!d&&typeof v==='number')d=new Date(Math.round((v-25569)*864e5));
 if(d)return isNaN(d)?null:(v instanceof Date?window.ktxLocalISO(d):d.toISOString().slice(0,10));const m=String(v).trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);return m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:null}
const N={name:v=>{const s=sa(String(v||'').replace(/\(\d+\)/g,''));return s||null},mnv:v=>{const s=String(v==null?'':v).trim().replace(/\.0$/,'');return /^\d{7}$/.test(s)?s:null},
 sdt:v=>{let s=String(v==null?'':v).replace(/\D/g,'');if(s.length==9)s='0'+s;return s.length==10&&s[0]=='0'?s:null},cccd:v=>{let s=String(v==null?'':v).replace(/\D/g,'');if(s.length==11)s='0'+s;return s.length==12?s:null},
 dob:iso,td:v=>{if(v==null||v==='')return null;const s=String(v).trim().replace(/\.0$/,'');return /^[\d.\s]+$/.test(s)?String(parseInt(s.replace(/\D/g,''))):sa(s)||null}};
async function loadFiles(files){const bad=[];for(const file of files){try{const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true}),parts=[];
  wb.SheetNames.forEach(sn=>{if(/so do|csvc|dieu khien/.test(sa(sn)))return;const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:''});let h=-1,map={};
   for(let i=0;i<Math.min(8,rows.length);i++){const m={};rows[i].forEach((c,j)=>{const k=sa(c);FD.forEach(([f,,re])=>{if(!(f in m)&&k&&re.test(k))m[f]=j})});if(Object.keys(m).length>=3){h=i;map=m;break}}
   if(h<0)return;const list=rows.slice(h+1).map((r,i)=>{const o={row:h+i+2,raw:{},k:{}};for(const f in map)o.raw[f]=r[map[f]];return o}).filter(o=>Object.values(o.raw).some(x=>x!==''&&x!=null));
   list.forEach(o=>{for(const f in N)o.k[f]=f in map?N[f](o.raw[f]):null});parts.push([sn,list])});
  const recs=[];parts.forEach(([sn,list])=>list.forEach(o=>{o.src=parts.length>1?`${file.name} [${sn}]`:file.name;o.file=file.name;recs.push(o)}));
  if(!recs.length){bad.push(file.name);continue}D.B=D.B.filter(o=>o.file!==file.name);D.B.push(...recs)}catch(e){bad.push(file.name)}}return bad}
function showFiles(bad){const g={};D.B.forEach(o=>g[o.file]=(g[o.file]||0)+1);const ib=$('infob');
 ib.innerHTML=Object.keys(g).map(n=>`<span class="tag">${esc(n)} · ${g[n].toLocaleString()} dòng <a href="#" data-rm="${esc(n)}" style="margin-left:6px;color:var(--rd);text-decoration:none" title="Bỏ file này">✕</a></span>`).join(' ')||'<span class="mut">Chưa thêm file nào.</span>';
 if(bad&&bad.length)ib.insertAdjacentHTML('beforeend',`<span class="warn">Không nhận ra tiêu đề: ${bad.map(esc).join(', ')}</span>`);
 ib.querySelectorAll('[data-rm]').forEach(a=>a.onclick=ev=>{ev.preventDefault();D.B=D.B.filter(o=>o.file!==a.dataset.rm);showFiles()})}
$('fb').onchange=async e=>{const fs=[...e.target.files];if(!fs.length)return;$('infob').textContent='Đang đọc '+fs.length+' file...';const bad=await loadFiles(fs);e.target.value='';showFiles(bad)};
$('fbc').onclick=()=>{D.B=[];showFiles()};showFiles();
const PROV='An Giang|Bà Rịa - Vũng Tàu|Bắc Giang|Bắc Kạn|Bạc Liêu|Bắc Ninh|Bến Tre|Bình Định|Bình Dương|Bình Phước|Bình Thuận|Cà Mau|Cần Thơ|Cao Bằng|Đà Nẵng|Đắk Lắk|Đắk Nông|Điện Biên|Đồng Nai|Đồng Tháp|Gia Lai|Hà Giang|Hà Nam|Hà Nội|Hà Tĩnh|Hải Dương|Hải Phòng|Hậu Giang|Hòa Bình|Hưng Yên|Khánh Hòa|Kiên Giang|Kon Tum|Lai Châu|Lâm Đồng|Lạng Sơn|Lào Cai|Long An|Nam Định|Nghệ An|Ninh Bình|Ninh Thuận|Phú Thọ|Phú Yên|Quảng Bình|Quảng Nam|Quảng Ngãi|Quảng Ninh|Quảng Trị|Sóc Trăng|Sơn La|Tây Ninh|Thái Bình|Thái Nguyên|Thanh Hóa|Thừa Thiên Huế|Tiền Giang|Hồ Chí Minh|Trà Vinh|Tuyên Quang|Vĩnh Long|Vĩnh Phúc|Yên Bái'.split('|');
const PK={};PROV.forEach(p=>PK[sa(p)]=p);Object.assign(PK,{'ho chi minh':'Hồ Chí Minh','hcm':'Hồ Chí Minh','tphcm':'Hồ Chí Minh','sai gon':'Hồ Chí Minh','dak lak':'Đắk Lắk','dak nong':'Đắk Nông','hue':'Thừa Thiên Huế','vung tau':'Bà Rịa - Vũng Tàu','daklak':'Đắk Lắk','dacklak':'Đắk Lắk','ag':'An Giang'});
const prov=s=>{let k=sa(s).replace(/^(thanh pho|tinh|tp) /,'');return PK[k]||null};
// ---- Lọc trùng
const CR=[['name','Họ tên'],['mnv','Mã NV'],['sdt','SĐT'],['cccd','CCCD'],['dob','Ngày sinh'],['td','Tiểu đoàn']];
$('crit').innerHTML=CR.map(([f,l])=>`<label><input type="checkbox" value="${f}" ${['name','mnv','cccd','dob'].includes(f)?'checked':''}> ${l}</label>`).join('');
let OUT=null;
$('go').onclick=()=>{try{
 sync();
 const useCurrent=$('useA')&&$('useA').checked;
 const Z=[...(useCurrent?D.A:[]),...(Array.isArray(D.B)?D.B:[])].filter(Boolean).map((o,i)=>{o.k=o.k||{};o.raw=o.raw||{};o.src=o.src||'Nguồn '+(i+1);return o});
 if(!Z.length){$('r2').innerHTML='<div class="mut" style="padding:12px">Không có dữ liệu để lọc trùng.</div>';return}
 const fs=[...document.querySelectorAll('#crit input:checked')].map(x=>x.value);if(!fs.length){$('r2').innerHTML='<div class="mut" style="padding:12px">Hãy chọn ít nhất một tiêu chí so khớp.</div>';return}
 const minm=Math.max(1,+$('minm').value||2),xo=!!($('xonly')&&$('xonly').checked),pairs=new Map();
 fs.forEach(f=>{const g=new Map();Z.forEach((o,i)=>{const v=o.k&&o.k[f];if(v!=null&&String(v).trim()!==''){const k=String(v);if(!g.has(k))g.set(k,[]);g.get(k).push(i)}});g.forEach(a=>{if(a.length<2||a.length>100)return;for(let x=0;x<a.length;x++)for(let y=x+1;y<a.length;y++){const ia=a[x],ib=a[y];if(xo&&Z[ia].src===Z[ib].src)continue;const key=ia+'|'+ib;if(!pairs.has(key))pairs.set(key,new Set());pairs.get(key).add(f)}})});
 const par=Z.map((_,i)=>i),find=x=>par[x]===x?x:(par[x]=find(par[x]));const meta=[];
 pairs.forEach((fields,key)=>{if(fields.size<minm)return;const [a,b]=key.split('|').map(Number);if(!Number.isInteger(a)||!Number.isInteger(b))return;par[find(a)]=find(b);meta.push([a,b,fields])});
 const grp=new Map();meta.forEach(([a,b])=>{[a,b].forEach(n=>{const r=find(n);if(!grp.has(r))grp.set(r,new Set());grp.get(r).add(n)})});
 const rows=[];let gi=0,nk=0;const hl={};
 [...grp.values()].sort((p,q)=>Math.min(...p)-Math.min(...q)).forEach(g=>{gi++;const m=[...g].sort((a,b)=>a-b),fl=new Set();let conf=false;meta.forEach(([a,b,fields])=>{if(g.has(a)&&g.has(b)){fields.forEach(f=>fl.add(f));hl[a]=hl[a]||new Set();hl[b]=hl[b]||new Set();fields.forEach(f=>{hl[a].add(f);hl[b].add(f)});['mnv','cccd'].forEach(f=>{const x=Z[a].k&&Z[a].k[f],y=Z[b].k&&Z[b].k[f];if(x&&y&&x!==y)conf=true})}});if(conf)nk++;m.forEach(i=>rows.push({i,gi,lv:conf?'Nghi khác người':'Chắc chắn',fl:[...fl].map(f=>(CR.find(c=>c[0]===f)||['',f])[1]).join(' + ')}))});
 OUT={rows,Z,hl,groups:gi,nk};const cols=[['name','Họ tên'],['ktx','KTX'],['day','Dãy'],['room','Phòng'],['mnv','Mã NV'],['sdt','SĐT'],['cccd','CCCD'],['dob','Ngày sinh'],['td','Tiểu đoàn']];
 const val=(o,f)=>{let v=f==='dob'?vn((o.k&&o.k.dob)||''):(o.raw&&o.raw[f]!=null?o.raw[f]:'');if(v instanceof Date)v=Number.isFinite(v.getTime())?v.toLocaleDateString('vi-VN'):'';return esc(String(v??''))};
 $('r2').innerHTML=`<p><b class="ok">${gi}</b> nhóm trùng, <b>${rows.length}</b> dòng; <b class="warn">${nk}</b> nhóm nghi khác người. Đã so sánh ${new Set(Z.map(o=>o.src)).size} nguồn, ${Z.length.toLocaleString('vi-VN')} dòng.</p><div class="wrap"><table class="cmp3"><tr><th>Nhóm</th>${cols.map(c=>`<th>${c[1]}</th>`).join('')}<th class="act">Thao tác</th></tr>${rows.slice(0,400).map(r=>{const o=Z[r.i];return `<tr><td>${r.gi}</td>${cols.map(([f])=>`<td class="${hl[r.i]&&hl[r.i].has(f)?'h':''}${f==='name'?' wr':''}">${val(o,f)}</td>`).join('')}${o.wi!==undefined&&W[o.wi]?`<td class="act"><button class="btn s sm" data-de="${esc(W[o.wi].id)}">${ico('edit')}Sửa</button> <button class="btn r sm" data-dx="${esc(W[o.wi].id)}">${ico('trash')}Xóa</button></td>`:'<td class="act mut">File ngoài</td>'}</tr>`}).join('')}</table></div>${rows.length>400?'<div class="mut">Hiển thị 400 dòng đầu, hãy tải Excel để xem đủ.</div>':''}`;
 $('x2').disabled=!rows.length;window.DEDUP_ON=true;window.DUP_N=gi;const nd=$('nd');if(nd){nd.textContent=gi;nd.style.display=gi?'':'none'}const w2=$('wdn');if(w2){w2.textContent=gi;w2.style.display=gi?'':'none'}
 $('r2').querySelectorAll('[data-de]').forEach(b=>b.onclick=()=>{const w=W.find(x=>String(x.id)===String(b.dataset.de));if(w)edit(w)});$('r2').querySelectorAll('[data-dx]').forEach(b=>b.onclick=async()=>{const w=W.find(x=>String(x.id)===String(b.dataset.dx));if(!w)return;const inf=await askLeave([w],{reason:'Trùng dữ liệu'});if(inf)delWorkers([w],inf)});
 }catch(err){console.error('Lọc trùng:',err);$('r2').innerHTML=`<div class="bkstatus wn"><b>Không thể lọc trùng</b><div class="mut">${esc(err&&err.message||String(err))}</div></div>`}}
$('x2').onclick=()=>{const{rows,Z}=OUT,f=['name','mnv','sdt','cccd','dob','td','ktx','day','room'];const sv=v=>v instanceof Date?v.toISOString().slice(0,10):v;
 save([['Nhóm','Mức độ','File','Dòng gốc','Họ tên','Mã NV','SĐT','CCCD','Ngày sinh','Tiểu đoàn','KTX','Dãy','Phòng','Trùng ở'],...rows.map(r=>{const o=Z[r.i];return [r.gi,r.lv,o.src,o.row,...f.map(x=>sv(o.raw[x])??''),r.fl]})],'loc_trung.xlsx','Bản ghi trùng')};
// ---- Tách địa chỉ
const HAM=/^(ap|thon|khom|xom|to|khu pho|kp|ban|buon|so nha)\b/;
function split(raw){const p=String(raw||'').split(',').map(s=>s.trim()).filter(Boolean);const r={thon:'',xa:'',huyen:'',tinh:'',tc:'Cao'};if(!p.length)return{...r,tc:'Không có'};
 const t=prov(p[p.length-1]);if(!t){r.tinh=p[p.length-1];r.tc='Thấp';p.pop()}else{r.tinh=t;p.pop()}
 if(!p.length)return r;if(p.length==1){HAM.test(sa(p[0]))?r.thon=p[0]:r.xa=p[0];r.tc=r.tc=='Cao'?'Trung bình':r.tc;return r}
 r.huyen=p.pop();const x=p.pop();if(HAM.test(sa(x))){r.thon=[...p,x].join(', ');r.tc='Trung bình'}else{r.xa=x;r.thon=p.join(', ')}return r}
let AD=null;
$('go3').onclick=()=>{if(!D.A.length||!D.A.cols.includes('tinh'))return $('r3').textContent='File A cần có cột Tỉnh/TP hoặc Địa chỉ.';
 AD=D.A.map(o=>({o,...split(o.raw.tinh)}));const c={};AD.forEach(r=>c[r.tc]=(c[r.tc]||0)+1);
 $('r3').innerHTML=`<p>Độ tin cậy: ${Object.entries(c).map(([k,v])=>`${k} <b>${v}</b>`).join(' · ')}</p><div class="wrap"><table><tr><th>Dòng</th><th>Địa chỉ gốc</th><th>Thôn/Ấp/Số nhà</th><th>Xã/Phường</th><th>Huyện/Quận</th><th>Tỉnh/TP</th><th>Tin cậy</th></tr>${AD.slice(0,200).map(r=>`<tr><td>${r.o.row}</td><td>${r.o.raw.tinh}</td><td>${r.thon}</td><td>${r.xa}</td><td>${r.huyen}</td><td>${r.tinh}</td><td>${r.tc}</td></tr>`).join('')}</table></div>${AD.length>200?'<div class="mut">Hiển thị 200 dòng đầu, hãy tải Excel để xem đủ.</div>':''}`;$('x3').disabled=false};
$('x3').onclick=()=>save([['Dòng gốc','Họ và tên','Địa chỉ gốc','Thôn/Ấp/Số nhà','Xã/Phường','Huyện/Quận','Tỉnh/TP','Tin cậy'],...AD.map(r=>[r.o.row,r.o.raw.name||'',r.o.raw.tinh,r.thon,r.xa,r.huyen,r.tinh,r.tc])],'tach_dia_chi.xlsx','Địa chỉ đã tách');
// ---- Gộp địa chỉ
const MP=[['thon','Thôn/Ấp/Số nhà'],['xa','Xã/Phường'],['huyen','Huyện/Quận'],['tinh','Tỉnh/TP']];
const gv=(o,f)=>{let v=f=='tinh'?(o.raw.tinh2||o.raw.tinh):o.raw[f];v=String(v==null?'':v).trim();if(f=='tinh'&&!o.raw.tinh2&&v.includes(','))v=v.split(',').pop().trim();return v};
let MG=null;
$('go4').onclick=()=>{if(!D.A.length)return $('r4').textContent='Hãy chọn file A.';
 const fs=[...document.querySelectorAll('#mp input:checked')].map(x=>x.value),sep=$('sep').value,dd=$('dd').checked,C=D.A.cols;
 const miss=fs.filter(f=>f=='tinh'?!(C.includes('tinh2')||C.includes('tinh')):!C.includes(f)).map(f=>MP.find(m=>m[0]==f)[1]);
 if(!fs.length)return $('r4').textContent='Hãy chọn ít nhất một phần địa chỉ.';
 if(miss.length)return $('r4').textContent='File A chưa có cột: '+miss.join(', ');
 MG=D.A.map(o=>{const all=MP.map(([f])=>fs.includes(f)?gv(o,f):'');let p=all.filter(Boolean);if(dd)p=p.filter((x,i)=>!i||sa(x)!=sa(p[i-1]));return{o,all,g:p.join(sep)}});
 const empty=MG.filter(r=>!r.g).length;
 $('r4').innerHTML=`<p>Đã gộp <b class="ok">${(MG.length-empty).toLocaleString()}</b> địa chỉ${empty?`, <b class="warn">${empty}</b> dòng không có thông tin địa chỉ`:''}.</p><div class="wrap"><table><tr><th>Dòng</th><th>Họ và tên</th>${MP.map(m=>`<th>${m[1]}</th>`).join('')}<th>Địa chỉ gộp</th></tr>${MG.slice(0,200).map(r=>`<tr><td>${r.o.row}</td><td>${r.o.raw.name||''}</td>${r.all.map(x=>`<td>${x}</td>`).join('')}<td><b>${r.g}</b></td></tr>`).join('')}</table></div>${MG.length>200?'<div class="mut">Hiển thị 200 dòng đầu, hãy tải Excel để xem đủ.</div>':''}`;$('x4').disabled=false};
$('x4').onclick=()=>save([['Dòng gốc','Họ và tên',...MP.map(m=>m[1]),'Địa chỉ gộp'],...MG.map(r=>[r.o.row,r.o.raw.name||'',...r.all,r.g])],'gop_dia_chi.xlsx','Địa chỉ đã gộp');
// ---- PDF -> ảnh (nhiều file một lần)
let PG=[];
async function saveBlob(name,blob){const dl=await claude.use('downloads');if(!dl)return alert('Môi trường này chưa hỗ trợ tải file.');try{await dl.save({filename:name,data:blob})}catch(e){if(e&&e.code!='declined')alert('Không tải được: '+(e.message||e))}}
$('fp').onchange=e=>{const fs=[...e.target.files];$('pinfo').textContent=fs.length?`${fs.length} file: ${fs.map(f=>f.name).join(', ')} (${Math.round(fs.reduce((t,f)=>t+f.size,0)/1024).toLocaleString()} KB)`:''};
const setB=on=>['zp','sp','pa','pn'].forEach(i=>$(i).disabled=!on);
$('gp').onclick=async()=>{const files=[...$('fp').files];if(!files.length)return $('rp').textContent='Hãy chọn một hoặc nhiều file PDF.';
 if(!window.pdfjsLib)return $('rp').textContent='Không tải được thư viện đọc PDF (cần kết nối mạng tới cdnjs).';
 pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 $('gp').disabled=true;setB(false);PG=[];const R=$('rp');R.innerHTML='Đang xử lý...';
 const fmt=$('pf').value,sc=+$('ps').value,ext=fmt=='image/png'?'png':'jpg',rg=$('pr').value.trim(),used={},fails=[],box=document.createElement('div');
 try{for(let fi=0;fi<files.length;fi++){const f=files[fi];let base=f.name.replace(/\.pdf$/i,'');used[base]=(used[base]||0)+1;if(used[base]>1)base+='_'+used[base];
   try{const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let pages=[...Array(pdf.numPages).keys()].map(i=>i+1);
    if(rg){const set=new Set();rg.split(',').forEach(x=>{const m=x.trim().match(/^(\d+)(?:-(\d+))?$/);if(m)for(let i=+m[1];i<=(+m[2]||+m[1]);i++)set.add(i)});pages=pages.filter(q=>set.has(q))}
    if(!pages.length){fails.push(`${f.name}: không có trang nào trong khoảng đã nhập (file có ${pdf.numPages} trang)`);continue}
    const h=document.createElement('h3');h.style.margin='14px 0 8px';h.textContent=`${f.name} (${pages.length} trang)`;const g=document.createElement('div');g.className='grid';box.append(h,g);
    for(const n of pages){R.textContent=`File ${fi+1}/${files.length} (${f.name}): trang ${n}/${pdf.numPages}...`;const pg=await pdf.getPage(n),vp=pg.getViewport({scale:sc}),cv=document.createElement('canvas');cv.width=Math.floor(vp.width);cv.height=Math.floor(vp.height);
     const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);await pg.render({canvasContext:cx,viewport:vp}).promise;
     const blob=await new Promise(r=>cv.toBlob(r,fmt,0.92));cv.width=cv.height=0;const name=`${base}_trang${String(n).padStart(2,'0')}.${ext}`,k=PG.length;PG.push({k,file:base,n,blob,name});
     const c=document.createElement('div');c.style.cssText='border:1px solid var(--bd);border-radius:8px;padding:8px';const im=document.createElement('img');im.src=URL.createObjectURL(blob);im.style.cssText='width:100%;display:block;margin-bottom:6px';
     const b=document.createElement('button');b.className='btn s';b.textContent=`Tải trang ${n} (${Math.round(blob.size/1024).toLocaleString()} KB)`;b.onclick=()=>saveBlob(name,blob);
     const lb=document.createElement('label');lb.style.cssText='display:block;margin:0 0 6px';const ck=document.createElement('input');ck.type='checkbox';ck.className='pk';ck.dataset.k=k;ck.onchange=cnt;lb.append(ck,' Chọn trang '+n);c.append(im,lb,b);g.appendChild(c)}
    pdf.destroy()}catch(e){fails.push(`${f.name}: ${e.message||e}`)}}
  R.innerHTML=`<p class="ok">Đã chuyển <b>${PG.length}</b> trang từ <b>${new Set(PG.map(x=>x.file)).size}</b>/${files.length} file thành ảnh ${ext.toUpperCase()}.</p>`+(fails.length?`<p class="warn">Bỏ qua: ${fails.map(x=>x.replace(/[<>&]/g,'')).join('; ')}</p>`:'');R.appendChild(box);
  if(PG.length)setB(true);cnt()
 }finally{$('gp').disabled=false}};
const cnt=()=>{const k=document.querySelectorAll('.pk:checked').length;$('sp').textContent=`Tải trang đã chọn (${k})`;$('sp').disabled=!k};
$('pa').onclick=()=>{document.querySelectorAll('.pk').forEach(x=>x.checked=true);cnt()};
$('pn').onclick=()=>{document.querySelectorAll('.pk').forEach(x=>x.checked=false);cnt()};
async function zipOf(list,zname){const multi=new Set(list.map(p=>p.file)).size>1,z=new JSZip();list.forEach(p=>z.file(multi?p.file+'/'+p.name:p.name,p.blob));await saveBlob(zname,await z.generateAsync({type:'blob'}))}
$('sp').onclick=async()=>{const ks=[...document.querySelectorAll('.pk:checked')].map(x=>+x.dataset.k),sel=PG.filter(p=>ks.includes(p.k));if(!sel.length)return;
 if(sel.length==1)return saveBlob(sel[0].name,sel[0].blob);$('sp').disabled=true;try{await zipOf(sel,new Set(sel.map(p=>p.file)).size==1?sel[0].file+'_'+sel.length+'trang.zip':'anh-da-chon.zip')}finally{cnt()}};
$('zp').onclick=async()=>{if(!PG.length)return;$('zp').disabled=true;try{await zipOf(PG,new Set(PG.map(p=>p.file)).size==1?PG[0].file+'_anh.zip':'anh-tu-pdf.zip')}finally{$('zp').disabled=false}};

function sync(){const fs=['name','mnv','sdt','cccd','dob','gt','td','ktx','day','tinh','thon','xa','huyen','tinh2'];
 D.A=W.map((w,i)=>{const raw={};fs.forEach(f=>raw[f]=w[f]||'');raw.ktx=w.ktx||'KTX 1';raw.day=w.day||'Dãy 1';raw.room=w.room||'';raw.dob=vn(w.dob);const o={row:i+1,src:'Danh sách hiện tại',wi:i,raw,k:{}};for(const f in N)o.k[f]=N[f](raw[f]);return o});
 D.A.file='Danh sách hiện tại';D.A.cols=fs.filter(f=>W.some(w=>w[f]))}
['go','go3','go4'].forEach(id=>{const g=$(id).onclick;$(id).onclick=()=>{sync();g();if(id=='go3')$('ap3').disabled=!AD}});
$('ap3').onclick=()=>{if(!AD)return;AD.forEach(r=>{const w=W[r.o.wi];if(w){w.thon=r.thon;w.xa=r.xa;w.huyen=r.huyen;w.tinh2=r.tinh}});sv();add('UPDATE','Áp dụng tách địa chỉ cho '+AD.length+' công nhân');alert('Đã lưu kết quả tách vào danh sách. Có thể gộp lại ở tab Gộp địa chỉ.')};
window.ADDR={prov,split,HAM,PK};
setTimeout(()=>{if(W.length)$('go').onclick()},400);
})();

