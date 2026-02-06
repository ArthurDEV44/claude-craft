# Debug with Competing Hypotheses

## Simple (2-3 pistes)

```
Bug : [DESCRIPTION DU BUG]
Repro : [ÉTAPES DE REPRODUCTION]

Crée une agent team pour investiguer en parallèle :
- "hyp-1": investigate [HYPOTHÈSE 1] dans [FICHIERS/DOSSIERS]
- "hyp-2": investigate [HYPOTHÈSE 2] dans [FICHIERS/DOSSIERS]
- "hyp-3": investigate [HYPOTHÈSE 3] dans [FICHIERS/DOSSIERS]

Chaque investigateur doit :
- Chercher des preuves concrètes (logs, traces, état)
- Tenter de reproduire le bug via son hypothèse
- Documenter ses findings

Synthétise les résultats et propose un fix basé sur l'hypothèse gagnante.
```

## Adversarial (débat scientifique)

```
Bug : [DESCRIPTION DU BUG]
Repro : [ÉTAPES DE REPRODUCTION]
Contexte : [STACK, INFRA, DERNIERS CHANGEMENTS]

Crée une agent team pour investiguer avec des hypothèses concurrentes :
- "hyp-memory": fuite mémoire ou accumulation dans [COMPOSANTS]
- "hyp-race": race condition ou problème de concurrence dans [MODULES]
- "hyp-config": mauvaise config ou regression dans [FICHIERS CONFIG]
- "hyp-external": défaillance service externe ou réseau dans [INTÉGRATIONS]
- "arbitre": compare les findings, challenge les hypothèses faibles, force chaque investigateur à réfuter les autres

Les investigateurs doivent se parler entre eux pour confronter leurs théories.
L'arbitre tranche quand une hypothèse est réfutée ou confirmée.
Documente la conclusion dans docs/investigation.md avec :
- Hypothèses testées
- Preuves pour/contre chacune
- Root cause identifiée
- Fix proposé
```

## Rapide (triage)

```
Bug : [DESCRIPTION DU BUG]

Crée une agent team de triage rapide :
- "reader": lit les logs et traces d'erreur dans [CHEMIN LOGS]
- "differ": analyse les derniers commits avec git log/diff pour trouver la regression
- "reproducer": tente de reproduire le bug et identifie les conditions exactes

Synthétise en un diagnostic : quoi, où, depuis quand, et comment fixer.
```
