// create an array of the three types of strings we're creating,
// mirrored, inverted, and reversed.
var mystring = [];
mystring["mirrored"] = new StringBuffer();
mystring["inverted"] = new StringBuffer();
mystring["reversed"] = new StringBuffer();


// build a hash table
// from  http://docs.google.com/Doc?id=dfqr8rd5_353ft4xw6hj
// with modifications
var hashesMirrored = {};
hashesMirrored["A"] = "A";
hashesMirrored["B"] = "ᙠ";
hashesMirrored["C"] = "Ɔ";
hashesMirrored["D"] = "ᗡ";
hashesMirrored["E"] = "Ǝ";
hashesMirrored["F"] = "ᖷ";
hashesMirrored["G"] = "Ꭾ";  // need a good G
hashesMirrored["H"] = "H";
hashesMirrored["I"] = "I";
hashesMirrored["J"] = "Ⴑ";
hashesMirrored["K"] = "ᐴ";
hashesMirrored["L"] = "⅃";
hashesMirrored["M"] = "M";
hashesMirrored["N"] = "И";
hashesMirrored["O"] = "O";
hashesMirrored["P"] = "ꟼ";  //  or try ᑫ
hashesMirrored["Q"] = "Ọ";
hashesMirrored["R"] = "Я"; 
hashesMirrored["S"] = "Ƨ";
hashesMirrored["T"] = "T";
hashesMirrored["U"] = "U";
hashesMirrored["V"] = "V";
hashesMirrored["W"] = "W";
hashesMirrored["X"] = "X";
hashesMirrored["Y"] = "Y";
hashesMirrored["Z"] = "Ƹ";  // need a good Z
hashesMirrored["a"] = "ɒ";
hashesMirrored["b"] = "d";
hashesMirrored["c"] = "ɔ";
hashesMirrored["d"] = "b";
hashesMirrored["e"] = "ɘ";
hashesMirrored["f"] = "ʇ";
hashesMirrored["g"] = "ǫ";
hashesMirrored["h"] = "ʜ";
hashesMirrored["i"] = "i";
hashesMirrored["j"] = "Ⴑ";
hashesMirrored["k"] = "ʞ";
hashesMirrored["l"] = "l";
hashesMirrored["m"] = "m";
hashesMirrored["n"] = "n";
hashesMirrored["o"] = "o";
hashesMirrored["p"] = "q";
hashesMirrored["q"] = "p";
hashesMirrored["r"] = "ɿ";
hashesMirrored["s"] = "ƨ";
hashesMirrored["t"] = "ƚ";
hashesMirrored["u"] = "u";
hashesMirrored["v"] = "v";
hashesMirrored["w"] = "w";
hashesMirrored["x"] = "x";
hashesMirrored["y"] = "";
hashesMirrored["z"] = "";
hashesMirrored["0"] = "0";
hashesMirrored["1"] = "";
hashesMirrored["2"] = "";
hashesMirrored["3"] = "Ƹ";
hashesMirrored["4"] = "";
hashesMirrored["5"] = "";
hashesMirrored["6"] = "";
hashesMirrored["7"] = "";
hashesMirrored["8"] = "8";
hashesMirrored["9"] = "";
hashesMirrored["?"] = "␚";
hashesMirrored[";"] = "⁏";

