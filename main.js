// =========================================================
// main.js - ゲームの「頭脳」部分
// =========================================================
//
// このファイルでは、ゲームの裏側で動く計算をしています。
//
// 【このファイルでやっていること】
// 1. マップ（迷路）のデータを持っている
// 2. プレイヤーの位置や向きを管理している
// 3. キーボード入力を受け取っている
// 4. 「レイキャスト」という方法で壁を見つけている
//
// =========================================================

// =====================
// 🗺️ マップの設定
// =====================

// 1マスの大きさ（ピクセル単位）
// 例えば64なら、1マス = 64ピクセル四方
const TILE_SIZE = 64;

// マップのデータ
// 1 = 壁（通れない）
// 0 = 通路（通れる）
//
// 上から見た迷路の地図だと思ってください！
// 外周は全部壁で囲まれています
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

// マップの大きさを計算
// MAP_ROWS = 縦に何マスあるか
// MAP_COLS = 横に何マスあるか
const MAP_ROWS = MAP.length;
const MAP_COLS = MAP[0].length;

// =====================
// 🧍 プレイヤーの設定
// =====================

// プレイヤーの情報をまとめたもの
const player = {
  // 現在地（ピクセル単位）
  // 1.5 * TILE_SIZE = 1マス目の真ん中からスタート
  x: 1.5 * TILE_SIZE,
  y: 1.5 * TILE_SIZE,

  // 向いている方向（ラジアンという角度の単位）
  // 0 = 右向き、増えると時計回りに回転
  angle: 0,

  // 視野角（どれくらい広く見えるか）
  // Math.PI / 3 = 60度（人間の視野に近い）
  fov: Math.PI / 3,

  // 移動の速さ（1秒間に何ピクセル動くか）
  moveSpeed: 160,

  // 回転の速さ（1秒間に何ラジアン回るか）
  // Math.PI = 180度
  rotSpeed: Math.PI,
};

// =====================
// ⌨️ キー入力の管理
// =====================

// どのキーが押されているかを記録する
// true = 押されている、false = 押されていない
const keys = {
  w: false, // 前に進む
  s: false, // 後ろに下がる
  a: false, // 左に横移動
  d: false, // 右に横移動
  left: false, // 左を向く
  right: false, // 右を向く
};

// キーが押されたり離されたりしたときに呼ばれる関数
function setKeyState(code, isDown) {
  if (code === "KeyW") keys.w = isDown;
  if (code === "KeyS") keys.s = isDown;
  if (code === "KeyA") keys.a = isDown;
  if (code === "KeyD") keys.d = isDown;
  if (code === "ArrowLeft") keys.left = isDown;
  if (code === "ArrowRight") keys.right = isDown;
}

// =====================
// 🔧 便利な関数たち
// =====================

// 角度を 0〜2π の範囲に収める
// （ぐるぐる回っても角度が無限に大きくならないように）
function normalizeAngle(angle) {
  const twoPi = Math.PI * 2; // 360度
  angle = angle % twoPi;
  if (angle < 0) angle += twoPi;
  return angle;
}

// 2点間の距離を計算する（三平方の定理！）
function distanceBetween(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// その場所が壁かどうかを調べる
function isWallAt(x, y) {
  // マップの外は壁として扱う（はみ出し防止）
  if (x < 0 || y < 0) return true;

  // ピクセル座標 → マス目の番号に変換
  const mapX = Math.floor(x / TILE_SIZE);
  const mapY = Math.floor(y / TILE_SIZE);

  // マップの外なら壁
  if (mapX < 0 || mapX >= MAP_COLS) return true;
  if (mapY < 0 || mapY >= MAP_ROWS) return true;

  // マップのデータを見て判定
  return MAP[mapY][mapX] === 1;
}

// =====================
// 🚶 プレイヤーを動かす
// =====================

function updatePlayer(dt) {
  // dt = 前のフレームからの経過時間（秒）

  // --- 回転 ---
  if (keys.left) player.angle -= player.rotSpeed * dt;
  if (keys.right) player.angle += player.rotSpeed * dt;
  player.angle = normalizeAngle(player.angle);

  // --- 移動量を計算 ---
  let moveX = 0;
  let moveY = 0;
  const step = player.moveSpeed * dt;

  // 前方向のベクトル（向いている方向）
  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);

  // 横方向のベクトル（前方向を90度回転）
  const sideX = Math.cos(player.angle + Math.PI / 2);
  const sideY = Math.sin(player.angle + Math.PI / 2);

  // 前後移動
  if (keys.w) {
    moveX += dirX * step;
    moveY += dirY * step;
  }
  if (keys.s) {
    moveX -= dirX * step;
    moveY -= dirY * step;
  }

  // 横移動（ストレイフ）
  if (keys.d) {
    moveX += sideX * step;
    moveY += sideY * step;
  }
  if (keys.a) {
    moveX -= sideX * step;
    moveY -= sideY * step;
  }

  // --- 壁にぶつからないように移動 ---
  // X方向とY方向を別々にチェック（壁に沿って滑れるように）
  if (!isWallAt(player.x + moveX, player.y)) player.x += moveX;
  if (!isWallAt(player.x, player.y + moveY)) player.y += moveY;
}

