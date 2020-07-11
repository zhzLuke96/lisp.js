((safeEval) => {
    const isNode = typeof window === 'undefined';
    const isBrowser = !isNode;
    // const
    const env0 = Object.create(null),
        QUOTE = Symbol.for("quote"),
        EVAL = Symbol.for("eval"),
        PROGN = Symbol.for("progn"),
        SETQ = Symbol.for("setq"),
        IF = Symbol.for("if"),
        GO = Symbol.for("go"),
        DEFER = Symbol.for("defer"),
        IMPORT = Symbol.for("import"),
        AWAIT = Symbol.for("await"),
        DASH = Symbol.for("_"),
        DEFMACRO = Symbol.for("defmacro"),
        LAMBDA = Symbol.for("lambda");


    env0[Symbol.for("js")] = [x => safeEval(x)];
    env0[Symbol.for("js!")] = [x => eval(x)];
    // common
    const noop = (...x) => x;

    const ev = (x, env) => {
        if (x && x.constructor === Symbol) {
            if (env[x] === undefined) return noop;
            return env[x][0];
        } else if (x && x.constructor === Array) {
            return evalx(x, env);
        }
        return x;
    }

    const evalx = (x, env) => {
        switch (x[0]) {
            case DASH:
                return null;
            case QUOTE:
                return x[1];
            case IMPORT:
                return readFile(ev(x[1], env));
            case EVAL:
                return ev(ev(x[1], env), env);
            case SETQ:
                return (env[x[1]] || (env0[x[1]] = []))[0] = ev(x[2], env);
            case IF:
                return ev(x[1], env) ? ev(x[2], env) : ev(x[3], env);
            case GO:
                return Promise.resolve().then(() => ev(x[1], env));
            case DEFER:
                return new Promise(resolve => setTimeout(() => resolve(ev(x[1], env)), Number(ev(x[2], env))))
            case DEFMACRO: {
                let [nSym, ...Syms] = x[1];
                let body = x[2];
                Syms = Syms.map(s => ev(s, env));
                (env[nSym] || (env0[nSym] = []))[0] = (...RSyms) => ev(SymbolReplace(body, Syms, RSyms), env);
                return (env[nSym] || (env0[nSym] = []))[0];
            }
            case LAMBDA: {
                let variadic = x[1].length ? Symbol.keyFor(x[1][x[1].length - 1]) : undefined;
                if (variadic && variadic.slice(0, 3) === "...") {
                    variadic = Symbol.for(variadic.slice(3));
                } else {
                    variadic = undefined;
                }
                return function (...args) {
                    let ne = Object.create(env);
                    x[1].forEach((s, i) => {
                        if (i === x[1].length - 1 && variadic) {
                            ne[variadic] = [args.slice(i)];
                        } else {
                            ne[s] = [args[i]];
                        }
                    });
                    let res = undefined;
                    for (let i = 2; i < x.length; i++) {
                        res = ev(x[i], ne);
                    }
                    return res;
                };
            }
            default: {
                const maybeNil = ev(x[0], env);
                return !maybeNil ? null : maybeNil.apply(null, x.slice(1).map(y => ev(y, env)));
            }
        }
    }

    class Source {
        constructor(s) {
            this.s = s;
            this.i = 0;
        }
        curr() {
            return this.s[this.i];
        }
        next() {
            return this.s[this.i++];
        }
    }

    const spaces = "\t\n\r ",
        stopchars = spaces + "()";

    const skipSpaces = (s) => {
        for (;;) {
            while (spaces.indexOf(s.curr()) >= 0) {
                s.next();
            }
            if (s.curr() === ";") {
                while (s.curr() && s.curr() !== "\n") {
                    s.next();
                }
            } else {
                break;
            }
        }
    }

    const readList = (s) => {
        if (s.curr() === "(") {
            s.next();
            let res = [];
            for (;;) {
                skipSpaces(s);
                if (!s.curr() || s.curr() === ")") break;
                res.push(read(s));
            }
            if (!s.curr()) err("')' expected", s);
            s.next();
            return res;
        } else {
            err("List expected", s);
        }
    }

    const readString = (s) => {
        if (s.curr() === "\"") {
            let res = s.next();
            while (s.curr() && s.curr() !== "\"") {
                if (s.curr() === "\\") res += s.next();
                res += s.next();
            }
            if (!s.curr()) err("'\"' expected", s);
            res += s.next();
            return JSON.parse(res.replace(/\n/g, "\\n"));
        } else {
            err("String expected", s);
        }
    }

    const readSymbolOrNumber = (s) => {
        let res = "";
        while (s.curr() && stopchars.indexOf(s.curr()) === -1) {
            res += s.next();
        }
        if (res === "") err("Symbol or number expected", s);
        let v = parseFloat(res);
        return isNaN(v) ? Symbol.for(res) : res.endsWith('n') ? BigInt(res.replace(/[a-zA-Z]/g, '')) : v;
    }

    const read_table = {
        "(": readList,
        "\"": readString
    }

    const read = (s) => {
        skipSpaces(s);
        return (read_table[s.curr()] || readSymbolOrNumber)(s);
    }

    let [, , filename, clear] = process.argv;
    if (clear === '--clear') {
        console.clear();
    }

    function readFile(path) {
        let source = null;
        if (isNode) {
            const text = require("fs").readFileSync(path, "utf-8");
            source = new Source(text);
            ExecSource(source);
        } else {
            (async () => {
                const resp = await fetch(path);
                const text = resp.text();
                source = new Source(text);
                ExecSource(source);
            })();
        }
    }

    function ExecSource(source) {
        for (;;) {
            skipSpaces(source);
            if (!source.curr()) break;
            ev(read(source), env0);
        }
    }

    readFile(filename);

    function fromEntries(kvarr = []) {
        return kvarr.reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc
        }, {})
    }

    function SymbolReplace(c, ks, vs) {
        const map = fromEntries(ks.map((k, idx) => [k, vs[idx]]));
        return walk(c, (sym) => sym in map ? map[sym] : sym);
    }

    function walk(c, fn = x => x) {
        for (const idx in c) {
            if (c.hasOwnProperty(idx)) {
                const sym = c[idx];
                if (Array.isArray(sym)) {
                    walk(sym, fn);
                } else {
                    c[idx] = fn(sym);
                }
            }
        }
        return c;
    }
})(x => eval(x));