var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var sprites = {
  fluffy: {
    x_offset: -37,
    y_offset: -3,
  },
  fluffy_flipped: {
    x_offset: -37,
    y_offset: -3,
  },
  bait: {
    x_offset: -10,
    y_offset: -22,
  },
  fluffy_bite: {
    x_offset: -39,
    y_offset: -27,
  },
  penguin: {
    x_offset: 0,
    y_offset: 0,
  },
  deck_back: {
    x_offset: -93,
    y_offset: -60,
  },
  deck_front: {
    x_offset: -93,
    y_offset: -60,
  },
  deck_side: {
    x_offset: 0,
    y_offset: 20,
  },
};

for (sprite in sprites) {
  sprites[sprite].img = new Image();
  sprites[sprite].img.src = "res/" + sprite + ".png";
};

var canvasW, canvasH, centre;

canvasW = window.innerWidth;
canvasH = window.innerHeight;
canvas.width = canvasW;
canvas.height = canvasH;
centre = canvasW / 2;
var landBorder = canvasH / 3,
heightMin = landBorder / 3,
deckLoops = Math.ceil(canvasW / sprites["deck_side"].img.width),
water = ctx.createLinearGradient(0, 0, 0, canvasH - landBorder);
water.addColorStop(0, "#B8D9E4");
water.addColorStop(1, "#4A82C8");

function sizeWindow() {
  canvasW = window.innerWidth; // https://stackoverflow.com/a/17507923
  canvasH = window.innerHeight;
  landBorder = canvasH / 3;
  heightMin = landBorder / 3;
  for (entity in Entities) {
    /*let Entity = Entities[entity];
    //Entity.init_y_pos = landBorder + (canvasH - landBorder) / 2;
    let pre_init_y_pos = Entity.init_y_pos;
    let sole_init_y_pos = pre_init_y_pos - landBorder - (Entity.y2 - Entity.y1);
    let new_init_y_pos = sole_init_y_pos / (canvas.height - landBorder - (Entity.y2 - Entity.y1) * 2 - ((canvas.width - Entity.x1) / 8)) * (canvasH - landBorder - (Entity.y2 - Entity.y1) * 2 - ((canvasW - Entity.x1) / 8));
    //return Math.floor((Math.random() * (canvas.height - landBorder - (type.y2 - type.y1) * 2 - ((canvas.width - type.x1) / 8)) + 1) + landBorder + (type.y2 - type.y1) + ((canvas.width - type.x1) / 16));
    Entity.init_y_pos = new_init_y_pos;
    let pre_x_pos = Entity.x_pos;
    let difference = centre - pre_x_pos;
    let new_x_pos = canvasW / 2 - difference;
    Entity.x_pos = new_x_pos;*/
    despawn(Entities[entity]);
  };
  canvas.width = canvasW;
  canvas.height = canvasH;
  centre = canvasW / 2;
  if (typeof Rod !== "undefined") {
    Rod.x_pos = centre;
  };
  deckLoops = Math.ceil(canvasW / sprites["deck_side"].img.width);
  water = ctx.createLinearGradient(0, 0, 0, canvasH - landBorder);
  water.addColorStop(0, "#B8D9E4");
  water.addColorStop(1, "#4A82C8");
};

window.addEventListener("resize", sizeWindow);

var lineThickness = 1,
holeSize = 4;

var coins = 0;
var fish = 0;
var worms = 3;

var Entities = {}, EntityCount = 0;

var Rod = {
  x1: -20,
  y1: -15,
  x2: 15,
  y2: 20,
  x_pos: centre,
  y_pos: heightMin * 2,
  colour: "#FFCACA",
  bitten: false,
  baitless: false,
  default: function () {
    this.bitten = false;
    this.baitless = false;
    this.x1 = -20;
    this.y1 = -15;
    this.x2 = 15;
    this.y2 = 20;
    this.colour = "#FFCACA";
  },
  bite: function (type) {
    switch (type) {
      case "fluffy":
        this.colour = "#FCCB2D";
        this.fish = "fluffy";
        break;
      case "grey":
        this.colour = "#A09BA0";
        this.fish = "grey";
        break;
      case "mullet":
        this.colour = "#D74C42";
        this.fish = "mullet";
        break;
      default:
        this.colour = "#FCCB2D";
    };
    this.bitten = true;
    if (type === "mullet") {
      this.x1 = -100;
      this.y1 = -15;
      this.x2 = 100;
      this.y2 = 405;
    } else {
      this.x1 = -30;
      this.y1 = -15;
      this.x2 = 30;
      this.y2 = 115;
    };
    this.stage = 3;
  },
  fish: undefined,
  reeled: function () {
    fish++;
    this.default(),
    this.fish = undefined;
    this.stage = 0;
  },
  release: function () {
    this.default(),
    this.fish = undefined;
    this.stage = 2;
  },
  zap: function () {
    this.bitten = false;
    this.baitless = true;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.fish = undefined;
    this.stage = 3;
  },
  bait: function () {
    this.baitless = false;
    this.default(),
    this.stage = 2;
  },
  stage: 0,
  hook_x_offset: -30,
  hook_y_offset: -37,
};

