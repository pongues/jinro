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

let key;
let game;
let sync;

const STORAGE_PLAY_KEY = "jinro.play.";

function removeAll($node){
	while($node.lastChild){
		$node.removeChild($node.lastChild);
	}
}

function addCell($row, $node){
	const $cell = document.createElement("td");
	$cell.appendChild($node);
	$row.appendChild($cell);
}

function save(){
	sync = false;
	try{
		const json = JSON.stringify(game, Jinro.replacer);
		window.localStorage.setItem(key, json);
	}catch(err){
		console.error(err);
		return;
	}
	sync = true;
}

window.addEventListener("pageshow", e => {
	let err = "";
	do{
		const hash = window.location.hash;
		if(!hash){
			err = "URL が不正です"; break;
		}
		key = STORAGE_PLAY_KEY + hash;

		const json = window.localStorage.getItem(key);
		if(!json){
			err = "ゲームが存在しません"; break;
		}

		try{
			game = JSON.parse(json, Jinro.reviver);
		}catch(err){
			err = "ゲームデータの読込に失敗しました"; break;
		}
	} while(false);

	if(err){
		window.alert(err);
		$button.style.display = "none";
		return;
	}
	sync = true;
	main();
});

function setOptions($select, strings, indexes){
	$select.innerHTML = "";
	for(const index of indexes){
		const option = document.createElement("option");
		option.required = true;
		option.value = index;
		option.appendChild(document.createTextNode(strings[index]));
		$select.appendChild(option);
	}
}

let one;

function main(){
	console.log(game);

	if(game.result !== Jinro.RESULT_NONE){
		document.getElementById("play.res").style.display = "block";
		createRes();
	}else if(game.isNight){
		document.getElementById("play.night").style.display = "block";
		document.getElementById("play.night.time").innerText = game.time;
		if(!game.night){
			document.getElementById("play.night.before").style.display = "block";
		}else{
			one = game.night.next(game);
			if(one >= 0){
				document.getElementById("play.night.act").style.display = "block";
				document.getElementById("play.night.act0").style.display = "block";
				const $name = document.getElementById("play.night.act.name");
				removeAll($name);
				$name.appendChild(document.createTextNode(game.names[one]));
			}else if(!game.night.calced){
				document.getElementById("play.night.after").style.display = "block";
			}else{
				document.getElementById("play.night.res").style.display = "block";
				createNightRes();
			}
		}
	}else{
		document.getElementById("play.day").style.display = "block";
		document.getElementById("play.day.time").innerText = game.time;
		if(!game.day){
			document.getElementById("play.day.before").style.display = "block";
		}else{
			one = game.day.next(game);
			if(one >= 0){
				document.getElementById("play.day.act").style.display = "block";
				const $name = document.getElementById("play.day.act.name");
				removeAll($name);
				$name.appendChild(document.createTextNode(game.names[one]));

				const $select = document.getElementById("play.day.act.select");
				setOptions($select, game.names, game.day.getOptions(game, one));
			}else if(!game.day.calced){
				document.getElementById("play.day.after").style.display = "block";
			}else{
				document.getElementById("play.day.res").style.display = "block";
				createDayRes();
			}
		}
	}
}


// day

document.getElementById("play.day.before.button").addEventListener("click", function(e){
	document.getElementById("play.day.before").style.display = "none";
	document.getElementById("play.day").style.display = "none";
	game.day = new Jinro.Day(game);
	save();
	main();
});

document.getElementById("play.day.act.button").addEventListener("click", function(e){
	document.getElementById("play.day.act").style.display = "none";
	document.getElementById("play.day").style.display = "none";

	const $select = document.getElementById("play.day.act.select");
	if(!$select.reportValidity()){
		return;
	}
	const target = parseInt($select.value);
	game.day.aVote[one] = target;

	save();
	main();
});

document.getElementById("play.day.after.button").addEventListener("click", function(e){
	document.getElementById("play.day.after").style.display = "none";
	document.getElementById("play.day").style.display = "none";

	game.day.calc(game);
	save();
	main();
});

document.getElementById("play.day.res.button").addEventListener("click", function(e){
	document.getElementById("play.day.res").style.display = "none";
	document.getElementById("play.day").style.display = "none";

	game.calc();
	game.night = null;
	game.isNight = true;
	main();
});

