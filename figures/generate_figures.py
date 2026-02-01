# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "matplotlib",
#     "numpy",
# ]
# ///
"""
レイキャスト教育用の図を生成するスクリプト
uv run generate_figures.py で実行
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.font_manager as fm

# 日本語フォント設定
# macOS, Windows, Linux で利用可能なフォントを試す
japanese_fonts = [
    'Hiragino Sans',           # macOS
    'Hiragino Maru Gothic Pro', # macOS
    'Yu Gothic',               # Windows
    'Meiryo',                  # Windows
    'Noto Sans CJK JP',        # Linux
    'IPAGothic',               # Linux
    'DejaVu Sans',             # フォールバック
]

# 利用可能なフォントを探す
available_fonts = [f.name for f in fm.fontManager.ttflist]
selected_font = None
for font in japanese_fonts:
    if font in available_fonts:
        selected_font = font
        break

if selected_font:
    plt.rcParams['font.family'] = selected_font
else:
    plt.rcParams['font.family'] = 'sans-serif'

plt.rcParams['axes.unicode_minus'] = False

# 共通の色設定
COLORS = {
    'primary': '#2563eb',      # 青
    'secondary': '#dc2626',    # 赤
    'accent': '#059669',       # 緑
    'orange': '#f59e0b',       # オレンジ
    'purple': '#7c3aed',       # 紫
    'grid': '#e5e7eb',         # グリッド
    'axis': '#374151',         # 軸
    'wall': '#475569',         # 壁
    'light': '#f3f4f6',        # 背景
    'dark': '#1f2937',         # テキスト
}


def setup_figure(figsize=(8, 6)):
    """図の基本設定"""
    fig, ax = plt.subplots(1, 1, figsize=figsize)
    ax.set_facecolor('white')
    ax.set_aspect('equal')
    return fig, ax


def save_figure(fig, filename):
    """図を保存"""
    plt.tight_layout()
    plt.savefig(filename, format='svg', bbox_inches='tight', facecolor='white')
    plt.close()
    print(f'✓ {filename} を生成しました')


def create_linear_function():
    """一次関数の図"""
    fig, ax = setup_figure(figsize=(9, 7))

    # グリッド
    for i in range(-1, 7):
        ax.axhline(y=i, color=COLORS['grid'], linewidth=0.8, zorder=0)
        ax.axvline(x=i, color=COLORS['grid'], linewidth=0.8, zorder=0)

    # 軸
    ax.axhline(y=0, color=COLORS['axis'], linewidth=2.5, zorder=1)
    ax.axvline(x=0, color=COLORS['axis'], linewidth=2.5, zorder=1)

    # 軸の矢印
    ax.annotate('', xy=(6.3, 0), xytext=(6, 0),
                arrowprops=dict(arrowstyle='->', color=COLORS['axis'], lw=2.5))
    ax.annotate('', xy=(0, 6.3), xytext=(0, 6),
                arrowprops=dict(arrowstyle='->', color=COLORS['axis'], lw=2.5))

    # 軸ラベル
    ax.text(6.5, -0.3, 'x', fontsize=16, ha='left', va='center', fontweight='bold')
    ax.text(-0.3, 6.5, 'y', fontsize=16, ha='center', va='bottom', fontweight='bold')

    # 原点ラベル
    ax.text(-0.3, -0.4, 'O', fontsize=14, ha='center', va='center', fontweight='bold')

    # 直線 y = 0.75x + 1
    a, b = 0.75, 1
    x = np.linspace(-0.5, 6.5, 100)
    y = a * x + b
    ax.plot(x, y, color=COLORS['primary'], linewidth=3.5, zorder=3)

    # 切片を強調
    ax.scatter([0], [b], color=COLORS['secondary'], s=180, zorder=5,
               edgecolors='white', linewidths=2)
    ax.annotate(f'切片 b = {b}\n（直線がy軸と\n 交わる点）',
                xy=(0, b), xytext=(-1.8, b + 1.2),
                fontsize=11, color=COLORS['secondary'], fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=COLORS['secondary'], lw=2),
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white',
                         edgecolor=COLORS['secondary'], alpha=0.95))

    # 傾きを示す三角形
    x1, x2 = 2, 4
    y1, y2 = a * x1 + b, a * x2 + b

    # 三角形を塗りつぶし
    triangle = plt.Polygon([[x1, y1], [x2, y1], [x2, y2]],
                           facecolor=COLORS['accent'], alpha=0.15, zorder=2)
    ax.add_patch(triangle)

    # 三角形の辺
    ax.plot([x1, x2], [y1, y1], color=COLORS['accent'], linewidth=3, zorder=2)
    ax.plot([x2, x2], [y1, y2], color=COLORS['accent'], linewidth=3, zorder=2)

    # 点を強調
    ax.scatter([x1, x2], [y1, y2], color=COLORS['primary'], s=120, zorder=5,
               edgecolors='white', linewidths=2)

    # Δx と Δy のラベル
    ax.annotate('', xy=(x2 - 0.05, y1), xytext=(x1 + 0.05, y1),
                arrowprops=dict(arrowstyle='<->', color=COLORS['accent'], lw=2.5))
    ax.text((x1 + x2) / 2, y1 - 0.5, 'Δx = 2', fontsize=13, ha='center',
            color=COLORS['accent'], fontweight='bold')

    ax.annotate('', xy=(x2, y2 - 0.05), xytext=(x2, y1 + 0.05),
                arrowprops=dict(arrowstyle='<->', color=COLORS['accent'], lw=2.5))
    ax.text(x2 + 0.5, (y1 + y2) / 2, f'Δy = {y2-y1:.1f}', fontsize=13, ha='left',
            color=COLORS['accent'], fontweight='bold')

    # 傾きの説明ボックス
    ax.text(4.5, 1.5, f'傾き a = Δy ÷ Δx\n       = 1.5 ÷ 2\n       = {a}',
            fontsize=12, color=COLORS['accent'], fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.5', facecolor='#ecfdf5',
                     edgecolor=COLORS['accent'], linewidth=2))

    # 数式ボックス
    ax.text(4.5, 5, r'$y = ax + b$', fontsize=20, color=COLORS['primary'],
            fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.5', facecolor=COLORS['light'],
                     edgecolor=COLORS['primary'], linewidth=2))

    ax.set_xlim(-2.5, 7)
    ax.set_ylim(-1, 7)
    ax.axis('off')
    ax.set_title('一次関数：直線の式', fontsize=16, fontweight='bold', pad=15)

    save_figure(fig, 'linear_function.svg')


def create_unit_circle():
    """単位円の図"""
    fig, ax = setup_figure(figsize=(9, 9))

    # 単位円
    theta_circle = np.linspace(0, 2 * np.pi, 100)
    ax.plot(np.cos(theta_circle), np.sin(theta_circle),
            color=COLORS['axis'], linewidth=3, zorder=2)

    # 円の内側を薄く塗る
    circle = plt.Circle((0, 0), 1, facecolor=COLORS['light'],
                        edgecolor='none', alpha=0.5, zorder=1)
    ax.add_patch(circle)

    # 軸
    ax.axhline(y=0, color=COLORS['axis'], linewidth=2, zorder=1)
    ax.axvline(x=0, color=COLORS['axis'], linewidth=2, zorder=1)

    # 軸の矢印とラベル
    ax.annotate('', xy=(1.5, 0), xytext=(1.4, 0),
                arrowprops=dict(arrowstyle='->', color=COLORS['axis'], lw=2))
    ax.annotate('', xy=(0, 1.5), xytext=(0, 1.4),
                arrowprops=dict(arrowstyle='->', color=COLORS['axis'], lw=2))
    ax.text(1.55, -0.08, 'x', fontsize=16, ha='left', va='center', fontweight='bold')
    ax.text(-0.08, 1.55, 'y', fontsize=16, ha='center', va='bottom', fontweight='bold')

    # 角度 θ = 45°
    theta = np.pi / 4
    cos_val = np.cos(theta)
    sin_val = np.sin(theta)

    # 半径（レイ）
    ax.plot([0, cos_val], [0, sin_val], color=COLORS['primary'], linewidth=4, zorder=3)
    ax.scatter([cos_val], [sin_val], color=COLORS['primary'], s=200, zorder=5,
               edgecolors='white', linewidths=3)

    # cos の投影（x軸への垂線）
    ax.plot([cos_val, cos_val], [0, sin_val], color=COLORS['secondary'],
            linewidth=2.5, linestyle='--', zorder=2)
    ax.plot([0, cos_val], [0, 0], color=COLORS['secondary'], linewidth=5, zorder=3)

    # sin の投影（y軸への垂線）
    ax.plot([0, cos_val], [sin_val, sin_val], color=COLORS['accent'],
            linewidth=2.5, linestyle='--', zorder=2)
    ax.plot([0, 0], [0, sin_val], color=COLORS['accent'], linewidth=5, zorder=3)

    # 直角マーク
    rect_size = 0.08
    rect = plt.Rectangle((cos_val - rect_size, 0), rect_size, rect_size,
                         facecolor='none', edgecolor=COLORS['axis'], linewidth=1.5)
    ax.add_patch(rect)

    # 角度の弧
    arc_theta = np.linspace(0, theta, 30)
    arc_r = 0.3
    ax.plot(arc_r * np.cos(arc_theta), arc_r * np.sin(arc_theta),
            color=COLORS['primary'], linewidth=2.5)
    ax.text(0.42, 0.15, 'θ', fontsize=18, color=COLORS['primary'], fontweight='bold')

    # ラベル
    ax.text(cos_val / 2, -0.18, 'cos θ', fontsize=15, ha='center',
            color=COLORS['secondary'], fontweight='bold')
    ax.text(-0.22, sin_val / 2, 'sin θ', fontsize=15, ha='center', va='center',
            color=COLORS['accent'], fontweight='bold', rotation=90)

    # 点の座標ラベル
    ax.text(cos_val + 0.12, sin_val + 0.12, '(cos θ, sin θ)', fontsize=13,
            color=COLORS['primary'], fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white',
                     edgecolor=COLORS['primary'], alpha=0.95))

    # 半径 = 1 のラベル
    ax.text(0.3, 0.52, 'r = 1', fontsize=13, color=COLORS['primary'],
            fontweight='bold', rotation=45)

    # 角度の目盛り（度数）
    angles_deg = [(0, '0°'), (np.pi/2, '90°'), (np.pi, '180°'), (3*np.pi/2, '270°')]
    for angle, label in angles_deg:
        x, y = 1.2 * np.cos(angle), 1.2 * np.sin(angle)
        ax.text(x, y, label, fontsize=12, ha='center', va='center',
                color=COLORS['dark'], fontweight='bold')

    # 説明ボックス
    explanation = '【単位円】\n半径1の円で、角度θから\nx座標 = cos θ\ny座標 = sin θ\nが求まる'
    ax.text(0, -1.55, explanation, fontsize=12, ha='center', color=COLORS['dark'],
            bbox=dict(boxstyle='round,pad=0.5', facecolor=COLORS['light'],
                     edgecolor=COLORS['axis'], linewidth=2))

    ax.set_xlim(-1.7, 1.7)
    ax.set_ylim(-1.9, 1.7)
    ax.axis('off')
    ax.set_title('単位円と三角関数', fontsize=16, fontweight='bold', pad=15)

    save_figure(fig, 'unit_circle.svg')


def create_raycast_grid():
    """レイキャストのグリッド図"""
    fig, ax = setup_figure(figsize=(11, 8))

    # グリッドサイズ
    grid_size = 1
    cols, rows = 8, 6

    # 背景（通路）
    for y in range(rows):
        for x in range(cols):
            rect = patches.Rectangle((x, y), grid_size, grid_size,
                                     facecolor='#fafafa', edgecolor=COLORS['grid'],
                                     linewidth=1, zorder=0)
            ax.add_patch(rect)

    # 壁
    walls = [(0, 5), (1, 5), (2, 5), (3, 5), (4, 5), (5, 5), (6, 5), (7, 5),
             (0, 0), (1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0), (7, 0),
             (0, 1), (0, 2), (0, 3), (0, 4),
             (7, 1), (7, 2), (7, 3), (7, 4),
             (3, 3), (4, 3),
             (5, 1), (5, 2)]

    for wx, wy in walls:
        rect = patches.Rectangle((wx, wy), grid_size, grid_size,
                                 facecolor=COLORS['wall'], edgecolor='#334155',
                                 linewidth=1.5, zorder=1)
        ax.add_patch(rect)

    # プレイヤー位置
    player_x, player_y = 1.5, 2.5

    # レイの終点を計算（壁にぶつかるまで）
    ray_angle = np.radians(30)
    ray_end_x = 5.0
    ray_end_y = player_y + (ray_end_x - player_x) * np.tan(ray_angle)

    # レイ（光線）
    ax.plot([player_x, ray_end_x], [player_y, ray_end_y],
            color=COLORS['primary'], linewidth=3.5, zorder=5,
            solid_capstyle='round')

    # 矢印の先端
    ax.annotate('', xy=(ray_end_x, ray_end_y),
                xytext=(ray_end_x - 0.3 * np.cos(ray_angle),
                       ray_end_y - 0.3 * np.sin(ray_angle)),
                arrowprops=dict(arrowstyle='->', color=COLORS['primary'], lw=3))

    # グリッドとの交点を計算して表示
    # 水平線との交点
    for y in range(3, 5):
        if player_y < y < ray_end_y:
            t = (y - player_y) / (ray_end_y - player_y)
            x = player_x + t * (ray_end_x - player_x)
            ax.scatter([x], [y], color=COLORS['accent'], s=100, zorder=8,
                      marker='o', edgecolors='white', linewidths=2)

    # 垂直線との交点
    for x in range(2, 6):
        if player_x < x < ray_end_x:
            t = (x - player_x) / (ray_end_x - player_x)
            y = player_y + t * (ray_end_y - player_y)
            ax.scatter([x], [y], color=COLORS['orange'], s=100, zorder=8,
                      marker='s', edgecolors='white', linewidths=2)

    # 衝突点
    ax.scatter([ray_end_x], [ray_end_y], color=COLORS['secondary'], s=200,
               zorder=10, marker='X', edgecolors='white', linewidths=2)
    ax.text(ray_end_x + 0.15, ray_end_y + 0.25, '衝突！', fontsize=12,
            color=COLORS['secondary'], fontweight='bold')

    # プレイヤー
    ax.scatter([player_x], [player_y], color=COLORS['accent'], s=250, zorder=10,
               edgecolors='white', linewidths=3)
    ax.text(player_x, player_y - 0.5, 'プレイヤー', fontsize=12, ha='center',
            color=COLORS['accent'], fontweight='bold')

    # 角度の弧
    arc_theta = np.linspace(0, ray_angle, 20)
    arc_r = 0.7
    ax.plot(player_x + arc_r * np.cos(arc_theta),
            player_y + arc_r * np.sin(arc_theta),
            color=COLORS['primary'], linewidth=2.5)
    ax.text(player_x + 0.9, player_y + 0.3, 'θ', fontsize=16,
            color=COLORS['primary'], fontweight='bold')

    # 凡例
    legend_y = 0.8
    ax.scatter([1], [legend_y], color=COLORS['accent'], s=80, marker='o')
    ax.text(1.3, legend_y, '水平線との交点', fontsize=10, va='center')
    ax.scatter([4], [legend_y], color=COLORS['orange'], s=80, marker='s')
    ax.text(4.3, legend_y, '垂直線との交点', fontsize=10, va='center')
    ax.scatter([6.5], [legend_y], color=COLORS['secondary'], s=80, marker='X')
    ax.text(6.8, legend_y, '壁との衝突点', fontsize=10, va='center')

    # 説明ボックス
    explanation = 'レイ（光線）を飛ばして、\nグリッドの線との交点を\n順番に調べていく'
    ax.text(6, 4.5, explanation, fontsize=11, ha='center', color=COLORS['dark'],
            bbox=dict(boxstyle='round,pad=0.5', facecolor='white',
                     edgecolor=COLORS['axis'], linewidth=2, alpha=0.95))

    ax.set_xlim(-0.5, 8.5)
    ax.set_ylim(-0.3, 6.5)
    ax.axis('off')
    ax.set_title('レイキャスト：グリッド上での壁の探し方', fontsize=16,
                fontweight='bold', pad=15)

    save_figure(fig, 'raycast_grid.svg')


def create_projection():
    """投影と見かけの高さの図"""
    fig, ax = setup_figure(figsize=(11, 7))

    # 視点（目）
    eye_x, eye_y = 0, 0

    # スクリーンの位置
    screen_x = 7
    screen_top, screen_bottom = 3, -3

    # 壁（実際の位置）- 近い壁と遠い壁
    wall_near_x = 3.5
    wall_near_top, wall_near_bottom = 1.5, -1.5

    wall_far_x = 5.5
    wall_far_top, wall_far_bottom = 1.5, -1.5

    # スクリーンを描画
    ax.plot([screen_x, screen_x], [screen_top, screen_bottom],
            color=COLORS['axis'], linewidth=5, zorder=2)
    ax.text(screen_x + 0.3, screen_top, 'スクリーン\n（画面）', fontsize=11,
            va='top', color=COLORS['axis'], fontweight='bold')

    # 近い壁を描画
    ax.plot([wall_near_x, wall_near_x], [wall_near_top, wall_near_bottom],
            color=COLORS['primary'], linewidth=10, zorder=3, solid_capstyle='round')
    ax.text(wall_near_x, wall_near_top + 0.4, '近い壁', fontsize=11, ha='center',
            color=COLORS['primary'], fontweight='bold')

    # 遠い壁を描画（半透明）
    ax.plot([wall_far_x, wall_far_x], [wall_far_top, wall_far_bottom],
            color=COLORS['purple'], linewidth=10, zorder=2, alpha=0.6,
            solid_capstyle='round')
    ax.text(wall_far_x, wall_far_top + 0.4, '遠い壁', fontsize=11, ha='center',
            color=COLORS['purple'], fontweight='bold')

    # 目
    ax.scatter([eye_x], [eye_y], color=COLORS['secondary'], s=300, zorder=10,
               edgecolors='white', linewidths=3)
    ax.text(eye_x, eye_y - 0.7, '視点', fontsize=13, ha='center',
            color=COLORS['secondary'], fontweight='bold')

    # 近い壁の投影線
    proj_near_top = (wall_near_top / wall_near_x) * screen_x
    proj_near_bottom = (wall_near_bottom / wall_near_x) * screen_x

    ax.plot([eye_x, screen_x], [eye_y, proj_near_top],
            color=COLORS['primary'], linewidth=1.5, linestyle='--', alpha=0.7, zorder=1)
    ax.plot([eye_x, screen_x], [eye_y, proj_near_bottom],
            color=COLORS['primary'], linewidth=1.5, linestyle='--', alpha=0.7, zorder=1)

    # 近い壁のスクリーン上の投影
    ax.plot([screen_x, screen_x], [proj_near_top, proj_near_bottom],
            color=COLORS['primary'], linewidth=8, zorder=4)

    # 遠い壁の投影線
    proj_far_top = (wall_far_top / wall_far_x) * screen_x
    proj_far_bottom = (wall_far_bottom / wall_far_x) * screen_x

    ax.plot([eye_x, screen_x], [eye_y, proj_far_top],
            color=COLORS['purple'], linewidth=1.5, linestyle='--', alpha=0.5, zorder=1)
    ax.plot([eye_x, screen_x], [eye_y, proj_far_bottom],
            color=COLORS['purple'], linewidth=1.5, linestyle='--', alpha=0.5, zorder=1)

    # 遠い壁のスクリーン上の投影
    ax.plot([screen_x + 0.15, screen_x + 0.15], [proj_far_top, proj_far_bottom],
            color=COLORS['purple'], linewidth=8, zorder=4, alpha=0.7)

    # 近い壁の見かけの高さラベル
    ax.annotate('', xy=(screen_x + 0.5, proj_near_top),
                xytext=(screen_x + 0.5, proj_near_bottom),
                arrowprops=dict(arrowstyle='<->', color=COLORS['primary'], lw=2))
    ax.text(screen_x + 0.8, 0, '大きい！', fontsize=11, va='center',
            color=COLORS['primary'], fontweight='bold', rotation=90)

    # 遠い壁の見かけの高さラベル
    ax.annotate('', xy=(screen_x + 1.3, proj_far_top),
                xytext=(screen_x + 1.3, proj_far_bottom),
                arrowprops=dict(arrowstyle='<->', color=COLORS['purple'], lw=2))
    ax.text(screen_x + 1.6, 0, '小さい', fontsize=10, va='center',
            color=COLORS['purple'], fontweight='bold', rotation=90)

    # 距離の矢印（近い壁）
    ax.annotate('', xy=(wall_near_x, -2.3), xytext=(eye_x, -2.3),
                arrowprops=dict(arrowstyle='<->', color=COLORS['primary'], lw=2))
    ax.text((eye_x + wall_near_x) / 2, -2.6, '距離 D_1（近い）', fontsize=11,
            ha='center', color=COLORS['primary'], fontweight='bold')

    # 距離の矢印（遠い壁）
    ax.annotate('', xy=(wall_far_x, -2.9), xytext=(eye_x, -2.9),
                arrowprops=dict(arrowstyle='<->', color=COLORS['purple'], lw=2))
    ax.text((eye_x + wall_far_x) / 2, -3.2, '距離 D_2（遠い）', fontsize=11,
            ha='center', color=COLORS['purple'], fontweight='bold')

    # 数式ボックス
    formula = '見かけの高さ = 実際の高さ ÷ 距離 × P\n\n近いほど大きく、遠いほど小さく見える！'
    ax.text(1.5, 2.5, formula, fontsize=12, ha='left', color=COLORS['dark'],
            bbox=dict(boxstyle='round,pad=0.7', facecolor='#fffbeb',
                     edgecolor=COLORS['orange'], linewidth=2))

    ax.set_xlim(-1.5, 10)
    ax.set_ylim(-4, 4)
    ax.axis('off')
    ax.set_title('投影：遠いものは小さく見える', fontsize=16, fontweight='bold', pad=15)

    save_figure(fig, 'projection.svg')


if __name__ == '__main__':
    print('図を生成中...\n')
    create_linear_function()
    create_unit_circle()
    create_raycast_grid()
    create_projection()
    print('\n✅ すべての図を生成しました！')
