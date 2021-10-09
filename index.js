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

function addCell($row, $node){
	const $cell = document.createElement("td");
	$cell.appendChild($node);
	$row.appendChild($cell);
}


/* play */

const STORAGE_PLAY_KEY = "jinro.play.#";

const $play_tbody = document.getElementById("index.play.tbody");

function play_remove(id){
	if(window.confirm("削除します")){
		window.localStorage.removeItem(STORAGE_PLAY_KEY + id);
		main();
	}
}

function play_add(id){
	const $row = document.createElement("tr");

	const date = new Date(id);

	const $a = document.createElement("a");
	$a.setAttribute("href", "./play#" + id);
	$a.appendChild(document.createTextNode(date.toLocaleString("ja-JP")));
	addCell($row, $a);

	const $button = document.createElement("button");
	$button.appendChild(document.createTextNode("削除"));
	$button.addEventListener("click", e => { play_remove(id); });
	addCell($row, $button);

	$play_tbody.appendChild($row);
}

function main(){
	$play_tbody.innerHTML = "";
	for(let i=0; i<window.localStorage.length; ++i){
		const key = window.localStorage.key(i);
		if(key.startsWith(STORAGE_PLAY_KEY)){
			const idstr = key.substring(STORAGE_PLAY_KEY.length);
			const id = parseInt(idstr, 10);
			play_add(id);
		}
	}
}

window.addEventListener("pageshow", main);