function createDayRes(){
	const $text = document.getElementById("play.day.res.text");
	removeAll($text);
	if(game.day.kVote >= 0){
		const $h2 = document.createElement("h2");
		$h2.appendChild(document.createTextNode(game.names[game.day.kVote]));
		$text.appendChild($h2);
		$text.appendChild(document.createTextNode("の死体が発見されました"));
	}else{
		$text.appendChild(document.createTextNode("犠牲者はいませんでした"));
	}
}

// night

document.getElementById("play.night.before.button").addEventListener("click", function(e){
	document.getElementById("play.night.before").style.display = "none";
	document.getElementById("play.night").style.display = "none";
	game.night = new Jinro.Night(game);
	save();
	main();
});

document.getElementById("play.night.act0.button").addEventListener("click", function(e){
	document.getElementById("play.night.act0.button").style.display = "none";
	document.getElementById("play.night.act0.confirm").style.display = "block";
});
document.getElementById("play.night.act0.confirm.prev").addEventListener("click", function(e){
	document.getElementById("play.night.act0.confirm").style.display = "none";
	document.getElementById("play.night.act0.button").style.display = "block";
});
document.getElementById("play.night.act0.confirm.next").addEventListener("click", function(e){
	document.getElementById("play.night.act0.confirm").style.display = "none";
	document.getElementById("play.night.act0.button").style.display = "block";
	document.getElementById("play.night.act0").style.display = "none";
	document.getElementById("play.night.act1").style.display = "block";

	const $text = document.getElementById("play.night.act1.text");
	removeAll($text);
	switch(game.yakus[one]){
		case Jinro.YAKU_JINRO:
			$text.appendChild(document.createTextNode("誰を噛みますか？"));
			break;
		default:
			$text.appendChild(document.createTextNode("誰が好きですか？"));
	}
	const $select = document.getElementById("play.night.act1.select");
	setOptions($select, game.names, game.night.getOptions(game, one));
});

document.getElementById("play.night.act1.button").addEventListener("click", function(e){
	document.getElementById("play.night.act1").style.display = "none";
	document.getElementById("play.night.act").style.display = "none";
	document.getElementById("play.night").style.display = "none";

	const $select = document.getElementById("play.night.act1.select");
	if(!$select.reportValidity()){
		return;
	}
	const target = parseInt($select.value);
	game.night.aVote[one] = target;

	save();
	main();
});

document.getElementById("play.night.after.button").addEventListener("click", function(e){
	document.getElementById("play.night.after").style.display = "none";
	document.getElementById("play.night").style.display = "none";

	game.night.calc(game);
	save();
	main();
});

document.getElementById("play.night.res.button").addEventListener("click", function(e){
	document.getElementById("play.night.res").style.display = "none";
	document.getElementById("play.night").style.display = "none";

	game.calc();
	game.day = null;
	game.isNight = false;
	game.time++;
	main();
});


function createNightRes(){
	const $text = document.getElementById("play.night.res.text");
	removeAll($text);
	if(game.night.kJinro >= 0){
		const $h2 = document.createElement("h2");
		$h2.appendChild(document.createTextNode(game.names[game.night.kJinro]));
		$text.appendChild($h2);
		$text.appendChild(document.createTextNode("の死体が発見されました"));
	}else{
		$text.appendChild(document.createTextNode("犠牲者はいませんでした"));
	}
}


// res

function createRes(){
	const $text = document.getElementById("play.res.text");
	removeAll($text);

	const $h2 = document.createElement("h2");
	if(game.result === Jinro.RESULT_DRAW){
		$h2.appendChild(document.createTextNode("引き分け"));
	}else if(game.result === Jinro.RESULT_MURA){
		$h2.appendChild(document.createTextNode("村人陣営の勝利"));
	}else if(game.result === Jinro.RESULT_JINRO){
		$h2.appendChild(document.createTextNode("人狼陣営の勝利"));
	}
	$text.appendChild($h2);
	$text.appendChild(document.createElement("br"));
	$text.appendChild(document.createElement("br"));

	const $table = document.createElement("table");
	const $tbody = document.createElement("tbody");
	for(let i=0; i<game.n; ++i){
		const $tr = document.createElement("tr");
		addCell($tr, document.createTextNode(game.names[i]));
		addCell($tr, document.createTextNode(Jinro.YAKU_NAMES[game.yakus[i]]));
		$tbody.appendChild($tr);
	}
	$table.appendChild($tbody);
	$text.appendChild($table);
}

