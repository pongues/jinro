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

const n = 5;
const game = new Jinro.Game(n);
game.yaku[0] = 0;
game.yaku[1] = 0;
game.yaku[2] = 0;
game.yaku[3] = 1;
game.yaku[4] = 0;

const day = new Jinro.Day(n);

day.aVote[0] = 2;
day.aVote[1] = 1;
day.aVote[2] = 3;
day.aVote[3] = 4;
day.aVote[4] = 4;

day.calc(game, true);

console.log("day", day);


const night = new Jinro.Night(n);

night.aJinro[0] = 2;
night.aJinro[1] = 3;
night.aKari[0] = 2;

night.calc(game);

console.log(night);


const json = JSON.stringify(game, Jinro.replacer);
console.log("json", json);
const tmp = JSON.parse(json, Jinro.reviver);
console.log("tmp", tmp);
