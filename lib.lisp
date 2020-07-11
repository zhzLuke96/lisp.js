;;; safety js call
(setq jsex (js "x => {try{safeEval(x)}catch{return null}}"))

;;; Basic math
(setq + (js "(x, y) => x + y"))
(setq - (js "(x, y) => x - y"))
(setq * (js "(x, y) => x * y"))
(setq ** (js "(x, y) => x ** y"))
(setq / (js "(x, y) => x / y"))

;; boolean opt
(setq not (js "(x) => !x"))
(setq and (js "(x, y) => x && y"))
(setq or (js "(x, y) => x || y"))
(setq xor (js "(x, y) => x !== y"))

;; binary operators
(setq ~ (js "(x) => ~x"))
(setq | (js "(x,y) => x | y"))
(setq & (js "(x, y) => x & y"))
(setq ^ (js "(x, y) => x ^ y"))
(setq << (js "(x, y) => x << y"))
(setq >> (js "(x, y) => x >> y"))
(setq >>> (js "(x, y) => x >>> y"))

;;; Type inspection
(setq symbol? (js "x => x && x.constructor === Symbol"))
(setq list? (js "x => x && x.constructor === Array"))
(setq nil? (js "x => x === null || (x && x.length === 0)"))

;;; Array support
(setq map (js "(f, a) => a.map(f)"))
(setq join (js "(a, s) => a.join(s)"))

;;; JSON support
(setq json (js "x => JSON.stringify(x, (k,v) => v && v.constructor === BigInt ? v.toString() : v)"))

;;; Symbol support
(setq symbol-name (js "x => Symbol.keyFor(x)"))

;;; Comparison
(setq <  (js "(x, y) => x < y"))
(setq <= (js "(x, y) => x <= y"))
(setq >  (js "(x, y) => x > y"))
(setq >= (js "(x, y) => x >= y"))
(setq =  (js "(x, y) => x === y"))
(setq /= (js "(x, y) => x !== y"))

;;; regexp
(setq regexp (js "(x) => (xs) => Array.from(new RegExp(x).exec(xs))"))

;;; I/O
(setq str (lambda (x)
            (if (symbol? x)
                (symbol-name x)
                (if (list? x)
                    (+ "("
                       (+ (join (map str x) " ")
                          ")"))
                    (json x)))))

;; (setq jslog (js "(...x) => console.log(...x)"))
(setq jslog (js "(...x) => console.log(Date.now() % 10000, ...x)"))
(setq print (lambda (...args)
              (jslog (join (map str args) " "))))

;;; base tool
(setq progn (lambda (...args) (map eval args)))
(setq toString (js "(x,y) => x && x.toString && x.toString(y)"))
