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

import * as Jinro from "./jinro.js";


function addCell($row, $node){
	const $cell = document.createElement("td");
	$cell.appendChild($node);
	$row.appendChild($cell);
}


/* name */
const $name_tbody = document.getElementById("init.name.tbody");
const $name_inputs = document.getElementsByName("init.name.input");

function name_removeRow(e){
	const $row = e.target.parentElement.parentElement;
	$row.parentElement.removeChild($row);
}

function name_onchange(e){
	const l = $name_inputs.length;
	for(const $input1 of $name_inputs){
		const value = $input1.value;
		if(value === ""){
			//$input1.setCustomValidity("empty");
		}else{
			$input1.setCustomValidity("");
			for(const $input2 of $name_inputs){
				if($input2 !== $input1 && $input2.value === value){
					$input1.setCustomValidity("the same name");
				}
			}
		}
	}
}

function name_add(name){
	const $row = document.createElement("tr");

	const $input = document.createElement("input");
	$input.setAttribute("type", "text");
	$input.setAttribute("name", "init.name.input");
	$input.setAttribute("required", true);
	$input.setAttribute("placeholder", "名前");
	$input.value = name;
	$input.addEventListener("change", name_onchange);
	addCell($row, $input);

	const $button = document.createElement("button");
	$button.appendChild(document.createTextNode("-"));
	$button.addEventListener("click", name_removeRow);
	addCell($row, $button);

	$name_tbody.appendChild($row);
}

document.getElementById("init.name.addRow").addEventListener("click", e => {
	name_add("");
}, false);


/* yaku */

const $yaku_inputs = new Array(2);

for(let i=0; i<2; ++i){
	const $row = document.getElementById("init.yaku.row." + i);

	const $text = document.createTextNode(Jinro.YAKU_NAMES[i]);
	addCell($row, $text);

	const $input = document.createElement("input");
	$input.setAttribute("required", true);
	$input.setAttribute("type", "number");
	$input.setAttribute("value", "0");
	$input.setAttribute("min", "0");
	$input.setAttribute("step", "1");
	addCell($row, $input);

	$yaku_inputs[i] = $input;
}


/* settings */
function getSettings(){
	const settings = new Jinro.Settings();
	settings.shoni = document.getElementById("init.settings.shoni").selectedIndex;
	settings.firstAct = document.getElementById("init.settings.firstAct").selectedIndex;
	settings.draw = document.getElementById("init.settings.draw").selectedIndex;
	return settings;
}

function restoreSettings(settings){
	document.getElementById("init.settings.shoni").selectedIndex = settings.shoni;
	document.getElementById("init.settings.firstAct").selectedIndex = settings.firstAct;
	document.getElementById("init.settings.draw").selectedIndex = settings.draw;
}


/* sesseion storage */

const STORAGE_INIT_KEY = "jinro.init";

function setStorage(){
	const names = new Array();
	for(const $input of $name_inputs){
		names.push($input.value);
	}
	const nYakus = new Object();
	for(const i in $yaku_inputs){
		const $input = $yaku_inputs[i];
		const n = parseInt($input.value);
		if(!isNaN(n)){
			nYakus[Jinro.YAKU_CHARS[i]] = n;
		}
	}
	const settings = getSettings();
	const data = { version: 1, names: names, nYakus: nYakus, settings: settings };
	const json = JSON.stringify(data);
	if(!json) return;
	window.sessionStorage.setItem(STORAGE_INIT_KEY, json);
}

function restoreStorage(){
	const json = window.sessionStorage.getItem(STORAGE_INIT_KEY);
	if(!json) return;
	const data = JSON.parse(json);
	if(!data) return;
	if(data.version !== 1) return;
	for(const name of data.names){
		name_add(name);
	}
	for(const char in data.nYakus){
		const yaku = Jinro.YAKU_CHARS.indexOf(char);
		if(yaku < 0) continue;
		$yaku_inputs[yaku].value = data.nYakus[char];
	}
	restoreSettings(data.settings);
}

window.addEventListener("pagehide", e => { setStorage(); });
restoreStorage();

/* start */

const STORAGE_PLAY_KEY = "jinro.play.#";

document.getElementById("init.start").addEventListener("click", e => {
	const settings = getSettings();

	const names = new Array();
	if(settings.shoni === Jinro.SETTINGS_SHONI_SHONI){
		names.unshift("第一犠牲者");
	}
	for(const $input of $name_inputs){
		if(!$input.reportValidity()){
			window.alert("誤入力があります（赤下線部）");
			return;
		}
		names.push($input.value);
	}
	const n = names.length;
	if(n <= 1){
		window.alert("人数が少ないです");
		return;
	}
	const nYakus = new Array(Jinro.YAKU_N).fill(0);
	for(const i in $yaku_inputs){
		const $input = $yaku_inputs[i];
		if(!$input.reportValidity()){
			window.alert("誤入力があります（赤下線部）");
			return;
		}
		nYakus[i] = parseInt($input.value);
	}
	const yakus = Jinro.yalloc(names.length, nYakus, settings.shoni);
	if(yakus === undefined){
		window.alert("第一犠牲者に適する役職がありません");
		return;
	}else if(yakus === null){
		window.alert("人数と役職数が異なります");
		return;
	}
	const game = new Jinro.Game(n, yakus, settings);
	game.names = names;

	const id = new Date().getTime();
	game.id = id;

	const key = STORAGE_PLAY_KEY + id;
	if(window.localStorage.getItem(key)){
		window.alert("時間を置いてお試しください");
		return;
	}

	try{
		const json = JSON.stringify(game, Jinro.replacer);
		window.localStorage.setItem(key, json);
	}catch(err){
		window.alert("データを保存できませんでした");
		return;
	}

	window.location.replace("./play#" + id);
});
