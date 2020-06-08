### How-to

Get and process logs:

```
cat blowing-0.log foster-* keyword-* legend-* quarter-0.log romaine-* speaker-* strain-* | grep CONFIRM_OK | cut -d, -f3,7 | cut -d# -f2 > partial_confirm_ok_results
```

Run processing as:

```
./main.py partial_confirm_ok_results
```

### Results:

```
Histogram:
[(1, 16), (2, 31), (3, 64), (4, 100), (5, 210)]

Piece-wise results:
 bt.n: 3.80
 pp.n: 3.95
 qe.y: 3.98
   et: 4.02
 ft.y: 4.09
 qe.n: 4.19
   cs: 4.19
 pp.y: 4.22
 bt.y: 4.38

Complex results:
  ft.y-bt.n-pp.n-qe.y-et: 3.06
 ft.y-bt.n-pp.n-qe.n-csw: 3.53
  ft.y-bt.n-pp.n-qe.y-cs: 3.53
  ft.y-bt.n-pp.y-qe.y-et: 3.56
  ft.y-bt.n-pp.n-qe.n-cs: 3.71
  ft.y-bt.n-pp.n-qe.n-et: 3.72
 ft.y-bt.n-pp.n-qe.y-csw: 3.89
 ft.y-bt.y-pp.n-qe.y-csw: 3.94
 ft.y-bt.n-pp.y-qe.y-csw: 3.94
  ft.y-bt.n-pp.y-qe.n-cs: 4.12
  ft.y-bt.n-pp.y-qe.n-et: 4.17
 ft.y-bt.n-pp.y-qe.n-csw: 4.18
 ft.y-bt.y-pp.y-qe.y-csw: 4.19
  ft.y-bt.y-pp.n-qe.y-et: 4.21
  ft.y-bt.n-pp.y-qe.y-cs: 4.21
  ft.y-bt.y-pp.y-qe.y-cs: 4.29
  ft.y-bt.y-pp.y-qe.n-et: 4.35
  ft.y-bt.y-pp.n-qe.y-cs: 4.38
 ft.y-bt.y-pp.y-qe.n-csw: 4.39
 ft.y-bt.y-pp.n-qe.n-csw: 4.39
  ft.y-bt.y-pp.n-qe.n-et: 4.50
  ft.y-bt.y-pp.y-qe.y-et: 4.56
  ft.y-bt.y-pp.n-qe.n-cs: 4.56
  ft.y-bt.y-pp.y-qe.n-cs: 4.75
```