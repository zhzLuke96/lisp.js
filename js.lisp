;; import lib
(import "./lib.lisp")

;;; Test program
(setq fibo (lambda (x)
             (if (< x 2)
                 1
                 (+ (fibo (- x 1))
                    (fibo (- x 2))))))
(print "Fibo 10 ==> " (fibo 10))

(setq test (lambda (x y ...z)
             (print x y z)))
(test)
(test 1)
(test 1 2)
(test 1 2 3)
(test 1 2 3 4)

(print (quote (lambda (x)
                (if (< x 2)
                    1
                    (+ (fibo (- x 1))
                       (fibo (- x 2)))))))

(defmacro (swap (quote a) (quote b)) (progn (setq temp a) (setq a b) (setq b temp)))

(setq q1 12n)
(setq q2 15n)

(print q1 q2)
(swap (quote q1) (quote q2))
(print q1 q2)

(setq big1 99999999999999999999999999n)
(setq big2 99999999999999999999999999n)
(print (+ big1 big2))

(print (** 99 99))
(print (** 99n 99n))

(go (print 1))
(go (print 2))
(go (print 3))
(go (print 4))
(go (print 5))
(go (print 6))
(go (print 7))
(go (print 8))

(print (nil? (print 1)))

(setq URL_Similar (
    regexp "(([\\w\\.\\-\\+]+:)\\/{2}(([\\w\\d\\.]+):([\\w\\d\\.]+))?@?(([a-zA-Z0-9\\.\\-_]+)(?::(\\d{1,5}))?))?(\\/(?:[a-zA-Z0-9\\.\\-\\/\\+\\%]+)?)(?:\\?([a-zA-Z0-9=%\\-_\\.\\*&;]+))?(?:#([a-zA-Z0-9\\-=,&%;\\/\\\\\"'\\?]+)?)?"
    )
)
(print (URL_Similar "http://user:pass@www.google.com:8000/foo/bar?st=1&lt=10;#/koo9"))

(defmacro (isURL (quote a)) (not (nil? (URL_Similar a))))
(print "is URL? => " (isURL "http://user:pass@www.google.com:8000/foo/bar?st=1&lt=10;#/koo9"))
(print (isURL "🥝"))
(print "🥝")
(print (jsex "ev"))
(print "🥝")

(setq bnum 14)
(progn 
    (print (toString (<< bnum 3) 2))
    (print (toString (<< bnum 2) 2))
    (print (toString (<< bnum 1) 2))
    (print (toString bnum 2))
    (print (toString (>> bnum 1) 2))
    (print (toString (>> bnum 2) 2))
    (print (toString (>> bnum 3) 2))
)
