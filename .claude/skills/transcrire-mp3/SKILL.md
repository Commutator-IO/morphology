---
name: transcrire-mp3
description: Transcrit un fichier audio (mp3) en français avec Whisper, en local sur Mac (mlx-whisper), et produit un JSON au format json3 lu par scripts/corpus.mjs, avec horodatage. À utiliser pour les fonds sans sous-titres YouTube, notamment les Conférences de l'École des Beaux-Arts de Bibnum (issue 1), ou quand on demande « transcris ce mp3 ».
---

# Transcrire un mp3 (Whisper local)

Claude ne peut pas écouter l'audio : ce skill lance un moteur de reconnaissance
vocale local et traite le texte produit. Rien n'est envoyé à un service tiers.

## Règles du projet, à respecter avant toute commande

- **Les transcriptions ne sont jamais publiées.** Sorties dans
  `transcripts/bibnum/`, sous `transcripts/`, gitignoré. Ne jamais les committer,
  ni les coller dans une issue, une page ou un message.
- **Ne pas résumer ni reformuler** le contenu. On transcrit, on indexe, on renvoie.
- **Bibnum : citer et lier, ne jamais moissonner.** Ne télécharger que le ou les
  mp3 que Michel a désignés. Pas de téléchargement en masse sans accord
  explicite, à confirmer à chaque fois. Ces enregistrements sont « Tous droits
  réservés », l'artiste est le détenteur.
- **Pas d'API cloud** (OpenAI, Deepgram…) : envoyer ces enregistrements à un tiers
  reviendrait à les redistribuer.
- **Aucun horodatage écrit sans l'avoir calculé** depuis le fichier produit.
- **Déformation phonétique de l'ASR** : c'est la prononciation qui tranche, donc
  Michel à l'oreille, jamais le contexte. Livrer les passages avec leurs
  horodatages plutôt que de les corriger soi-même.

## Utilisation

```bash
.claude/skills/transcrire-mp3/scripts/transcrire.sh <audio.mp3> <id> [modele]
```

- `<id>` : l'identifiant `ark` de la notice Bibnum (ex. `2nhq0`).
- `[modele]` : par défaut `mlx-community/whisper-large-v3-turbo` (environ 1,6 Go).
  `mlx-community/whisper-large-v3-mlx` est meilleur en français mais pèse 3 Go :
  sur un Mac à 8 Go de RAM, il est juste. Ne le choisir que si Michel le demande.

Le script produit dans `transcripts/bibnum/` :

- `<id>-whisper.json` : sortie brute de Whisper, avec les horodatages au mot ;
- `<id>.fr-orig.json3` : événements par segment (`tStartMs`, `dDurationMs`,
  `segs[].utf8`), même forme que les sous-titres YouTube.

Ce qu'il fait : ffmpeg (mono 16 kHz, volume normalisé, **sans débruitage**),
puis `mlx_whisper` via `uvx --python 3.12`, langue forcée à `fr`,
`condition_on_previous_text=False` (évite les boucles sur les fichiers longs).

## Trouver le mp3 d'une séance

`beaux-arts-mp3.csv` (dans ce dossier) liste les 149 séances des Conférences de
l'École des Beaux-Arts : `ark`, titre, durée en secondes, notice, URL du mp3.

```bash
awk -F, -v a=2nhq0 '$1==a{print $NF}' .claude/skills/transcrire-mp3/beaux-arts-mp3.csv
```

Usage prévu : une séance à la fois, à la demande de Michel. Télécharger avec
`curl -L -o <ark>.mp3 <url>`, transcrire, puis **supprimer le mp3** (environ
20 Mo par quart d'heure). Rythme mesuré : environ 3,9 fois la vitesse réelle
avec le modèle turbo, soit 16 min de calcul pour 1 h d'audio sur un Mac M2 à 8 Go.

## Points d'attention

- **Bibnum** : le mp3 d'une notice se trouve dans son manifeste IIIF
  (`https://bibnum.explore.psl.eu/iiif/3/<ark>/manifest`), pas dans la page HTML.
  Le nom du fichier ne se déduit pas de l'`ark`.
- **ffmpeg** : le script vérifie qu'il s'exécute. S'il échoue avec une erreur
  `dyld` (bibliothèque manquante), le ffmpeg Homebrew est cassé : le signaler à
  Michel (`brew reinstall ffmpeg`), ne pas modifier son Homebrew.
- **Premier lancement** : téléchargement du modèle depuis Hugging Face. Prévenir
  Michel de la taille avant de lancer.
- **Durée** : quelques minutes par fichier d'une heure sur Apple Silicon, à
  mesurer sur un fichier avant d'en enchaîner plusieurs.
- **Le corpus Debord n'est pas touché** : `scripts/corpus.mjs` ne lit que
  `transcripts/*.fr-orig.json3` à la racine, pas le sous-dossier `bibnum/`. Les
  transcriptions Whisper n'entrent donc dans aucun index tant que `corpus.mjs`
  n'est pas étendu explicitement.
- **Moins de tokens** : la transcription tourne hors de Claude. Ne pas relire le
  JSON entier ; interroger le fichier par mot ou par plage d'horodatage.
- **Hallucinations** : sur les silences, Whisper peut inventer du texte
  (« Sous-titrage… »). Vérifier les segments très courts ou répétés avant de s'y
  fier.

## Vérifier un résultat

```bash
node -e "const d=JSON.parse(require('fs').readFileSync('transcripts/bibnum/<id>.fr-orig.json3'));console.log(d.events.length,'segments, fin à',Math.round((d.events.at(-1).tStartMs+d.events.at(-1).dDurationMs)/1000),'s')"
```

La fin doit coïncider avec la durée déclarée du manifeste IIIF (champ `duration`).
