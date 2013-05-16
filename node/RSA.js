
/**
 * NOTE: the following copyright notices refer to libraries
 * that I have re-calibrated so they can be used as a nodejs
 * module
 */


// BigInt, a suite of routines for performing multiple-precision arithmetic in
// JavaScript.
//
// Copyright 1998-2005 David Shapiro.
//
// You may use, re-use, abuse,
// copy, and modify this code to your liking, but please keep this header.
// Thanks!
//
// Dave Shapiro
// dave@ohdave.com

var rsa = (function(){

	$this = this;
	this.biRadixBase = 2;
	this.biRadixBits = 16;
	this.bitsPerDigit = this.biRadixBits;
	this.biRadix = 1 << 16; // = 2^16 = 65536
	this.biHalfRadix = this.biRadix >>> 1;
	this.biRadixSquared = this.biRadix * this.biRadix;
	this.maxDigitVal = this.biRadix - 1;
	this.maxInteger = 9999999999999998; 

	this.maxDigits;
	this.ZERO_ARRAY;
	this.bigZero
	this.bigOne;

	this.setMaxDigits = function(value) {
		$this.maxDigits = value;
		$this.ZERO_ARRAY = new Array(maxDigits);
		for (var iza = 0; iza < $this.ZERO_ARRAY.length; iza++) $this.ZERO_ARRAY[iza] = 0;
		$this.bigZero = new $this.BigInt();
		$this.bigOne = new $this.BigInt();
		$this.bigOne.digits[0] = 1;
	}

	this.BigInt = function(flag) {
		if (typeof flag == "boolean" && flag == true) {
			this.digits = null;
		}
		else {
			this.digits = $this.ZERO_ARRAY.slice(0);
		}
		this.isNeg = false;
	}

	this.setMaxDigits(20);

	this.biFromNumber = function(i) {
		var result = new $this.BigInt();
		result.isNeg = i < 0;
		i = Math.abs(i);
		var j = 0;
		while (i > 0) {
			result.digits[j++] = i & $this.maxDigitVal;
			i >>= $this.biRadixBits;
		}
		return result;
	}

	this.dpl10 = 15;
	this.lr10 = $this.biFromNumber(1000000000000000);

	this.biFromDecimal = function(s) {
		var isNeg = s.charAt(0) == '-';
		var i = isNeg ? 1 : 0;
		var result;
		// Skip leading zeros.
		while (i < s.length && s.charAt(i) == '0') ++i;
		if (i == s.length) {
			result = new $this.BigInt();
		}
		else {
			var digitCount = s.length - i;
			var fgl = digitCount % $this.dpl10;
			if (fgl == 0) fgl = $this.dpl10;
			result = $this.biFromNumber(Number(s.substr(i, fgl)));
			i += fgl;
			while (i < s.length) {
				result = $this.biAdd($this.biMultiply(result, $this.lr10),
				               $this.biFromNumber(Number(s.substr(i, $this.dpl10))));
				i += $this.dpl10;
			}
			result.isNeg = isNeg;
		}
		return result;
	}

	this.biCopy = function(bi) {
		var result = new $this.BigInt(true);
		result.digits = bi.digits.slice(0);
		result.isNeg = bi.isNeg;
		return result;
	}

	this.reverseStr = function(s) {
		var result = "";
		for (var i = s.length - 1; i > -1; --i) {
			result += s.charAt(i);
		}
		return result;
	}

	this.hexatrigesimalToChar = new Array(
		 '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
		 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
		 'u', 'v', 'w', 'x', 'y', 'z'
	);

	this.biToString = function(x, radix) {
		var b = new $this.BigInt();
		b.digits[0] = radix;
		var qr = $this.biDivideModulo(x, b);
		var result = $this.hexatrigesimalToChar[qr[1].digits[0]];
		while ($this.biCompare(qr[0], bigZero) == 1) {
			qr = $this.biDivideModulo(qr[0], b);
			digit = qr[1].digits[0];
			result += $this.hexatrigesimalToChar[qr[1].digits[0]];
		}
		return (x.isNeg ? "-" : "") + $this.reverseStr(result);
	}

	this.biToDecimal = function(x) {
		var b = new $this.BigInt();
		b.digits[0] = 10;
		var qr = $this.biDivideModulo(x, b);
		var result = String(qr[1].digits[0]);
		while ($this.biCompare(qr[0], $this.bigZero) == 1) {
			qr = $this.biDivideModulo(qr[0], b);
			result += String(qr[1].digits[0]);
		}
		return (x.isNeg ? "-" : "") + $this.reverseStr(result);
	}

	this.hexToChar = new Array(
		'0', '1', '2', '3', '4', '5',
		'6', '7', '8', '9', 'a', 'b',
		'c', 'd', 'e', 'f'
	);

	this.digitToHex = function(n) {
		var mask = 0xf;
		var result = "";
		for (i = 0; i < 4; ++i) {
			result += $this.hexToChar[n & mask];
			n >>>= 4;
		}
		return $this.reverseStr(result);
	}

	this.biToHex = function(x) {
		var result = "";
		var n = $this.biHighIndex(x);
		for (var i = $this.biHighIndex(x); i > -1; --i) {
			result += $this.digitToHex(x.digits[i]);
		}
		return result;
	}

	this.charToHex = function(c) {
		var ZERO = 48;
		var NINE = ZERO + 9;
		var littleA = 97;
		var littleZ = littleA + 25;
		var bigA = 65;
		var bigZ = 65 + 25;
		var result;

		if (c >= ZERO && c <= NINE) {
			result = c - ZERO;
		} else if (c >= bigA && c <= bigZ) {
			result = 10 + c - bigA;
		} else if (c >= littleA && c <= littleZ) {
			result = 10 + c - littleA;
		} else {
			result = 0;
		}
		return result;
	}

	this.hexToDigit = function(s) {
		var result = 0;
		var sl = Math.min(s.length, 4);
		for (var i = 0; i < sl; ++i) {
			result <<= 4;
			result |= $this.charToHex(s.charCodeAt(i))
		}
		return result;
	}

	this.biFromHex = function(s) {
		var result = new $this.BigInt();
		var sl = s.length;
		for (var i = sl, j = 0; i > 0; i -= 4, ++j) {
			result.digits[j] = $this.hexToDigit(s.substr(Math.max(i - 4, 0), Math.min(i, 4)));
		}
		return result;
	}

	this.biFromString = function(s, radix) {
		var isNeg = s.charAt(0) == '-';
		var istop = isNeg ? 1 : 0;
		var result = new $this.BigInt();
		var place = new $this.BigInt();
		place.digits[0] = 1; // radix^0
		for (var i = s.length - 1; i >= istop; i--) {
			var c = s.charCodeAt(i);
			var digit = $this.charToHex(c);
			var biDigit = $this.biMultiplyDigit(place, digit);
			result = $this.biAdd(result, biDigit);
			place = $this.biMultiplyDigit(place, radix);
		}
		result.isNeg = isNeg;
		return result;
	}

	this.biDump = function(b) {
		return (b.isNeg ? "-" : "") + b.digits.join(" ");
	}

	this.biAdd = function(x, y) {
		var result;

		if (x.isNeg != y.isNeg) {
			y.isNeg = !y.isNeg;
			result = $this.biSubtract(x, y);
			y.isNeg = !y.isNeg;
		}
		else {
			result = new $this.BigInt();
			var c = 0;
			var n;
			for (var i = 0; i < x.digits.length; ++i) {
				n = x.digits[i] + y.digits[i] + c;
				result.digits[i] = n & 0xffff;
				c = Number(n >= $this.biRadix);
			}
			result.isNeg = x.isNeg;
		}
		return result;
	}

	this.biSubtract = function(x, y) {
		var result;
		if (x.isNeg != y.isNeg) {
			y.isNeg = !y.isNeg;
			result = biAdd(x, y);
			y.isNeg = !y.isNeg;
		} else {
			result = new $this.BigInt();
			var n, c;
			c = 0;
			for (var i = 0; i < x.digits.length; ++i) {
				n = x.digits[i] - y.digits[i] + c;
				result.digits[i] = n & 0xffff;
				// Stupid non-conforming modulus operation.
				if (result.digits[i] < 0) result.digits[i] += $this.biRadix;
				c = 0 - Number(n < 0);
			}
			// Fix up the negative sign, if any.
			if (c == -1) {
				c = 0;
				for (var i = 0; i < x.digits.length; ++i) {
					n = 0 - result.digits[i] + c;
					result.digits[i] = n & 0xffff;
					// Stupid non-conforming modulus operation.
					if (result.digits[i] < 0) result.digits[i] += $this.biRadix;
					c = 0 - Number(n < 0);
				}
				// Result is opposite sign of arguments.
				result.isNeg = !x.isNeg;
			} else {
				// Result is same sign.
				result.isNeg = x.isNeg;
			}
		}
		return result;
	}

	this.biHighIndex = function(x) {
		var result = x.digits.length - 1;
		while (result > 0 && x.digits[result] == 0) --result;
		return result;
	}

	this.biNumBits = function(x) {
		var n = $this.biHighIndex(x);
		var d = x.digits[n];
		var m = (n + 1) * $this.bitsPerDigit;
		var result;
		for (result = m; result > m - $this.bitsPerDigit; --result) {
			if ((d & 0x8000) != 0) break;
			d <<= 1;
		}
		return result;
	}

	this.biMultiply = function(x, y) {
		var result = new $this.BigInt();
		var c;
		var n = $this.biHighIndex(x);
		var t = $this.biHighIndex(y);
		var u, uv, k;

		for (var i = 0; i <= t; ++i) {
			c = 0;
			k = i;
			for (j = 0; j <= n; ++j, ++k) {
				uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
				result.digits[k] = uv & $this.maxDigitVal;
				c = uv >>> $this.biRadixBits;
			}
			result.digits[i + n + 1] = c;
		}
		// Someone give me a logical xor, please.
		result.isNeg = x.isNeg != y.isNeg;
		return result;
	}

	this.biMultiplyDigit = function(x, y) {
		var n, c, uv;

		result = new $this.BigInt();
		n = $this.biHighIndex(x);
		c = 0;
		for (var j = 0; j <= n; ++j) {
			uv = result.digits[j] + x.digits[j] * y + c;
			result.digits[j] = uv & $this.maxDigitVal;
			c = uv >>> $this.biRadixBits;
		}
		result.digits[1 + n] = c;
		return result;
	}

	this.arrayCopy = function(src, srcStart, dest, destStart, n) {
		var m = Math.min(srcStart + n, src.length);
		for (var i = srcStart, j = destStart; i < m; ++i, ++j) {
			dest[j] = src[i];
		}
	}

	this.highBitMasks = new Array(
		0x0000, 0x8000, 0xC000, 0xE000, 0xF000, 0xF800,
		0xFC00, 0xFE00, 0xFF00, 0xFF80, 0xFFC0, 0xFFE0,
		0xFFF0, 0xFFF8, 0xFFFC, 0xFFFE, 0xFFFF);

	this.biShiftLeft = function(x, n) {
		var digitCount = Math.floor(n / $this.bitsPerDigit);
		var result = new $this.BigInt();
		$this.arrayCopy(x.digits, 0, result.digits, digitCount,
		          result.digits.length - digitCount);
		var bits = n % bitsPerDigit;
		var rightBits = bitsPerDigit - bits;
		for (var i = result.digits.length - 1, i1 = i - 1; i > 0; --i, --i1) {
			result.digits[i] = ((result.digits[i] << bits) & $this.maxDigitVal) |
			                   ((result.digits[i1] & $this.highBitMasks[bits]) >>>
			                    (rightBits));
		}
		result.digits[0] = ((result.digits[i] << bits) & $this.maxDigitVal);
		result.isNeg = x.isNeg;
		return result;
	}

	this.lowBitMasks = new Array(
		0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
		0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
		0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF);

	this.biShiftRight = function(x, n) {
		var digitCount = Math.floor(n / $this.bitsPerDigit);
		var result = new $this.BigInt();
		$this.arrayCopy(x.digits, digitCount, result.digits, 0,
		          x.digits.length - digitCount);
		var bits = n % $this.bitsPerDigit;
		var leftBits = $this.bitsPerDigit - bits;
		for (var i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
			result.digits[i] = (result.digits[i] >>> bits) |
			                   ((result.digits[i1] & $this.lowBitMasks[bits]) << leftBits);
		}
		result.digits[result.digits.length - 1] >>>= bits;
		result.isNeg = x.isNeg;
		return result;
	}

	this.biMultiplyByRadixPower = function(x, n) {
		var result = new $this.BigInt();
		$this.arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
		return result;
	}

	this.biDivideByRadixPower = function(x, n) {
		var result = new $this.BigInt();
		$this.arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
		return result;
	}

	this.biModuloByRadixPower = function(x, n) {
		var result = new $this.BigInt();
		$this.arrayCopy(x.digits, 0, result.digits, 0, n);
		return result;
	}

	this.biCompare = function(x, y) {
		if (x.isNeg != y.isNeg) {
			return 1 - 2 * Number(x.isNeg);
		}
		for (var i = x.digits.length - 1; i >= 0; --i) {
			if (x.digits[i] != y.digits[i]) {
				if (x.isNeg) {
					return 1 - 2 * Number(x.digits[i] > y.digits[i]);
				} else {
					return 1 - 2 * Number(x.digits[i] < y.digits[i]);
				}
			}
		}
		return 0;
	}

	this.biDivideModulo = function(x, y) {
		var nb = $this.biNumBits(x);
		var tb = $this.biNumBits(y);
		var origYIsNeg = y.isNeg;
		var q, r;
		if (nb < tb) {
			// |x| < |y|
			if (x.isNeg) {
				q = $this.biCopy($this.bigOne);
				q.isNeg = !y.isNeg;
				x.isNeg = false;
				y.isNeg = false;
				r = $this.biSubtract(y, x);
				// Restore signs, 'cause they're references.
				x.isNeg = true;
				y.isNeg = origYIsNeg;
			} else {
				q = new $this.BigInt();
				r = $this.biCopy(x);
			}
			return new Array(q, r);
		}
	
		q = new $this.BigInt();
		r = x;
	
		// Normalize Y.
		var t = Math.ceil(tb / $this.bitsPerDigit) - 1;
		var lambda = 0;
		while (y.digits[t] < $this.biHalfRadix) {
			y = $this.biShiftLeft(y, 1);
			++lambda;
			++tb;
			t = Math.ceil(tb / $this.bitsPerDigit) - 1;
		}
		// Shift r over to keep the quotient constant. We'll shift the
		// remainder back at the end.
		r = $this.biShiftLeft(r, lambda);
		nb += lambda; // Update the bit count for x.
		var n = Math.ceil(nb / $this.bitsPerDigit) - 1;
	
		var b = $this.biMultiplyByRadixPower(y, n - t);
		while ($this.biCompare(r, b) != -1) {
			++q.digits[n - t];
			r = $this.biSubtract(r, b);
		}
		for (var i = n; i > t; --i) {
	    var ri = (i >= r.digits.length) ? 0 : r.digits[i];
	    var ri1 = (i - 1 >= r.digits.length) ? 0 : r.digits[i - 1];
	    var ri2 = (i - 2 >= r.digits.length) ? 0 : r.digits[i - 2];
	    var yt = (t >= y.digits.length) ? 0 : y.digits[t];
	    var yt1 = (t - 1 >= y.digits.length) ? 0 : y.digits[t - 1];
			if (ri == yt) {
				q.digits[i - t - 1] = $this.maxDigitVal;
			} else {
				q.digits[i - t - 1] = Math.floor((ri * $this.biRadix + ri1) / yt);
			}
	
			var c1 = q.digits[i - t - 1] * ((yt * $this.biRadix) + yt1);
			var c2 = (ri * $this.biRadixSquared) + ((ri1 * $this.biRadix) + ri2);
			while (c1 > c2) {
				--q.digits[i - t - 1];
				c1 = q.digits[i - t - 1] * ((yt * $this.biRadix) | yt1);
				c2 = (ri * $this.biRadix * $this.biRadix) + ((ri1 * $this.biRadix) + ri2);
			}

			b = $this.biMultiplyByRadixPower(y, i - t - 1);
			r = $this.biSubtract(r, $this.biMultiplyDigit(b, q.digits[i - t - 1]));
			if (r.isNeg) {
				r = $this.biAdd(r, b);
				--q.digits[i - t - 1];
			}
		}
		r = $this.biShiftRight(r, lambda);
		// Fiddle with the signs and stuff to make sure that 0 <= r < y.
		q.isNeg = x.isNeg != origYIsNeg;
		if (x.isNeg) {
			if (origYIsNeg) {
				q = $this.biAdd(q, $this.bigOne);
			} else {
				q = $this.biSubtract(q, $this.bigOne);
			}
			y = $this.biShiftRight(y, lambda);
			r = $this.biSubtract(y, r);
		}
		// Check for the unbelievably stupid degenerate case of r == -0.
		if (r.digits[0] == 0 && $this.biHighIndex(r) == 0) r.isNeg = false;

		return new Array(q, r);
	}

	this.biDivide = function(x, y) {
		return $this.biDivideModulo(x, y)[0];
	}

	this.biModulo = function(x, y) {
		return $this.biDivideModulo(x, y)[1];
	}

	this.biMultiplyMod = function(x, y, m) {
		return $this.biModulo($this.biMultiply(x, y), m);
	}

	this.biPow = function(x, y) {
		var result = $this.bigOne;
		var a = x;
		while (true) {
			if ((y & 1) != 0) result = $this.biMultiply(result, a);
			y >>= 1;
			if (y == 0) break;
			a = $this.biMultiply(a, a);
		}
		return result;
	}

	this.biPowMod = function(x, y, m) {
		var result = $this.bigOne;
		var a = x;
		var k = y;
		while (true) {
			if ((k.digits[0] & 1) != 0) result = $this.biMultiplyMod(result, a, m);
			k = $this.biShiftRight(k, 1);
			if (k.digits[0] == 0 && $this.biHighIndex(k) == 0) break;
			a = $this.biMultiplyMod(a, a, m);
		}
		return result;
	}

// BarrettMu, a class for performing Barrett modular reduction computations in
// JavaScript.
//
// Requires BigInt.js.
//
// Copyright 2004-2005 David Shapiro.
//
// You may use, re-use, abuse, copy, and modify this code to your liking, but
// please keep this header.
//
// Thanks!
// 
// Dave Shapiro
// dave@ohdave.com 

	this.BarrettMu = function(m) {
		this.modulus = $this.biCopy(m);
		this.k = $this.biHighIndex(this.modulus) + 1;
		var b2k = new $this.BigInt();
		b2k.digits[2 * this.k] = 1; // b2k = b^(2k)
		this.mu = $this.biDivide(b2k, this.modulus);
		this.bkplus1 = new $this.BigInt();
		this.bkplus1.digits[this.k + 1] = 1; // bkplus1 = b^(k+1)
		this.modulo = $this.BarrettMu_modulo;
		this.multiplyMod = $this.BarrettMu_multiplyMod;
		this.powMod = $this.BarrettMu_powMod;
	}

	this.BarrettMu_modulo = function(x) {
		var q1 = $this.biDivideByRadixPower(x, this.k - 1);
		var q2 = $this.biMultiply(q1, this.mu);
		var q3 = $this.biDivideByRadixPower(q2, this.k + 1);
		var r1 = $this.biModuloByRadixPower(x, this.k + 1);
		var r2term = $this.biMultiply(q3, this.modulus);
		var r2 = $this.biModuloByRadixPower(r2term, this.k + 1);
		var r = $this.biSubtract(r1, r2);
		if (r.isNeg) {
			r = $this.biAdd(r, this.bkplus1);
		}
		var rgtem = $this.biCompare(r, this.modulus) >= 0;
		while (rgtem) {
			r = $this.biSubtract(r, this.modulus);
			rgtem = $this.biCompare(r, this.modulus) >= 0;
		}
		return r;
	}

	this.BarrettMu_multiplyMod = function(x, y) {
		/*
		x = this.modulo(x);
		y = this.modulo(y);
		*/
		var xy = $this.biMultiply(x, y);
		return this.modulo(xy);
	}

	this.BarrettMu_powMod = function(x, y) {
		var result = new $this.BigInt();
		result.digits[0] = 1;
		var a = x;
		var k = y;
		while (true) {
			if ((k.digits[0] & 1) != 0) result = this.multiplyMod(result, a);
			k = $this.biShiftRight(k, 1);
			if (k.digits[0] == 0 && $this.biHighIndex(k) == 0) break;
			a = this.multiplyMod(a, a);
		}
		return result;
	}

// RSA, a suite of routines for performing RSA public-key computations in
// JavaScript.
//
// Requires BigInt.js and Barrett.js.
//
// Copyright 1998-2005 David Shapiro.
//
// You may use, re-use, abuse, copy, and modify this code to your liking, but
// please keep this header.
//
// Thanks!
// 
// Dave Shapiro
// dave@ohdave.com 

	this.RSAKeyPair = function(encryptionExponent, decryptionExponent, modulus) {
		this.e = $this.biFromHex(encryptionExponent);
		this.d = $this.biFromHex(decryptionExponent);
		this.m = $this.biFromHex(modulus);
		// We can do two bytes per digit, so
		// chunkSize = 2 * (number of digits in modulus - 1).
		// Since biHighIndex returns the high index, not the number of digits, 1 has
		// already been subtracted.
		this.chunkSize = 2 * $this.biHighIndex(this.m);
		this.radix = 16;
		this.barrett = new $this.BarrettMu(this.m);
	}

	this.twoDigit = function(n) {
		return (n < 10 ? "0" : "") + String(n);
	}

	this.encryptedString = function(key, s) {
		// Altered by Rob Saunders (rob@robsaunders.net). New routine pads the
		// string after it has been converted to an array. This fixes an
		// incompatibility with Flash MX's ActionScript.
		var a = new Array();
		var sl = s.length;
		var i = 0;
		while (i < sl) {
			a[i] = s.charCodeAt(i);
			i++;
		}

		while (a.length % key.chunkSize != 0) {
			a[i++] = 0;
		}

		var al = a.length;
		var result = "";
		var j, k, block;
		for (i = 0; i < al; i += key.chunkSize) {
			block = new $this.BigInt();
			j = 0;
			for (k = i; k < i + key.chunkSize; ++j) {
				block.digits[j] = a[k++];
				block.digits[j] += a[k++] << 8;
			}
			var crypt = key.barrett.powMod(block, key.e);
			var text = key.radix == 16 ? $this.biToHex(crypt) : $this.biToString(crypt, key.radix);
			result += text + " ";
		}
		return result.substring(0, result.length - 1); // Remove last space.
	}

	this.decryptedString = function(key, s) {
		var blocks = s.split(" ");
		var result = "";
		var i, j, block;
		for (i = 0; i < blocks.length; ++i) {
			var bi;
			if (key.radix == 16) {
				bi = $this.biFromHex(blocks[i]);
			}
			else {
				bi = $this.biFromString(blocks[i], key.radix);
			}
			block = key.barrett.powMod(bi, key.d);
			for (j = 0; j <= $this.biHighIndex(block); ++j) {
				result += String.fromCharCode(block.digits[j] & 255,
				                              block.digits[j] >> 8);
			}
		}
		// Remove trailing null, if any.
		if (result.charCodeAt(result.length - 1) == 0) {
			result = result.substring(0, result.length - 1);
		}
		return result;
	}
	return this;
}())

module.exports = rsa;
