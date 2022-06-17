# Kio estas JSON-filtriloj kaj kiel ili uzeblas?
## Kio estas datumoj?
En AKSO datumo estas ekz. membro, revuo, revua numero ktp.

## Kiel AKSO strukturigas datumojn?
En AKSO datumon ni nomas *resurso*. Aro de resursoj nomiĝas *kolekto*. Ekzemple do iu specifa membro estas resurso en la kolekto membroj.

## Kiel funkcias filtrado en kolektoj?
Nur kolektoj povas esti filtritaj por trovi specifajn resursojn. Ne sencas filtri resurson.

Uzante la »facilajn filtrilojn« en AKSO-Administranto, la sistemo fakte konvertas viajn agorditajn filtrilojn en la grafika interfaco al JSON-filtrilo. Tiele, interne, ekzistas efektive nur JSON-filtriloj, kaj ĉio alia estas abstrakto super ili, kiu celas plifaciligi la uzon de AKSO.

## Kiel aspektas JSON?
JSON (prononcita *ĝei-son*) estas datumformato tute kiel ekz. kalkultabeloj, nur ĝi estas uzata por celoj, kie la datumoj estu facile legeblaj de komputilo.

JSON-objekto povas aspekti ekz. jene:
```json
{
	"nomo": "Zamenhof",
	"koloroj": [
		"blua",
		"ruĝa"
	]
}
```

En tiu ĉi objekto estas du ŝlosiloj: »nomo« kaj »koloroj«. Pensu pri ŝlosilo kiel la nomo de io—tio kion vi uzas por referenci ion. Tio kio venas post la dupunkto estas la valoro.

- La valoro de la ŝlosilo »nomo« estas la teksto »Zamenhof«. 
- La valoro de la ŝlosilo »koloroj« estas listo. Tiu listo enhavas du tekstojn: »blua« kaj »ruĝa«.

Ĉiuj paroj de ŝlosilo + valoro devas esti interdividitaj je komo (`,`).

Ĉiu ŝlosilo devas havi unu kaj nur unu valoron. Valoro povas esti de unu el la jenaj specoj:

- Teksto, ekz. `"Zamenhof"`, kiu devas esti enkadrigita per `" "`; aŭ
- Nombro, ekz. `12` aŭ `7.5` (uzu punkton ne komon maldekstre de decimaloj); aŭ
- Buleo, `true` (vera/jes) aŭ `false` (falsa/ne); aŭ
- Senvaloraĵo, `null` por indiki ke tiu ĉi ŝlosilo ne havas valoron (uzata ekz. kiam la valoro mankas); aŭ
- Listo, ekz. `[ "blua", 12, true, "ruĝa" ]`, kiu devas esti enkadrigita per `[ ]`. Ĉiuj valoroj en la listo devas esti interdividitaj per komo (`,`). Ne rajtas esti fina punkto; aŭ
- Objekto. Ĉiu ŝlosilo ankaŭ povas havi propan objekton kiel valoron. Ekzemplo:
```json
{
	"homoj": {
		"Zamenhof": {
			"naskiĝtago": "1859-12-15",
			"plej-ŝatata-koloro": "verda"
		},
		"Grundtvig": {
			"naskiĝtago": "1783-09-8",
			"plej-ŝatata-koloro": "ruĝa"
		}
	}
}
```

## Kiel funkcias kaj aspektas simpla JSON-filtrilo?
Ĉiu JSON-filtrilo estas simpla JSON-objekto (enkadrigita per `{ }`).

La kolekto kiu estas filtrita laŭ la donita JSON-filtrilo enhavas nur resursojn, kiuj laŭas la JSON-filtrilon. Ni konsideru simplan ekzemplan JSON-filtrilon por membroj.

```json
{
	"age": 97,
	"address.country": "kh"
}
```

Filtrante membrojn laŭ tiu JSON-filtrilo donos al vi kolekton nur de membro-resursoj kiuj havas 97 jarojn kaj loĝlandon Kamboĝo. Notu, ke la aĝo (97) ne estas enkadrigita per `" "` ĉar ĝi estas nombro, ne teksto.

Ne eblas uzi listojn kiel valoron en JSON-filtrilo. Por scii kiel filtri listojn en resursoj, daŭrigu la legadon.

La API de AKSO, kiu estas la leganto de ĉiu JSON-filtrilo, uzas la anglan por la nomoj de ĉiuj kampoj. Por trovi la nomon de kampo estas du manieroj:

