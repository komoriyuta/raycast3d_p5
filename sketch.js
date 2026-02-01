// =========================================================
// レイキャスト3D - 中学生向け教育用ゲーム
// =========================================================
// 「レイキャスト」とは、目から光線（レイ）を飛ばして
// 壁までの距離を測り、3Dっぽく見せる技術です。
// 1990年代のゲーム「Wolfenstein 3D」などで使われました。
// =========================================================

// --- マップデータ ---
// 1 = 壁（通れない）、0 = 通路（通れる）
// 上から見た迷路の地図です
const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// --- 定数（変わらない値）---
const TILE = 64; // 1マスの大きさ（ピクセル）
const ROWS = MAP.length; // マップの縦マス数
const COLS = MAP[0].length; // マップの横マス数
const FOV = Math.PI / 3; // 視野角（60度 = π/3ラジアン）
const SPEED = 160; // 移動の速さ
const ROT_SPEED = Math.PI; // 回転の速さ（180度/秒）
const RAY_STEP = 4; // レイを何ピクセルおきに飛ばすか

// --- プレイヤーの状態（変わる値）---
let px = TILE * 1.5; // x座標（1.5マス目 = マス1の中央）
let py = TILE * 1.5; // y座標
let angle = 0; // 向いている方向（0 = 右向き）
let keys = {}; // 押されているキーを記録

// --- 計算用の変数 ---
let numRays, screenDist;

// =========================================================
// setup(): 最初に1回だけ実行される
// =========================================================
function setup() {
  createCanvas(900, 500);
  numRays = floor(width / RAY_STEP);
  // スクリーン距離 = 画面幅の半分 ÷ tan(視野角の半分)
  // これで遠近感が自然になる
  screenDist = width / 2 / tan(FOV / 2);
}

// =========================================================
// draw(): 毎秒約60回、繰り返し実行される
// =========================================================
function draw() {
  const dt = deltaTime / 1000; // 前フレームからの経過秒数

  // --- プレイヤーを動かす ---
  movePlayer(dt);

  // --- 画面を描く ---
  drawSkyAndFloor();
  drawWalls();
  drawMiniMap();
}

// =========================================================
// プレイヤーの移動と回転
// =========================================================
function movePlayer(dt) {
  // 回転（←→キー）
  if (keys.ArrowLeft) angle -= ROT_SPEED * dt;
  if (keys.ArrowRight) angle += ROT_SPEED * dt;

  // 移動量を計算
  let dx = 0,
    dy = 0;
  const step = SPEED * dt;

  // 前後移動（W/Sキー）
  // cos(angle) = 進む方向のx成分、sin(angle) = y成分
  if (keys.KeyW) {
    dx += cos(angle) * step;
    dy += sin(angle) * step;
  }
  if (keys.KeyS) {
    dx -= cos(angle) * step;
    dy -= sin(angle) * step;
  }

  // 横移動（A/Dキー）
  // 横方向 = 前方向を90度回転させた方向
  if (keys.KeyA) {
    dx -= sin(angle) * step;
    dy += cos(angle) * step;
  }
  if (keys.KeyD) {
    dx += sin(angle) * step;
    dy -= cos(angle) * step;
  }

  // 壁に当たらなければ移動（XとYを別々にチェック→壁に沿って滑れる）
  if (!isWall(px + dx, py)) px += dx;
  if (!isWall(px, py + dy)) py += dy;
}

// =========================================================
// 壁かどうかを判定する
// =========================================================
function isWall(x, y) {
  const mx = floor(x / TILE);
  const my = floor(y / TILE);
  // マップ外は壁として扱う
  if (mx < 0 || mx >= COLS || my < 0 || my >= ROWS) return true;
  return MAP[my][mx] === 1;
}

