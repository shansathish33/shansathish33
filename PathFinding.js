/* 
 * PathFinding JavaScript path finding library
 * 
*/

/* 
var start = {x: 1, y: 1};
var end = {x: 1, y: 1};
var finder = null;
var path = null;
var blocks = [1, 3];

function init(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	canvas.style = 'margin: 0; padding: 0; top: 0; left: 0;';
	canvas.width = map[0].length * size;
	canvas.height = map.length * size;
	
	createMap();
	finder = new PathFinder({map: map, start: start, end: end, blocks: blocks});
	path = finder.getPath();
	mover = new Mover(path, start, 0.1);
	
	canvas.addEventListener('click', function(event){
		let x = Math.floor(event.x / size);
		let y = Math.floor(event.y / size);
		
		let _start = {x: mover.px, y: mover.py};
		let _end = {x: x, y: y};
		
		finder = new PathFinder({map: map, start: _start, end: _end, blocks: blocks});
		path = finder.getPath();
		
		mover.reset(path);
	});
}

function draw(){
	mover.update();
	ctx.fillStyle = '#f0f';
	ctx.fillRect(mover.x * size + 2, mover.y * size + 2, size - 4, size - 4);
	ctx.fillStyle = '#fff';
	
	if (mover.direction == 'left'){
		ctx.fillRect(mover.x * size + 2, mover.y * size + 2, size / 2 - 4, size - 4);
	} else if (mover.direction == 'right'){
		ctx.fillRect(mover.x * size + size / 2 + 2, mover.y * size + 2, size / 2 - 4, size - 4);
	} else if (mover.direction == 'up'){
		ctx.fillRect(mover.x * size + 2, mover.y * size + 2, size - 4, size / 2 - 4);
	} else if (mover.direction == 'down'){
		ctx.fillRect(mover.x * size + 2, mover.y * size + size / 2 + 2, size - 4, size / 2 - 4);
	}
}
*/

/* parameters :-
map: [[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1]],
start: {x: 0, y: 0},
end: {x: 6, y: 6},
blocks: [1],
diagonal: false
*/


function heuristic(a, b){
	let dx = a.x - b.x;
	let dy = a.y - b.y;
	
	return Math.abs(dx) + Math.abs(dy);
}

class Mover{
	constructor(path, start = {x: 0, y: 0}, speed = 0.1){
		this.path = null;
		this.px = start.x;
		this.py = start.y;
		this.updatable = true;
		this.reset(path);
		this.x = this.px;
		this.y = this.py;
		this.vx = speed;
		this.vy = speed;
		this.direction = 'stop';
		this.stopCounter = 0;
	}
	
	reset(path){
		if (path.length != 0){
			this.path = path;
			this.updatable = true;
			this.px = this.path[0].x;
			this.py = this.path[0].y;
		} else{
			this.updatable = false;
		}
	}
	
	update(){
		if (!this.updatable){
			return;
		}
		
		this.x = Math.round(this.x * 100) / 100;
		this.y = Math.round(this.y * 100) / 100;
		
		if (this.x < this.px){
			this.x += this.vx;
		}
		
		if (this.x > this.px){
			this.x -= this.vx;
		}
		
		if (this.y < this.py){
			this.y += this.vy;
		}
		
		if (this.y > this.py){
			this.y -= this.vy;
		}
		
		if (this.x < this.px){
			this.direction = 'right';
		}
		
		if (this.x > this.px){
			this.direction = 'left';
		}
		
		if (this.y < this.py){
			this.direction = 'down';
		}
		
		if (this.y > this.py){
			this.direction = 'up';
		}
		
		if (this.x == this.px && this.y == this.py){
			if (this.stopCounter < 10){
				this.stopCounter++;
			} else{
				this.stopCounter = 0;
				this.direction = 'stop';
			}
		} else{
			this.stopCounter = 0;
		}
		
		if (0 > this.path.length - 2){
			return;
		}
		
		if (this.x == this.path[0].x && this.y == this.path[0].y){
			this.path.splice(0, 1);
			this.px = this.path[0].x;
			this.py = this.path[0].y;
		}
	}
}

class Tile{
	constructor(x, y, value, blocks, diagonal){
		this.x = x;
		this.y = y;
		this.nearTiles = [];
		this.value = value;
		this.block = false;
		this.f = 0;
		this.g = 0;
		this.h = 0;
		this.previousTile = undefined;
		this.diagonal = diagonal;
		
		for (let i = 0; i < blocks.length; i++){
			if (this.value == blocks[i]){
				this.block = true;
				break;
			}
		}
	}
	
