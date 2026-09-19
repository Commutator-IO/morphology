# Morphologie — index du cours de Jean-François Debord

Index de travail pour le [cours de morphologie de Jean-François Debord][playlist],
filmé aux Beaux-Arts de Paris et publié par l'Université PSL : 43 séances,
environ 74 heures.

Le site répond à une question précise — *où, dans ces 74 heures, Debord
parle-t-il de ça ?* — et à rien d'autre. Il ne résume pas le cours, ne le
reformule pas et ne l'héberge pas.

**<https://morphologie.commutator.io>**

## Ce qu'on y trouve

| Page | Contenu |
|---|---|
| `/` | 95 termes d'anatomie et de morphologie, chacun horodaté dans les séances |
| `/references/` | 63 références artistiques — peintres, sculpteurs, anatomistes, musées, œuvres |
| `/seances/` | Les 43 séances rangées par région du corps |
| `/methode/` | Comment l'index est construit, et ce qu'il vaut |

Sur téléphone, un horodatage ouvre la séance dans YouTube. Sur grand écran, il
la place dans un lecteur à droite de la liste, sans quitter l'index.

## Ce qui est publié, et ce qui ne l'est pas

Les sous-titres automatiques des séances servent à fabriquer l'index, puis
restent dans `transcripts/`, qui n'est pas versionné. Le dépôt ne contient que
des données dérivées : identifiants de vidéo, identifiants de terme et
horodatages en secondes. Les définitions et les notices sont écrites pour ce
site.

C'est aussi ce qui permet à la CI de construire le site sans disposer des
transcriptions.

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

`scripts/frequences.mjs` sert à la mise au point du lexique : il montre ce que la
transcription écrit réellement, ce qui évite d'inventer des variantes qui
n'existent pas — et d'en oublier qui existent.

## Développer

```bash
npm ci
npm run dev
npm run lint && npm test && npm run build
```

Les tests portent sur la cohérence de l'index publié : tout horodatage tombe dans
la durée de sa séance, les comptes affichés correspondent aux horodatages, et
aucune référence n'est listée sans mention.

## Sources

Le cours appartient à ses auteurs. Ce dépôt n'en redistribue rien.

- [La playlist, sur la chaîne de l'Université PSL][playlist]
- Jean-François Debord a tenu la chaire de morphologie de l'École nationale
  supérieure des beaux-arts de Paris, à la suite de Paul Richer et Mathias Duval.

[playlist]: https://www.youtube.com/playlist?list=PLYnh6UuzuHLtlgap6QPtov3MhLmWeIrEp