function CreateFish() {
  this.direction = genDirect();
  this.direction2 = genDirect();
  this.x1 = -130;
  this.y1 = -30;
  this.x2 = 0;
  this.y2 = 30;
  this.x_pos = (this.direction2 == 1 ? (0 + this.x1) : (canvas.width - this.x1)); // https://stackoverflow.com/a/8611855
  //this.x_pos = canvas.width / 2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  //this.speed = Math.random() * 5;
  this.speed = 5;
  this.colour = "#FCCB2D";
  this.collide = function () {
    if (Rod.bitten) {return}; // Don't catch if the line has a bite
    if (Rod.baitless) {return}; // Don't catch if the line doesn't have bait
    Rod.bite("fluffy");
    despawn(this);
  };
  this.life = 0;
  this.lifespan = canvas.width - this.x1;
  this.name = "fluffy";
};

function CreateGreyFish() {
  this.x1 = -130;
  this.y1 = -30;
  this.x2 = 0;
  this.y2 = 30;
  this.x_pos = 0 - this.x2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 8;
  this.colour = "#A09BA0";
  this.collide = function () {
    if (Rod.bitten) {return}; // Don't catch if the line has a bite
    if (Rod.baitless) {return}; // Don't catch if the line doesn't have bait
    Rod.bite("grey");
    despawn(this);
  };
  this.life = 0;
  this.direction = genDirect();
};

function CreateMullet() {
  this.x1 = -420;
  this.y1 = -100;
  this.x2 = 0;
  this.y2 = 100;
  this.x_pos = 0 - this.x2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 2;
  this.colour = "#D74C41";
  this.collide = function () {
    if (!Rod.bitten) {return}; // Don't catch if the line does not have a bite
    if (Rod.baitless) {return}; // Don't catch if the line doesn't have bait
    if (Rod.fish === "mullet") {return}; // Don't catch if the hook has a mullet
    Rod.bite("mullet");
    despawn(this);
  };
  this.life = 0;
  this.direction = genDirect();
}

function CreateBoot() {
  this.x1 = -45;
  this.y1 = -45;
  this.x2 = 45;
  this.y2 = 45;
  this.x_pos = 0 - this.x2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 6;
  this.colour = "#996502";
  this.collide = function () {
    if (!Rod.bitten && Rod.fish != "mullet") {return}; // Don't collide if the line doesn't have a bite
    Rod.release();
  };
  this.life = 0;
  this.direction = genDirect();
};

function CreateBarrel() {
  this.x1 = -85;
  this.y1 = -105;
  this.x2 = 85;
  this.y2 = 105;
  this.x_pos = 0 - this.x2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 7;
  this.colour = "#D0976A";
  this.collide = function () {
    if (!Rod.bitten) {return}; // Don't collide if the line doesn't have a bite
    Rod.release();
  };
  this.life = 0;
  this.direction = genDirect();
};

function CreateJellyfish() {
  this.x1 = -50;
  this.y1 = -50;
  this.x2 = 50;
  this.y2 = 50;
  this.x_pos = 0 - this.x2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 6;
  this.colour = "#2643AC";
  this.collision_type = "cut";
  this.collide = function () {
    Rod.zap();
  };
  this.life = 0;
  this.direction = genDirect();
};

function CreateCan() {
  this.x1 = -25;
  this.y1 = -25;
  this.x2 = 25;
  this.y2 = 25;
  this.x_pos = 0 - this.x2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 5;
  this.colour = "#CCCBD0";
  this.collide = function () {
    worms++;
    despawn(this);
  };
  this.life = 0;
  this.direction = genDirect();
};

function CreateShark() {
  this.x1 = -200;
  this.y1 = -50;
  this.x2 = 200;
  this.y2 = 50;
  this.x_pos = 0 - this.x2;
  this.y_pos = undefined;
  this.init_y_pos = genYPos(this);
  this.speed = 5;
  this.colour = "#CCCBD0";
  this.collision_type = "cut";
  this.collide = function () {
    Rod.zap();
  };
  this.life = 0;
  this.direction = genDirect();
};

function calcSize(var1, var2) {
  return var2 - var1;
};

function despawn(entity) {
  entity.x_pos = canvas.width * 3;
};

