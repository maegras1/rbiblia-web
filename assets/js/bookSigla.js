/**
 * Polish sigla (abbreviations) for Bible books
 * Used for compact display on mobile devices
 */
const bookSigla = {
    // Stary Testament
    gen: "Rdz",
    exo: "Wj",
    lev: "Kpł",
    num: "Lb",
    deu: "Pwt",
    jos: "Joz",
    jdg: "Sdz",
    rut: "Rt",
    "1sa": "1 Sm",
    "2sa": "2 Sm",
    "1ki": "1 Krl",
    "2ki": "2 Krl",
    "1ch": "1 Krn",
    "2ch": "2 Krn",
    ezr: "Ezd",
    neh: "Ne",
    tob: "Tb",
    jdt: "Jdt",
    est: "Est",
    "1ma": "1 Mch",
    "2ma": "2 Mch",
    "3ma": "3 Mch",
    "4ma": "4 Mch",
    job: "Hi",
    psa: "Ps",
    pro: "Prz",
    ecc: "Koh",
    sol: "Pnp",
    wis: "Mdr",
    sip: "Syr Prol",
    sir: "Syr",
    pss: "Ps Sal",
    isa: "Iz",
    jer: "Jr",
    lam: "Lm",
    bar: "Ba",
    eze: "Ez",
    dan: "Dn",
    hos: "Oz",
    joe: "Jl",
    amo: "Am",
    oba: "Ab",
    jon: "Jon",
    mic: "Mi",
    nah: "Na",
    hab: "Ha",
    zep: "So",
    hag: "Ag",
    zec: "Za",
    mal: "Ml",
    // Nowy Testament
    mat: "Mt",
    mar: "Mk",
    luk: "Łk",
    joh: "J",
    act: "Dz",
    rom: "Rz",
    "1co": "1 Kor",
    "2co": "2 Kor",
    gal: "Ga",
    eph: "Ef",
    phi: "Flp",
    col: "Kol",
    "1th": "1 Tes",
    "2th": "2 Tes",
    "1ti": "1 Tm",
    "2ti": "2 Tm",
    tit: "Tt",
    phm: "Flm",
    heb: "Hbr",
    jam: "Jk",
    "1pe": "1 P",
    "2pe": "2 P",
    "1jo": "1 J",
    "2jo": "2 J",
    "3jo": "3 J",
    jud: "Jud",
    rev: "Ap",
};

/**
 * Get sigla for a book ID
 * @param {string} bookId - The book identifier (e.g., "gen", "mat")
 * @returns {string} - The Polish sigla or the bookId if not found
 */
export const getSigla = (bookId) => {
    return bookSigla[bookId] || bookId.toUpperCase();
};

/**
 * Check if we should use sigla (on mobile devices)
 * @returns {boolean}
 */
export const usesMobileSigla = () => {
    return window.innerWidth < 768;
};

export default bookSigla;
