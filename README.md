# lisp.js

lisp base on javascript.

# usage

```lisp
(import "lib.lisp")

(setq apiTask (fetch "https://api.ipify.org?format=json"))
(print "your ip => " (
        (js "res => res.json().ip")
        (await apiTask)
    )
)
```

# fork for

- [A very simple JS based Lisp interpreter](https://www.youtube.com/watch?v=vqiic9tshfg)

# todo

- [ ] syntax-rule
- [ ] await
- [ ] fetch
- [ ] dom 操作

# LICENSE

MIT
