// =========================================================
// sketch.js - 画面に絵を描く部分
// =========================================================
//
// p5.js というライブラリを使って、画面に3Dっぽい迷路を描きます。
//
// 【このファイルでやっていること】
// 1. setup() ... 最初に1回だけ実行される準備
// 2. draw()  ... 毎秒60回くらい繰り返し実行される描画
//
// =========================================================

// =====================
// ⚙️ 設定
// =====================

// レイを何ピクセルおきに飛ばすか
// 数字が大きいほど荒くなるけど軽くなる
const RAY_STEP = 5;

// 以下は setup() で計算する
let numRays = 0; // レイの本数
let screenDist = 0; // 視点からスクリーンまでの仮想距離

// =====================
// 🎬 最初の準備
// =====================

function setup() {
  // 描画エリアを作る（横900px × 縦500px）
  createCanvas(900, 500);

  // レイの本数を計算
  // 画面の幅 ÷ RAY_STEP = レイの本数
  numRays = Math.floor(width / RAY_STEP);

  // スクリーンまでの距離を計算
  // これは「遠近感」を出すための計算で、
  // 視野角から自動的に決まります
  //
  // 公式: screenDist = (画面幅÷2) ÷ tan(視野角÷2)
  screenDist = width / 2 / Math.tan(player.fov / 2);
}

// =====================
// 🔄 毎フレームの描画
// =====================

function draw() {
  // 前のフレームからの経過時間（秒に変換）
  const dt = deltaTime / 1000;

  // 1. プレイヤーを動かす
  updatePlayer(dt);

  // 2. 天井と床を描く
  drawSkyAndFloor();

  // 3. 壁を描く（3D風に見せる）
  drawWalls();

  // 4. ミニマップを描く（左上に小さく）
  drawMiniMap();
}

// =====================
// 🌤️ 天井と床を描く
// =====================

function drawSkyAndFloor() {
  noStroke(); // 輪郭線なし

  // 天井（画面の上半分）- 薄い青
  fill(200, 220, 255);
  rect(0, 0, width, height / 2);

  // 床（画面の下半分）- グレー
  fill(180, 180, 180);
  rect(0, height / 2, width, height / 2);
}

// =====================
// 🧱 壁を描く（レイキャストの結果を使う）
// =====================

function drawWalls() {
  // 画面の左端から右端まで、レイを1本ずつ飛ばす
  for (let i = 0; i < numRays; i++) {
    // このレイの角度を計算
    // 視野の左端から右端まで均等に分ける
    const rayAngle = player.angle - player.fov / 2 + (i / numRays) * player.fov;

    // レイを飛ばして壁を探す
    const hit = castRay(rayAngle);

    // --- フィッシュアイ補正 ---
    // 斜めに見た壁が膨らんで見えるのを防ぐ
    // 正面との角度差の cos を掛けて距離を補正する
    const angleDiff = rayAngle - player.angle;
    const correctedDist = hit.distance * Math.cos(angleDiff);

    // --- 壁の高さを計算 ---
    // 近いほど高く、遠いほど低く見える
    // 公式: 見かけの高さ = (実際の高さ ÷ 距離) × スクリーン距離
    const wallHeight = (TILE_SIZE / correctedDist) * screenDist;

    // 壁の上端の位置（画面の中央を基準に）
    const wallTop = height / 2 - wallHeight / 2;

    // --- 壁の色 ---
    // 縦の壁と横の壁で色を変えると立体感が出る
    if (hit.hitVertical) {
      fill(150, 170, 190); // 縦の壁（少し暗い）
    } else {
      fill(190, 210, 230); // 横の壁（少し明るい）
    }

    // 縦長の四角形として描く
    noStroke();
    rect(i * RAY_STEP, wallTop, RAY_STEP, wallHeight);
  }
}

// =====================
// 🗺️ ミニマップを描く
// =====================

function drawMiniMap() {
  const scale = 0.18; // 縮小率

  push(); // 描画設定を保存
  translate(10, 10); // 左上に移動
  scale(scale); // 縮小

  // マップを描く
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (MAP[row][col] === 1) {
        fill(60); // 壁は濃いグレー
      } else {
        fill(230); // 通路は薄いグレー
      }
      noStroke();
      rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // プレイヤーの位置を赤丸で表示
  fill(255, 80, 80);
  noStroke();
  circle(player.x, player.y, 14);

  // プレイヤーの向きを線で表示
  stroke(255, 80, 80);
  strokeWeight(2);
  line(
    player.x,
    player.y,
    player.x + Math.cos(player.angle) * 40,
    player.y + Math.sin(player.angle) * 40,
  );

  pop(); // 描画設定を元に戻す
}

// =====================
// ⌨️ キー入力の処理
// =====================

// キーが押されたとき
function keyPressed() {
  setKeyState(convertKey(keyCode, key), true);
}

// キーが離されたとき
function keyReleased() {
  setKeyState(convertKey(keyCode, key), false);
}

// p5.jsのキーコードを、わかりやすい名前に変換
function convertKey(code, k) {
  // アルファベットキー（A〜Z）
  if (code >= 65 && code <= 90) {
    return "Key" + String.fromCharCode(code);
  }

  // 矢印キー
  if (code === LEFT_ARROW) return "ArrowLeft";
  if (code === RIGHT_ARROW) return "ArrowRight";

  return "";
}