function genYPos(type) {
  return Math.floor((Math.random() * (canvas.height - landBorder - (type.y2 - type.y1) * 2 - ((canvas.width - type.x1) / 8)) + 1) + landBorder + (type.y2 - type.y1) + ((canvas.width - type.x1) / 16));
};

function genDirect() {
  return Math.random() < 0.5 ? -1 : 1; // https://stackoverflow.com/a/8611855
};

canvas.addEventListener("mousemove", function(e) {
  var rect = e.target.getBoundingClientRect(), y = e.clientY - rect.top; // https://stackoverflow.com/a/42111623
  if (y <= heightMin - Rod.hook_y_offset) {return}; // Barrier at the top
  if (!Rod.baitless && !Rod.bitten) {
    if (y <= landBorder) {
      Rod.stage = 0;
    } else if (y < Rod.y_pos) {
      Rod.stage = 1;
      setTimeout(function () {
        if (Rod.y_pos > landBorder) {
          Rod.stage = 2;
        };
      }, 250);
    } else {
      Rod.stage = 2;
    };
  };
  Rod.y_pos = y;
});

canvas.addEventListener("mousedown", function(e) {
  if (Rod.y_pos < landBorder) {
    if (Rod.bitten) {
      switch (Rod.fish) {
        case "fluffy":
          coins += 4;
          break;
        case "grey":
          coins += 8;
          break;
        case "mullet":
          coins += 100;
          break;
        default:
      };
      Rod.reeled();
    };
    if (Rod.baitless && worms > 0) {
      worms--;
      Rod.bait();
      //console.log("Re-baited")
    };
  } else if (Rod.bitten) {
    Rod.release();
  };
});

// Spawn entities
function spawn() {
  //let seed = Math.floor(Math.random() * 10 + 1);
  let seed = 0;
  EntityCount++;
  switch (seed) {
    case 1:
      Entities[EntityCount] = new CreateBoot();
      break;
    case 2:
      Entities[EntityCount] = new CreateBarrel();
      break;
    case 3:
      Entities[EntityCount] = new CreateJellyfish();
      break;
    case 4:
      Entities[EntityCount] = new CreateGreyFish();
      break;
    case 5:
      Entities[EntityCount] = new CreateMullet();
      break;
    case 6:
      Entities[EntityCount] = new CreateCan();
      break;
    case 7:
      Entities[EntityCount] = new CreateShark();
      break;
    default:
      Entities[EntityCount] = new CreateFish();
      break;
  };
  console.log("Entity #" + EntityCount + " spawned.");
}
setInterval(spawn, 3000);

//EntityCount++; Entities[EntityCount] = new CreateFish();

// Update
function update() {
  for (entity in Entities) {
    let Entity = Entities[entity];
    // Move fish
    Entity.x_pos += Entity.speed * Entity.direction2;
    let life = Entity.x_pos / Entity.lifespan;
    Entity.y_pos = (1/(canvas.width - Entity.x1) * Math.pow(Entity.x_pos, 2) - Entity.x_pos) / (4 * Entity.direction) + Entity.init_y_pos;
    // Check collision
    if (Entity.collision_type === "cut") {
      if (checkLine(Entity)) {Entity.collide()};
    } else {
      if (checkCollision(Entity)) {Entity.collide()};
    };
    // Out of bounds
    if (Entity.x_pos + Entity.x1 > canvas.width * 2) {
      delete Entities[entity];
      console.log("Entity #" + entity + " despawned.");
    };
  };
};
setInterval(update, 1000/60);

function checkCollision(Obj) { // https://stackoverflow.com/a/7301852
  let a = {
    x: Rod.x_pos + Rod.x1,
    y: Rod.y_pos + Rod.y1,
    width: calcSize(Rod.x1, Rod.x2),
    height: calcSize(Rod.y1, Rod.y2),
  },
  b = {
    x: Obj.x_pos + Obj.x1,
    y: Obj.y_pos + Obj.y1,
    width: calcSize(Obj.x1, Obj.x2),
    height: calcSize(Obj.y1, Obj.y2),
  };
  return !(
    ((a.y + a.height) < (b.y)) ||
    (a.y > (b.y + b.height)) ||
    ((a.x + a.width) < b.x) ||
    (a.x > (b.x + b.width))
  );
};

function checkLine(Obj) {
  let a = {
    x: Rod.x_pos + lineThickness / -2,
    width: lineThickness,
  },
  b = {
    x: Obj.x_pos + Obj.x1,
    width: calcSize(Obj.x1, Obj.x2),
  };
  if (Rod.y_pos >= Obj.y_pos + Obj.y1 && !Boolean(((a.x + a.width) < b.x) || (a.x > (b.x + b.width)))) {
    return true;
  };
};

/*function addKeyframe() {
  for (entity in Entities) {
    let Entity = Entities[entity];
    Entity.
  };
};*/

