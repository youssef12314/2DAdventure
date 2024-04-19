"use strict";


window.addEventListener("load", start);

function start() {
  console.log("JavaScript kører...");
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);
  createTiles(); 
  displayTiles();
  requestAnimationFrame(tick);
  createItems();
  createEnemies();
}

let lastTimestamp = 0;

function tick(timestamp) {
  requestAnimationFrame(tick);

  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  movePlayer(deltaTime);

  displayPlayerAtPosition();
  displayPlayerAnimation();

  showDebugging();
  checkForItems();
}

// *******************Model**********************

//shooting mechaninc
const projectiles = []
const projectileSpeed = 200;

const player = {
  x: 100,
  y: 100,
  regX: 8,
  regY: 12,
  speed: 120,
  moving: false,
  direction: undefined,
};


const itemsGrid = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

const visualItemsGrid = [];

const tiles = [
    [0,10,0,0,4,5,5,5,5,5,4,0,3,0,0,0],
    [0,0,10,0,4,5,5,5,5,5,4,0,7,0,0,0],
    [0,0,0,0,4,4,4,6,4,4,4,0,3,0,0,0],
    [0,1,0,0,0,0,0,1,9,0,0,9,3,0,0,0],
    [0,1,0,10,0,0,10,1,8,8,8,8,3,0,0,0],
    [0,1,1,1,1,1,1,1,0,0,0,0,11,11,0,0],
    [0,13,6,13,13,13,0,1,10,0,10,10,10,0,0,0],
    [0,13,14,14,14,13,0,1,1,1,1,1,1,1,1,1],
    [0,13,12,12,12,13,0,1,0,0,0,0,0,0,0,0],
    [0,13,13,13,13,13,0,1,0,0,0,0,0,0,0,0]
]

const enemiesGrid = [
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,0,2,0,2,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

const visualEnemiesGrid = [];



const GRID_HEIGHT = tiles.length; // row
const GRID_WIDTH = tiles[0].length; // col
const TILE_SIZE = 32;

//*********************View***************** */

function getTileAtCoordinate({ row, col }) {
  return tiles[row][col];
}

function CoordinateFromPosition({ x, y }) {
  const row = Math.round(y / TILE_SIZE);
  const col = Math.round(x / TILE_SIZE);
  const coordinate = { row, col };
  return coordinate;
}

function positionFromCoordinate() {}

function displayPlayerAnimation() {
  const visualPlayer = document.querySelector("#player");

  if (player.moving) {
    visualPlayer.classList.add("animate");

    // Determine animation direction based on the player's movement direction
    if (controls.right) {
      visualPlayer.classList.remove("up", "down", "left");
      visualPlayer.classList.add("right");
    } else if (controls.left) {
      visualPlayer.classList.remove("up", "down", "right");
      visualPlayer.classList.add("left");
    } else if (controls.up) {
      visualPlayer.classList.remove("down", "left", "right");
      visualPlayer.classList.add("up");
    } else if (controls.down) {
      visualPlayer.classList.remove("up", "left", "right");
      visualPlayer.classList.add("down");
    }
  } else {
    visualPlayer.classList.remove("animate");
  }
}

function displayPlayerAtPosition() {
  const visualPlayer = document.querySelector("#player");
  visualPlayer.style.translate = `${player.x - player.regX}px ${
    player.y - player.regY
  }px`;
}

function createTiles() {

  const gamefield = document.querySelector("#gamefield")

  const background = document.querySelector("#background");
  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      background.append(tile);
    }
  }
  gamefield.style.setProperty("--GRID_WIDTH", GRID_WIDTH);
  gamefield.style.setProperty("--GRID_HEIGHT", GRID_HEIGHT);
  gamefield.style.setProperty("--TILE_SIZE", TILE_SIZE + "px");
}


function createItems() {
  const visualItemsContainer = document.querySelector("#items");

  for (let row = 0; row < GRID_HEIGHT; row++) {
    visualItemsGrid[row] = [];
    for (let col = 0; col < GRID_WIDTH; col++) {
      if (itemsGrid[row] && itemsGrid[row][col] !== 0) {
        const visualItems = document.createElement("div");
        visualItems.classList.add("item");
        visualItems.classList.add("chest");
        visualItems.style.setProperty("--row", row);
        visualItems.style.setProperty("--col", col);
        visualItemsContainer.append(visualItems);

        visualItemsGrid[row][col] = visualItems;
      }
    }
  }
}

function createEnemies() {
  const visualEnemiesContainer = document.querySelector("#enemies");

  for (let row = 0; row < GRID_HEIGHT; row++) {
    visualEnemiesGrid[row] = [];
    for (let col = 0; col < GRID_WIDTH; col++) {
      if (enemiesGrid[row] && enemiesGrid[row][col] !== 0) {
        const enemyType = enemiesGrid[row][col]; 
        let enemyClass = ""; 
        switch (enemyType) {
          case 1:
            enemyClass = "slime";
            break;
          case 2:
            enemyClass = "ghost";
            break;
          default:
            enemyClass = "slime"; 
        }

        const visualEnemies = document.createElement("div");
        visualEnemies.classList.add("enemy");
        visualEnemies.classList.add(enemyClass);
        visualEnemies.style.setProperty("--row", row);
        visualEnemies.style.setProperty("--col", col);
        visualEnemiesContainer.append(visualEnemies);

        visualEnemiesGrid[row][col] = visualEnemies;
      }
    }
  }
}
function checkForItems() {
  const items = getItemsUnderPlayer();
  if(items.length > 0) {
    items.forEach(coords => takeItem(coords));
  }
}
function getItemsUnderPlayer() {
  const items = [];
  const coord = CoordinateFromPosition(player);
  const item = itemsGrid[coord.row][coord.col];
  if (item !== 0) {
    items.push(coord);
  }

  return items;
}