var hashesInverted = {};
hashesInverted["A"] = "ᗄ";
hashesInverted["B"] = "ᗷ";
hashesInverted["C"] = "⊂";
hashesInverted["D"] = "D";
hashesInverted["E"] = "E";
hashesInverted["F"] = "ᖶ";
hashesInverted["G"] = "⅁";
hashesInverted["H"] = "H";
hashesInverted["I"] = "I";
hashesInverted["J"] = "ᘃ";
hashesInverted["K"] = "ʞ";
hashesInverted["L"] = "⅂";
hashesInverted["M"] = "ʍ";
hashesInverted["N"] = "";
hashesInverted["O"] = "O";
hashesInverted["P"] = "b";
hashesInverted["Q"] = "ⵚ";
hashesInverted["R"] = "ᖉ";
hashesInverted["S"] = "ᴤ";
hashesInverted["T"] = "⊥";
hashesInverted["U"] = "∩";
hashesInverted["V"] = "⋀";
hashesInverted["W"] = "M";
hashesInverted["X"] = "X";
hashesInverted["Y"] = "⅄";
hashesInverted["Z"] = "Z";  // need better
hashesInverted["a"] = "ɐ";
hashesInverted["b"] = "p";
hashesInverted["c"] = "ⅽ";
hashesInverted["d"] = "q";
hashesInverted["e"] = "ө";
hashesInverted["f"] = "ʈ";
hashesInverted["g"] = "ɓ";
hashesInverted["h"] = "µ";
hashesInverted["i"] = "!";
hashesInverted["j"] = "ɾ";
hashesInverted["k"] = "ʞ";
hashesInverted["l"] = "ꞁ";
hashesInverted["m"] = "w";
hashesInverted["n"] = "u";
hashesInverted["o"] = "o";
hashesInverted["p"] = "b";
hashesInverted["q"] = "d";
hashesInverted["r"] = "ʁ";
hashesInverted["s"] = "ƨ";
hashesInverted["t"] = "ʇ";
hashesInverted["u"] = "∩";
hashesInverted["v"] = "٨";
hashesInverted["w"] = "ʍ";
hashesInverted["x"] = "x";
hashesInverted["y"] = "ʎ";
hashesInverted["z"] = "z";
hashesInverted["0"] = "0";
hashesInverted["1"] = "";
hashesInverted["2"] = "";
hashesInverted["3"] = "3";
hashesInverted["4"] = "";
hashesInverted["5"] = "";
hashesInverted["6"] = "";
hashesInverted["7"] = "∠";
hashesInverted["8"] = "";
hashesInverted["9"] = "";
hashesInverted["!"] = "¡";
hashesInverted["?"] = "¿";
hashesInverted[";"] = "⁏";

exports.mirror = function mirror(source) {
    mystring['reversed'] == "";
    for (var i=0; i < source.length; i++) {
        transform(source[i],'reversed');
    }
    return mystring['reversed']
} 
// reverse the source string
function transform(source, type) {
	var character = source;
	
//	character = String.fromCharCode(source);
	
	// for reversed strings, flip it first so we can append properly
	if (type == "reversed" && mystring[type] != null) mystring[type].reverse();
	
	// handle backspaces
	if (source == 8) {
		if (mystring[type] != null) {
			mystring[type].remove();
		}
	}
	// reversed strings can use the mirrored hash table
	else	if ((type == "mirrored" || type == "reversed") && hashesMirrored[character]) {
			mystring[type].append(hashesMirrored[character]);
	}
	else	if (type == "inverted" && hashesInverted[character]) {
			mystring[type].append(hashesInverted[character]);
	}
	
	// only support ASCII input in the range of normal
	// alphabet and punctuation characters
	// BUG: Opera doesn't seem to care
	else if (source >= 32 && source <= 126) {
		mystring[type].append(character);
	}
	
	//for reversed strings, flip again to reverse the updated string
	if (type == "reversed") mystring[type].reverse();
	return mystring[type].toString();

}


// from http://www.softwaresecretweapons.com/jspwiki/javascriptstringconcatenation
function StringBuffer() { 
   this.buffer = []; 
 } 

 StringBuffer.prototype.append = function append(string) { 
   this.buffer.push(string); 
   return this; 
 }; 
 
  StringBuffer.prototype.remove = function remove() { 
   this.buffer.pop(); 
   return this; 
 }; 

  StringBuffer.prototype.reverse = function reverse() { 
   this.buffer.reverse(); 
   return this; 
 }; 
 
 StringBuffer.prototype.toString = function toString() { 
   return this.buffer.join(""); 
 }; 

