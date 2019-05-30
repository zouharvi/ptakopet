![Ptakopět logo](logo.png)

# Future improvements ideas

While Ptakopět passed as a semestral project, there are many improvements, which could be implemented.

## Language pairs
So far Ptakopět supports only _en-es_ (QuEst++) and _en-de_ (deepQuest). Especially the later model can be utilized with more language pairs.

## Better highlighting
The code on the frontend side has grown significally. Rewriting the whole code into something structured like TypeScript is necessary if more features in this direction are desired.

## Robust structure
So far everything is stored in one GitHub repository. This includes version 1, all models, docs, web, backend, etc. They need not to be tied together this way. For example the server at quest.ms.mff.cuni.cz does not need any code related to the web content. Spliting the whole project into repositories such as: `ptakopet-v1`, `ptakopet-web`, `ptakopet-docs`, `ptakopet-qe` and `ptakopet-v2` is necessary for future development.

## Automatic setup
Even though the installation is described in detail, it would be beneficial if (especially the quality estimation backend) contained scripts for automatic installation.