function takeItem(coords){
  const itemValue = itemsGrid[coords.row][coords.col];
  if(itemValue !==0){
    itemsGrid[coords.row][coords.col] = 0;

    const visualItem = visualItemsGrid[coords.row][coords.col];
    visualItem.classList.add("take");
  }
}



function displayTiles() {
  const visualTiles = document.querySelectorAll("#background .tile");

  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      const tileType = getTileAtCoordinate({ row, col });
      const visualTile = visualTiles[row * GRID_WIDTH + col];

      visualTile.classList.add(getClassForTileType(tileType));
    }
  }
}



function getClassForTileType(tileType) {
    switch (tileType) {
      case 0:
        return "grass";
      case 1:
        return "path";
      case 2:
        return "flowers";
      case 3:
        return "water";
        case 4:
        return "wall";
        case 5:
        return "floorstone";
        case 6:
        return "door";
        case 7:
        return "floorplanks";
        case 8:
        return "fencehori";
        case 9:
        return "fencevert";
        case 10:
        return "tree";
        case 11:
        return "flowers";
        case 12:
        return "lava";
        case 13:
        return "redwall";
        case 14:
        return "floorwood";
        
      default:
        return "";
    }
  }

  function showDebugging() {
    showDebugTileUnderPlayer();
    showDebugPlayerRect();
    showDebugPlayerRegistrationPoint();
  }

let lastPlayerCoordinate = { row: 0, col: 0 };

function showDebugTileUnderPlayer() {
  const coordinate = CoordinateFromPosition(player);

  if (
    coordinate.row != lastPlayerCoordinate.row ||
    coordinate.col != lastPlayerCoordinate.col
  ) {
    unHighlightTile(lastPlayerCoordinate);
    highlightTile(coordinate);
  }
  lastPlayerCoordinate = coordinate;
}

function highlightTile({ row, col }) {
  const visualTiles = document.querySelectorAll("#background .tile");
  const visualTile = visualTiles[row * GRID_WIDTH + col];
  visualTile.classList.add("highlight");
}

function unHighlightTile({ row, col }) {
  const visualTiles = document.querySelectorAll("#background .tile");
  const visualTile = visualTiles[row * GRID_WIDTH + col];
  visualTile.classList.remove("highlight");
}

function showDebugPlayerRect() {
  const visualPlayer = document.querySelector("#player");
  if (!visualPlayer.classList.contains("show-rect")) {
    visualPlayer.classList.add("show-rect");
  }
}

function showDebugPlayerRegistrationPoint() {
  const visualPlayer = document.querySelector("#player");
  if (!visualPlayer.classList.contains("show-reg-point")) {
    visualPlayer.classList.add("show-reg-point");
  }

  visualPlayer.style.setProperty("--regX", player.regX + "px");
  visualPlayer.style.setProperty("--regY", player.regY + "px");
}

//****************Controller************** */

function keyDown(event) {
  switch (event.key) {
    case "d":
    case "ArrowRight":
      controls.right = true;
      break;
    case "a":
    case "ArrowLeft":
      controls.left = true;
      break;
    case "w":
    case "ArrowUp":
      controls.up = true;
      break;
    case "s":
    case "ArrowDown":
      controls.down = true;
      break;
  }
}

function keyUp(event) {
  switch (event.key) {
    case "d":
    case "ArrowRight":
      controls.right = false;
      break;
    case "a":
    case "ArrowLeft":
      controls.left = false;
      break;
    case "w":
    case "ArrowUp":
      controls.up = false;
      break;
    case "s":
    case "ArrowDown":
      controls.down = false;
      break;
  }
}

const controls = {
  right: false,
  left: false,
  up: false,
  down: false,
};

function movePlayer(deltaTime) {
    const speed = player.speed * deltaTime; 
  
    const newPos = {
      x: player.x,
      y: player.y,
    };
  
    player.moving = false;
  
    let deltaX = 0;
    let deltaY = 0;
  
    if (controls.right) {
      deltaX += speed;
    }
    if (controls.left) {
      deltaX -= speed;
    }
    if (controls.up) {
      deltaY -= speed;
    }
    if (controls.down) {
      deltaY += speed;
    }
  
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (length !== 0) {
      deltaX /= length;
      deltaY /= length;
    }
    newPos.x += deltaX * speed;
    newPos.y += deltaY * speed;
  
    player.moving = length !== 0;
  
    if (canMoveTo(newPos)) {
      player.x = newPos.x;
      player.y = newPos.y;
    }
  }
function canMoveTo(pos) {
  const { row, col } = CoordinateFromPosition(pos);

  if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) {
    return false;
  }

  const tileType = getTileAtCoordinate({ row, col });
  switch (tileType) {
    case 0:
    case 1:
    case 2:
      return true;
    case 3:
      return false;
  }
}