- Kreu facilan filtrilon kaj konvertu ĝin al JSON-filtrilo. Ĝi tuj montros al vi la anglan nomon de la kampo **(rekomendita)**.
- [Legu la teĥnikan dokumentigon](https://dok.akso.org) (en la angla) pri la koncerna resurso. Ĉiuj resursoj troveblas ĉe `GET`-petoj.

## Pli komplikaj JSON-filtriloj (komparaj operacioj)
Ĉiu ŝlosilo ankaŭ povas havi objektan valoron, kiu enhavas pli komplikajn filtro-instrukciojn. Ni rigardu ekzemplon:

```json
{
	"age": {
		"$gt": 40,
		"$lte": 55
	}
}
```

Filtrante membrojn laŭ tiu JSON-filtrilo vi ricevos kolekton de ĉiuj membroj, kiuj havas pli ol 40 jaroj, sed malpli ol 55 jaroj aŭ ekzakte 55 jarojn.

Kaj `$gt` kaj `$lte` estas tiel-nomataj *komparaj operacioj*. Jen listo de ĉiuj komparaj operacioj:

- `$eq` — Ekzakta egalo. Elfiltras ĉion kio *ne* havas la ekzaktan donitan valoron.  
Akceptas nur valoron kiu estas teksto, nombro, buleo aŭ `null`.  
- `$neq` — Neegaleco. Elfiltras ĉion kio *ja* havas la ekzaktan donitan valoron.  
Akceptas nur valoron kiu estas teksto, nombro, buleo aŭ `null`.
- `$pre` — Komenca valoro. Elfiltras ĉion kio *ne* komenciĝas je la donita teksto. Ekz. `$pre: "ak"` elfiltrus la valorojn `"bonuso"` kaj `"monstro"` sed *ne* elfiltrus la valorojn `"akvo"` kaj `"akcio`.  
Akceptas nur valoron kiu estas teksto.
- `$range` — Intervalo. Elfiltras ĉion kio havas valoron ekster la donita inkluziva intervalo. Ekz. `$range: [ 20, 40 ]` elfiltrus ĉiujn valorojn malpli grandajn ol 20 aŭ pli grandajn ol 40.  
Akceptas nur valoron kiu estas listo de du nombroj aŭ datoj kiel teksto (ekz. `2022-12-31` por la lasta tago de la jaro 2022).
- `$gt` — Pli granda ol x. Elfiltras ĉion *krom* tio kio havas valoron pli grandan ol la donita valoro.  
Akceptas nur valoron kiu estas nombro.
- `$gte` — Pli granda ol x aŭ identa al x. Elfiltras ĉion *krom* tio kio havas valoron pli grandan ol aŭ identa al la donita valoro.  
Akceptas nur valoron kiu estas nombro.
- `$lt` — Malpli granda ol x. Elfiltras ĉion *krom* tio kio havas valoron malpli grandan ol la donita valoro.  
Akceptas nur valoron kiu estas nombro.
- `$lte` — Malpli granda ol x aŭ identa al x. Elfiltras ĉion *krom* tio kio havas valoron malpli grandan ol aŭ identa al la donita valoro.  
Akceptas nur valoron kiu estas nombro.
- `$in` — Havas valoron el la jena listo. Elfiltras ĉion *krom* tio kio havas valoron kiu troveblas ankaŭ en la donita listo. Ekz. `$in: [ "blua", "ruĝa", 13 ]` elfiltrus la valorojn `"verda"` kaj `15` sed *ne* elfiltrus la valorojn `"blua"`, `"ruĝa"` aŭ `13`.  
Akceptas nur valoron kiu estas listo kiu enhavas valorojn kiuj estas teksto, nombro, buleo aŭ `null`.
- `$nin` — Ne havas valoron el la jena listo. Faras la malon de `$nin`.  
Akceptas nur valoron kiu estas listo kiu enhavas valorojn kiuj estas teksto, nombro, buleo aŭ `null`.

## Logikaj operacioj
Krom la komparaj operacioj ekzistas ankaŭ *logikaj operacioj*. Logika operacio malkiel komparaj operacioj ne estas uzataj sur specifa ŝlosilo por filtri laŭ ties valoro, sed por fari kondiĉan filtradon. Ni rigardu ekzemplon:

```json
{
	"$or": [
		{ "age": 97 },
		{ "age": 34 }
	]
}
```

Tiu JSON-filtrilo elfiltros ĉiujn membrojn kiuj ne aĝas 97 aŭ 34 jarojn.

Ni vidu pli komplikan ekzemplon:

```json
{
	"$or": [
		{
			"age": {
				"$range": [ 35, 45 ]
			},
			"address.country": "se"
		},
		{
			"address.country": "no"
		}
	],
	"$not": {
		"firstName": "Hans",
		"isDead": true
	}
}
```

Tiu ĉi JSON-filtrilo elfiltros ĉiujn membrojn kiuj:

1. Ne plenumas minimume unu el la jenaj subpunktoj:
	1. Aĝas inter 35 kaj 45 (inkluzive) KAJ loĝas en Svedio.
	2. Loĝas en Norvegio.
2. Havas la personan nomon » Hans « kaj estas mortinta. Se oni nur nomiĝas Hans aŭ nur estas mortinta, sed ne ambaŭ, oni *ne* estos elfiltrita.

La plena listo de logikaj operacioj estas:

- `$or` — aŭ: Elfiltras ĉion kio *ne* laŭas almenaŭ unu el la filtriloj en la donita listo.  
Akceptas kiel valoron nur liston de JSON-filtrilaj objektoj.
- `$not` — ne: Elfiltras ĉion kio *ja* laŭas la donitan filtrilon.  
Akceptas kiel valoron nur JSON-filtrilan objekton.
- `$and` — kaj: Elfiltras ĉion kio *ne* laŭas ĉiujn filtrilojn en la donita listo. **Notu:** Tiu ĉi logika operacio ekzistas nur pro kompleteco. Oni neniam bezonas uzi `$and`, ĉar simpla filtrila objekto kun pluraj kampoj (ŝlosiloj) jam estas interpretata kiel implica `$and`. Se oni kreas tre grandan kaj komplikan filtrilon, eventuale `$and` povas utili pro legeblecaj kialoj.  
La jenaj du JSON-filtriloj estas ekzakte egalaj:
```json
{
	"age": 25,
	"firstName": "Hans"
}
```
kaj
```json
{
	"$and": [
		{
			"age": 25
		},
		{
			"firstName": "Hans"
		}
	]
}
```  
Akceptas kiel valoron nur liston de JSON-filtrilaj objektoj.

## Nevalidaj JSON aŭ JSON-filtrilo
Se vi ricevas eraron de AKSO-administranto pro via JSON-filtrilo, estas tre verŝajna, ke tio okazas pro *sintaksa eraro* en la JSON. Por kontroli ĉu via JSON estas valida, vi povas uzi [interretan validigilon](https://jsonlint.com/). Alguu en la grandan kampon vian JSON-filtrilon kaj alklaku la butonon » Validate JSON «. Sube de la butono granda skatolo kun la teksto » Valid JSON « se via filtrilo estas sintakte ĝusta. Se ĝi estas sintakse malĝusta, la skatolo estos ruĝa kaj enhavos anglalingvan klarigon pri la eraro.

Sintakse valida JSON ne nepre estas sintakse valida JSON-filtrilo. Se via JSON-filtrilo estas sintakse valida kaj tamen rezultas je eraro en AKSO-administranto, tio tre verŝajne signifas ke estas eraro en la sintakso de la JSON-filtrilo (sed ne en la JSON mem). Kontrolu ke ĉiu parentezo (`[ ]` aŭ `{ }`) havas paron kaj ke ĉiu valoro estas interdividita je komo.

Same memoru, ke teksto ĉiam devas esti en citiloj (`" "`). Se en la teksto vi bezonas uzi citilojn, tion vi devas fari enskribante `\"`. Tion la sistemo komprenos kiel simplan citilon, kiu ne celas fini la tekston. Ekzemple por filtri laŭ la teksto » la revuo "Esperanto" « oni skribu `"la revuo \"Esperanto\""`. Notu la finan duoblan citilon.

## Pli facilaj JSON-filtriloj en AKSO-Administranto
Uzantoj de JSON-filtriloj en AKSO-Administranto povas fari kelkajn aferojn pli facile ol tiuj kiuj uzas JSON-filtrilojn ekster AKSO-Administranto.

Notu, ke tiuj ĉi » trikoj « nur aplikiĝas al JSON-filtriloj en AKSO-Administranto. La trikoj ankaŭ funkcias en konservitaj filtriloj, sed nur se ili estas kaj kreitaj per AKSO-Administranto kaj uzataj per AKSO-Administranto.

En JSON-filtriloj en AKSO-Administranto uzeblas ĉiuj plifaciligoj de JSON5 ([pli da informoj anglalingve](https://json5.org/)), ekz. komentoj, malpli striktaj komoj, pli facilaj tekstoj (valoro), neniuj citiloj ĉirkaŭ ŝlosiloj kaj pli. Ni vidu ekzemplon de JSON5-filtrilo:

```json5
{
	// Persona nomo devas esti Hans
	firstName: "Hans",
	// Aĝo devas esti malpli ol 40 (ekskluziva)
	age: {
		$lt: 40
	},
	// Loĝlando devas esti Palestino
	"address.country": "ps",
}
```

Rimarku, ke la ŝlosiloj (kampoj) ne estas enkadrigitaj je citiloj (`" "`) krom por `address.country` (loĝlando). En JSON5 citiloj estas nur divigaj por ŝlosiloj enhavantaj je neliteraj signoj, kiel ekz. punkto.

JSON5 ankaŭ permesas komentojn, kiuj estas konservitaj ankaŭ en konservitaj filtriloj. Komentoj utilas por klarigi kion faras la linio(j) sub la komento mem, kiam la filtrilo estas pli komplika. Se vi timas forgesi kial vi skribis ion precipmaniere aŭ kion io faras, aldonu komento(j)n.

Krome, AKSO-Administranto havas kelkajn ŝablonajn valorojn, kiu je uzo iĝos difinita valoro. Ekzemple eblas filtri ke iu jaro egalu al la nuna jaro. Se oni konservas tiun filtrilon kaj poste reuzas ĝin en alia jaro, la jaro aŭtomate estos ŝanĝita al nova jaro.
