# Morphologie — index du cours de Jean-François Debord

Index de travail pour le [cours de morphologie de Jean-François Debord][playlist],
filmé aux Beaux-Arts de Paris et publié par l'Université PSL : 45 séances,
environ 77 heures.

Le site répond à une question précise — _où, dans ces 77 heures, Debord
parle-t-il de ça ?_ — et à rien d'autre. Il ne résume pas le cours, ne le
reformule pas et ne l'héberge pas.

**<https://morphologie.commutator.io>**

## Ce qu'on y trouve

| Page           | Contenu                                                                         |
| -------------- | ------------------------------------------------------------------------------- |
| `/`            | 109 termes d'anatomie et de morphologie, chacun horodaté dans les séances       |
| `/references/` | 73 références — peintres, sculpteurs, anatomistes, musées, œuvres               |
| `/digressions/` | 122 moments où le cours sort de son sujet, dont 71 décrits                      |
| `/seances/`    | Les 45 séances rangées par région du corps                                      |
| `/lignee/`     | 23 figures : les livres qu'il ouvre, la chaire avant lui, et ceux qu'il a formés |
| `/methode/`    | Comment l'index est construit, et ce qu'il vaut                                 |
| `/mentions/`   | Éditeur, droits sur le cours, procédure de retrait                              |

12 160 horodatages en tout. Sur téléphone, un horodatage ouvre la séance dans
YouTube. Sur grand écran, il la place dans un lecteur à droite de la liste, sans
quitter l'index.

L'onglet `/digressions/` ne recueille pas un florilège
de bons mots : Debord enseigne de vive voix, deux heures sans notes, et ces
écarts sont ses outils de pédagogue.

## Ce qui est publié, et ce qui ne l'est pas

Les sous-titres automatiques des séances servent à fabriquer l'index, puis
restent dans `transcripts/`, qui n'est pas versionné. Le dépôt ne contient que
des données dérivées : identifiants de vidéo, identifiants de terme et
horodatages en secondes. Les définitions et les notices sont écrites pour ce
site.

C'est aussi ce qui permet à la CI de construire le site sans disposer des
transcriptions.

Le cours n'est pas sous licence ouverte : le catalogue Bibnum porte la mention
« Tous droits réservés » et nomme trois détenteurs. Les [mentions
légales](https://morphologie.commutator.io/mentions/) exposent la position du
site et ouvrent un retrait sous 48 heures à tout ayant droit.

## Construire l'index

```bash
# 1. Récupérer les sous-titres (une fois ; ~59 Mo, non versionnés)
mkdir -p transcripts && cd transcripts
yt-dlp --flat-playlist --print "%(id)s" "$PLAYLIST" | while read -r id; do
  yt-dlp --skip-download --write-auto-subs --sub-langs fr-orig \
         --sub-format json3 -o "%(id)s" -- "https://www.youtube.com/watch?v=$id"
done

# 2. Recalculer les deux index à partir du lexique et des références
npm run indexer
```

Le `--` avant l'URL n'est pas décoratif : deux identifiants de la playlist
commencent par un tiret, et sans lui ils sont lus comme des options.

**La playlist ne suffit pas.** Elle compte 43 vidéos, alors que le catalogue
Bibnum de PSL décrit 45 séances. Les deux manquantes — _Les deux membres
inférieurs en vue latérale_ (`BZMmmc3HVto`) et _Le bras en vue postérieure_
(`qWn9BntEhyU`) — sont publiées sur la même chaîne, hors playlist. Elles portent
les rangs 44 et 45 et le drapeau `horsPlaylist`, parce que leur numéro ne
prétend à aucune place dans l'ordre du cours.

`scripts/frequences.mjs` sert à la mise au point du lexique : il montre ce que la
transcription écrit réellement, ce qui évite d'inventer des variantes qui
n'existent pas — et d'en oublier qui existent. C'est indispensable, la
reconnaissance vocale écrivant « sézanne » pour Cézanne, « gaulle sus » pour
Goltzius ou « frédéric de la vieille » pour Frédéric Delavier.

## Développer

```bash
npm ci
npm run dev
npm run lint && npm test && npm run build
```

Les tests portent sur la cohérence de l'index publié : tout horodatage tombe dans
la durée de sa séance, les comptes affichés correspondent aux horodatages, et
aucune référence n'est listée sans mention.

Trois garde-fous méritent d'être connus avant de toucher aux données, parce
qu'ils encodent des erreurs déjà commises :

- **Les homonymes du vocabulaire.** « carpeaux » transcrit _carpo-_, « courbet »
  le verbe _courber_, « poussin » un fléchisseur du pouce. Aucun de ces mots ne
  peut servir de variante à lui seul. Poussin figure au relevé — Debord le cite
  une fois, aux côtés du Tintoret — mais par une locution qui isole ce passage.
- **Les domaines de musée.** Seuls les domaines ouverts et vérifiés à la main
  sont admis. Le Louvre, le Mauritshuis et Bibnum opposent une vérification
  anti-robot à toute requête automatique : un contrôle par code HTTP ne
  prouverait rien, il faut ouvrir la page et lire son titre.
- **Les notices de digression.** Trois phrases au plus, et aucun champ hors de
  la liste blanche.

La règle qui les résume : une référence n'entre au relevé que si elle est citée,
fût-ce approximativement, et l'on n'ajoute jamais une variante sans avoir lu les
passages qu'elle ramène.

## Sources

Le cours appartient à ses auteurs. Ce dépôt n'en redistribue rien.

- [La playlist, sur la chaîne de l'Université PSL][playlist]
- [Le catalogue Bibnum de l'Université PSL][bibnum] — 45 notices documentaires,
  chapitrées et indexées à la main. C'est la référence, et elle est meilleure que
  la nôtre sur ce qu'elle couvre ; on y renvoie plutôt que de la refaire.
- Jean-François Debord a tenu la chaire de morphologie de l'École nationale
  supérieure des beaux-arts de Paris, à la suite de Paul Richer et Mathias Duval.
- Les séances ont été réalisées par Cyril de Turckheim.

[playlist]: https://www.youtube.com/playlist?list=PLYnh6UuzuHLtlgap6QPtov3MhLmWeIrEp
[bibnum]: https://bibnum.explore.psl.eu/s/psl/ark:/18469/290s8
