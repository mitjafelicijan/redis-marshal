# TODO

- [ ] add list support
- [ ] add sets support
- [ ] add sorted sets support
- [ ] add bitmaps and hyperloglogs support
- [ ] add connection indicator with redis ping and add try catch
- [ ] add analyze all keys to provide autocomplete in search input
- [ ] add authentication (login form) with bottlepy

# DONE

- [x] when usign * for query check num_keys and if larger that 500 alert user or even disable query
- [x] on query enter press disable input and on results reenable input... loading
- [x] proccessed num format into human friendly
- [x] add execute command
- [x] bulk delete sends command for deletetion in batch of 10
- [x] add query took ms in results
