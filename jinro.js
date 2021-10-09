/*
 * Copyright (c) 2021 Hiroaki Sano
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

"use strict";

const FLAG_ONALIVE = 0x1;
const FLAG_EXONE = 0x2;
const FLAG_ONYAKU = 0x4;
const FLAG_EXYAKU = 0x8;

export const YAKU_N = 2;
export const YAKU_CHARS = [ "村", "狼" ];
export const YAKU_NAMES = [ "村人", "人狼" ];

export const YAKU_MURA = 0;
export const YAKU_JINRO = 1;
//export const YAKU_YOKO = 2;

export const RESULT_NONE = 0;
export const RESULT_DRAW = 1;
export const RESULT_MURA = 2;
export const RESULT_JINRO = 3;

export const SETTINGS_SHONI_SHONI = 0;
export const SETTINGS_SHONI_BITE = 1;
export const SETTINGS_SHONI_NONE = 2;

export const SETTINGS_DRAW_RANDOM = 0;
//export const SETTINGS_DRAW_EXIT = 1;
//export const SETTINGS_DRAW_REVOTE_RANDOM = 2;
//export const SETTINGS_DRAW_REVOTE_EXIT = 3;


export class Night {
	constructor(game){
		this[""] = "Night";
		//Object.defineProperty(this, "className", { value: "Night" });

		const n = game.n;

		this.calced = false;

		this.aVote = new Array(n).fill(-1);
		this.kJinro = -1;

		if(game.time === 1 && game.settings.shoni === SETTINGS_SHONI_SHONI){
			const options = this.getOptions(game, 0);
			const option = options[myrand(options.length)];
			this.aVote[0] = option;
		}
	}

	next(game){
		const n = game.n;
		for(let i=0; i<n; ++i){
			if(game.alives[i] && this.aVote[i] < 0) return i;
		}
		return -1;
	}

	getOptions(game, one){
		const yaku = game.yakus[one];
		if(yaku === YAKU_JINRO){
			if(game.time === 1){
				if(game.settings.shoni === SETTINGS_SHONI_SHONI){
					return [ 0 ];
				}else if(game.settings.shoni === SETTINGS_SHONI_NONE){
					return game.select(FLAG_ONALIVE | FLAG_EXONE, one, -1);
				}else{
					return game.select(FLAG_ONALIVE | FLAG_EXYAKU, -1, YAKU_JINRO);
				}
			}else{
				return game.select(FLAG_ONALIVE | FLAG_EXYAKU, -1, YAKU_JINRO);
			}
		}else{
			return game.select(FLAG_ONALIVE | FLAG_EXONE, one, -1);
		}
	}

	calc(game){
		const n = game.n;

		const aJinro = new Array(n).fill(-1);
		const aKari = new Array(n).fill(-1);
		const aUra = new Array(n).fill(-1);
		for(let i=0; i<n; ++i){
			switch(game.yakus[i]){
				case YAKU_JINRO:
					aJinro[i] = this.aVote[i];
			}
		}

		const tJinro = new Array(n).fill(0);
		for(let i=0; i<n; ++i){
			const t1 = aJinro[i];
			if(t1 >= 0) tJinro[t1]++;
		}
		const kJinro = arrayMaxIndex(tJinro, n, true);
		if(aKari.indexOf(kJinro) === -1){
			this.kJinro = kJinro;
			game.alives[kJinro] = false;
		}else{
			this.kJinro = -1;
		}

		this.calced = true;
	}
}

export class Day {
	constructor(game){
		this[""] = "Day";

		const n = game.n;

		this.calced = false;

		this.aVote = new Array(n).fill(-1);
		this.tVote = new Array(n).fill(0);
		this.kVote = -1;
	}

	next(game){
		const n = game.n;
		for(let i=0; i<n; ++i){
			if(game.alives[i] && this.aVote[i] < 0) return i;
		}
		return -1;
	}

	getOptions(game, one){
		return game.select(FLAG_ONALIVE | FLAG_EXONE, one, -1);
	}

	calc(game){
		const n = game.n;
		for(let i=0; i<n; ++i){
			const t = this.aVote[i];
			if(t >= 0){
				this.tVote[t]++;
			}
		}
		const kVote = arrayMaxIndex(this.tVote, n, true);
		this.kVote = kVote;
		game.alives[kVote] = false;

		this.calced = true;
	}
}

export function Settings(){
	this.shoni = SETTINGS_SHONI_SHONI;
	this.draw = SETTINGS_DRAW_RANDOM;
}

export class Game {
	constructor(n, yakus, settings){
		this[""] = "Game";
		this.version = 1;

		this.n = n;
		this.yakus = yakus;
		this.settings = settings;
		this.alives = new Array(n).fill(true);

		this.day = null;
		this.night = null;

		this.days = new Array();
		this.nights = new Array();

		this.result = RESULT_NONE;
		this.time = 1;
		this.isNight = true;
	}

	select(flags, one, yaku){
		const array = new Array();
		for(let i=0; i<this.n; ++i){
			if((flags & FLAG_ONALIVE) && !this.alives[i]) continue;
			if((flags & FLAG_EXONE) && i === one) continue;
			if((flags & FLAG_ONYAKU) && this.yakus[i] !== yaku) continue;
			if((flags & FLAG_EXYAKU) && this.yakus[i] === yaku) continue;
			array.push(i);
		}
		return array;
	}

	calc(){
		let n = 0, m = 0;
		for(let i=0; i<this.n; ++i){
			if(this.alives[i]){
				if(this.yakus[i] === YAKU_JINRO){
					m++;
				}else{
					n++;
				}
			}
		}
		if(m == 0){
			this.result = RESULT_MURA;
		}else if(n <= m){
			this.result = RESULT_JINRO;
		}
	}
}

export function yalloc(n, nYakus, shoni){
	if(shoni === SETTINGS_SHONI_SHONI){
		let m = 0, f = false;
		for(let i=0; i<YAKU_N; ++i){
			m += nYakus[i];
			if(i != YAKU_JINRO && nYakus[i] > 0){
				f = true;
			}
		}
		if(m != n) return null;
		if(!f) return undefined;
		const yakus = new Array(n);
		m = 0;
		for(let i=0; i<YAKU_N; ++i){
			if(i != YAKU_JINRO){
				for(let j=nYakus[i]; j>0; --j){
					yakus[m++] = i;
				}
			}
		}
		const s = myrand(m);
		const t = yakus[0]; yakus[0] = yakus[s]; yakus[s] = t;
		for(let i=0; i<YAKU_N; ++i){
			if(i == YAKU_JINRO){
				for(let j=nYakus[i]; j>0; --j){
					yakus[m++] = i;
				}
			}
		}
		console.log(yakus);
		return yakus;
	}else{
		let m = 0;
		for(let i=0; i<YAKU_N; ++i){
			m += nYakus[i];
		}
		if(m != n) return null;
		const yakus = new Array(n);
		m = 0;
		for(let i=0; i<YAKU_N; ++i){
			for(let j=nYakus[i]; j>0; --j){
				yakus[m++] = i;
			}
		}
		myrandarray(yakus, 0, n);
		return yakus;
	}
}

export function replacer(key, value){
	if(this[""] === "Game"){
		if(key === "yaku"){
			return value.map(yaku => YAKU_CHARS[yaku]);
		}
	}
	return value;
}

export function reviver(key, value){
	if(this[""] === "Game"){
		if(key === "yaku"){
			return value.map(char => YAKU_CHARS.indexOf(char));
		}
	}
	if(typeof value === "object"){
		if(value === null){
			return null;
		}
		const c = value[""];
		switch(value[""]){
			case "Game":
				return Object.create(Game.prototype, Object.getOwnPropertyDescriptors(value));
			case "Day":
				return key === "day" ? Object.create(Day.prototype, Object.getOwnPropertyDescriptors(value)) : value;
			case "Night":
				return key === "night" ? Object.create(Night.prototype, Object.getOwnPropertyDescriptors(value)) : value;
		}
	}
	return value;
}

function arrayMaxIndex(array, length, random){
	if(length == 0) return -1;
	let maxV = array[0];
	let maxN = 1;
	for(let i=1; i<length; ++i){
		if(array[i] > maxV){
			maxV = array[i];
			maxN = 1;
		}else if(array[i] === maxV){
			maxN++;
		}
	}
	if(!random && maxN !== 1) return -1;
	let maxI = myrand(maxN);
	for(let i=0; i<length; ++i){
		if(array[i] === maxV){
			if(maxI-- === 0) return i;
		}
	}
	return -1;
}

function myrandarray(array, fromIndex, toIndex){
	const length = toIndex - fromIndex;
	for(let i=length-1; i>0; --i){
		const j = i + fromIndex;
		const k = myrand(i+1) + fromIndex;
		const t = array[j];
		array[j] = array[k];
		array[k] = t;
	}
}

let myrandI = 0;
let myrandA = new Uint32Array(16);
function myrand(n){
	if(myrandI === 0){
		window.crypto.getRandomValues(myrandA);
		myrandI = 16;
	}
	const i = myrandA[--myrandI] % n;
	console.log("random", n, i);
	return i;
}
