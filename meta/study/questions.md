### in domain
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
- Do projektu nelze přidat ochrannou známku.
- Formát data nelze změnit z Měsíc-Den-Rok na Den-Měsíc-Rok.

### out of domain
Něco podobného SQuAD 2.0, tj. vzít paragraf, vystřihnout nějakou faktickou informaci a nechat uživatele, ať se na nic zeptá.
Vznikl by tak dataset otázek pro češtinu.

- Životní situace Praha 6

Zároveň by se mohl vzít německý paragraf + přeložený do češtiny (v obou chybějící faktická část). Uživatel by pak znal kontext (byl by česky), ale muse lby formulovat otázku.