// =====================
// 👁️ レイキャスト（壁を探す）
// =====================
//
// 「レイ」とは「光線」のこと。
// プレイヤーの目から光線を飛ばして、
// 最初にぶつかる壁を見つける方法です。
//
// 【仕組み】
// マップはマス目（グリッド）になっているので、
// レイがグリッドの線と交わる点を順番に調べていきます。
//
// 横線（水平線）との交点と、
// 縦線（垂直線）との交点を別々に調べて、
// 近い方を採用します。
//

function castRay(rayAngle) {
  rayAngle = normalizeAngle(rayAngle);

  // レイがどっち向きに進むかを判定
  const goingDown = rayAngle > 0 && rayAngle < Math.PI;
  const goingRight = rayAngle < Math.PI / 2 || rayAngle > Math.PI * 1.5;

  // tan(角度) = 傾き（どれだけ斜めか）
  let tanAngle = Math.tan(rayAngle);
  if (tanAngle === 0) tanAngle = 0.00001; // 0で割るのを防ぐ

  // -----------------------------------------
  // 【1】横線（水平グリッド線）との交点を探す
  // -----------------------------------------
  let horzDist = Infinity;
  let horzX = 0,
    horzY = 0;

  // 最初の横線の位置を決める
  let firstY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
  if (goingDown) firstY += TILE_SIZE;

  // その横線とレイが交わるX座標
  let firstX = player.x + (firstY - player.y) / tanAngle;

  // 次の交点へ進む量
  const stepY = goingDown ? TILE_SIZE : -TILE_SIZE;
  const stepX = stepY / tanAngle;

  // 壁にぶつかるまで進む
  let checkX = firstX;
  let checkY = firstY;
  const horzOffset = goingDown ? 0 : -1;

  for (let i = 0; i < 20; i++) {
    // 最大20回チェック
    if (isWallAt(checkX, checkY + horzOffset)) {
      horzDist = distanceBetween(player.x, player.y, checkX, checkY);
      horzX = checkX;
      horzY = checkY;
      break;
    }
    checkX += stepX;
    checkY += stepY;
  }

  // -----------------------------------------
  // 【2】縦線（垂直グリッド線）との交点を探す
  // -----------------------------------------
  let vertDist = Infinity;
  let vertX = 0,
    vertY = 0;

  // 最初の縦線の位置を決める
  let firstX2 = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
  if (goingRight) firstX2 += TILE_SIZE;

  // その縦線とレイが交わるY座標
  let firstY2 = player.y + (firstX2 - player.x) * tanAngle;

  // 次の交点へ進む量
  const stepX2 = goingRight ? TILE_SIZE : -TILE_SIZE;
  const stepY2 = stepX2 * tanAngle;

  // 壁にぶつかるまで進む
  let checkX2 = firstX2;
  let checkY2 = firstY2;
  const vertOffset = goingRight ? 0 : -1;

  for (let i = 0; i < 20; i++) {
    if (isWallAt(checkX2 + vertOffset, checkY2)) {
      vertDist = distanceBetween(player.x, player.y, checkX2, checkY2);
      vertX = checkX2;
      vertY = checkY2;
      break;
    }
    checkX2 += stepX2;
    checkY2 += stepY2;
  }

  // -----------------------------------------
  // 【3】近い方を採用
  // -----------------------------------------
  if (vertDist < horzDist) {
    return { distance: vertDist, hitX: vertX, hitY: vertY, hitVertical: true };
  }
  return { distance: horzDist, hitX: horzX, hitY: horzY, hitVertical: false };
}
