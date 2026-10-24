"""Part layouts for tools/vectorize.py (coordinates are pixels of the source model sheet)."""
R = lambda x0, y0, x1, y1: [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
SKIN_G = '#fbd19e'
CONFIGS = {
    'gabriel': {
        'image': 'assets/researched_references/gabriel/00_referencia_original.jpeg',
        'out': 'remotion/src/chars/data/gabriel.json', 'K': 30,
        'drop_near': ['#d6d6d6'],
        'repaint': [
            (R(508, 262, 565, 340), SKIN_G), (R(675, 262, 731, 340), SKIN_G),
            (R(502, 230, 559, 268), SKIN_G), (R(679, 223, 736, 262), SKIN_G),
            (R(566, 350, 674, 407), SKIN_G),
        ],
        'parts': {
            'head': {'poly': [(380, 20), (880, 20), (880, 395), (800, 395), (745, 420), (690, 438), (620, 446), (550, 438), (495, 420), (440, 395), (380, 395)],
                     'exclude': ['#fcce4b', '#edd9b9', '#f3cc6f'], 'pivot': [620, 445]},
            'armLU': {'poly': [(400, 470), (500, 478), (505, 560), (498, 650), (497, 700), (398, 700), (396, 560)], 'pivot': [466, 502]},
            'armLF': {'poly': R(390, 700, 500, 778), 'pivot': [455, 700]},
            'armLH': {'poly': R(385, 778, 502, 880), 'pivot': [455, 778]},
            'armRU': {'poly': [(745, 478), (845, 470), (852, 560), (852, 700), (745, 700), (742, 650), (738, 560)], 'pivot': [776, 502]},
            'armRF': {'poly': R(742, 700, 856, 778), 'pivot': [785, 700]},
            'armRH': {'poly': R(742, 778, 860, 880), 'pivot': [785, 778]},
            'torso': {'poly': [(470, 420), (770, 420), (770, 748), (470, 748)], 'pivot': [620, 745]},
            'hips': {'poly': R(480, 740, 765, 832), 'pivot': [620, 745]},
            'legL': {'poly': [(486, 790), (622, 790), (622, 1175), (450, 1175)], 'pivot': [562, 832], 'shared': True, 'only': ['#324537', '#2c392e', '#232221', '#2b2b2b', '#515249'], 'tol': 40},
            'legR': {'poly': [(622, 790), (760, 790), (800, 1175), (622, 1175)], 'pivot': [680, 832], 'shared': True, 'only': ['#324537', '#2c392e', '#232221', '#2b2b2b', '#515249'], 'tol': 40},
        },
        'preview_order': ['legL', 'legR', 'hips', 'torso', 'armLU', 'armLF', 'armLH', 'armRU', 'armRF', 'armRH', 'head'],
    },
}

SKIN_T = '#fec585'
CHAIR = ['#262729', '#1d1e1f', '#2a2a2c', '#232321', '#3a3a3a', '#141414', '#ced0d3', '#a3aab2', '#7c838b', '#e4e7ea', '#555555']
def circ(cx, cy, r, n=48):
    import math
    return [(cx + r * math.cos(i / n * 2 * math.pi), cy + r * math.sin(i / n * 2 * math.pi)) for i in range(n)]
CONFIGS['theo'] = {
    'image': 'assets/researched_references/theo/03_perfil_original.png',
    'out': 'remotion/src/chars/data/theo.json', 'K': 26, 'mode_r': 5, 'turd': 30, 'bilateral': 3, 'upsample': 2, 'min_island': 240,
    'drop_near': ['#dfdede'],
    'repaint': [(R(596, 228, 646, 292), SKIN_T), (R(584, 188, 640, 226), SKIN_T), (R(614, 312, 684, 370), SKIN_T),
                (R(536, 494, 600, 540), '#efdcb9'), (R(538, 548, 603, 642), '#efdcb9'), ([(424, 476), (500, 500), (436, 552)], '#efdcb9')],
    'parts': {
        'head': {'turd': 120, 'poly': [(330, 20), (790, 20), (790, 395), (700, 392), (640, 404), (560, 400), (500, 388), (440, 382), (330, 382)], 'exclude': ['#fed52c', '#efdcb9', '#f0bc14'], 'pivot': [552, 395]},
        'armFore': {'turd': 120, 'poly': [(352, 706), (432, 668), (464, 646), (505, 662), (565, 700), (580, 805), (530, 820), (465, 815)], 'only': [SKIN_T, '#f2ae6e', '#e39a60', '#ffd3a0'], 'tol': 30, 'pivot': [400, 668]},
        'armUpper': {'poly': [(352, 448), (520, 440), (524, 560), (503, 640), (464, 646), (432, 668), (352, 706), (338, 600)], 'exclude': CHAIR, 'pivot': [452, 486]},
        '_wheel': {'poly': circ(448, 930, 242)},
        '_caster': {'poly': circ(752, 1104, 66)},
        'chairBack': {'poly': [(262, 445), (428, 445), (428, 910), (360, 910), (360, 510), (262, 510)], 'only': CHAIR, 'tol': 26},
        'torso': {'poly': [(360, 375), (700, 375), (700, 705), (420, 712), (370, 690)], 'pivot': [520, 690], 'inpaint_under': ['armUpper', 'armFore']},
        'chair': {'poly': [(200, 440), (1100, 440), (1100, 1200), (200, 1200)], 'inpaint_under': ['armFore']},
    },
    'preview_order': ['chairBack', 'chair', 'torso', 'armUpper', 'head', 'armFore'],
}
G2 = lambda pts: [(x * 2, y * 2) for x, y in pts]
R2 = lambda x0, y0, x1, y1: G2(R(x0, y0, x1, y1))
SKIN_D = '#fdcd9b'
SKIN_DS = ['#fdcd9b', '#f4b67c', '#e8a070', '#fbe0c0', '#f7c08a']
HAIR_D = ['#c0431f', '#a8341a', '#8e2a14', '#b8391a', '#d24f25', '#9b2f17', '#e06a3a']
CONFIGS['girl'] = {
    'image': 'assets/researched_references/desbravadora/guia_consistencia.png', 'crop': (15, 75, 435, 985), 'scale': 2,
    'out': 'remotion/src/chars/data/girl.json', 'K': 26, 'flood': 10, 'mode_r': 3, 'turd': 6,
    'drop_near': ['#c9d3dd'], 'drop_tol': 14,
    'repaint': [(R2(128, 182, 182, 246), SKIN_D), (R2(238, 178, 292, 244), SKIN_D), (R2(130, 160, 176, 190), SKIN_D), (R2(240, 152, 286, 182), SKIN_D), (R2(170, 236, 250, 290), SKIN_D)],
    'parts': {
        'armLU': {'poly': G2([(58, 342), (142, 330), (148, 440), (140, 480), (40, 480), (34, 440)]), 'exclude': HAIR_D, 'pivot': [210, 720]},
        'armLF': {'poly': G2([(30, 480), (142, 480), (138, 528), (26, 528)]), 'only': SKIN_DS, 'tol': 34, 'pivot': [180, 960]},
        'armLH': {'poly': G2([(20, 528), (138, 528), (136, 615), (20, 615)]), 'only': SKIN_DS, 'tol': 34, 'pivot': [160, 1056]},
        'armRU': {'poly': G2([(278, 330), (362, 342), (388, 440), (390, 480), (280, 480), (272, 440)]), 'exclude': HAIR_D, 'pivot': [630, 720]},
        'armRF': {'poly': G2([(280, 480), (392, 480), (396, 528), (284, 528)]), 'only': SKIN_DS, 'tol': 34, 'pivot': [670, 960]},
        'armRH': {'poly': G2([(284, 528), (398, 528), (402, 615), (284, 615)]), 'only': SKIN_DS, 'tol': 34, 'pivot': [680, 1056]},
        'head': {'turd': 22, 'ptol': 0.45, 'poly': G2([(0, 0), (420, 0), (420, 398), (290, 394), (276, 312), (240, 302), (180, 302), (144, 312), (130, 394), (0, 398)]), 'pivot': [420, 600]},
        'torso': {'poly': G2([(126, 292), (294, 292), (304, 506), (116, 506)]), 'pivot': [420, 1000]},
        'skirt': {'poly': G2([(70, 496), (350, 496), (350, 672), (70, 672)]), 'pivot': [420, 1000]},
        'legL': {'poly': G2([(84, 660), (210, 660), (206, 880), (84, 880)]), 'pivot': [336, 1330]},
        'legR': {'poly': G2([(210, 660), (336, 660), (336, 880), (210, 880)]), 'pivot': [500, 1330]},
    },
    'preview_order': ['legL', 'legR', 'skirt', 'torso', 'armLU', 'armLF', 'armLH', 'armRU', 'armRF', 'armRH', 'head'], 'clear_border': 16,
}
