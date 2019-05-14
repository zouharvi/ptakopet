![Ptakopět logo](logo.png)

# Issues

Issues are tracked via [https://github.com/zouharvi/ptakopet](GitHub Issues). Notable issues are listed here.

## cors.io

Because of missing `Access-Control-Allow-Origin` header on the Khresmoi translator backend, we must use a proxy, such as [cors.io](cors.io). This is considered unsafe and software such as Avast will notify the users of this behavior.

## Not secure

[https://ptakopet.vilda.net](ptakopet.vilda.net) does have a valid SSL certificate, but makes requests to unsafe servers (most importantly to `quest.ms.mff.cuni.cz/zouharvi`)