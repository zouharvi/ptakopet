# in domain
Popis problému technické podpoře.

- Po výběru souboru 3D CAD, který jste chtěli převést, se však v Trackeru zobrazí pouze položky, které jste předtím uložili.
- V programu se kurzor skrývá za kreslícím plátnem, ale stále zůstává aktivní a lze s ním např. provádět výběr a vytvářet okna.
- Není možné editovat text dvojím kliknutím.
- V exportovaném PDF dokumentu výchozím způsobem jsou chybějící části textu a symboly. Při výběru kódování Windows-1250 chybí zase jiné symboly.
- Při zapnutí programu se zobrazí načítací obrazovka, která posléze zmizí, ale program se nespustí.
- Při použití příkazu Duplicate se skript provede pouze na předtím uložených souborech.
- Příkaz Duplicate není dostupný pro formuláře pouze s jednou stránkou.
- Kontura vyznačeného objektu se vykresluje modrou linií, která ovšem splývá s označením vrstev. V předchozích verzích byl aktivní objekt zvýrazňován zelenou barvou.
- I přes výběr metrických jednotek v nastavení jsou rozměry plátna v imperiálních jednotkách (palce). Rozměry objektů ve scéně se však zobrazují správně. Po změně nastavení jste zkoušeli restartovat program i počítač, ale to problém nevyřešilo.
- Soubor "math.h" neobsahuje očekávané matematické konstanty (Math.PI atd.).
- Nelze editovat jednotlivá klíčová slova, pokud byl soubor alespoň jednou uložen.
- Nelze změnit kódování z Unicode na Windows-1250.
- Po exportování neuloženého souboru se v dialogovém okně Acrobat 3D Conversion nezobrazuje žádné nastavení a na tlačítko OK nelze kliknout. Po uložení daného souboru už dialogové okno funguje správně, ovšem toto není kýžené chování.
- Pokud je objekt složen z více komplexních komponent, velikost dialogového okna obsahující seznam těchto součástí je větší než velikost obrazovky. Z toho důvodu nelze s tímto oknem pracovat (nelze kliknout na tlačítka, neboť jsou mimo obrazovku). 
- Když nemá soubor vyplněné všechny numerické vlastnosti, pak se při škálování zobrazí "UNHANDLED EXCEPTION: Access Violation at 0x0000" a program se ukončí. Bohužel při znovuotevření soubory jsou všechny změny ztraceny.
- V dialogovém okně pro nastavení maximálních rozměrů stroje se při prvním zadání nevhodné hodnoty  zablokuje celý program a nelze chybnou hodnotu opravit.
- Tlačítko Zpět nelze zmáčknou vícekrát než třikrát.
- Příkazy "Importovat" a "Importovat nativně" jsou nefunkční. V programu nemají žádnou odezvu a i v detailním logu, který jste zkoušeli otevřít, nemají žádný záznam.
- Faktor měřítka může být zadán mezi 1.000 a 2.000. Zadáním vyšší hodnoty měřítka se dialog zavře a obraz ztmaví. Pro další práci je potřeba znovu otevřít nastavení a hodnotu upravit.
- Pokud zadáte absolutní URL, není přijímaný žádný protokol (např. https://www.cuni.cz, ani http://www.cuni.com).
- Pokud vytvoříte spojení přes dbConnect na SQL Server, program se ukončí, pokud existuje tabulka začínající číslem. Toto lze obejít, pokud se tyto tabulky přejmenují, ovšem v aktuálním projektu to není možné.
- Komponenta objektů na plátně neupravuje automaticky velikost nápovědy podle její délky. 
- Barevné reprezentace v Inspektoru jsou obráceně oproti skriptovacímu jazyku. V Inspektoru 0-0-0 je černá, zatímco ve skriptu 0-0-0 reprezentuje bílou barvu. Dle konvencí je to v Inspektoru správně a ve skriptu špatně.
- Do souboru nelze přidat ochrannou známku pro licenci projektu.
- Formát data nelze změnit z Měsíc-Den-Rok na Den-Měsíc-Rok.
- Při výběru nastavení Text > Nastavení pravopisu > Kontrola pravopisu se program ukončí.
- Patrně byl na naše počítače nainstalován chybný ovladač tiskárny. Při tisku libovolných dokumentů se tisknou prázdné stránky.
- Po přepnutí jazyka z angličtiny do češtiny je celý program lokalizován stále v angličtině. Restartování programu způsobí jen změnu položky v nastavení zpět do angličtiny.
- Překlepy v dokumentu jsou opravovány pomocí anglického slovníku a nikoliv českého. V nastavení chybí výběr jazyka.
- Při výběru nástroje Rozmazání začne obrazovka problikávat.
- Není možné otevřít obraz formátu BMP (pouze JPG a PNG).
- Import PDF vytvořených na jiných počítačích vždy skončí chybou "UNDEFINED SEQUENCE". 
- Při výběru skriptů nelze vybrat skript, který se nachází mimo adresář aktuálního projektu.
- U chybějících souborů při importu projektu lze sice kliknout na tlačítko Přeskočit, ale nemá žádný efekt.
- Česká diakritika se zobrazuje v textu pouze jako velké bílé obdelníky.

# out of domain
Něco podobného SQuAD 2.0, tj. vzít paragraf, vystřihnout nějakou faktickou informaci a nechat uživatele, ať se na něco zeptá.
Vznikl by tak dataset otázek pro češtinu.
Zároveň by se mohl vzít německý paragraf + přeložený do češtiny (v obou chybějící faktická část). Uživatel by pak znal kontext (byl by česky), ale musel by formulovat otázku.


## Praha 6 - Potřebuji vyřídit
- Osobní údaje shromažďujeme různými způsoby během své činnosti, a to jak on-line, tak off-line. Ke shromažďování údajů dochází při výkonu povinností městské části Praha 6 v rámci přenesené i samostatné působnosti, při *nákupu zboží či služeb, při uzavírání smluv nebo komunikaci s občany a ostatními subjekty*.
- Udržujeme ucelený systém informační bezpečnosti, jehož rozsah je úměrný *rizikům spojeným se zpracováváním údajů*. Tento systém je neustále přizpůsobován za účelem zmírnění provozních rizik a k ochraně osobních údajů při zohlednění uplatňovaných postupů.
- V souborech protokolů z našich serverů mohou být shromažďovány informace o tom, jakým způsobem uživatelé používají webové stránky. Mezi tyto údaje patří mimo jiné *název domény uživatele, jazyk, typ prohlížeče a operační systém, poskytovatel internetových služeb, adresa IP (internetový protokol) a rovněž čas strávený na našem webu*. 
- Údaje o používání webu můžeme sledovat a využívat k hodnocení *jeho výkonu a činnosti*, ke zlepšení jeho designu a funkcí nebo k bezpečnostním účelům.
- Na našich webových stránkách můžeme poskytovat odkazy na weby třetích stran. Propojené stránky nejsme povinni *hodnotit, kontrolovat ani zkoumat*. Každá propojená stránka může mít vlastní podmínky použití a prohlášení o ochraně osobních údajů. 
- Na svých webových stránkách můžeme rovněž používat službu *Google Analytics* ke shromažďování informací o on-line aktivitách uživatelů na webových stránkách, jako jsou například navštívené webové stránky, odkliknuté odkazy a provedená vyhledávání.
- Informace vytvořené těmito soubory cookie a vaše aktuální adresa IP budou přeneseny z vašeho internetového prohlížeče a budou uloženy na serverech v *Spojených státech* a dalších zemích. 
- Soubory cookie anonymně shromažďují informace, jako je počet návštěvníků na webu, odkud návštěvníci přišli a stránky, které navštívili. Tyto informace používáme k *sestavování zpráv a k vylepšování webu*.
- Petice musí být písemná a musí být pod ní uvedeno *jméno, příjmení a bydliště* toho, kdo ji podává. 
- Podle školského zákona jsou k předškolnímu vzdělávání přednostně přijímány děti v posledním roce před zahájením *povinné školní docházky*. 
- Sazby poplatku činí ročně: *1.500 Kč* za jednoho psa, 2.250 Kč za druhého a každého dalšího psa téhož držitele.
- Úhradu poplatku lze provést *hotově v pokladně úřadu, nebo převodem z účtu*. 
- Ohlášení tomboly s herní jistinou nad *100 000* Kč musí vedle obecných náležitostí podání podle správního řádu obsahovat název a popis ohlašované hazardní hry.
- Poplatek je splatný bez vyměření do *15* dnů po konání akce. 
- O pronájem bytu ze sociálních důvodů si může žádat občan, který se ocitl nikoliv vlastní vinou v obtížné sociálně bytové situaci a není schopen ji řešit vlastní silou při splnění podmínek, které jsou uvedeny v „Pravidlech pro *pronájem bytu ze sociálních důvodů*“.
- Zvláštní příjemce dávek důchodového pojištění se ustanovuje příjemci starobního důchodu, který zejména z důvodu *zdravotního stavu nebo věku* není sám schopen přijímat výplatu dávek důchodového pojištění ani s nimi hospodařit. 
- Podpora předškolní výchovy dětí do *3* let v zařízeních, které jsou specializované na tuto péči.
- Zvýhodněné stravování určené pro seniory starší 65 let s trvalým pobytem v Praze 6 ve vybraných školních jídelnách za *50* Kč.
- Obědy jsou dotovány z rozpočtu *MČ Praha 6*.
- Žádost o udělení občanství sepsaná žadatelem musí obsahovat: *jméno, příjmení, datum narození a místo trvalého pobytu*.
- Potvrzení o stavu závazků z Pražské správy sociálního zabezpečení nesmí být starší více než *30 dnů*, předkládá se v originále.
- Předkládá-li rozvedený manžel cizozemské doklady, je třeba, aby tyto měly náležitosti veřejné listiny, tj. musí být opatřeny potřebnými ověřeními, nestanoví-li *mezinárodní smlouva* jinak.
- Fyzická osoba, která má v matriční knize zapsáno *jedno jméno*, může před matričním úřadem prohlásit, že bude užívat dvě jména.
- Žadatel zaplatí 100 Kč při změně příjmení, které je hanlivé, výstřední, směšné, zkomolené nebo cizojazyčné. 
- Při povolení změny jména nebo příjmení v ostatních případech zaplatí žadatel *1 000* Kč.
- *Rodiče dítěte* vždy souhlasně prohlašují, kdo je otcem dítěte. 
- Církevní sňatek může být uzavřen po předložení *osvědčení vydaného matričním úřadem*, od jehož vydání neuplynulo více než šest měsíců, o tom, že snoubenci splnili všechny požadavky zákona pro uzavření platného manželství.
- Ke změně rozsahu živnostenského oprávnění pro živnost řemeslnou, vázanou a koncesovanou se přikládají doklady prokazující *odbornou a jinou* způsobilost podnikatele. 
- V případě, že sídlo bude odlišné od *bydliště*, je potřeba doložit doklad prokazující právní důvod užívání prostor v nichž bude sídlo umístěno. 
- Povolení ke kácení dřevin rostoucích mimo les o obvodu kmene větším než *80* cm.