	findNearTiles(grid){
		if (this.x < grid[0].length - 1){
			this.nearTiles.push(grid[this.y][this.x + 1]);
		}
		
		if (this.x > 0){
			this.nearTiles.push(grid[this.y][this.x - 1]);
		}
		
		if (this.y < grid.length - 1){
			this.nearTiles.push(grid[this.y + 1][this.x]);
		}
		
		if (this.y > 0){
			this.nearTiles.push(grid[this.y - 1][this.x]);
		}
		
		if (this.diagonal){
			if (this.x < grid[0].length - 1 && this.y < grid.length - 1){
				this.nearTiles.push(grid[this.y + 1][this.x + 1]);
			}
			
			if (this.x < grid[0].length - 1 && this.y > 0){
				this.nearTiles.push(grid[this.y - 1][this.x + 1]);
			}
			
			if (this.x > 0 && this.y < grid.length - 1){
				this.nearTiles.push(grid[this.y + 1][this.x - 1]);
			}
			
			if (this.x > 0 && this.y > 0){
				this.nearTiles.push(grid[this.y - 1][this.x - 1]);
			}
		}
	}
}

class PathFinder{
	constructor(userSettings = {}){
		let defaultSettings = {
			map: [[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1]],
			start: {x: 0, y: 0},
			end: {x: 6, y: 6},
			blocks: [1],
			diagonal: false
		};
		let settings = {};
		
		for (let i in defaultSettings){
			if (i in userSettings){
				settings[i] = userSettings[i];
			} else{
				settings[i] = defaultSettings[i];
			}
		}
		
		this.diagonal = settings.diagonal;
		this.blocks = settings.blocks;
		let start = settings.start;
		let end = settings.end;
		let map = settings.map;
		this.map = new Array(map.length);
		
		for (let i = 0; i < map.length; i++){
			this.map[i] = new Array(map[0].length);
		}
		
		for (let j = 0; j < map.length; j++){
			for (let i = 0; i < map[0].length; i++){
				this.map[j][i] = new Tile(i, j, map[j][i], this.blocks, this.diagonal);
			}
		}
		
		for (let j = 0; j < map.length; j++){
			for (let i = 0; i < map[0].length; i++){
				this.map[j][i].findNearTiles(this.map);
			}
		}
		
		this.path = [];
		this.openedSet = [];
		this.closedSet = [];
		this.start = this.map[start.y][start.x];
		this.end = this.map[end.y][end.x];
		this.openedSet.push(this.start);
		this.founded = false;
		this.maximamCallStuck = 0;
		
		while(!this.founded){
			if (this.openedSet.length > 0){
				let bestTile = 0;
				
				for (let i = 0; i < this.openedSet.length; i++){
					if (this.openedSet[i].f < this.openedSet[bestTile].f){
						bestTile = i;
					}
				}
				
				let currentTile = this.openedSet[bestTile];
				
				if (currentTile == this.end){
					this.path = [];
					let tempTile = currentTile;
					
					while (tempTile.previousTile != undefined){
						this.path.unshift(tempTile.previousTile);
						tempTile = tempTile.previousTile;
					}
					
					this.founded = true;
				}
				
				for (let i = this.openedSet.length - 1; i >= 0; i--){
					if (this.openedSet[i] == currentTile){
						this.openedSet.splice(i, 1);
						break;
					}
				}
				
				this.closedSet.push(currentTile);
				let nearTiles = currentTile.nearTiles;
				
				if (nearTiles.length != 0){
					for (let i = 0; i < nearTiles.length; i++){
						let nearTile = nearTiles[i];
						
						if (!this.closedSet.includes(nearTile) && !nearTile.block){
							let tempG = currentTile.g + 1;
							let newPath = false;
							
							if (this.openedSet.includes(nearTile)){
								if (tempG < nearTile.g){
									nearTile.g = tempG;
									newPath = true;
								}
							} else{
								nearTile.g = tempG;
								this.openedSet.push(nearTile);
								newPath = true;
							}
							
							if (newPath){
								nearTile.h = heuristic(nearTile, this.end);
								nearTile.f = nearTile.g + nearTile.h;
								nearTile.previousTile = currentTile;
							}
						}
					}
				}
			} else{
				this.founded = true;
				this.path = [];
				console.warn('there is no path');
			}
			
			this.maximamCallStuck++;
			
			if (this.maximamCallStuck > map.length * map[0].length * 100){
				this.founded = true;
				this.path = [];
				console.warn('the path is too long');
			}
		}
	}
	
	getPath(){
		let _path = [];
		
		for (let i = 0; i < this.path.length; i++){
			_path.push({x: this.path[i].x, y: this.path[i].y});
		}
		
		if (_path.length != 0){
			_path.push(this.end);
		}
		
		return _path;
	}
}
