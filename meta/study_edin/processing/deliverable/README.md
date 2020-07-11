### How-to

Get and process logs into `logs`. Run processing as:

```
./preliminary.sh
```

### Results:

```
Lines:    27771
Blocks:   84
Segments: 573
```

#### No Czech knowledge people || Estonian model
```
Rating histogram:
[(1, 16), (2, 58), (3, 97), (4, 118), (5, 141)]

Piece-wise results:
 bt.n: 3.42
  csw: 3.47
 pp.n: 3.65
 qe.n: 3.70
 ft.y: 3.72
 qe.y: 3.75
 pp.y: 3.80
   cs: 3.81
   et: 3.83
 bt.y: 4.03

Complex results:
  ft.y-bt.n-pp.n-qe.y-et: 3.00
 ft.y-bt.n-pp.y-qe.n-csw: 3.11
 ft.y-bt.n-pp.y-qe.y-csw: 3.29
 ft.y-bt.n-pp.n-qe.y-csw: 3.31
 ft.y-bt.n-pp.n-qe.n-csw: 3.32
  ft.y-bt.n-pp.n-qe.n-et: 3.39
  ft.y-bt.n-pp.n-qe.n-cs: 3.41
  ft.y-bt.n-pp.n-qe.y-cs: 3.44
  ft.y-bt.n-pp.y-qe.y-et: 3.45
  ft.y-bt.n-pp.y-qe.n-cs: 3.56
 ft.y-bt.y-pp.n-qe.n-csw: 3.63
 ft.y-bt.y-pp.y-qe.n-csw: 3.71
 ft.y-bt.y-pp.n-qe.y-csw: 3.73
 ft.y-bt.y-pp.y-qe.y-csw: 3.82
  ft.y-bt.n-pp.y-qe.n-et: 3.88
  ft.y-bt.y-pp.y-qe.n-cs: 3.89
  ft.y-bt.n-pp.y-qe.y-cs: 3.92
  ft.y-bt.y-pp.n-qe.n-et: 3.97
  ft.y-bt.y-pp.y-qe.y-cs: 4.11
  ft.y-bt.y-pp.n-qe.n-cs: 4.15
  ft.y-bt.y-pp.y-qe.n-et: 4.16
  ft.y-bt.y-pp.n-qe.y-cs: 4.18
  ft.y-bt.y-pp.n-qe.y-et: 4.27
  ft.y-bt.y-pp.y-qe.y-et: 4.45
```

#### Some Czech knowledge && Czech Model
```
Rating histogram:
[(1, 4), (2, 12), (3, 17), (4, 29), (5, 78)]

Piece-wise results:
 bt.n: 3.93
 pp.n: 3.99
  csw: 4.13
 qe.y: 4.14
 ft.y: 4.18
 qe.n: 4.21
   cs: 4.23
 pp.y: 4.38
 bt.y: 4.43

Complex results:
 ft.y-bt.n-pp.n-qe.n-csw: 3.33
  ft.y-bt.n-pp.n-qe.n-cs: 3.33
  ft.y-bt.n-pp.n-qe.y-cs: 3.44
 ft.y-bt.n-pp.y-qe.y-csw: 3.89
 ft.y-bt.n-pp.n-qe.y-csw: 4.00
  ft.y-bt.y-pp.y-qe.y-cs: 4.22
 ft.y-bt.y-pp.n-qe.y-csw: 4.22
 ft.y-bt.y-pp.y-qe.y-csw: 4.25
 ft.y-bt.y-pp.n-qe.n-csw: 4.33
  ft.y-bt.n-pp.y-qe.n-cs: 4.38
 ft.y-bt.y-pp.y-qe.n-csw: 4.44
  ft.y-bt.n-pp.y-qe.y-cs: 4.56
 ft.y-bt.n-pp.y-qe.n-csw: 4.56
  ft.y-bt.y-pp.n-qe.y-cs: 4.62
  ft.y-bt.y-pp.n-qe.n-cs: 4.67
  ft.y-bt.y-pp.y-qe.n-cs: 4.75
```