function render() {
  // Backdrop
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasW, landBorder);
  ctx.fillStyle = water;
  ctx.fillRect(0, landBorder, canvasW, canvasH - landBorder);

  // Deck
  let DeckSprites = {
    back: sprites["deck_back"],
    front: sprites["deck_front"],
    side: sprites["deck_side"],
  };

  // Deck Back
  ctx.drawImage(DeckSprites.back.img, 0, 0, DeckSprites.back.img.width, DeckSprites.back.img.height, centre - ((landBorder / holeSize) * (DeckSprites.front.img.width / DeckSprites.front.img.height)) / 2, landBorder - landBorder / holeSize, (landBorder / holeSize) * (DeckSprites.front.img.width / DeckSprites.front.img.height), landBorder / holeSize);

  // Penguin
  let PenguinSprite = sprites["penguin"];
  ctx.drawImage(PenguinSprite.img, 0, 0, PenguinSprite.img.width, PenguinSprite.img.height, centre + PenguinSprite.x_offset, heightMin + PenguinSprite.y_offset, landBorder * 1.48 / 2, landBorder / 2);

  // Line
  ctx.fillStyle = "#000000";
  ctx.fillRect(Rod.x_pos - lineThickness / 2, heightMin, lineThickness, Rod.y_pos - heightMin - 30);

  // Hook/Bait
  //ctx.fillStyle = Rod.colour;
  let HookSprite = sprites["bait"];
  if (Rod.bitten) {
    ctx.drawImage(HookSprite.img, 3 * 60, 0, 60, 60, Rod.x_pos + Rod.hook_x_offset, Rod.y_pos + Rod.hook_y_offset, 60, 60);
    //ctx.fillRect(Rod.x_pos + Rod.x1, Rod.y_pos + Rod.y1, calcSize(Rod.x1, Rod.x2), calcSize(Rod.y1, Rod.y2));
    let BaitSprite = sprites[Rod.fish + "_bite"];
    ctx.drawImage(BaitSprite.img, Rod.x_pos + BaitSprite.x_offset, Rod.y_pos + BaitSprite.y_offset);
  } else {
    ctx.drawImage(HookSprite.img, Rod.stage * 60, 0, 60, 60, Rod.x_pos + Rod.x1 + HookSprite.x_offset, Rod.y_pos + Rod.y1 + HookSprite.y_offset, 60, 60);
  };
  /* else {}
  {
    ctx.fillRect(Rod.x_pos + Rod.x1, Rod.y_pos + Rod.y1, calcSize(Rod.x1, Rod.x2), calcSize(Rod.y1, Rod.y2));

    ctx.drawImage(Sprite.img, Rod.stage * 60, 0, 60, 60, Rod.x_pos + Rod.x1 + Sprite.x_offset, Rod.y_pos + Rod.y1 + Sprite.y_offset, 60, 60);
  }*/

  // Deck Front
  ctx.drawImage(DeckSprites.front.img, 0, 0, DeckSprites.front.img.width, DeckSprites.front.img.height, centre - ((landBorder / holeSize) * (DeckSprites.front.img.width / DeckSprites.front.img.height)) / 2, landBorder - landBorder / holeSize, (landBorder / holeSize) * (DeckSprites.front.img.width / DeckSprites.front.img.height), landBorder / holeSize);

  // Entities
  for (entity in Entities) {
    let Entity = Entities[entity];
    //ctx.fillStyle = Entity.colour;
    //ctx.fillRect(Entity.x_pos + Entity.x1, Entity.y_pos + Entity.y1, calcSize(Entity.x1, Entity.x2), calcSize(Entity.y1, Entity.y2));
    let Sprite = Entity.direction2 == 1 ? sprites[Entity.name] : sprites[Entity.name + "_flipped"];
    /*if (Entity.direction2 != 1) {
      ctx.scale(-1, 1);
    };*/
    ctx.drawImage(Sprite.img, Entity.x_pos + Entity.x1 + Sprite.x_offset, Entity.y_pos + Entity.y1 + Sprite.y_offset)
    /*if (Entity.direction2 != 1) {
      ctx.scale(-1, 1);
    };*/
  };

  // Deck Side
  for (var i = 0; i < deckLoops; i++) {
    ctx.drawImage(DeckSprites.side.img, 0, 0, DeckSprites.side.img.width, DeckSprites.side.img.height, i * DeckSprites.side.img.width, landBorder - DeckSprites.side.img.height + DeckSprites.side.y_offset, DeckSprites.side.img.width, DeckSprites.side.img.height);
  };

  // Print stats
  ctx.font = "30px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("Fish: " + fish + " | Worms: " + worms + " | Coins: " + coins, 20, 40);
};

setInterval(render, 1000/60);