// =========================================================
// 天井と床を描く
// =========================================================
function drawSkyAndFloor() {
  noStroke();
  fill(200, 220, 255); // 天井：薄い青
  rect(0, 0, width, height / 2);
  fill(160, 160, 160); // 床：グレー
  rect(0, height / 2, width, height / 2);
}

// =========================================================
// 壁を描く（レイキャストのメイン部分）
// =========================================================
function drawWalls() {
  for (let i = 0; i < numRays; i++) {
    // このレイの角度を計算（視野の左端から右端まで均等に）
    const rayAngle = angle - FOV / 2 + (i / numRays) * FOV;

    // レイを飛ばして壁を探す
    const hit = castRay(rayAngle);

    // フィッシュアイ補正：斜めのレイは距離が長くなるので補正
    const corrected = hit.dist * cos(rayAngle - angle);

    // 壁の高さを計算（近いほど高く見える）
    const wallHeight = (TILE / corrected) * screenDist;
    const wallTop = height / 2 - wallHeight / 2;

    // 色を決める（縦壁と横壁で色を変えて立体感を出す）
    fill(hit.vertical ? [150, 170, 190] : [190, 210, 230]);
    noStroke();
    rect(i * RAY_STEP, wallTop, RAY_STEP, wallHeight);
  }
}

// =========================================================
// レイキャスト：指定した角度にレイを飛ばし、壁との距離を返す
// =========================================================
function castRay(rayAngle) {
  const sinA = sin(rayAngle);
  const cosA = cos(rayAngle);
  const tanA = sinA / (cosA || 0.0001); // 0で割るのを防ぐ

  // レイが進む方向
  const down = sinA > 0;
  const right = cosA > 0;

  // --- 水平線（横のグリッド線）との交点を探す ---
  let hDist = Infinity;
  let hy = floor(py / TILE) * TILE + (down ? TILE : 0);
  let hx = px + (hy - py) / tanA;
  const hStepY = down ? TILE : -TILE;
  const hStepX = hStepY / tanA;

  for (let i = 0; i < 20; i++) {
    if (isWall(hx, hy + (down ? 0 : -1))) {
      hDist = dist(px, py, hx, hy);
      break;
    }
    hx += hStepX;
    hy += hStepY;
  }

  // --- 垂直線（縦のグリッド線）との交点を探す ---
  let vDist = Infinity;
  let vx = floor(px / TILE) * TILE + (right ? TILE : 0);
  let vy = py + (vx - px) * tanA;
  const vStepX = right ? TILE : -TILE;
  const vStepY = vStepX * tanA;

  for (let i = 0; i < 20; i++) {
    if (isWall(vx + (right ? 0 : -1), vy)) {
      vDist = dist(px, py, vx, vy);
      break;
    }
    vx += vStepX;
    vy += vStepY;
  }

  // 近い方を返す
  return vDist < hDist
    ? { dist: vDist, vertical: true }
    : { dist: hDist, vertical: false };
}

// =========================================================
// ミニマップを左上に描く
// =========================================================
function drawMiniMap() {
  push();
  translate(10, 10);
  scale(0.15);

  // マップを描く
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      fill(MAP[y][x] ? 60 : 230);
      noStroke();
      rect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  // プレイヤーを描く
  fill(255, 80, 80);
  circle(px, py, 16);
  stroke(255, 80, 80);
  strokeWeight(3);
  line(px, py, px + cos(angle) * 40, py + sin(angle) * 40);

  pop();
}

// =========================================================
// キーボード入力
// =========================================================
function keyPressed() {
  const k = getKeyName();
  if (k) keys[k] = true;
}

function keyReleased() {
  const k = getKeyName();
  if (k) keys[k] = false;
}

function getKeyName() {
  if (keyCode >= 65 && keyCode <= 90)
    return "Key" + String.fromCharCode(keyCode);
  if (keyCode === LEFT_ARROW) return "ArrowLeft";
  if (keyCode === RIGHT_ARROW) return "ArrowRight";
  return null;
}
