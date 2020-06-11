### How-to

Get and process logs into `logs_0` (no Czech knowledge) and `logs_1` (some Czech knowledge).

Run processing as:

```
./preliminary_0.sh
```

### Results:

#### No Czech knowledge:
```
Lines:    18373
Blocks:   54
Segments: 363
Rating histogram:
[(1, 12), (2, 49), (3, 88), (4, 99), (5, 112)]

Piece-wise results:
 bt.n: 3.45
  csw: 3.47
 qe.n: 3.64
 pp.n: 3.64
 ft.y: 3.69
 pp.y: 3.76
 qe.y: 3.79
   et: 3.81
   cs: 3.81
 bt.y: 3.94

Complex results:
  ft.y-bt.n-pp.n-qe.y-et: 3.00
 ft.y-bt.n-pp.y-qe.n-csw: 3.11
 ft.y-bt.n-pp.y-qe.y-csw: 3.29
 ft.y-bt.n-pp.n-qe.y-csw: 3.31
 ft.y-bt.n-pp.n-qe.n-csw: 3.32
  ft.y-bt.n-pp.n-qe.n-cs: 3.41
  ft.y-bt.n-pp.n-qe.y-cs: 3.44
  ft.y-bt.n-pp.n-qe.n-et: 3.55
  ft.y-bt.n-pp.y-qe.n-cs: 3.56
 ft.y-bt.y-pp.n-qe.n-csw: 3.63
  ft.y-bt.y-pp.n-qe.n-et: 3.65
 ft.y-bt.y-pp.y-qe.n-csw: 3.71
 ft.y-bt.y-pp.n-qe.y-csw: 3.73
  ft.y-bt.n-pp.y-qe.n-et: 3.73
 ft.y-bt.y-pp.y-qe.y-csw: 3.82
  ft.y-bt.y-pp.y-qe.n-cs: 3.89
  ft.y-bt.n-pp.y-qe.y-cs: 3.92
  ft.y-bt.y-pp.y-qe.n-et: 4.00
  ft.y-bt.n-pp.y-qe.y-et: 4.00
  ft.y-bt.y-pp.y-qe.y-cs: 4.11
  ft.y-bt.y-pp.n-qe.n-cs: 4.15
  ft.y-bt.y-pp.n-qe.y-cs: 4.18
  ft.y-bt.y-pp.n-qe.y-et: 4.38
  ft.y-bt.y-pp.y-qe.y-et: 4.38
```

#### Some Czech knowledge:
```
Lines:    9398
Blocks:   30
Segments: 210
Rating histogram:
[(1, 8), (2, 21), (3, 26), (4, 48), (5, 107)]

Piece-wise results:
 bt.n: 3.70
   et: 3.86
 pp.n: 3.90
 qe.y: 3.97
 ft.y: 4.07
  csw: 4.13
 qe.n: 4.17
   cs: 4.23
 pp.y: 4.24
 bt.y: 4.44

Complex results:
  ft.y-bt.n-pp.y-qe.y-et: 2.78
  ft.y-bt.n-pp.n-qe.y-et: 3.00
  ft.y-bt.n-pp.n-qe.n-et: 3.00
 ft.y-bt.n-pp.n-qe.n-csw: 3.33
  ft.y-bt.n-pp.n-qe.n-cs: 3.33
  ft.y-bt.n-pp.n-qe.y-cs: 3.44
 ft.y-bt.n-pp.y-qe.y-csw: 3.89
 ft.y-bt.n-pp.n-qe.y-csw: 4.00
  ft.y-bt.n-pp.y-qe.n-et: 4.11
  ft.y-bt.y-pp.n-qe.y-et: 4.11
  ft.y-bt.y-pp.y-qe.y-cs: 4.22
 ft.y-bt.y-pp.n-qe.y-csw: 4.22
 ft.y-bt.y-pp.y-qe.y-csw: 4.25
 ft.y-bt.y-pp.n-qe.n-csw: 4.33
  ft.y-bt.n-pp.y-qe.n-cs: 4.38
  ft.y-bt.y-pp.y-qe.n-et: 4.44
 ft.y-bt.y-pp.y-qe.n-csw: 4.44
  ft.y-bt.n-pp.y-qe.y-cs: 4.56
 ft.y-bt.n-pp.y-qe.n-csw: 4.56
  ft.y-bt.y-pp.y-qe.y-et: 4.56
  ft.y-bt.y-pp.n-qe.y-cs: 4.62
  ft.y-bt.y-pp.n-qe.n-et: 4.67
  ft.y-bt.y-pp.n-qe.n-cs: 4.67
  ft.y-bt.y-pp.y-qe.n-cs: 4.75
```